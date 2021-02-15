import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withTranslation, Trans } from 'react-i18next';
import Localize from './Localize';
import Store from '../Stores/Store';
import Title from './Title';
import { Typography } from '@material-ui/core';

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
      <div>
        <Title><Trans>Documents that need renumbering</Trans></Title>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '1rem', padding: '1rem' }}>
          {
            toRenumber.length
              ? toRenumber.map((c) => <div key={c.id}>
                <Typography color="primary">
                  <Localize date={c.date}></Localize>
                  &nbsp;
                  #{c.number} {'->'} #{c.newNumber}
                </Typography>
              </div>)
              : <Trans>All documents are correctly numbered.</Trans>
          }
        </div>
        <Title><Trans>Documents having no entries</Trans></Title>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '1rem', padding: '1rem' }}>
          {
            toDelete.length
              ? toDelete.map((d) => <div key={d.id}>
                <Typography color="primary">
                  <Localize date={d.date}></Localize>
                  &nbsp;
                  #{d.number}
                </Typography>
              </div>)
              : <Trans>No empty documents.</Trans>
          }
        </div>
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
