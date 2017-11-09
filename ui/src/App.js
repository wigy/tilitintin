import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import './App.css';
import Periods from './Pages/Periods';
import Accounts from './Pages/Accounts';
import Reports from './Pages/Reports';

export default inject('store')(observer(class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="Menu">
          <Link to="/period">Periods</Link> |
          <Link to="/account">Accounts</Link> |
          <Link to="/report">Reports</Link>
        </header>
        <div className="Page">
          <Route path="/period" component={Periods}/>
          <Route path="/account" component={Accounts}/>
          <Route path="/report" component={Reports}/>
        </div>
      </div>
    );
  }
}));
