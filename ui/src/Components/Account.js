import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans, I18n } from 'react-i18next';
import Store from '../Stores/Store';
import AccountModel from '../Models/AccountModel';
import Dialog from './Dialog';
import './Account.css';

@translate('translations')
@inject('store')
@observer
class Account extends Component {

  state = {
    createNewIsOpen: true,
    deleteIsOpen: false,
    changed: false,
    accountName: 'Koiran muona',
    accountNumber: '1213',
    accountType: 'ASSET'
  };

  componentDidMount() {
    const {db, periodId, accountId} = this.props.match.params;
    this.props.store.setAccount(db, periodId, accountId);
  }

  componentDidUpdate() {
    this.componentDidMount();
  }

  onClickCreate() {
    this.setState({createNewIsOpen: true});
  }

  onCreateAccount() {
    const model = new AccountModel(this.props.store.database, {
      name: this.state.accountName,
      number: this.state.accountNumber,
      type: this.state.accountType
    });
    model.save()
      .then(() => {
        this.setState({createNewIsOpen: false, accountName: '', accountNumber: '', accountType: null});
      });
  }

  renderCreateNewDialog() {
    const t = (s) => this.props.i18n.t(s);
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

      <Trans>Account Number</Trans>:
      <br/>
      <div className="error">{this.state.changed && (
        this.state.accountNumber ? (database.hasAccount(this.state.accountNumber) ? t('Account number exists.') : '') : t('Account number is required.')
      )}</div>
      <input className="number" value={this.state.accountNumber} onChange={(e) => this.setState({changed: true, accountNumber: e.target.value})}/>
      {number && <span> (<Trans>Next free number</Trans> {number})</span>}
      <br/>
      <br/>

      <Trans>Account Name</Trans>:
      <br/>
      <div className="error">{this.state.changed && (
        this.state.accountName ? '' : t('Account name is required.')
      )}</div>
      <input className="name" value={this.state.accountName} onChange={(e) => this.setState({changed: true, accountName: e.target.value})}></input>
      <br/>
      <br/>

      <Trans>Account Type</Trans>:
      <br/>
      <div className="error">{this.state.changed && (
        this.state.accountType ? '' : t('Account type is required.')
      )}</div>
      <select onChange={(e) => this.setState({changed: true, accountType: e.target.value})}>
        <option></option>
        {['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].map(o => <option value={o} key={o}>{t(o)}</option>)}
      </select>

    </Dialog>;
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }
    const account = this.props.store.account;
    return (
      <div className="Account">
        <h1><Trans>Account</Trans></h1>
        {
          account &&
          <div className="summary">
            <Trans>Account Name</Trans>: {account.name}<br/>
            <Trans>Account Number</Trans>: {account.number}<br/>
            <Trans>Account Type</Trans>: <Trans>{account.type}</Trans><br/>
          </div>
        }
        <button className="create-new" onClick={() => this.onClickCreate()}><Trans>Create New Account</Trans></button>
        {this.renderCreateNewDialog()}
      </div>
    );
  }
}

Account.propTypes = {
  i18n: PropTypes.instanceOf(I18n),
  match: PropTypes.object,
  store: PropTypes.instanceOf(Store)
};

export default Account;
