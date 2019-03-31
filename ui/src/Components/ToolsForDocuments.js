import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Localize from './Localize';
import Store from '../Stores/Store';

import './ToolsForPeriods.css';

@translate('translations')
@inject('store')
@observer
class ToolsForPeriods extends Component {

  state = {
    changes: []
  };

  componentDidMount() {
    const {db, periodId} = this.props;
    let next = 0;
    let changes = [];
    // TODO: Same request than in ToolsToolPanel. Reorganize code.
    this.props.store.request('/db/' + db + '/document/?period=' + periodId)
      .then((data) => {
        data.forEach(doc => {
          if (doc.number !== next) {
            doc.newNumber = next;
            changes.push(doc);
          }
          next++;
        });
      });
    this.setState({changes});
  }

  render() {

    if (!this.props.store.token) {
      return '';
    }
    if (!this.props.store.periodId) {
      return '';
    }

    return (
      <div className="Tools">
        <h1><Trans>Documents that need renumbering</Trans></h1>
        {
          this.state.changes.map((c) => <div key={c.id}>
            <b><Localize date={c.date}></Localize></b> #{c.number} {'->'} #{c.newNumber}
          </div>)
        }
      </div>
    );
  }
}

ToolsForPeriods.propTypes = {
  db: PropTypes.string,
  periodId: PropTypes.string,
  store: PropTypes.instanceOf(Store)
};
export default ToolsForPeriods;
