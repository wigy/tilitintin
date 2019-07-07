import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
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
    this.props.cursor.selectPage('Tools', this);
  }

  url(page) {
    const { store } = this.props;
    return '/' + (store.db || '_') + '/tools/' + (store.periodId || '') + '/' + ((store.account && store.account.id) || '') + '/' + page;
  }

  keyText(cursor, key) {
    if (key === '1') {
      this.props.history.push(this.url('periods'));
      return {preventDefault: true};
    }
    if (key === '2') {
      this.props.history.push(this.url('documents'));
      return {preventDefault: true};
    }
    if (key === '3') {
      this.props.history.push(this.url('vat'));
      return {preventDefault: true};
    }
  }

  render() {
    const { store } = this.props;
    if (!store.token) {
      return '';
    }

    return (
      <div>
        <h1><Trans>Tools</Trans></h1>
        <ul className="menu">
          <li className={store.db ? '' : 'disabled-link'}><Link to={this.url('periods')}><code>1</code> <Trans>Periods</Trans></Link></li>
          <li className={store.db ? '' : 'disabled-link'}><Link to={this.url('documents')}><code>2</code> <Trans>Documents</Trans></Link></li>
          <li className={store.periodId ? '' : 'disabled-link'}><Link to={this.url('vat')}><code>3</code> <Trans>Value Added Tax</Trans></Link></li>
        </ul>
      </div>
    );
  }
}

ToolsList.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  history: ReactRouterPropTypes.history.isRequired,
  store: PropTypes.instanceOf(Store)
};

export default ToolsList;
