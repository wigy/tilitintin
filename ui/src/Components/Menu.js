import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Navbar, Nav, NavDropdown, NavItem, MenuItem } from 'react-bootstrap';
import YYYYMMDD from './YYYYMMDD';
import './Menu.css';

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
    if (!this.props.store.token) {
      return '';
    }

    const {db,periodId} = this.props.store;

    return (
      <div className="Menu">
        <Navbar fluid>
          <Navbar.Header>
            <Navbar.Brand>
              <span className="brand">Tilitintin</span>
            </Navbar.Brand>
          </Navbar.Header>

          <Nav bsStyle="tabs" activeKey="1" onSelect={k => this.handleSelect(k)}>
            <NavDropdown eventKey="1" title={this.props.store.db || 'Select Database'} id="nav-dropdown">
              {this.props.store.dbs.map(db => (
                <MenuItem key={db} eventKey={'/' + db}>{db}</MenuItem>
              ))}
            </NavDropdown>
          </Nav>

          <Nav bsStyle="tabs" activeKey="2" onSelect={k => this.handleSelect(k)}>
            <NavDropdown eventKey="2" title={periodId ? 'Period ' + periodId : 'Select Period'} id="nav-dropdown" disabled={!this.props.store.db}>
              {this.props.store.periods.map(period => (
                <MenuItem key={period.id} eventKey={'/' + db + '/period/' + period.id}>
                  <YYYYMMDD date={period.start_date} /> &mdash; <YYYYMMDD date={period.end_date} />
                </MenuItem>
              ))}
            </NavDropdown>
          </Nav>

          <Nav bsStyle="tabs" pullRight activeKey="3" onSelect={() => this.handleSelect('logout')}>
            <NavItem eventKey="3">
              Logout
            </NavItem>
          </Nav>

        </Navbar>
      </div>
    );
  }
}));

/*
OLD Menu
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Menu extends Component {
  render() {
    const {db} = this.props.match.params;
    const ret=(<div className="Menu">
      <Link to={'/' + db + '/account'}>Tilit</Link> |
      <Link to={'/' + db + '/report'}>Raportit</Link>
    </div>);
    return ret && '';
  }
}

export default Menu;
*/
