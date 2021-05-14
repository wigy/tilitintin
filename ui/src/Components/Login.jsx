import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { inject, observer } from 'mobx-react'
import { Trans, withTranslation } from 'react-i18next'
import Store from '../Stores/Store'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import Title from './Title'
import Panel from './Panel'

@withRouter
@withTranslation('translations')
@inject('store')
@observer
class Login extends Component {

  state = {
    appState: null
  }

  componentDidMount() {
    if (this.props.store.token) {
      this.setState({ appState: 'LOGGED_IN' })
    } else {
      this.props.store.request('/status')
        .then((data) => {
          if (data.hasAdminUser) {
            this.setState({ appState: 'NOT_LOGGED_IN' })
          } else {
            this.setState({ appState: 'NO_ROOT' })
          }
        })
    }
  }

  componentDidUpdate() {
    if (this.props.store.token) {
      if (this.state.appState !== 'LOGGED_IN') {
        this.setState({ appState: 'LOGGED_IN' })
      }
    } else {
      if (this.state.appState === 'LOGGED_IN') {
        this.setState({ appState: 'NOT_LOGGED_IN' })
      }
    }
  }

  render() {

    const { store } = this.props

    const onLogin = ({ user, password }) => {
      store.login(user, password)
        .then(() => {
          if (this.props.store.isAdmin) {
            this.props.history.push('/_/admin')
          } else {
            this.props.history.push('/')
          }
        })
    }

    const onRegisterAdmin = ({ user, name, password, email }) => {
      return store.request('/register', 'POST', { admin: true, user, name, password, email })
        .then(() => {
          store.login(user, password)
            .then(() => {
              this.props.history.push('/_/admin')
            })
        })
    }

    if (this.state.appState === 'NO_ROOT') {
      return (
        <div>
          <Title><Trans>This system has no admin user</Trans></Title>
          <Panel title={<Trans>Please register an admin user</Trans>}>
            <RegisterForm onRegister={onRegisterAdmin}/>
          </Panel>
        </div>
      )
    }

    if (this.state.appState === 'NOT_LOGGED_IN') {
      return (
        <div>
          <Title className="LoginPage"><Trans>Login to Tilitintin</Trans></Title>
          <LoginForm onLogin={onLogin}/>
        </div>
      )
    }

    return ''
  }
}

Login.propTypes = {
  store: PropTypes.instanceOf(Store),
  history: ReactRouterPropTypes.history,
  t: PropTypes.func
}

export default Login
