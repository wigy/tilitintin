import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import { translate, Trans, I18n } from 'react-i18next';
import { Form, FormControl, ControlLabel, Button } from 'react-bootstrap';
import Store from '../Stores/Store';
import AccountModel from '../Models/AccountModel';
import Dialog from './Dialog';
import Localize from './Localize';
import SubPanel from './SubPanel';
import './Account.css';

@translate('translations')
@inject('store')
@observer
class Account extends Component {

  state = {
    createNewIsOpen: false,
    deleteIsOpen: false,
    changed: false,
    accountName: '',
    accountNumber: '',
    accountType: ''
  };

  componentDidMount() {
    const {db, periodId, accountId} = this.props.match.params;
    if (accountId) {
      this.props.store.setAccount(db, periodId, accountId);
    } else if (periodId) {
      this.props.store.setPeriod(db, periodId);
    }
  }

  componentDidUpdate() {
    this.componentDidMount();
  }

  @action.bound
  onCreateAccount() {
    const model = new AccountModel(this.props.store.database, {
      name: this.state.accountName,
      number: this.state.accountNumber,
      type: this.state.accountType
    });
    model.save()
      .then(() => {
        this.setState({createNewIsOpen: false, accountName: '', accountNumber: '', accountType: ''});
        this.props.store.fetchAccounts(this.props.store.database.name);
      });
  }

  @action.bound
  onDeleteAccount() {
    const {db, periodId} = this.props.match.params;
    this.props.store.deleteAccount(this.props.store.account)
      .then(() => this.props.history.push(`/${db}/account/${periodId || ''}`));
  }

  renderDeleteDialog() {
    const account = this.props.store.account;
    return <Dialog
      className="dialog"
      title={<Trans>Delete this account?</Trans>}
      isVisible={this.state.deleteIsOpen}
      onClose={() => this.setState({deleteIsOpen: false})}
      onConfirm={() => this.onDeleteAccount()}>
      <i>{account.number} {account.name}</i><br/>

    </Dialog>;
  }

  renderCreateNewDialog() {
    const t = this.props.t;
    const account = this.props.store.account;
    const database = this.props.store.database;
    const nextNumber = (number) => {
      if (!account.database.hasAccount(number)) {
        return number;
      }
      return nextNumber((parseInt(number) + 1).toString());
    };
    const number = account ? nextNumber(account.number) : null;
    const isValid = () => this.state.accountNumber && this.state.accountName && this.state.accountType && database && !database.hasAccount(this.state.accountNumber);

    return <Dialog
      isValid={() => isValid()}
      className="dialog"
      title={<Trans>Create New Account</Trans>}
      isVisible={this.state.createNewIsOpen}
      onClose={() => this.setState({createNewIsOpen: false})}
      onConfirm={() => this.onCreateAccount()}>
      <Form>
        <ControlLabel><Trans>Account Number</Trans>:</ControlLabel>
        <div className="error">{this.state.changed && (
          this.state.accountNumber ? (database.hasAccount(this.state.accountNumber) ? t('Account number exists.') : '') : t('Account number is required.')
        )}</div>
        <FormControl type="text" className="number" value={this.state.accountNumber} onChange={(e) => this.setState({changed: true, accountNumber: e.target.value})} placeholder={number}/>

        <ControlLabel><Trans>Account Name</Trans>:</ControlLabel>
        <div className="error">{this.state.changed && (
          this.state.accountName ? '' : t('Account name is required.')
        )}</div>
        <FormControl type="text" className="name" value={this.state.accountName} onChange={(e) => this.setState({changed: true, accountName: e.target.value})}></FormControl>

        <ControlLabel><Trans>Account Type</Trans>:</ControlLabel>
        <br/>
        <div className="error">{this.state.changed && (
          this.state.accountType ? '' : t('Account type is required.')
        )}</div>
        <FormControl componentClass="select" value={this.state.accountType} onChange={(e) => this.setState({changed: true, accountType: e.target.value})}>
          <option></option>
          {['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].map(o => <option value={o} key={o}>{t(o)}</option>)}
        </FormControl>
      </Form>
    </Dialog>;
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }
    const account = this.props.store.account;
    const canDelete = () => {
      if (!account || !account.periods) {
        return false;
      }
      return account.periods.reduce((prev, cur) => prev && !cur.locked && !cur.entries, true);
    };

    return (
      <div className="Account">
        <h1><Trans>Account</Trans></h1>
        {
          account &&
          <SubPanel>
            <div className="summary">
              <Trans>Account Name</Trans>: {account.name}<br/>
              <Trans>Account Number</Trans>: {account.number}<br/>
              <Trans>Account Type</Trans>: <Trans>{account.type}</Trans><br/>
            </div>
            <Button className="delete" disabled={!canDelete()} onClick={() => this.setState({deleteIsOpen: true})}><Trans>Delete Account</Trans></Button><br/>
            {this.renderDeleteDialog()}
          </SubPanel>
        }
        <Button className="create-new" onClick={() => this.setState({createNewIsOpen: true})}><Trans>Create New Account</Trans></Button>
        {this.renderCreateNewDialog()}
        <div className="periods">
          {
            account && account.periods && account.periods.length > 0 &&
            <>
              <h2><Trans>Periods</Trans></h2>
              {
                account.periods.map((period) => <div key={period.id}>
                  <Localize date={period.start_date}/> - <Localize date={period.end_date}/>{period.locked && <b> <Trans>Locked</Trans></b>}<br/>
                  &nbsp;&nbsp;&nbsp;{
                    period.entries === 0 ? this.props.t('no transactions', {num: period.entries})
                      : period.entries === 1 ? this.props.t('1 transaction', {num: period.entries})
                        : this.props.t('{{count}} transactions', {count: period.entries})
                  }
                </div>)
              }
            </>
          }
        </div>
      </div>
    );
  }
}

Account.propTypes = {
  i18n: PropTypes.instanceOf(I18n),
  t: PropTypes.func,
  history: PropTypes.object.isRequired,
  match: PropTypes.object,
  store: PropTypes.instanceOf(Store)
};

export default Account;
