import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { withTranslation, Trans } from 'react-i18next'
import Store from '../Stores/Store'
import Title from './Title'
import { Card, CardActions, CardContent, Button, CardHeader } from '@material-ui/core'
import ReactRouterPropTypes from 'react-router-prop-types'
import { withRouter } from 'react-router-dom'
import { Storage } from '@material-ui/icons'

@withRouter
@withTranslation('translations')
@inject('store')
@observer
class ToolsForDatabases extends Component {

  render() {

    if (!this.props.store.token) {
      return ''
    }

    const goto = (db) => {
      this.props.history.push(`/${db.name}`)
    }

    return (
      <div>
        <Title><Trans>Databases</Trans></Title>
        <div style={{ display: 'flex' }}>
          {this.props.store.dbs.map((db, index) => (
            <Card key={index} style={{ margin: '1rem', width: '20rem' }}>
              <CardHeader avatar={<Storage/>} title={<Trans>Database</Trans>} subheader={db.name}/>
              <CardContent>
              </CardContent>
              <CardActions>
                <Button variant="outlined" color="primary" size="small" onClick={() => goto(db)}><Trans>View</Trans></Button>
              </CardActions>
            </Card>
          ))}
        </div>
      </div>
    )
  }
}

ToolsForDatabases.propTypes = {
  db: PropTypes.string,
  periodId: PropTypes.string,
  history: ReactRouterPropTypes.history,
  store: PropTypes.instanceOf(Store)
}
export default ToolsForDatabases
