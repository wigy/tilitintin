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

  state = {
    user: null
  };

  componentDidMount() {
    this.updateUser(this.props.match.params.arg)
  }

  componentDidUpdate() {
    const user = this.props.match.params.arg
    if (user && user !== (this.state.user && this.state.user.user)) {
      this.updateUser(user)
    }
  }

  updateUser(user) {
    if (user === '[create]' || !user) {
      return
    }
    this.props.store.request(`/admin/user/${user}`)
      .then((user) => {
        this.setState({ user })
      })
  }

  onRegister({ user, name, password, email }) {
    return this.props.store.request('/admin/user', 'POST', { user, name, password, email })
      .then(() => {
        this.props.history.push('/_/admin')
      })
      .catch(() => {
        this.props.store.addError(this.props.t('User creation failed.'))
      })
  }

  render() {
    const { store } = this.props

    if (!store.token) {
      return ''
    }

    const creatingUser = this.props.match.params.arg === '[create]'

    return (
      <div>
        <Title><Trans>Users</Trans></Title>
        {
          this.state.user && !creatingUser && <UserList current={this.state.user}/>
        }
        {
          creatingUser && <RegisterForm onRegister={({ user, name, password, email }) => this.onRegister({ user, name, password, email })}/>
        }
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
