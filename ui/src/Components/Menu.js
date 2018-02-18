import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Navbar, Nav, NavDropdown, NavItem, MenuItem } from 'react-bootstrap';
import YYYYMMDD from './YYYYMMDD';
import './Menu.css';

// TODO: i18n
// TODO: Keep account if changing period.
export default inject('store')(observer(class Menu extends Component {

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

    return (
      <div className="Menu">
        <Navbar fluid>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="/" className="brand">Tilitintin</a>
            </Navbar.Brand>
          </Navbar.Header>

          <Nav bsStyle="tabs" activeKey="1" onSelect={k => this.handleSelect(k)}>
            <NavDropdown eventKey="1" title={db || 'Valitse kanta'} id="nav-dropdown" disabled={notLoggedIn}>
              {this.props.store.dbs.map(db => (
                <MenuItem key={db} eventKey={'/' + db}>{db}</MenuItem>
              ))}
            </NavDropdown>
          </Nav>

          <Nav bsStyle="tabs" activeKey="2" onSelect={k => this.handleSelect(k)}>
            <NavDropdown eventKey="2" title={periodId ? 'Jakso ' + periodId : 'Valitse jakso'} id="nav-dropdown" disabled={!db || notLoggedIn}>
              {this.props.store.periods.map(period => (
                <MenuItem key={period.id} eventKey={'/' + db + '/period/' + period.id}>
                  <YYYYMMDD date={period.start_date} /> &mdash; <YYYYMMDD date={period.end_date} />
                </MenuItem>
              ))}
            </NavDropdown>
          </Nav>

          <Nav bsStyle="tabs" pullRight activeKey="5" onSelect={() => this.handleSelect('logout')}>
            <NavItem eventKey="5" disabled={notLoggedIn}>
              Poistu
            </NavItem>
          </Nav>

          <Nav bsStyle="tabs" pullRight activeKey="3" onSelect={() => this.handleSelect('/' + db + '/account/')}>
            <NavItem eventKey="3" disabled={!db || notLoggedIn}>
              Tilit
            </NavItem>
          </Nav>
          <Nav bsStyle="tabs" pullRight activeKey="4" onSelect={() => this.handleSelect('/' + db + '/report/')}>
            <NavItem eventKey="4" disabled={!db || notLoggedIn}>
              Raportit
            </NavItem>
          </Nav>

        </Navbar>
      </div>
    );
  }
}));
