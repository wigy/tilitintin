import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import './App.css';
import Periods from './Pages/Periods.js';
import Accounts from './Pages/Accounts.js';
import Reports from './Pages/Reports.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="Menu">
          <Link to="/periods">Periods</Link> |
          <Link to="/accounts">Accounts</Link> |
          <Link to="/reports">Reports</Link>
        </header>
        <div className="Page">
          <Route path="/" component={Periods}/>
          <Route path="/periods" component={Periods}/>
          <Route path="/accounts" component={Accounts}/>
          <Route path="/reports" component={Reports}/>
        </div>
      </div>
    );
  }
}

export default App;
