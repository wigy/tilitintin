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

  render() {
    if (!this.props.store.token) {
      return '';
    }
    const current = this.props.store.db;
    return (
      <div className="DatabaseList">
        <h1><Trans>Databases</Trans></h1>
        <ul className="menu">
          {this.props.store.dbs.map((db, index) => <li key={db.name} className={current === db.name ? 'current' : ''}>
            <Link to={`/${db.name}`}><code>{'ABCDEFGHIJKLMNOPQRSTUVWZ'[index]}</code> {db.name}</Link>
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
