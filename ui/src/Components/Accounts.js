import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import AccountTable from '../Components/AccountTable';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';

@translate('translations')
@inject('store')
@inject('cursor')
@observer
class Accounts extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Accounts');
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }
    const { favorite, asset, liability, equity, revenue, expense, profit, search } = this.props.store.tools.accounts;
    const types = []
      .concat(!asset ? ['ASSET'] : [])
      .concat(!liability ? ['LIABILITY'] : [])
      .concat(!equity ? ['EQUITY'] : [])
      .concat(!revenue ? ['REVENUE'] : [])
      .concat(!expense ? ['EXPENSE'] : [])
      .concat(!profit ? ['PROFIT_PREV', 'PROFIT'] : []);
    const s = search && search.toUpperCase();
    let accounts = this.props.store.accounts.filter(acc => (
      (!favorite || acc.FAVORITE) &&
      (types.includes(acc.type)) &&
      (!s || acc.name.toUpperCase().indexOf(s) >= 0)
    ));

    return (
      <div className="Accounts">
        <h1><Trans>Account scheme</Trans></h1>
        <AccountTable accounts={accounts} headings={this.props.store.headings} />
      </div>
    );
  }
}

Accounts.propTypes = {
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor)
};

export default Accounts;
