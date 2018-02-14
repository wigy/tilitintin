import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

export default inject('store')(observer(class Menu extends Component {
  render() {
    if (!this.props.store.token) {
      return '';
    }
    // TODO: Rename as Menu and get rit of old Menu.
//    Databases: {this.props.store.dbs.map(db => (<Link key={db} to={'/' + db}>{db}</Link>))}
    return (
      <div className="Menu">
        <nav className="navbar navbar-expand-lg navbar-light">
          <span className="navbar-brand">Tilitin</span>

          <ul className="navbar-nav mr-auto">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Select Database
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <a className="dropdown-item" href="#">Action</a>
                <a className="dropdown-item" href="#">Another action</a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">Something else here</a>
              </div>
            </li>

          <li className="nav-item active">
            <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Link</a>
          </li>
          <li className="nav-item">
            <a className="nav-link disabled" href="#">Disabled</a>
          </li>

          </ul>
        </nav>
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

OLD Period list
<Route path="/:db" component={Periods}/>

*/
