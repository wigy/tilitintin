import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { Trans, withTranslation } from 'react-i18next'
import Store from '../Stores/Store'
import Panel from './Panel'
import { TextField, Button } from '@material-ui/core'
import Cursor from '../Stores/Cursor'
import ReactRouterPropTypes from 'react-router-prop-types'
import { withRouter } from 'react-router-dom'

@inject('store')
@inject('cursor')
@withRouter
@withTranslation('translations')
@observer
class RegisterForm extends Component {

  state = {
    user: '',
    name: '',
    email: '',
    password: '',
    passwordAgain: ''
  }

  componentDidMount() {
    this.props.cursor.disableHandler()
  }

  componentWillUnmount = () => {
    this.props.cursor.enableHandler()
  }

  onCancel() {
    this.props.history.push('/_/admin')
  }

  onRegister() {
    const { store } = this.props
    const { user, name, email, password, passwordAgain } = this.state
    store.clearMessages()

    if (!user || !/^[a-z0-9]+$/.test(user)) {
      store.addError(this.props.t('User name is not valid (lower case letters and numbers only).'))
    }
    if (password.length < 4) {
      store.addError(this.props.t('Password is too short.'))
    }
    if (password !== passwordAgain) {
      store.addError(this.props.t('Passwords do not match.'))
    }
    if (!email) {
      store.addError(this.props.t('Email is required.'))
    }
    if (!name) {
      store.addError(this.props.t('Full name is required.'))
    }

    if (store.messages.length) {
      return
    }

    this.props.onRegister({ user, name, password, email })
  }

  render() {

    return <form>
      <Panel>
        <TextField
          style={{ width: '50%' }}
          name="username"
          label={<Trans>Username</Trans>}
          onChange={(event) => (this.setState({ user: event.target.value }))}
        />
        <br/>
        <TextField
          style={{ width: '50%' }}
          name="full-name"
          label={<Trans>Full Name</Trans>}
          onChange={(event) => (this.setState({ name: event.target.value }))}
        />
        <br/>
        <TextField
          style={{ width: '50%' }}
          name="email"
          label={<Trans>Email</Trans>}
          onChange={(event) => (this.setState({ email: event.target.value }))}
        />
        <br/>
        <TextField
          type="password"
          name="password"
          style={{ width: '50%' }}
          label={<Trans>Password</Trans>}
          onChange={(event) => (this.setState({ password: event.target.value }))}
        />
        <br/>
        <TextField
          type="password"
          name="password-again"
          style={{ width: '50%' }}
          label={<Trans>Password Again</Trans>}
          onChange={(event) => (this.setState({ passwordAgain: event.target.value }))}
        />
        <br/>
        <br/>
        <Button id="cancel" variant="outlined" onClick={() => this.onCancel()}><Trans>Cancel</Trans></Button>
        &nbsp;
        <Button id="submit" variant="outlined" onClick={() => this.onRegister()}><Trans>Submit</Trans></Button>
      </Panel>
    </form>
  }
}

RegisterForm.propTypes = {
  store: PropTypes.instanceOf(Store),
  history: ReactRouterPropTypes.history.isRequired,
  onRegister: PropTypes.func,
  t: PropTypes.func,
  cursor: PropTypes.instanceOf(Cursor)
}

export default RegisterForm
