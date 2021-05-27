import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { withTranslation, Trans } from 'react-i18next'
import IconButton from './IconButton'
import Store from '../Stores/Store'
import Cursor from '../Stores/Cursor'
import Title from './Title'
import RegisterForm from './RegisterForm'
import Dialog from './Dialog'
import { TextField } from '@material-ui/core'

@withTranslation('translations')
@inject('store')
@observer
class AdminToolPanel extends Component {

  state = {
    showCreateUserDialog: false,
    showDeleteUserDialog: false,
    emailInput: ''
  }

  componentDidMount() {
    this.props.store.getUsers()
  }

  onCreateUser() {
    this.setState({ showCreateUserDialog: true })
  }

  async onDeleteUser(user) {
    if (user.email !== this.state.emailInput) {
      this.props.store.addError(this.props.t('Email was not given correctly.'))
    } else {
      if (await this.props.store.deleteUser(user)) {
        this.props.store.getUsers()
        this.props.store.addMessage(this.props.t('User deleted permanently.'))
      }
    }
  }

  onRegister({ user, name, password, email }) {
    return this.props.store.request('/admin/user', 'POST', { user, name, password, email })
      .then(() => {
        this.setState({ showCreateUserDialog: false })
        this.props.store.getUsers()
        this.props.store.addMessage(this.props.t('User created successfully.'))
      })
      .catch(() => {
        this.setState({ showCreateUserDialog: false })
        this.props.store.addError(this.props.t('User creation failed.'))
      })
  }

  render() {
    const { store, match } = this.props

    if (!store.token) {
      return ''
    }

    if (match.params && (match.params.tool === 'users' || !match.params.tool)) {

      const selectedUser = this.props.location.search && new URLSearchParams(this.props.location.search).get('user')
      const user = selectedUser && this.props.store.getUser(selectedUser)

      return (
        <div className="ToolPanel AdminToolPanel">
          <Title className="UserTools"><Trans>User Tools</Trans></Title>

          <IconButton id="create-user" disabled={this.state.showCreateUserDialog} onClick={() => this.onCreateUser()} title="create-user" icon="user-plus"></IconButton>
          <IconButton id="delete-user" disabled={!selectedUser} onClick={() => this.setState({ showDeleteUserDialog: true, emailInput: '' })} title="delete-user" icon="trash"></IconButton>

          <Dialog
            noActions
            wider
            title={<Trans>Create User</Trans>}
            isVisible={this.state.showCreateUserDialog}
            onClose={() => this.setState({ showCreateUserDialog: false })}
          >
            <RegisterForm
              onCancel={() => this.setState({ showCreateUserDialog: false })}
              onRegister={({ user, name, password, email }) => this.onRegister({ user, name, password, email })}
              />
          </Dialog>

          <Dialog
            title={<Trans>Delete User</Trans>}
            isVisible={this.state.showDeleteUserDialog}
            onClose={() => this.setState({ showDeleteUserDialog: false })}
            onConfirm={() => this.onDeleteUser(user)}
            wider
          >
              <Trans>Deleting the user is irreversible!</Trans><br />
              <Trans>Please type in the email</Trans> <b>{user && user.email}</b>
              <TextField
                name="deleted-user-email"
                fullWidth
                label={<Trans>Email</Trans>}
                value={this.state.nameInput}
                onChange={(event) => (this.setState({ emailInput: event.target.value }))}
              />
          </Dialog>
        </div>
      )
    }

    return <Title><Trans>No Tools</Trans></Title>
  }
}

AdminToolPanel.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  location: PropTypes.object,
  match: PropTypes.object,
  store: PropTypes.instanceOf(Store),
  t: PropTypes.func
}

export default AdminToolPanel
