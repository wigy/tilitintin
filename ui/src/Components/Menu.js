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
      <nav class="navbar navbar-expand-lg navbar-light">
        <a class="navbar-brand" href="#">Tilitin</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Dropdown
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
              <a class="dropdown-item" href="#">Action</a>
              <a class="dropdown-item" href="#">Another action</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#">Something else here</a>
            </div>
          </li>
          <li class="nav-item">
            <a class="nav-link disabled" href="#">Disabled</a>
          </li>
        </ul>
      </div>
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
