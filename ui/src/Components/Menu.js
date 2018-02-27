import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import { Navbar, Nav, NavDropdown, NavItem, MenuItem } from 'react-bootstrap';
import YYYYMMDD from './YYYYMMDD';
import './Menu.css';

// TODO: Keep account if changing period.
export default translate('translations')(inject('store')(observer(class Menu extends Component {

  update({db, periodId, accountId}) {
    this.props.store.setDb(db);
    this.props.store.setPeriod(db, periodId);
    this.props.store.setAccount(db, periodId, accountId);
  }

  componentDidMount() {
    this.update(this.props.match.params);
  }

  componentWillReceiveProps(props) {
    this.update(props.match.params);
  }

  handleSelect(key) {
    if (key === 'logout') {
      this.props.store.logout();
    } else {
      this.props.history.push(key);
    }
  }

  render() {
    const {db,periodId} = this.props.store;
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

          <Nav bsStyle="tabs" activeKey="1" onSelect={k => this.handleSelect(k)}>
            <NavDropdown eventKey="1" title={db || t('Select database')} id="nav-dropdown" disabled={notLoggedIn}>
              {this.props.store.dbs.map(db => (
                <MenuItem key={db} eventKey={'/' + db}>{db}</MenuItem>
              ))}
            </NavDropdown>
          </Nav>

          <Nav bsStyle="tabs" activeKey="2" onSelect={k => this.handleSelect(k)}>
            <NavDropdown eventKey="2" title={periodId ? t('period {{period}}', {period: periodId}) : t('Select period')} id="nav-dropdown" disabled={!db || notLoggedIn}>
              {this.props.store.periods.map(period => (
                <MenuItem key={period.id} eventKey={'/' + db + '/txs/' + period.id}>
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

          <Nav bsStyle="tabs" pullRight activeKey="4" onSelect={() => this.handleSelect('/' + db + '/account/' + periodId)}>
            <NavItem eventKey="4" disabled={!db || !periodId || notLoggedIn}>
              <Trans>Accounts</Trans>
            </NavItem>
          </Nav>
          <Nav bsStyle="tabs" pullRight activeKey="5" onSelect={() => this.handleSelect('/' + db + '/report/' + periodId)}>
            <NavItem eventKey="5" disabled={!db || !periodId || notLoggedIn}>
              <Trans>Reports</Trans>
            </NavItem>
          </Nav>
          <Nav bsStyle="tabs" pullRight activeKey="6" onSelect={() => this.handleSelect('/' + db + '/txs/' + periodId)} activeHref="/:db/account">
            <NavItem eventKey="6" disabled={!db || !periodId || notLoggedIn}>
              <Trans>Transactions</Trans>
            </NavItem>
          </Nav>

        </Navbar>
      </div>
    );
  }
})));
