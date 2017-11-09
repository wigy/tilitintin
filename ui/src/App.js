import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import './App.css';
import Periods from './Pages/Periods';
import Period from './Pages/Period';
import Accounts from './Pages/Accounts';
import Reports from './Pages/Reports';

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="Menu">
          <Link to="/period">Periods</Link> |
          <Link to="/account">Accounts</Link> |
          <Link to="/report">Reports</Link>
        </header>
        <div className="LeftPanel">
          <Route path="/period" component={Periods}/>
          <Route path="/account" component={Accounts}/>
          <Route path="/report" component={Reports}/>
        </div>
       <div className="MainPanel">
         <Route path="/period/:id" component={Period}/>
      </div>
    </div>
    );
  }
};

export default App;
