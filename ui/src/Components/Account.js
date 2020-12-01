import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import { Trans, withTranslation } from 'react-i18next';
import { Form, FormControl, ControlLabel } from 'react-bootstrap';
import Store from '../Stores/Store';
import AccountModel from '../Models/AccountModel';
import Dialog from './Dialog';
import Localize from './Localize';
import SubPanel from './SubPanel';
import Title from './Title';
import { Typography, Button } from '@material-ui/core';

@withTranslation('translations')
@inject('store')
@observer
class Account extends Component {

  state = {
    editDialogIsOpen: false,
    deleteIsOpen: false,
    changed: false,
    new: null,
    accountName: '',
    accountNumber: '',
    accountType: ''
  };

  componentDidMount() {
    const { db, periodId, accountId } = this.props.match.params;
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
  onSubmitAccount() {
    let model;
    if (this.state.new) {
      model = new AccountModel(this.props.store.database, {
        name: this.state.accountName,
        number: this.state.accountNumber,
        type: this.state.accountType
      });
    } else {
      model = this.props.store.account;
      model.name = this.state.accountName;
      model.number = this.state.accountNumber;
      model.type = this.state.accountType;
    }
    model.save()
      .then(() => {
        this.setState({ editDialogIsOpen: false, accountName: '', accountNumber: '', accountType: '' });
        this.props.store.fetchAccounts(this.props.store.database.name);
      });
  }

  @action.bound
  onDeleteAccount() {
    const { db, periodId } = this.props.match.params;
    this.props.store.deleteAccount(this.props.store.account)
      .then(() => this.props.history.push(`/${db}/account/${periodId || ''}`));
  }

  renderDeleteDialog() {
    const account = this.props.store.account;
    return <Dialog
      className="dialog"
      title={<Trans>Delete this account?</Trans>}
      isVisible={this.state.deleteIsOpen}
      onClose={() => this.setState({ deleteIsOpen: false })}
      onConfirm={() => this.onDeleteAccount()}>
      <i>{account.number} {account.name}</i><br/>
    </Dialog>;
  }

  renderEditDialog() {
    const t = this.props.t;
    const database = this.props.store.database;
    const isValid = () => this.state.accountNumber &&
      this.state.accountName &&
      this.state.accountType &&
      (!this.state.new || (database && !database.hasAccount(this.state.accountNumber)));

    return <Dialog
      isValid={() => isValid()}
      className="dialog"
      title={<Trans>Create New Account</Trans>}
      isVisible={this.state.editDialogIsOpen}
      onClose={() => this.setState({ editDialogIsOpen: false })}
      onConfirm={() => this.onSubmitAccount()}>
      <Form>
        <ControlLabel><Trans>Account Number</Trans>:</ControlLabel>
        <div className="error">{this.state.changed && this.state.new && (
          this.state.accountNumber ? (database.hasAccount(this.state.accountNumber) ? t('Account number exists.') : '') : t('Account number is required.')
        )}</div>
        <FormControl type="text" className="number" value={this.state.accountNumber} onChange={(e) => this.setState({ changed: true, accountNumber: e.target.value })}/>

        <ControlLabel><Trans>Account Name</Trans>:</ControlLabel>
        <div className="error">{this.state.changed && (
          this.state.accountName ? '' : t('Account name is required.')
        )}</div>
        <FormControl type="text" className="name" value={this.state.accountName} onChange={(e) => this.setState({ changed: true, accountName: e.target.value })}></FormControl>

        <ControlLabel><Trans>Account Type</Trans>:</ControlLabel>
        <br/>
        <div className="error">{this.state.changed && (
          this.state.accountType ? '' : t('Account type is required.')
        )}</div>
        <FormControl disabled={!this.canChange()} componentClass="select" value={this.state.accountType} onChange={(e) => this.setState({ changed: true, accountType: e.target.value })}>
          <option></option>
          {['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].map(o => <option value={o} key={o}>{t(o)}</option>)}
        </FormControl>
      </Form>
    </Dialog>;
  }

  onClickCreateNew() {
    const account = this.props.store.account;
    const nextNumber = (number) => {
      if (!account.database.hasAccount(number)) {
        return number;
      }
      return nextNumber((parseInt(number) + 1).toString());
    };
    const number = account ? nextNumber(account.number) : '';
    this.setState({
      editDialogIsOpen: true,
      new: true,
      accountName: '',
      accountNumber: number,
      accountType: ''
    });
  }

  onClickEdit() {
    const account = this.props.store.account;
    this.setState({
      editDialogIsOpen: true,
      new: false,
      accountName: account.name,
      accountNumber: account.number,
      accountType: account.type
    });
  }

  canChange() {
    const account = this.props.store.account;
    if (!account || !account.periods) {
      return false;
    }
    return account.periods.reduce((prev, cur) => prev && !cur.locked && !cur.entries, true);
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }
    const account = this.props.store.account;

    return (
      <div className="Account">
        <Title><Trans>Account</Trans></Title>
        {
          account &&
          <SubPanel>
            <Typography color="primary" variant="subtitle1"><Trans>Account Name</Trans></Typography>
            {account.name}
            <Typography color="primary" variant="subtitle1"><Trans>Account Number</Trans></Typography>
            {account.number}
            <Typography color="primary" variant="subtitle1"><Trans>Account Type</Trans></Typography>
            <Trans>{account.type}</Trans>
            <br/>
            <br/>
            <Button variant="outlined" color="secondary" disabled={!this.canChange()} onClick={() => this.setState({ deleteIsOpen: true })}><Trans>Delete Account</Trans></Button>
            &nbsp;
            <Button variant="outlined" color="secondary" onClick={() => this.onClickEdit()}><Trans>Edit Account</Trans></Button>
            {this.renderDeleteDialog()}
          </SubPanel>
        }
        <Button className="create-new" onClick={() => this.onClickCreateNew()}><Trans>Create New Account</Trans></Button>
        {this.renderEditDialog()}
        <div className="periods">
          {
            account && account.periods && account.periods.length > 0 &&
            <>
              <h2><Trans>Periods</Trans></h2>
              {
                account.periods.map((period) => <div key={period.id}>
                  <Localize date={period.start_date}/> - <Localize date={period.end_date}/>{period.locked && <b> <Trans>Locked</Trans></b>}<br/>
                  &nbsp;&nbsp;&nbsp;{
                    period.entries === 0 ? this.props.t('no transactions', { num: period.entries })
                      : period.entries === 1 ? this.props.t('1 transaction', { num: period.entries })
                        : this.props.t('{{count}} transactions', { count: period.entries })
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
  t: PropTypes.func,
  history: PropTypes.object.isRequired,
  match: PropTypes.object,
  store: PropTypes.instanceOf(Store)
};

export default Account;
