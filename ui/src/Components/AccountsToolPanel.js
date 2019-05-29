import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import IconButton from './IconButton';
import IconSpacer from './IconSpacer';
import './ToolPanel.css';

@inject('store')
@inject('cursor')
@observer
class AccountsToolPanel extends Component {

  render() {
    const store = this.props.store;
    if (!store.token) {
      return '';
    }
    return ( // ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE/PROFIT_PREV/PROFIT
      <div className="ToolPanel">
        <h1><Trans>Accounts</Trans></h1>
        <IconButton key="button-favorite" title="favorite" icon="far fa-star"
          toggle={store.tools.accounts.favorite}
          onClick={() => (store.tools.accounts.favorite = !store.tools.accounts.favorite)}
        />
        <IconSpacer/>
        <IconButton key="button-asset" title="asset" icon="fas fa-coins"
          toggle={!store.tools.accounts.asset}
          onClick={() => (store.tools.accounts.asset = !store.tools.accounts.asset)}
        />
        <IconButton key="button-liability" title="liability" icon="far fa-credit-card"
          toggle={!store.tools.accounts.liability}
          onClick={() => (store.tools.accounts.liability = !store.tools.accounts.liability)}
        />
        <IconButton key="button-equity" title="equity" icon="fas fa-piggy-bank"
          toggle={!store.tools.accounts.equity}
          onClick={() => (store.tools.accounts.equity = !store.tools.accounts.equity)}
        />
        <IconButton key="button-revenue" title="revenue" icon="fas fa-money-bill"
          toggle={!store.tools.accounts.revenue}
          onClick={() => (store.tools.accounts.revenue = !store.tools.accounts.revenue)}
        />
        <IconButton key="button-expense" title="expense" icon="fas fa-shopping-cart"
          toggle={!store.tools.accounts.expense}
          onClick={() => (store.tools.accounts.expense = !store.tools.accounts.expense)}
        />
        <IconButton key="button-profit" title="profit" icon="fas fa-balance-scale"
          toggle={!store.tools.accounts.profit}
          onClick={() => (store.tools.accounts.profit = !store.tools.accounts.profit)}
        />
      </div>
    );
  }
}

AccountsToolPanel.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store)
};

export default AccountsToolPanel;
