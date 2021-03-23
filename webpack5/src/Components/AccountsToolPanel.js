import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import IconButton from './IconButton';
import IconSpacer from './IconSpacer';
import Title from './Title';
import { TextField } from '@material-ui/core';
import { Trans } from 'react-i18next';

@inject('store')
@inject('cursor')
@observer
class AccountsToolPanel extends Component {

  state = {
    search: ''
  };

  componentDidMount() {
    this.setState({ search: this.props.store.tools.accounts.search || '' });
  }

  render() {
    const { store, cursor } = this.props;
    if (!store.token) {
      return '';
    }

    const enableAll = () => {
      const favorite = store.tools.accounts.favorite;
      const search = store.tools.accounts.search;
      store.tools.accounts = { favorite, search };
    };

    const disableAll = () => {
      const favorite = store.tools.accounts.favorite;
      const search = store.tools.accounts.search;
      store.tools.accounts = { favorite, search, asset: true, liability: true, equity: true, revenue: true, expense: true, profit: true };
    };

    return ( // ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE/PROFIT_PREV/PROFIT
      <div className="ToolPanel AccountsToolPanel">
        <Title>Accounts</Title>
        <IconButton onClick={enableAll} title="all-account-types" icon="show-all"></IconButton>
        <IconButton onClick={disableAll} title="none-account-types" icon="hide-all"></IconButton>
        <IconSpacer/>
        <IconButton key="button-favorite" title="favorite" icon="star"
          toggle={!!store.tools.accounts.favorite}
          onClick={() => (store.tools.accounts.favorite = !store.tools.accounts.favorite)}
        />
        <IconSpacer/>
        <IconButton key="button-asset" title="asset" icon="money"
          toggle={!store.tools.accounts.asset}
          onClick={() => (store.tools.accounts.asset = !store.tools.accounts.asset)}
        />
        <IconButton key="button-liability" title="liability" icon="credit-card"
          toggle={!store.tools.accounts.liability}
          onClick={() => (store.tools.accounts.liability = !store.tools.accounts.liability)}
        />
        <IconButton key="button-equity" title="equity" icon="savings"
          toggle={!store.tools.accounts.equity}
          onClick={() => (store.tools.accounts.equity = !store.tools.accounts.equity)}
        />
        <IconButton key="button-revenue" title="revenue" icon="sales"
          toggle={!store.tools.accounts.revenue}
          onClick={() => (store.tools.accounts.revenue = !store.tools.accounts.revenue)}
        />
        <IconButton key="button-expense" title="expense" icon="shopping-cart"
          toggle={!store.tools.accounts.expense}
          onClick={() => (store.tools.accounts.expense = !store.tools.accounts.expense)}
        />
        <IconButton key="button-profit" title="profit" icon="profit"
          toggle={!store.tools.accounts.profit}
          onClick={() => (store.tools.accounts.profit = !store.tools.accounts.profit)}
        />
        <IconSpacer/>
        <TextField
          label={<Trans>Search</Trans>}
          style={{ height: '36px', width: '280px', fontSize: '20px' }}
          value={this.state.search}
          onChange={e => { this.setState({ search: e.target.value }); }}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              store.tools.accounts.search = e.target.value;
            }
          }}
          onFocus={() => cursor.disableHandler()}
          onBlur={() => cursor.enableHandler()}
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