import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { inject, observer } from 'mobx-react'
import { withTranslation, Trans } from 'react-i18next'
import Store from '../Stores/Store'
import Cursor from '../Stores/Cursor'
import UserList from './UserList'
import RegisterForm from './RegisterForm'
import Title from './Title'
import { withRouter } from 'react-router-dom'

@withRouter
@withTranslation('translations')
@inject('store')
@observer
class Admin extends Component {

  render() {
    const { store } = this.props

    if (!store.token) {
      return ''
    }

    return (
      <div>
        <Title><Trans>Users</Trans></Title>
        <UserList current={null}/>
      </div>
    )
  }
}

Admin.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  history: ReactRouterPropTypes.history,
  match: PropTypes.object,
  store: PropTypes.instanceOf(Store),
  t: PropTypes.func
}

export default Admin
