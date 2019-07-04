import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import Configuration from '../Configuration';
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
    this.props.cursor.registerMenu(this);
    this.props.store.fetchDatabases();
    this.update(this.props.match.params);
  }

  componentDidUpdate() {
    this.update(this.props.match.params);
  }

  keyCtrlSpace() {
    this.handleSelect('dashboard');
    return {preventDefault: true};
  }

  keyCtrlX() {
    this.handleSelect('txs');
    return {preventDefault: true};
  }

  keyCtrlR() {
    this.handleSelect('report');
    return {preventDefault: true};
  }

  keyCtrlA() {
    this.handleSelect('account');
    return {preventDefault: true};
  }

  keyCtrlO() {
    this.handleSelect('tools');
    return {preventDefault: true};
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

  render() {
    const {db, periodId} = this.props.store;
    const notLoggedIn = !this.props.store.token;

    return (
      <div className="Menu">
        <Navbar fluid>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="/" className="brand">Tilitintin v{Configuration.VERSION}</a>
            </Navbar.Brand>
          </Navbar.Header>

          <Nav bsStyle="tabs" activeKey="1" onSelect={() => this.handleSelect('dashboard')}>
            <NavItem eventKey="1" disabled={notLoggedIn}>
              <code>Ctrl+Space</code> <Trans>Home</Trans><span className="fa-icon"> <i className="fas fa-home"></i></span>
            </NavItem>
          </Nav>

          <Nav bsStyle="tabs" pullRight activeKey="3" onSelect={() => this.handleSelect('logout')}>
            <NavItem eventKey="3" disabled={notLoggedIn}>
              <Trans>Logout</Trans>
            </NavItem>
          </Nav>

          <Nav bsStyle="tabs" pullRight activeKey="4" onSelect={() => this.handleSelect('tools')}>
            <NavItem eventKey="4">
              <code>Ctrl+O</code> <Trans>Tools</Trans>
            </NavItem>
          </Nav>
          <Nav bsStyle="tabs" pullRight activeKey="5" onSelect={() => this.handleSelect('account')}>
            <NavItem eventKey="5" disabled={!db || notLoggedIn}>
              <code>Ctrl+A</code> <Trans>Accounts</Trans>
            </NavItem>
          </Nav>
          <Nav bsStyle="tabs" pullRight activeKey="6" onSelect={() => this.handleSelect('report')}>
            <NavItem eventKey="6" disabled={!db || !periodId || notLoggedIn}>
              <code>Ctrl+R</code> <Trans>Reports</Trans>
            </NavItem>
          </Nav>
          <Nav bsStyle="tabs" pullRight activeKey="7" onSelect={() => this.handleSelect('txs')}>
            <NavItem eventKey="7" disabled={!db || !periodId || notLoggedIn}>
              <code>Ctrl+X</code> <Trans>Transactions</Trans>
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
