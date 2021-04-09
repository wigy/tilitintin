import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { withTranslation, Trans } from 'react-i18next'
import BalanceTable from '../Components/BalanceTable'
import Store from '../Stores/Store'
import Cursor from '../Stores/Cursor'
import Loading from './Loading'
import Title from './Title'

@withTranslation('translations')
@inject('store')
@inject('cursor')
@observer
class Balances extends Component {

  render() {
    if (!this.props.store.token) {
      return ''
    }

    return (
      <div style={{ margin: '1rem' }}>
        <Title><Trans>Account Balances</Trans></Title>
        <Loading visible={this.props.store.loading}/>
        <BalanceTable balances={this.props.store.balances}/>
      </div>
    )
  }
}

Balances.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store)
}

export default Balances
