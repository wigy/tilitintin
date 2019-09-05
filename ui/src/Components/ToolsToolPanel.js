import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { translate, I18n, Trans } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Form, FormControl, ControlLabel } from 'react-bootstrap';
import Store from '../Stores/Store';
import Settings from '../Stores/Settings';
import IconButton from './IconButton';
import Dialog from './Dialog';
import Localize from './Localize';
import EntryModel from '../Models/EntryModel';
import './ToolPanel.css';
import moment from 'moment';

@withRouter
@translate('translations')
@inject('store')
@inject('settings')
@observer
class ToolsToolPanel extends Component {

  state = {
    askNewPeriod: false,
    askUpload: false,
    askNew: false,
    databaseName: '',
    companyName: '',
    companyCode: '',
    changed: false,
    code: null,
    files: []
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

  /**
   * Upload selected file.
   */
  @action.bound
  uploadFile() {
    if (this.state.files[0]) {
      this.props.store.request('/db/upload', 'POST', null, this.state.files[0])
        .then(() => {
          this.setState({askUpload: false});
          this.props.store.fetchDatabases(true);
        });
    }
  }

  /**
   * Create new database.
   */
  @action.bound
  onCreateNewDb() {
    if (this.state.databaseName) {
      this.props.store.createDatabase({
        databaseName: this.state.databaseName,
        companyName: this.state.companyName,
        companyCode: this.state.companyCode }
      )
        .then(() => {
          this.setState({ askNew: false });
          this.props.history.push(`/${this.state.databaseName}/txs/1`);
        });
    }
  }

  render() {
    const { t, store } = this.props;
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
          <IconButton key="button-new-database" onClick={() => this.setState({ askNew: true })} title="new-database" icon="fa-database"></IconButton>
          // TODO: Drop. Just testing. <IconButton key="button-new-database" onClick={() => this.setState({ databaseName: 'normaali', companyName: 'Reitti Oy', companyCode: '12345678-9' }) || this.onCreateNewDb()} title="new-database" icon="fa-database"></IconButton>
        );
        buttons.push(
          <IconButton key="button-upload" onClick={() => this.setState({askUpload: true})} title="upload-database" icon="fa-upload"></IconButton>
        );
        break;
    }

    return (
      <div className="ToolPanel">
        {label && <h1><Trans>{label}</Trans></h1>}
        {buttons}
        <Dialog
          title={<Trans>Start new period?</Trans>}
          isVisible={this.state.askNewPeriod}
          onClose={() => { this.setState({askNewPeriod: false}); }}
          onConfirm={() => this.createPeriod(startDate, endDate)}>
          <Localize date={startDate} /> - <Localize date={endDate} />
        </Dialog>

        <Dialog
          title={<Trans>Upload Database</Trans>}
          isVisible={this.state.askUpload}
          onClose={() => { this.setState({askUpload: false}); }}
          onConfirm={() => this.uploadFile()}>
          <h2><Trans>You can upload old Tilitin file here.</Trans></h2>
          <input type="file" accept=".sqlite" onChange={(e) => this.setState({files: e.target.files})} />
          <br />
          <Trans>Note that a database with the same name is overridden automatically.</Trans>
        </Dialog>

        <Dialog
          title={<Trans>Create New Database</Trans>}
          isVisible={this.state.askNew}
          onClose={() => { this.setState({askNew: false}); }}
          onConfirm={() => this.onCreateNewDb()}>
          <Form>
            <ControlLabel><Trans>Database Name</Trans>:</ControlLabel>
            <div className="error">{this.state.changed && (
              this.state.databaseName ? '' : t('Database name is required.') // TODO: Validate name here and in back-end.
            )}</div>
            <FormControl type="text" className="name" value={this.state.databaseName} onChange={(e) => this.setState({changed: true, databaseName: e.target.value})}></FormControl>
            <ControlLabel><Trans>Company Name</Trans>:</ControlLabel>
            <div className="error">{this.state.changed && (
              this.state.companyName ? '' : t('Company name is required.')
            )}</div>
            <FormControl type="text" className="company" value={this.state.companyName} onChange={(e) => this.setState({changed: true, companyName: e.target.value})}></FormControl>
            <ControlLabel><Trans>Company Registration Number</Trans>:</ControlLabel>
            <FormControl type="text" className="code" value={this.state.companyCode} onChange={(e) => this.setState({changed: true, companyCode: e.target.value})}></FormControl>
          </Form>
        </Dialog>
      </div>
    );
  }
}

ToolsToolPanel.propTypes = {
  t: PropTypes.func,
  history: PropTypes.any,
  match: PropTypes.object,
  i18n: PropTypes.instanceOf(I18n),
  settings: PropTypes.instanceOf(Settings),
  store: PropTypes.instanceOf(Store)
};

export default ToolsToolPanel;
