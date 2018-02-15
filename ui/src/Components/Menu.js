import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Navbar, Nav, NavDropdown, MenuItem } from 'react-bootstrap';
import YYYYMMDD from './YYYYMMDD';
import './Menu.css';

export default inject('store')(observer(class Menu extends Component {

  componentDidMount() {
    const {db, periodId} = this.props.match.params;
    if (db) {
      this.props.store.getPeriods(db);
      this.props.store.getTags(db);
      if (periodId) {
        this.props.store.setPeriod(periodId);
        this.props.store.getBalances(db, periodId);
      }
    } else {
      this.props.store.setDb(null);
    }
    // TODO: Handle also account here.
    // TODO: Try if you can now remove similar functionality from other components.
  }

  handleSelect(key) {
    const [, db] = key.split('/');
    this.props.history.push(key);
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }

    const {db,periodId} = this.props.store;

    return (
      <Navbar fluid>
        <Navbar.Header>
          <Navbar.Brand>
            Tilitintin
          </Navbar.Brand>
        </Navbar.Header>

        <Nav bsStyle="tabs" activeKey="1" onSelect={k => this.handleSelect(k)}>
          <NavDropdown eventKey="1" title={this.props.store.db || 'Select Database'} id="nav-dropdown">
            {this.props.store.dbs.map(db => (
              <MenuItem key={db} eventKey={'/' + db}>{db}</MenuItem>
            ))}
          </NavDropdown>
        </Nav>

        <Nav bsStyle="tabs" activeKey="1" onSelect={k => this.handleSelect(k)}>
          <NavDropdown eventKey="1" title={periodId ? 'Period ' + periodId : 'Select Period'} id="nav-dropdown">
            {this.props.store.periods.map(period => (
              <MenuItem key={period.id} eventKey={'/' + db + '/period/' + period.id}>
                <YYYYMMDD date={period.start_date} /> &mdash; <YYYYMMDD date={period.end_date} />
              </MenuItem>
            ))}
          </NavDropdown>
        </Nav>

      </Navbar>
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

OLD Period list
<Route path="/:db" component={Periods}/>

*/
