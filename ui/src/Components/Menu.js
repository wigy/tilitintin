import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Menu extends Component {
  render() {
    const {db} = this.props.match.params;
    return (<div className="Menu">
      <Link to={'/' + db + '/account'}>Accounts</Link> |
      <Link to={'/' + db + '/report'}>Reports</Link>
    </div>);
  }
};

export default Menu;
