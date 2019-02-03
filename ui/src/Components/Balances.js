import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import BalanceTable from '../Components/BalanceTable';
import Store from '../Stores/Store';
import Navigator from '../Stores/Navigator';

@translate('translations')
@inject('store')
@inject('navigator')
@observer
class Balances extends Component {

  componentDidMount() {
    this.props.navigator.selectPage('Balances');
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }

    return (
      <div className="Period">
        <h1><Trans>Account Balances</Trans></h1>
        <BalanceTable balances={this.props.store.balances}/>
      </div>
    );
  }
}

Balances.propTypes = {
  navigator: PropTypes.instanceOf(Navigator),
  store: PropTypes.instanceOf(Store)
};

export default Balances;
