import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import './App.css';
import Balances from './Components/Balances';
import AccountTransactions from './Components/AccountTransactions';
import Accounts from './Components/Accounts';
import Reports from './Components/Reports';
import Menu from './Components/Menu';
import ToolPanel from './Components/ToolPanel';
import Login from './Components/Login';

export default (class App extends Component {

  render() {
    return (
      <div className="App">
        <div className="TopPanel Panel">
          <Route exact path="/" component={Menu}/>
          <Route exact path="/:db" component={Menu}/>
          <Route exact path="/:db/txs/:periodId" component={Menu}/>
          <Route exact path="/:db/txs/:periodId/:accountId" component={Menu}/>
          <Route exact path="/:db/account/:periodId" component={Menu}/>
          <Route exact path="/:db/account/:periodId/:accountId" component={Menu}/>
          <Route exact path="/:db/report/:periodId" component={Menu}/>
        </div>
        <div className="SidePanel Panel">
          <div className="Frame">
          <Route path="/:db/txs/:periodId" component={Balances}/>
          <Route path="/:db/report/:periodId" component={Reports}/>
          </div>
        </div>
        <div className="MainTopPanel Panel">
          <div className="Frame">
            <Route path="/:db/txs/:periodId/:accountId" component={ToolPanel}/>
          </div>
        </div>
        <div className="MainPanel Panel">
          <div className="Frame">
            <Route path="/:db/txs/:periodId/:accountId" component={AccountTransactions}/>
            <Route path="/:db/account/:periodId" component={Accounts}/>
            <Login />
          </div>
        </div>
      </div>
    );
  }
});
