import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withTranslation, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import IconButton from './IconButton';
import Localize from './Localize';
import { Table, TableContainer, TableBody, TableCell, TableRow, TableHead, Chip, Avatar } from '@material-ui/core';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';

const Locked = ({ lock }) => lock
  ? <Chip color="primary" avatar={<Avatar><LockIcon/></Avatar>} label={<Trans>Locked</Trans>} />
  : <Chip color="secondary" avatar={<Avatar><LockOpenIcon/></Avatar>} label={<Trans>Unlocked</Trans>} />;

Locked.propTypes = {
  lock: PropTypes.bool
};

@withTranslation('translations')
@inject('store')
@observer
class ToolsForPeriods extends Component {

  render() {

    if (!this.props.store.token) {
      return '';
    }
    if (!this.props.store.database) {
      return '';
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
                  <IconButton toggle={!!period.locked} onClick={() => period.lock()} title="lock-period" icon="fa fa-lock"></IconButton>
                  <IconButton toggle={!period.locked} onClick={() => period.unlock()} title="unlock-period" icon="fa fa-unlock"></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

ToolsForPeriods.propTypes = {
  db: PropTypes.string,
  store: PropTypes.instanceOf(Store)
};
export default ToolsForPeriods;
