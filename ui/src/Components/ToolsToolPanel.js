import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { translate, I18n, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Settings from '../Stores/Settings';
import IconButton from './IconButton';
import DocumentModel from '../Models/DocumentModel';
import EntryModel from '../Models/EntryModel';
import './ToolPanel.css';
import moment from 'moment';

@translate('translations')
@inject('store')
@inject('settings')
@observer
class ToolsToolPanel extends Component {

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
    const {VAT_SALES_ACCOUNT, VAT_PURCHASES_ACCOUNT, VAT_RECEIVABLE_ACCOUNT, VAT_PAYABLE_ACCOUNT} = this.props.settings;
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
    const doc = new DocumentModel(store.period, {period_id: store.periodId, date: moment().format('YYYY-MM-DD')});
    await doc.save();
    if (sales) {
      doc.addEntry(new EntryModel(doc, {
        account_id: store.database.getAccountByNumber(VAT_SALES_ACCOUNT).id,
        debit: 1,
        amount: -sales,
        flags: EntryModel.FLAGS.VAT_IGNORE,
        row_number: doc.entries.length + 1,
        description: this.props.t('VAT update')
      }));
    }
    if (purchases) {
      doc.addEntry(new EntryModel(doc, {
        account_id: store.database.getAccountByNumber(VAT_PURCHASES_ACCOUNT).id,
        debit: 0,
        amount: purchases,
        flags: EntryModel.FLAGS.VAT_IGNORE,
        row_number: doc.entries.length + 1,
        description: this.props.t('VAT update')
      }));
    }
    // TODO: If the date is off from the period, consider adding it to "Siirtosaamiset/Siirtovelat".
    if (sales + purchases < 0) {
      doc.addEntry(new EntryModel(doc, {
        account_id: store.database.getAccountByNumber(VAT_PAYABLE_ACCOUNT).id,
        debit: 0,
        amount: -(sales + purchases),
        row_number: doc.entries.length + 1,
        description: this.props.t('VAT update')
      }));
    }
    if (sales + purchases > 0) {
      doc.addEntry(new EntryModel(doc, {
        account_id: store.database.getAccountByNumber(VAT_RECEIVABLE_ACCOUNT).id,
        debit: 1,
        amount: sales + purchases,
        row_number: doc.entries.length + 1,
        description: this.props.t('VAT update')
      }));
    }
    // Save entries.
    for (const entry of doc.entries) {
      await entry.save();
    }
    // Mark entries as reconciled.
    for (const entry of entries) {
      entry.VAT_RECONCILED = true;
      await entry.save();
    }
    store.period.addDocument(doc);
    store.fetchBalances();
  }

  render() {
    const store = this.props.store;
    const tool = this.props.match.params.tool || 'periods';

    if (!store.token) {
      return '';
    }

    let buttons, label;
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
        buttons = [
          <IconButton key="button-new" disabled={true} onClick={() => {}} title="create-period" icon="fa-calendar-plus"></IconButton>
        ];
        break;

      default:
        label = 'Unknown';
        buttons = [];
    }

    return (
      <div className="ToolPanel">
        <h1><Trans>{label}</Trans></h1>
        {buttons}
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
