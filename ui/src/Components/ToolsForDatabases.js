import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withTranslation, Trans } from 'react-i18next';
import Store from '../Stores/Store';

@withTranslation('translations')
@inject('store')
@observer
class ToolsForDatabases extends Component {

  render() {

    if (!this.props.store.token) {
      return '';
    }

    return (
      <div className="Tools">
        <h1><Trans>Databases</Trans></h1>
        {this.props.store.dbs.map((db, index) => <h2 key={db.name}>{db.name}</h2>)}
      </div>
    );
  }
}

ToolsForDatabases.propTypes = {
  db: PropTypes.string,
  periodId: PropTypes.string,
  store: PropTypes.instanceOf(Store)
};
export default ToolsForDatabases;
