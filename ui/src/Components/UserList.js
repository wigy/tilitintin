import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { inject, observer } from 'mobx-react'
import { withTranslation, Trans } from 'react-i18next'
import Store from '../Stores/Store'
import Cursor from '../Stores/Cursor'
import Title from './Title'
import { List, ListItem, ListItemText } from '@material-ui/core'

@withTranslation('translations')
@inject('store')
@observer
class ToolsList extends Component {

  state = {
    users: []
  }

  componentDidMount() {
    this.getUsers()
  }

  componentDidUpdate(oldProps) {
    if (oldProps.match.params.arg && !this.props.match.params.arg) {
      this.getUsers()
    }
  }

  getUsers() {
    this.props.store.request('/admin/user')
      .then((users) => {
        this.setState({ users })
      })
  }

  onClickUser(user) {
    this.props.history.push(`/_/admin/${user.user}`)
  }

  render() {
    const { store, match } = this.props
    if (!store.token) {
      return ''
    }

    return (
      <div>
        <Title><Trans>Users</Trans></Title>
        <List>
          {this.state.users.map((user) => (
            <ListItem key={user.user} button selected={match.params.arg === user.user} onClick={() => this.onClickUser(user)}>
              <ListItemText primary={`${user.name} (${user.user})`} secondary={user.email} />
            </ListItem>
          ))}
        </List>
      </div>
    )
  }
}

ToolsList.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  match: PropTypes.object,
  history: ReactRouterPropTypes.history.isRequired,
  store: PropTypes.instanceOf(Store)
}

export default ToolsList
