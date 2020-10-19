import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withTranslation, Trans } from 'react-i18next';
import Localize from './Localize';
import Store from '../Stores/Store';

import './ToolsForPeriods.css';
import Title from './Title';

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
    const toDelete = this.props.store.period.emptyDocuments;

    return (
      <div className="Tools">
        <Title><Trans>Documents that need renumbering</Trans></Title>
        {
          toRenumber.length
            ? toRenumber.map((c) => <div key={c.id}>
              <b><Localize date={c.date}></Localize></b> #{c.number} {'->'} #{c.newNumber}
            </div>)
            : <Trans>All documents are correctly numbered.</Trans>
        }
        <Title><Trans>Documents having no entries</Trans></Title>
        {
          toDelete.length
            ? toDelete.map((d) => <div key={d.id}><b>
              <Localize date={d.date}></Localize></b> #{d.number}
            </div>)
            : <Trans>No empty documents.</Trans>
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
