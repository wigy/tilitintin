import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import { Navbar, Nav, NavDropdown, NavItem, MenuItem } from 'react-bootstrap';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import YYYYMMDD from './YYYYMMDD';
import './Menu.css';

@translate('translations')
@inject('store')
@inject('cursor')
@observer
class Menu extends Component {

  update({db, periodId, accountId, format}) {
    const kept1 = this.props.store.setDb(db);
    const kept2 = this.props.store.setPeriod(db, periodId);
    this.props.store.setAccount(db, periodId, accountId);
    if (db && periodId && format) {
      this.props.store.getReport(format);
    }
    if (!kept1 || !kept2) {
      this.props.cursor.resetSelected();
    }
  }

  componentDidMount() {
    this.update(this.props.match.params);
  }

  componentWillReceiveProps(props) {
    this.update(props.match.params);
  }

  handleSelect(key, ...args) {
    let url;
    const [, db, page, periodId, accountId, param1] = this.props.history.location.pathname.split('/');

    switch (key) {
      case 'logout':
        this.props.store.logout();
        break;
      case 'db':
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
        this.props.history.push(url);
        break;
      case 'txs':
      case 'account':
      case 'report':
        url = '/' + db + '/' + key + '/' + periodId;
        if (accountId) {
          url += '/' + accountId;
        }
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
              <a href="/" className="brand">Tilitintin</a>
            </Navbar.Brand>
          </Navbar.Header>

          <Nav bsStyle="tabs" activeKey="1" onSelect={k => this.handleSelect('db', k)}>
            <NavDropdown eventKey="1" title={db || t('Select database')} id="nav-dropdown" disabled={notLoggedIn}>
              {this.props.store.dbs.map(db => (
                <MenuItem key={db} eventKey={db}>{db}</MenuItem>
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

          <Nav bsStyle="tabs" pullRight activeKey="5" onSelect={() => this.handleSelect('logout')}>
            <NavItem eventKey="5" disabled={notLoggedIn}>
              <Trans>Logout</Trans>
            </NavItem>
          </Nav>

          <Nav bsStyle="tabs" pullRight activeKey="4" onSelect={() => this.handleSelect('account')}>
            <NavItem eventKey="4" disabled={!db || !periodId || notLoggedIn}>
              <Trans>Accounts</Trans>
            </NavItem>
          </Nav>
          <Nav bsStyle="tabs" pullRight activeKey="5" onSelect={() => this.handleSelect('report')}>
            <NavItem eventKey="5" disabled={!db || !periodId || notLoggedIn}>
              <Trans>Reports</Trans>
            </NavItem>
          </Nav>
          <Nav bsStyle="tabs" pullRight activeKey="6" onSelect={() => this.handleSelect('txs')}>
            <NavItem eventKey="6" disabled={!db || !periodId || notLoggedIn}>
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
