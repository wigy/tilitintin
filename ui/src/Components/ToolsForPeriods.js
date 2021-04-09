import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { withTranslation, Trans } from 'react-i18next'
import Store from '../Stores/Store'
import IconButton from './IconButton'
import Localize from './Localize'
import { Table, TableContainer, TableBody, TableCell, TableRow, TableHead, Chip, Button } from '@material-ui/core'
import ReactRouterPropTypes from 'react-router-prop-types'
import { withRouter } from 'react-router-dom'

const Locked = ({ lock }) => lock
  ? <Chip color="primary" label={<Trans>Locked</Trans>} />
  : <Chip color="secondary" label={<Trans>Unlocked</Trans>} />

Locked.propTypes = {
  lock: PropTypes.bool
}

@withRouter
@withTranslation('translations')
@inject('store')
@observer
class ToolsForPeriods extends Component {

  render() {

    if (!this.props.store.token) {
      return ''
    }
    if (!this.props.store.database) {
      return ''
    }
    const goto = (period) => {
      this.props.history.push(`/${this.props.store.database.name}/txs/${period.id}`)
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell variant="head"><Trans>#</Trans></TableCell>
              <TableCell variant="head"><Trans>Start Date</Trans></TableCell>
              <TableCell variant="head"><Trans>End Date</Trans></TableCell>
              <TableCell variant="head"><Trans>Locking</Trans></TableCell>
              <TableCell variant="head"></TableCell>
              <TableCell variant="head"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.store.database.periods.reverse().map((period) => (
              <TableRow key={period.id}>
                <TableCell>{period.id}</TableCell>
                <TableCell><Localize date={period.start_date} /></TableCell>
                <TableCell><Localize date={period.end_date} /></TableCell>
                <TableCell>
                  <Locked lock={!!period.locked} />
                </TableCell>
                <TableCell>
                  <IconButton toggle={!!period.locked} onClick={() => period.lock()} title="lock-period" icon="lock"></IconButton>
                  <IconButton toggle={!period.locked} onClick={() => period.unlock()} title="unlock-period" icon="unlock"></IconButton>
                </TableCell>
                <TableCell>
                  <Button variant="outlined" color="primary" size="small" onClick={() => goto(period)}><Trans>View</Trans></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
}

ToolsForPeriods.propTypes = {
  db: PropTypes.string,
  store: PropTypes.instanceOf(Store),
  history: ReactRouterPropTypes.history,
}
export default ToolsForPeriods
