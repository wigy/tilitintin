import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import BalanceTable from '../Components/BalanceTable';

export default translate('translations')(inject('store')(observer(class Balances extends Component {

  render() {
    if (!this.props.store.token) {
      return '';
    }

    const {db, periodId} = this.props.match.params;
    let balances = this.props.store.balances;
    return (
      <div className="Period">
        <h1><Trans>Account Balances</Trans></h1>
        <BalanceTable db={db} periodId={periodId} balances={balances}/>
      </div>
    );
  }
})));
