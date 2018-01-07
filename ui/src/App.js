import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import './App.css';
import Periods from './Components/Periods';
import Period from './Components/Period';
import Account from './Components/Account';
import Accounts from './Components/Accounts';
import Reports from './Components/Reports';
import DbLinks from './Components/DbLinks';
import Menu from './Components/Menu';

class App extends Component {

  render() {
    return (
      <div className="App">
        <div className="TopPanel Panel">
          <DbLinks />
          <Route path="/:db" component={Periods}/>
          <Route path="/:db" component={Menu}/>
        </div>
        <div className="SidePanel Panel">
          <div className="Frame">
            <Route path="/:db/period/:id" component={Period}/>
            <Route path="/:db/account" component={Accounts}/>
            <Route path="/:db/report" component={Reports}/>
          </div>
        </div>
        <div className="MainPanel Panel">
          <div className="Frame">
            <Route path="/:db/period/:period/:id" component={Account}/>
          </div>
        </div>
      </div>
    );
  }
};

export default App;
