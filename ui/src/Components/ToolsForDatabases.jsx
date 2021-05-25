import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { withTranslation, Trans } from 'react-i18next'
import Store from '../Stores/Store'
import Title from './Title'
import { Card, CardActions, CardContent, Button, CardHeader, Typography, TextField } from '@material-ui/core'
import ReactRouterPropTypes from 'react-router-prop-types'
import { withRouter } from 'react-router-dom'
import { Storage } from '@material-ui/icons'
import Dialog from './Dialog'

@withRouter
@withTranslation('translations')
@inject('store')
@observer
class ToolsForDatabases extends Component {

  state = {
    showDeleteDialog: false,
    dbToDelete: null,
    nameInput: ''
  }

  async onDeleteDb() {
    if (this.state.dbToDelete.name !== this.state.nameInput) {
      this.props.store.addError(this.props.t('Database name was not given correctly.'))
    } else {
      const db = this.state.dbToDelete
      await db.delete()
      await this.props.store.fetchDatabases(true)
      this.props.store.addMessage(this.props.t('Database deleted permanently.'))
    }
  }

  render() {

    if (!this.props.store.token) {
      return ''
    }

    const goto = (db) => {
      this.props.history.push(`/${db.name}`)
    }

    return (
      <div>
        <Title className="ToolsForDatabasesPage"><Trans>Databases</Trans></Title>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {this.props.store.dbs.map((db, index) => (
            <Card key={index} style={{ margin: '1rem', width: '20rem' }}>
              <CardHeader className="Database" avatar={<Storage/>} title={<Trans>Database</Trans>} subheader={db.name}/>
              <CardContent>
              </CardContent>
              <CardActions>
                <Button className="ViewDatabase" variant="outlined" color="primary" size="small" onClick={() => goto(db)}><Trans>View</Trans></Button>
                <Button className="DeleteDatabase" disabled={this.props.store.db === db.name} style={{ color: this.props.store.db === db.name ? 'gray' : 'red' }} size="small" onClick={() => this.setState({ showDeleteDialog: true, dbToDelete: db, nameInput: '' })}><Trans>Delete</Trans></Button>
              </CardActions>
            </Card>
          ))}
        </div>

        { this.state.showDeleteDialog &&
          <Dialog
            title={<Trans>Delete this database?</Trans>}
            isVisible={this.state.showDeleteDialog}
            onClose={() => this.setState({ showDeleteDialog: false })}
            onConfirm={() => this.onDeleteDb()}>
              <Trans>Deleting the database is irreversible!</Trans><br />
              <Trans>Please type in the database name</Trans> <b>{this.state.dbToDelete.name}</b>
              <TextField
                name="name"
                fullWidth
                label={<Trans>Name</Trans>}
                value={this.state.nameInput}
                onChange={(event) => (this.setState({ nameInput: event.target.value }))}
              />
          </Dialog>
      }
      </div>
    )
  }
}

ToolsForDatabases.propTypes = {
  db: PropTypes.string,
  t: PropTypes.func,
  periodId: PropTypes.string,
  history: ReactRouterPropTypes.history,
  store: PropTypes.instanceOf(Store)
}
export default ToolsForDatabases
