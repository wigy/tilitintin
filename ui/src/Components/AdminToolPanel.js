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

@withTranslation('translations')
@inject('store')
@observer
class AdminToolPanel extends Component {

  state = {
    showCreateUserDialog: false
  }

  onCreateUser() {
    this.setState({ showCreateUserDialog: true })
  }

  onRegister({ user, name, password, email }) {
    return this.props.store.request('/admin/user', 'POST', { user, name, password, email })
      .then(() => {
        this.setState({ showCreateUserDialog: false })
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

    if (match.params && match.params.tool === 'users') {
      return (
        <div className="ToolPanel AdminToolPanel">
          <Title><Trans>User Tools</Trans></Title>
          <IconButton id="create-user" disabled={this.state.showCreateUserDialog} onClick={() => this.onCreateUser()} title="create-user" icon="user-plus"></IconButton>
          <Dialog noActions
            title={<Trans>Create User</Trans>}
            isVisible={this.state.showCreateUserDialog}
            onClose={() => this.setState({ showCreateUserDialog: false })}
            wider
          >
            <RegisterForm
              onCancel={() => this.setState({ showCreateUserDialog: false })}
              onRegister={({ user, name, password, email }) => this.onRegister({ user, name, password, email })}
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
