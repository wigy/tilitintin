import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import Store from '../Stores/Store'
import Cursor from '../Stores/Cursor'
import IconButton from './IconButton'
import IconSpacer from './IconSpacer'
import Title from './Title'
import { TextField } from '@material-ui/core'
import { Trans } from 'react-i18next'
import { runInAction } from 'mobx'

@inject('store')
@inject('cursor')
@observer
class AccountsToolPanel extends Component {

  state = {
    search: ''
  };

  componentDidMount() {
    this.setState({ search: this.props.store.tools.accounts.search || '' })
  }

  render() {
    const { store, cursor } = this.props
    if (!store.token) {
      return ''
    }

    const enableAll = () => {
      runInAction(() => {
        const favorite = store.tools.accounts.favorite
        const search = store.tools.accounts.search
        store.tools.accounts = { favorite, search }
      })
    }

    const disableAll = () => {
      runInAction(() => {
        const favorite = store.tools.accounts.favorite
        const search = store.tools.accounts.search
        store.tools.accounts = { favorite, search, asset: true, liability: true, equity: true, revenue: true, expense: true, profit: true }
      })
    }

    return ( // ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE/PROFIT_PREV/PROFIT
      <div className="ToolPanel AccountsToolPanel">
        <Title>Accounts</Title>
        <IconButton id="Show All" onClick={enableAll} title="all-account-types" icon="show-all"></IconButton>
        <IconButton id="Hide All" onClick={disableAll} title="none-account-types" icon="hide-all"></IconButton>
        <IconSpacer/>
        <IconButton id="Favourites" key="button-favorite" title="favorite" icon="star"
          toggle={!!store.tools.accounts.favorite}
          onClick={() => runInAction(() => (store.tools.accounts.favorite = !store.tools.accounts.favorite))}
        />
        <IconSpacer/>
        <IconButton id="Asset" key="button-asset" title="asset" icon="money"
          toggle={!store.tools.accounts.asset}
          onClick={() => runInAction(() => (store.tools.accounts.asset = !store.tools.accounts.asset))}
        />
        <IconButton id="Liability" key="button-liability" title="liability" icon="credit-card"
          toggle={!store.tools.accounts.liability}
          onClick={() => runInAction(() => (store.tools.accounts.liability = !store.tools.accounts.liability))}
        />
        <IconButton id="Equity" key="button-equity" title="equity" icon="savings"
          toggle={!store.tools.accounts.equity}
          onClick={() => runInAction(() => (store.tools.accounts.equity = !store.tools.accounts.equity))}
        />
        <IconButton id="Revenue" key="button-revenue" title="revenue" icon="sales"
          toggle={!store.tools.accounts.revenue}
          onClick={() => runInAction(() => (store.tools.accounts.revenue = !store.tools.accounts.revenue))}
        />
        <IconButton id="Expense" key="button-expense" title="expense" icon="shopping-cart"
          toggle={!store.tools.accounts.expense}
          onClick={() => runInAction(() => (store.tools.accounts.expense = !store.tools.accounts.expense))}
        />
        <IconButton id="Profit" key="button-profit" title="profit" icon="profit"
          toggle={!store.tools.accounts.profit}
          onClick={() => runInAction(() => (store.tools.accounts.profit = !store.tools.accounts.profit))}
        />
        <IconSpacer/>
        <TextField
          className="Search"
          label={<Trans>Search</Trans>}
          style={{ height: '36px', width: '280px', fontSize: '20px' }}
          value={this.state.search}
          onChange={e => { this.setState({ search: e.target.value }) }}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              runInAction(() => (store.tools.accounts.search = e.target.value))
            }
          }}
          onFocus={() => cursor.disableHandler()}
          onBlur={() => cursor.enableHandler()}
        />
      </div>
    )
  }
}

AccountsToolPanel.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store)
}

export default AccountsToolPanel
