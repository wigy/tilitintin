import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { withTranslation, Trans } from 'react-i18next'
import Store from '../Stores/Store'
import Cursor from '../Stores/Cursor'
import Title from './Title'
import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core'
import { withRouter } from 'react-router-dom'
import ReactRouterPropTypes from 'react-router-prop-types'

@withRouter
@withTranslation('translations')
@inject('cursor')
@inject('store')
@observer
class DatabaseList extends Component {

  render() {
    if (!this.props.store.token) {
      return ''
    }

    const current = this.props.store.db

    return (
      <div>
        <Title className="DatabasesPage"><Trans>Databases</Trans></Title>
        <List className="DatabaseList">
          {this.props.store.dbs.map((db, index) => {
            const letter = 'ABCDEFGHIJKLMNOPQRSTUVWZ'[index]
            return (
              <ListItem id={letter} key={db.name} button selected={current === db.name} onClick={() => this.props.history.push(`/${db.name}`)}>
                <ListItemAvatar color="primary">
                  <Avatar>{letter}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={db.name}
                />
              </ListItem>
            )
          }
          )}
        </List>
      </div>
    )
  }
}

DatabaseList.propTypes = {
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor),
  history: ReactRouterPropTypes.history,
}

export default DatabaseList
