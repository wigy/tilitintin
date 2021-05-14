import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { inject, observer } from 'mobx-react'
import { withTranslation } from 'react-i18next'
import Store from '../Stores/Store'
import Cursor from '../Stores/Cursor'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { withRouter } from 'react-router-dom'

@withRouter
@withTranslation('translations')
@inject('store')
@observer
class UserList extends Component {

  state = {
    users: []
  }

  componentDidMount() {
    this.getUsers()
  }

  getUsers() {
    this.props.store.request('/admin/user')
      .then((users) => {
        this.setState({ users })
      })
  }

  onClickUser(user) {
    this.props.history.push(`/_/admin///users?user=${user.user}`)
  }

  render() {
    const { store, location } = this.props
    if (!store.token) {
      return ''
    }
    const current = new URLSearchParams(location.search).get('user')
    return (
      <div>
        <List className="UserList">
          {this.state.users.map((user) => (
            <ListItem key={user.user} button selected={current === user.user} onClick={() => this.onClickUser(user)}>
              <ListItemText primary={`${user.name} (${user.user})`} secondary={user.email} />
            </ListItem>
          ))}
        </List>
      </div>
    )
  }
}

UserList.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  location: PropTypes.object,
  history: ReactRouterPropTypes.history,
  store: PropTypes.instanceOf(Store)
}

export default UserList
