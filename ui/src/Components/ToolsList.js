import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';

@translate('translations')
@inject('store')
@inject('cursor')
@observer
class ToolsList extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Tools');
  }

  render() {
    const { store } = this.props;
    if (!store.token) {
      return '';
    }

    const url = (page) => '/' + (store.db || '_') + '/tools/' + (store.periodId || '') + '/' + ((store.account && store.account.id) || '') + '/' + page;

    return (
      <div>
        <h1><Trans>Tools</Trans></h1>
        <dl>
          <li><Link className={store.db ? '' : 'disabled-link'} to={url('periods')}><Trans>Periods</Trans></Link></li>
          <li><Link className={store.periodId ? '' : 'disabled-link'} to={url('vat')}><Trans>Value Added Tax</Trans></Link></li>
        </dl>
      </div>
    );
  }
}

ToolsList.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store)
};

export default ToolsList;
