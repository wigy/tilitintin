import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import './App.css';
import Periods from './Components/Periods';
import Balances from './Components/Balances';
import AccountTransactions from './Components/AccountTransactions';
import Accounts from './Components/Accounts';
import Reports from './Components/Reports';
import DbLinks from './Components/DbLinks';
import Menu from './Components/Menu';
import ToolPanel from './Components/ToolPanel';
import Login from './Components/Login';
import Logout from './Components/Logout';

export default (class App extends Component {

  render() {
    // TODO: Top panel could be separate coponent.
    return (
      <div className="App">
        <div className="TopPanel Panel">
          <div style={{float: 'right'}} hreg="#"><Logout/></div>
          <DbLinks />
          <Route path="/:db" component={Periods}/>
          <Route path="/:db" component={Menu}/>
        </div>
        <div className="SidePanel Panel">
          <div className="Frame">
            <Route path="/:db/period/:periodId" component={Balances}/>
            <Route path="/:db/account" component={Accounts}/>
            <Route path="/:db/report" component={Reports}/>
          </div>
        </div>
        <div className="MainTopPanel Panel">
          <div className="Frame">
            <Route path="/:db/period/:periodId/:accountId" component={ToolPanel}/>
          </div>
        </div>
        <div className="MainPanel Panel">
          <div className="Frame">
            <Route path="/:db/period/:periodId/:accountId" component={AccountTransactions}/>
            <Login />
          </div>
        </div>
      </div>
    );
  }
});
