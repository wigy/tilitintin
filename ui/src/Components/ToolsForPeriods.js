import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import IconButton from './IconButton';
import Localize from './Localize';

import './ToolsForPeriods.css';

@translate('translations')
@inject('store')
@observer
class ToolsForPeriods extends Component {

  lockPeriod(period) {
    period.locked = 1;
    period.save();
  }

  unlockPeriod(period) {
    period.locked = 0;
    period.save();
  }

  render() {

    if (!this.props.store.token) {
      return '';
    }
    if (!this.props.store.database) {
      return '';
    }

    return (
      <div className="Tools">
        <table className="ToolsForPeriods">
          <tbody>
            <tr>
              <th>#</th>
              <th><Trans>Start Date</Trans></th>
              <th><Trans>End Date</Trans></th>
              <th><Trans>Locked</Trans></th>
              <th></th>
            </tr>
            {this.props.store.database.periods.map((period) =>
              <tr key={period.id}>
                <td>
                  {period.id}
                </td>
                <td>
                  <Localize date={period.start_date} />
                </td>
                <td>
                  <Localize date={period.end_date} />
                </td>
                <td>
                  <Trans>{period.locked ? 'Yes' : 'No'}</Trans>
                </td>
                <td>
                  <IconButton disabled={!!period.locked} onClick={() => this.lockPeriod(period)} title="lock-period" icon="fa fa-lock"></IconButton>
                  <IconButton disabled={!period.locked} onClick={() => this.unlockPeriod(period)} title="unlock-period" icon="fa fa-unlock"></IconButton>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

ToolsForPeriods.propTypes = {
  db: PropTypes.string,
  store: PropTypes.instanceOf(Store)
};
export default ToolsForPeriods;
