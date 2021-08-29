import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import Localize from './Localize'
import { inject, observer } from 'mobx-react'
import { withTranslation, Trans } from 'react-i18next'
import Store from '../Stores/Store'
import Cursor from '../Stores/Cursor'
import Title from './Title'
import { Button, Typography, Avatar, List, ListItem } from '@material-ui/core'
import Panel from './Panel'

@withTranslation('translations')
@inject('cursor')
@inject('store')
@observer
class Dashboard extends Component {

  componentDidUpdate() {
    if (!this.props.store.database) {
      return
    }
    if (this.props.store.database.name !== this.props.match.params.db) {
      this.props.store.setDb(this.props.match.params.db)
    }
  }

  componentDidMount() {
    this.props.cursor.selectPage('Dashboard', this)
  }

  selectDb(num) {
    const { dbs } = this.props.store
    num--
    if (num < dbs.length) {
      this.props.history.push(`/${dbs[num].name}`)
    }
  }

  selectPeriod(num) {
    if (!this.props.store.database) {
      return
    }
    let period
    if (typeof num === 'number') {
      const periods = this.props.store.database.periods.reverse()
      period = periods[num - 1]
    } else {
      period = num
    }
    if (period) {
      this.props.history.push(`/${this.props.store.db}/txs/${period.id}`)
    }
  }

  keyText(cursor, key) {
    if (key >= '1' && key <= '9') {
      this.selectPeriod(parseInt(key))
    }
    key = key.toUpperCase()
    if (key >= 'A' && key <= 'Z') {
      this.selectDb(key.charCodeAt(0) - 64)
    }
  }

  render() {
    const { store } = this.props
    if (!store.token) {
      return ''
    }
    if (!store.db) {
      return <>
        <Title><Trans>No Database Selected</Trans></Title>
      </>
    }
    const { periodId } = this.props.match.params

    return (
      <div className="Dashboard">
        <Title><Trans>Database</Trans>: {store.db}</Title>
        <Panel title={<Trans>Company Info</Trans>}>
          <Trans>Business name</Trans>: {store.settings.BUSINESS_NAME}<br />
          <Trans>Business ID</Trans>: {store.settings.BUSINESS_ID}<br />
          <br />
          <Typography variant="h5" color="textSecondary"><Trans>Periods</Trans></Typography>
          <List className="PeriodList">
            {store.database.periods.reverse().map((period, index) => (
              <ListItem id={`period-${period.start_date}-${period.end_date}`} key={period.id} selected={parseInt(periodId) === period.id}>
                <Button id={index + 1} onClick={() => this.selectPeriod(period)}>
                  <Avatar>{index + 1}</Avatar>&nbsp;
                  <Localize date={period.start_date} /> &mdash; <Localize date={period.end_date} />
                </Button>
              </ListItem>
            ))}
          </List>
        </Panel>
      </div>
    )
  }
}

Dashboard.propTypes = {
  match: PropTypes.object,
  history: ReactRouterPropTypes.history.isRequired,
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor)
}

export default Dashboard
