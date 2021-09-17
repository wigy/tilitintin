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
    this.props.cursor.registerTools(this)
  }

  componentWillUnmount() {
    this.props.cursor.registerTools(null)
  }

  keyIconS() {
    const { store } = this.props
    runInAction(() => {
      const favorite = store.tools.accounts.favorite
      const search = store.tools.accounts.search
      store.tools.accounts = { favorite, search }
    })
    return { preventDefault: true }
  }

  keyIconH() {
    const { store } = this.props
    runInAction(() => {
      const favorite = store.tools.accounts.favorite
      const search = store.tools.accounts.search
      store.tools.accounts = { favorite, search, asset: true, liability: true, equity: true, revenue: true, expense: true, profit: true }
    })
    return { preventDefault: true }
  }

  keyIconF() {
    const { store } = this.props
    runInAction(() => (store.tools.accounts.favorite = !store.tools.accounts.favorite))
    return { preventDefault: true }
  }

  keyIconA() {
    const { store } = this.props
    runInAction(() => (store.tools.accounts.asset = !store.tools.accounts.asset))
    return { preventDefault: true }
  }

  keyIconL() {
    const { store } = this.props
    runInAction(() => (store.tools.accounts.liability = !store.tools.accounts.liability))
    return { preventDefault: true }
  }

  keyIconE() {
    const { store } = this.props
    runInAction(() => (store.tools.accounts.equity = !store.tools.accounts.equity))
    return { preventDefault: true }
  }

  keyIconR() {
    const { store } = this.props
    runInAction(() => (store.tools.accounts.revenue = !store.tools.accounts.revenue))
    return { preventDefault: true }
  }

  keyIconX() {
    const { store } = this.props
    runInAction(() => (store.tools.accounts.expense = !store.tools.accounts.expense))
    return { preventDefault: true }
  }

  keyIconO() {
    const { store } = this.props
    runInAction(() => (store.tools.accounts.profit = !store.tools.accounts.profit))
    return { preventDefault: true }
  }

  render() {
    const { store, cursor } = this.props
    if (!store.token) {
      return ''
    }

    return ( // ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE/PROFIT_PREV/PROFIT
      <div className="ToolPanel AccountsToolPanel">
        <Title>Accounts</Title>
        <IconButton id="ShowAll" shortcut="S" pressKey="IconS" title="all-account-types" icon="show-all"></IconButton>
        <IconButton id="HideAll" shortcut="H" pressKey="IconH" title="none-account-types" icon="hide-all"></IconButton>
        <IconSpacer/>
        <IconButton id="Favourites" shortcut="F" pressKey="IconF" key="button-favorite" title="favorite" icon="star"
          toggle={!!store.tools.accounts.favorite}
        />
        <IconSpacer/>
        <IconButton id="Asset" key="button-asset" shortcut="A" pressKey="IconA" title="asset" icon="money"
          toggle={!store.tools.accounts.asset}
        />
        <IconButton id="Liability" key="button-liability" shortcut="L" pressKey="IconL" title="liability" icon="credit-card"
          toggle={!store.tools.accounts.liability}
        />
        <IconButton id="Equity" key="button-equity" shortcut="E" pressKey="IconE" title="equity" icon="savings"
          toggle={!store.tools.accounts.equity}
        />
        <IconButton id="Revenue" key="button-revenue" shortcut="R" pressKey="IconR" title="revenue" icon="sales"
          toggle={!store.tools.accounts.revenue}
        />
        <IconButton id="Expense" key="button-expense" shortcut="X" pressKey="IconX" title="expense" icon="shopping-cart"
          toggle={!store.tools.accounts.expense}
        />
        <IconButton id="Profit" key="button-profit" shortcut="O" pressKey="IconO" title="profit" icon="profit"
          toggle={!store.tools.accounts.profit}
        />
        <IconSpacer/>
        <TextField
          className="Search"
          label={<Trans>Search</Trans>}
          name="search"
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
