import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { inject, observer } from 'mobx-react';
import { Trans, withTranslation } from 'react-i18next';
import Store from '../Stores/Store';
import Localize from './Localize';
import Cursor from '../Stores/Cursor';
import Configuration from '../Configuration';
import LanguageSelector from './LanguageSelector';
import './Menu.css';

@withTranslation('translations')
@inject('store')
@inject('cursor')
@observer
class Menu extends Component {

  menu = [
    {
      title: 'Home',
      icon: 'fas fa-home',
      shortcut: ' ',
      disabled: ({ notLoggedIn, isAdmin }) => notLoggedIn || isAdmin,
      action: () => this.handleSelect('dashboard')
    },
    {
      title: 'Transactions',
      shortcut: 'X',
      disabled: ({ db, periodId, notLoggedIn }) => !db || !periodId || notLoggedIn,
      action: () => this.handleSelect('txs')
    },
    {
      title: 'Reports',
      shortcut: 'R',
      disabled: ({ db, periodId, notLoggedIn }) => !db || !periodId || notLoggedIn,
      action: () => this.handleSelect('report')
    },
    {
      title: 'Accounts',
      shortcut: 'Y',
      disabled: ({ db, notLoggedIn }) => !db || notLoggedIn,
      action: () => this.handleSelect('account')
    },
    {
      title: 'Tools',
      shortcut: 'T',
      disabled: ({ notLoggedIn, isAdmin }) => notLoggedIn || isAdmin,
      action: () => this.handleSelect('tools')
    },
    {
      title: 'Logout',
      disabled: ({ notLoggedIn }) => notLoggedIn,
      action: () => this.handleSelect('logout')
    }
  ];

  update({ db, periodId }) {
    if (db === '_') {
      db = null;
    }
    periodId = parseInt(periodId) || null;
    this.props.store.setPeriod(db, periodId);
  }

  componentDidMount() {
    this.props.cursor.registerMenu(this);
    this.props.store.fetchDatabases();
    this.update(this.props.match.params);
  }

  componentDidUpdate() {
    this.update(this.props.match.params);
  }

  keyText(cursor, key) {
    key = key.toUpperCase();
    const entry = this.menu.filter(e => e.shortcut === key);
    if (entry.length) {
      if (!this.isEnabled(entry[0])) {
        return;
      }
      entry[0].action();
      return { preventDefault: true };
    }
  }

  handleSelect(key, ...args) {
    let url;
    const [ , db, , periodId, accountId ] = this.props.history.location.pathname.split('/');
    switch (key) {
      case 'logout':
        this.props.store.logout();
        this.props.history.push('/');
        break;
      case 'dashboard':
      case 'txs':
      case 'account':
      case 'report':
      case 'tools':
        url = '/' + (db || '_') + '/' + key;
        if (periodId) {
          url += '/' + periodId;
        }
        if (accountId) {
          url += '/' + accountId;
        }
        this.props.cursor.resetSelected();
        this.props.history.push(url);
        break;
      default:
        console.log('No idea how to handle', key, args);
    }
  }

  isEnabled(entry) {
    const { db, periodId, isAdmin } = this.props.store;
    const notLoggedIn = !this.props.store.token;
    return !entry.disabled({ db, periodId, isAdmin, notLoggedIn });
  }

  renderMenu(entry) {
    return <span key={entry.title} className={this.isEnabled(entry) ? 'entry' : 'entry disabled'} onClick={() => entry.action()}>
      <span className="spacer"/>
      {entry.shortcut && <code>{entry.shortcut === ' ' ? 'Space' : entry.shortcut}</code>}
      <span> <Trans>{entry.title}</Trans></span>
      {entry.icon && <span className="fa-icon"> <i className={entry.icon}></i></span>}
      <span className="spacer"/>
    </span>;
  }

  render() {
    return (
      <div className="Menu">
        <span className="spacer"></span>
        <img className="logo" alt="logo" src="/logo.png"/>
        <span className="spacer"></span>
        <a href="/" className="brand">Tilitintin v{Configuration.VERSION}</a>
        <span className="spacer"></span>
        <span className="spacer"></span>
        <span className="spacer"></span>
        <span className="database">
          <span className="fa-icon"><i className="fa fa-database"></i></span> {this.props.store.db || <>&nbsp;&nbsp;&mdash;</>}
        </span>
        <span className="spacer"></span>
        <span className="period">
          <span className="fa-icon"><i className="fa fa-calendar"></i></span> {
            this.props.store.period &&
            <>
              <Localize date={this.props.store.period.start_date}/>
              &nbsp;&mdash;&nbsp;
              <Localize date={this.props.store.period.end_date}/>
            </>
          }{ !this.props.store.period &&
            <>&nbsp;&nbsp;&mdash;</>
          }
        </span>
        <span className="spacer"></span>
        <span className="spacer"></span>
        <span className="spacer"></span>
        {this.menu.map(entry => this.renderMenu(entry))}
        <LanguageSelector />
      </div>
    );
  }
}

Menu.propTypes = {
  store: PropTypes.instanceOf(Store),
  cursor: PropTypes.instanceOf(Cursor),
  match: PropTypes.object,
  history: ReactRouterPropTypes.history.isRequired,
  t: PropTypes.any
};

export default Menu;
