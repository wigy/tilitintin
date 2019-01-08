import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import BalanceTable from '../Components/BalanceTable';
import Store from '../Stores/Store';

@translate('translations')
@inject('store')
@observer
class Balances extends Component {

  render() {
    if (!this.props.store.token) {
      return '';
    }

    const {db, periodId} = this.props.match.params;

    return (
      <div className="Period">
        <h1><Trans>Account Balances</Trans></h1>
        <BalanceTable db={db} periodId={periodId} balances={this.props.store.balances}/>
      </div>
    );
  }
}

Balances.propTypes = {
  store: PropTypes.instanceOf(Store),
  db: PropTypes.string,
  match: PropTypes.object
};

export default Balances;
