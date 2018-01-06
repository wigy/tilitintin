import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import './App.css';
import Periods from './Pages/Periods';
import Period from './Pages/Period';
import Account from './Pages/Account';
import Accounts from './Pages/Accounts';
import Reports from './Pages/Reports';
import DbLinks from './Components/DbLinks';
import Menu from './Components/Menu';

class App extends Component {

  render() {
    return (
      <div className="App">
        <div className="TopPanel">
          <DbLinks />
          <Route path="/:db" component={Menu}/>
        </div>
        <div className="SidePanel">
          <Route path="/:db/period" component={Periods}/>
          <Route path="/:db/account" component={Accounts}/>
          <Route path="/:db/report" component={Reports}/>
        </div>
        <div className="MainPanel">
          <Route path="/:db/period/:id" component={Period}/>
          <Route path="/:db/account/:id/:period" component={Account}/>
        </div>
      </div>
    );
  }
};

export default App;
