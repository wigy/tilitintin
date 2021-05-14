import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { inject, observer } from 'mobx-react'
import { withTranslation, Trans } from 'react-i18next'
import Store from '../Stores/Store'
import Cursor from '../Stores/Cursor'
import Title from './Title'
import { List, ListItem, Avatar, ListItemAvatar, ListItemText } from '@material-ui/core'
import { withRouter } from 'react-router-dom'

@withRouter
@withTranslation('translations')
@inject('store')
@inject('cursor')
@observer
class AdminToolsList extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Admin', this)
  }

  url(page) {
    const { store } = this.props
    return '/' + (store.db || '_') + '/admin/' + (store.periodId || '') + '/' + ((store.account && store.account.id) || '') + '/' + page
  }

  keyText(cursor, key) {
    if (key === '1') {
      this.props.history.push(this.url('users'))
      return { preventDefault: true }
    }
  }

  render() {
    const { store, history, match } = this.props

    if (!store.token) {
      return ''
    }

    return (
      <div>
        <Title><Trans>Admin Tools</Trans></Title>
        <List>
        <ListItem button selected={!match.params.tool || match.params.tool === 'users'} onClick={() => history.push(this.url('users'))}>
            <ListItemAvatar color="primary">
              <Avatar>1</Avatar>
            </ListItemAvatar>
            <ListItemText primary={<Trans>Users</Trans>}/>
          </ListItem>
        </List>
      </div>
    )
  }
}

AdminToolsList.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  match: PropTypes.object,
  history: ReactRouterPropTypes.history.isRequired,
  store: PropTypes.instanceOf(Store)
}

export default AdminToolsList
