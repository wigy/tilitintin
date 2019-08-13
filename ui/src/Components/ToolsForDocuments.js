import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withTranslation, Trans } from 'react-i18next';
import Localize from './Localize';
import Store from '../Stores/Store';

import './ToolsForPeriods.css';

@withTranslation('translations')
@inject('store')
@observer
class ToolsForPeriods extends Component {

  render() {

    if (!this.props.store.token) {
      return '';
    }
    if (!this.props.store.periodId) {
      return '';
    }

    const toRenumber = this.props.store.period.incorrectlyNumberedDocuments;

    return (
      <div className="Tools">
        <h1><Trans>Documents that need renumbering</Trans></h1>
        {
          toRenumber.length
            ? toRenumber.map((c) => <div key={c.id}>
              <b><Localize date={c.date}></Localize></b> #{c.number} {'->'} #{c.newNumber}
            </div>)
            : <Trans>All documents are correctly numbered.</Trans>
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
