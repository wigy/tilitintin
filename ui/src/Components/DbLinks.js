import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

export default inject('store')(observer(class DbLinks extends Component {
  render() {
    return (<div className="DbLinks">
      Databases: {this.props.store.dbs.map(db => (<Link key={db} to={'/' + db}>{db}</Link>))}
    </div>);
  }
}));
