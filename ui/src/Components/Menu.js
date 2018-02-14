import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Navbar, Nav, NavDropdown, MenuItem } from 'react-bootstrap';

export default inject('store')(observer(class Menu extends Component {

  handleSelect(key) {
    document.location = key;
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }
    // Old DB link list.
    //     Databases: {this.props.store.dbs.map(db => (<Link key={db} to={'/' + db}>{db}</Link>))}

    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            Tilitintin
          </Navbar.Brand>
        </Navbar.Header>

        <Nav bsStyle="tabs" activeKey="1" onSelect={k => this.handleSelect(k)}>
          <NavDropdown eventKey="1" title="Select Database" id="nav-dropdown">
            {this.props.store.dbs.map(db => (<MenuItem key={db} eventKey={'/' + db}>{db}</MenuItem>))}
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
