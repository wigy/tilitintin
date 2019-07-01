import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';

@translate('translations')
@inject('cursor')
@inject('store')
@observer
class DatabaseList extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Dashboard');
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }
    return (
      <div className="DatabaseList">
        <h1><Trans>Databases</Trans></h1>
        <ul>
          {this.props.store.dbs.map((db) => <li key={db.name}>
            <Link to={`/${db.name}`}>{db.name}</Link>
          </li>)}
        </ul>
      </div>
    );
  }
}

DatabaseList.propTypes = {
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor)
};

export default DatabaseList;
