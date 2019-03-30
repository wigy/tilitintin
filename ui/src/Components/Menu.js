import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import { Navbar, Nav, NavDropdown, NavItem, MenuItem } from 'react-bootstrap';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import Configuration from '../Configuration';
import YYYYMMDD from './YYYYMMDD';
import './Menu.css';

@translate('translations')
@inject('store')
@inject('cursor')
@observer
class Menu extends Component {

  update({db, periodId}) {
    if (db === '_') {
      db = null;
    }
    periodId = parseInt(periodId) || null;
    this.props.store.setPeriod(db, periodId);
  }

  componentDidMount() {
    this.props.store.fetchDatabases();
    this.update(this.props.match.params);
  }

  handleSelect(key, ...args) {
    let url;
    const [, db, page, periodId, accountId, param1] = this.props.history.location.pathname.split('/');

    switch (key) {
      case 'logout':
        this.props.store.logout();
        break;
      case 'db':
        this.props.store.clearDb();
        this.update({db: args[0]});
        this.props.cursor.resetSelected();
        this.props.history.push('/' + args[0]);
        break;
      case 'period':
        url = '/' + db + '/' + (page || 'txs') + '/' + args[0];
        if (accountId) {
          url += '/' + accountId;
        }
        if (param1) {
          if (!accountId) {
            url += '/';
          }
          url += '/' + param1;
        }
        this.props.store.clearPeriod();
        this.update({db, periodId: args[0]});
        this.props.cursor.resetSelected();
        this.props.history.push(url);
        break;
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

  render() {
    const {db, periodId} = this.props.store;
    const notLoggedIn = !this.props.store.token;
    const {t} = this.props;

    return (
      <div className="Menu">
        <Navbar fluid>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="/" className="brand">Tilitintin v{Configuration.VERSION}</a>
            </Navbar.Brand>
          </Navbar.Header>

          <Nav bsStyle="tabs" activeKey="1" onSelect={k => this.handleSelect('db', k)}>
            <NavDropdown eventKey="1" title={db || t('Select database')} id="nav-dropdown" disabled={notLoggedIn}>
              {this.props.store.dbs.map(db => (
                <MenuItem key={db.name} eventKey={db.name}>{db.name}</MenuItem>
              ))}
            </NavDropdown>
          </Nav>

          <Nav bsStyle="tabs" activeKey="2" onSelect={k => this.handleSelect('period', k)}>
            <NavDropdown eventKey="2" title={periodId ? t('period {{period}}', {period: periodId}) : t('Select period')} id="nav-dropdown" disabled={!db || notLoggedIn}>
              {this.props.store.periods.map(period => (
                <MenuItem key={period.id} eventKey={period.id}>
                  <YYYYMMDD date={period.start_date} /> &mdash; <YYYYMMDD date={period.end_date} />
                </MenuItem>
              ))}
            </NavDropdown>
          </Nav>

          <Nav bsStyle="tabs" pullRight activeKey="3" onSelect={() => this.handleSelect('logout')}>
            <NavItem eventKey="3" disabled={notLoggedIn}>
              <Trans>Logout</Trans>
            </NavItem>
          </Nav>

          <Nav bsStyle="tabs" pullRight activeKey="4" onSelect={() => this.handleSelect('tools')}>
            <NavItem eventKey="4">
              <Trans>Tools</Trans>
            </NavItem>
          </Nav>
          <Nav bsStyle="tabs" pullRight activeKey="5" onSelect={() => this.handleSelect('account')}>
            <NavItem eventKey="5" disabled={!db || !periodId || notLoggedIn}>
              <Trans>Accounts</Trans>
            </NavItem>
          </Nav>
          <Nav bsStyle="tabs" pullRight activeKey="6" onSelect={() => this.handleSelect('report')}>
            <NavItem eventKey="6" disabled={!db || !periodId || notLoggedIn}>
              <Trans>Reports</Trans>
            </NavItem>
          </Nav>
          <Nav bsStyle="tabs" pullRight activeKey="7" onSelect={() => this.handleSelect('txs')}>
            <NavItem eventKey="7" disabled={!db || !periodId || notLoggedIn}>
              <Trans>Transactions</Trans>
            </NavItem>
          </Nav>

        </Navbar>
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
