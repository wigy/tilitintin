import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { translate, I18n, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Settings from '../Stores/Settings';
import IconButton from './IconButton';
import Dialog from './Dialog';
import Localize from './Localize';
import EntryModel from '../Models/EntryModel';
import './ToolPanel.css';
import moment from 'moment';

@translate('translations')
@inject('store')
@inject('settings')
@observer
class ToolsToolPanel extends Component {

  state = {
    askNewPeriod: false
  };

  /**
   * Collect entries with empty descriptions.
   */
  emptyEntries() {
    const emptyDescriptions = new Set();
    if (this.props.store.period) {
      this.props.store.period.openVATDocuments.forEach((doc) => {
        doc.entries.forEach((entry) => {
          if (entry.text === '') {
            emptyDescriptions.add(entry);
          }
        });
      });
    }
    return emptyDescriptions;
  }

  /**
   * Copy a description to the empty VAT fields usually inherited from Tilitin data.
   */
  @action.bound
  async fixDescriptions() {
    const entriesChanged = new Set();
    [...this.emptyEntries()].forEach((entry) => {
      const samples = entry.parent.entries.filter((e) => e.text !== '');
      if (samples.length) {
        entry.setText(samples[0].text);
        entriesChanged.add(entry);
      }
    });
    for (const entry of [...entriesChanged]) {
      await entry.save();
    }
  }

  /**
   * Combine unprocessed VAT to new payable or receivable entry.
   */
  @action.bound
  async createVATEntry() {
    const store = this.props.store;
    const {
      VAT_SALES_ACCOUNT,
      VAT_PURCHASES_ACCOUNT,
      VAT_RECEIVABLE_ACCOUNT,
      VAT_PAYABLE_ACCOUNT,
      VAT_DELAYED_RECEIVABLE_ACCOUNT,
      VAT_DELAYED_PAYABLE_ACCOUNT
    } = this.props.settings;
    // Collect entries.
    let sales = 0;
    let purchases = 0;
    const entries = [];
    for (const doc of this.props.store.period.openVATDocuments) {
      for (const entry of doc.entries) {
        const acc = entry.account.number;
        if (acc === VAT_SALES_ACCOUNT) {
          sales += entry.total;
          entries.push(entry);
        }
        if (acc === VAT_PURCHASES_ACCOUNT) {
          purchases += entry.total;
          entries.push(entry);
        }
      }
    }
    // Create new VAT payable/receivable.
    let date = moment().format('YYYY-MM-DD');
    let isDelayed = false;
    if (date > store.period.end_date) {
      isDelayed = true;
      date = store.period.end_date;
    }

    const doc = {date, entries: []};

    if (sales) {
      doc.entries.push({
        number: VAT_SALES_ACCOUNT,
        amount: -sales,
        flags: EntryModel.FLAGS.VAT_IGNORE,
        description: this.props.t('VAT update')
      });
    }
    if (purchases) {
      doc.entries.push({
        number: VAT_PURCHASES_ACCOUNT,
        amount: -purchases,
        flags: EntryModel.FLAGS.VAT_IGNORE,
        description: this.props.t('VAT update')
      });
    }
    // Add it to the receivable or to the payable VAT.
    if (sales + purchases < 0) {
      doc.entries.push({
        number: isDelayed ? VAT_DELAYED_PAYABLE_ACCOUNT : VAT_PAYABLE_ACCOUNT,
        amount: sales + purchases,
        description: this.props.t('VAT update')
      });
    }
    if (sales + purchases > 0) {
      doc.entries.push({
        number: isDelayed ? VAT_DELAYED_RECEIVABLE_ACCOUNT : VAT_RECEIVABLE_ACCOUNT,
        amount: sales + purchases,
        description: this.props.t('VAT update')
      });
    }

    await store.period.createDocument(doc);

    // Mark entries as reconciled.
    for (const entry of entries) {
      entry.VAT_RECONCILED = true;
      await entry.save();
    }

    store.fetchBalances();
  }

  /**
   * Create new period.
   */
  @action.bound
  async createPeriod(startDate, endDate) {
    const store = this.props.store;
    await store.database.createNewPeriod(startDate, endDate, this.props.t('Initial balance'));
  }

  /**
   * Renumber documents of the period.
   */
  @action.bound
  async renumberDocuments(db, periodId) {
    const toRenumber = this.props.store.period.incorrectlyNumberedDocuments;
    for (const change of toRenumber) {
      const doc = this.props.store.period.getDocument(change.id);
      doc.number = change.newNumber;
      await doc.save();
    }
  }

  render() {
    const store = this.props.store;
    const tool = this.props.match.params.tool;

    if (!store.token) {
      return '';
    }
    let buttons = [];
    let label;
    let startDate, endDate;
    const VAT = this.props.store.period ? this.props.store.period.VATSummary : {sales: 0, purchases: 0};

    switch (tool) {
      case 'vat':
        label = 'Value Added Tax';
        buttons = [
          <IconButton key="button-fix" disabled={!this.emptyEntries().size} onClick={() => this.fixDescriptions()} title="fix-vat-descriptions" icon="fa-paperclip"></IconButton>,
          <IconButton key="button-vat" disabled={!VAT.sales && !VAT.purchases} onClick={() => this.createVATEntry()} title="summarize-vat-period" icon="fa-balance-scale"></IconButton>
        ];
        break;

      case 'periods':
        label = 'Periods';
        if (this.props.store.db) {
          buttons.push(
            <IconButton key="button-new" onClick={() => this.setState({askNewPeriod: true})} title="create-period" icon="fa-calendar-plus"></IconButton>
          );

        }
        startDate = store.database && moment(store.database.periods[store.database.periods.length - 1].end_date).add(1, 'day').format('YYYY-MM-DD');
        endDate = store.database && moment(store.database.periods[store.database.periods.length - 1].end_date).add(1, 'year').format('YYYY-MM-DD');
        break;

      case 'documents':
        label = 'Documents';
        const toRenumber = store.period ? store.period.incorrectlyNumberedDocuments : [];
        buttons = [
          <IconButton key="button-new" disabled={!toRenumber.length} onClick={() => this.renumberDocuments(this.props.store.db, this.props.store.periodId)} title="sort-documents" icon="fas fa-sort-numeric-up"></IconButton>
        ];
        break;

      default:
        label = 'Database Management';
        buttons.push(
          <IconButton key="button-upload" onClick={() => this.setState({askUpload: true})} title="upload-database" icon="fa-upload"></IconButton>
        );
        break;
    }

    return (
      <div className="ToolPanel">
        {label && <h1><Trans>{label}</Trans></h1>}
        {buttons}
        <Dialog key="dialog"
          title={<Trans>Start new period?</Trans>}
          isVisible={this.state.askNewPeriod}
          onClose={() => { this.setState({askNewPeriod: false}); }}
          onConfirm={() => this.createPeriod(startDate, endDate)}>
          <Localize date={startDate} /> - <Localize date={endDate} />
        </Dialog>
      </div>
    );
  }
}

ToolsToolPanel.propTypes = {
  t: PropTypes.func,
  match: PropTypes.object,
  i18n: PropTypes.instanceOf(I18n),
  settings: PropTypes.instanceOf(Settings),
  store: PropTypes.instanceOf(Store)
};

export default ToolsToolPanel;
