import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { Route, withRouter } from 'react-router-dom';
import { inject } from 'mobx-react';
import Account from './Components/Account';
import Accounts from './Components/Accounts';
import AccountsToolPanel from './Components/AccountsToolPanel';
import AccountTransactions from './Components/AccountTransactions';
import Admin from './Components/Admin';
import AdminToolPanel from './Components/AdminToolPanel';
import Balances from './Components/Balances';
import Cursor from './Stores/Cursor';
import DatabaseList from './Components/DatabaseList';
import Dashboard from './Components/Dashboard';
import Login from './Components/Login';
import Menu from './Components/Menu';
import Report from './Components/Report';
import ReportsList from './Components/ReportsList';
import ReportToolPanel from './Components/ReportToolPanel';
import Store from './Stores/Store';
import Tools from './Components/Tools';
import ToolsList from './Components/ToolsList';
import ToolsToolPanel from './Components/ToolsToolPanel';
import TransactionToolPanel from './Components/TransactionToolPanel';
import UserList from './Components/UserList';
import { Paper } from '@material-ui/core';

import './App.css';

@withRouter
@inject('store')
@inject('cursor')
class App extends Component {

  render() {
    const [,, page] = this.props.history.location.pathname.split('/');
    if (page === 'print') {
      return (
        <div className="App print">
          <Route path="/:db/print/:periodId/:accountId/:format" component={Report}/>
        </div>
      );
    }

    return (
      <div className="App">
        <div>
          <Route exact path="/" component={Menu}/>
          <Route exact path="/_/admin/:arg?" component={Menu}/>
          <Route exact path="/:db" component={Menu}/>
          <Route exact path="/:db/dashboard" component={Menu}/>
          <Route exact path="/:db/dashboard/:periodId" component={Menu}/>
          <Route exact path="/:db/dashboard/:periodId/:accountId" component={Menu}/>
          <Route exact path="/:db/txs/:periodId" component={Menu}/>
          <Route exact path="/:db/txs/:periodId/:accountId" component={Menu}/>
          <Route exact path="/:db/account" component={Menu}/>
          <Route exact path="/:db/account/:periodId" component={Menu}/>
          <Route exact path="/:db/account/:periodId/:accountId" component={Menu}/>
          <Route exact path="/:db/report/:periodId" component={Menu}/>
          <Route exact path="/:db/report/:periodId/:accountId" component={Menu}/>
          <Route exact path="/:db/report/:periodId//:format" component={Menu}/>
          <Route exact path="/:db/report/:periodId/:accountId/:format" component={Menu}/>
          <Route exact path="/:db/tools/:periodId?/:accountId?/:tool?" component={Menu}/>
          <Route exact path="/:db/tools/:periodId//:tool?" component={Menu}/>
          <Route exact path="/:db/tools//:accountId/:tool?" component={Menu}/>
          <Route exact path="/:db/tools///:tool?" component={Menu}/>
        </div>
        <div className="Page">
          <Paper className="SidePanel Panel" elevation={4}>
            <Route exact path="/" component={DatabaseList}/>
            <Route exact path="/:db" component={DatabaseList}/>
            <Route exact path="/:db/dashboard/:periodId?" component={DatabaseList}/>
            <Route exact path="/:db/dashboard/:periodId/:accountId" component={DatabaseList}/>
            <Route path="/:db/txs/:periodId" component={Balances}/>
          </Paper>
          <Paper className="MainTopPanel Panel" elevation={4}>
            <Route path="/:db/txs/:periodId/:accountId?" component={TransactionToolPanel}/>
          </Paper>
          <Paper className="MainPanel Panel" elevation={4}>
            <Route exact path="/" component={Login}/>
            <Route exact path="/" component={Dashboard}/>
            <Route exact path="/:db" component={Dashboard}/>
            <Route exact path="/:db/dashboard" component={Dashboard}/>
            <Route exact path="/:db/dashboard/:periodId" component={Dashboard}/>
            <Route exact path="/:db/dashboard/:periodId/:accountId" component={Dashboard}/>
            <Route path="/:db/txs/:periodId/:accountId?" component={AccountTransactions}/>
          </Paper>
        </div>
        { /*
        <div className="SidePanel Panel">
          <div className="Frame">
            <Route exact path="/_/admin/:arg?" component={UserList}/>

            <Route path="/:db/account/:periodId?/:accountId?" component={Account}/>
            <Route exact path="/:db/report/:periodId" component={ReportsList}/>
            <Route exact path="/:db/report/:periodId/:accountId" component={ReportsList}/>
            <Route path="/:db/report/:periodId//:format" component={ReportsList}/>
            <Route path="/:db/report/:periodId/:accountId/:format" component={ReportsList}/>
            <Route exact path="/:db/tools/:periodId?/:accountId?/:tool?" component={ToolsList}/>
            <Route exact path="/:db/tools/:periodId//:tool?" component={ToolsList}/>
            <Route exact path="/:db/tools//:accountId/:tool?" component={ToolsList}/>
            <Route exact path="/:db/tools///:tool?" component={ToolsList}/>
          </div>
        </div>
        <div className="MainTopPanel Panel">
          <div className="Frame">
            <Route exact path="/_/admin/:arg?" component={AdminToolPanel}/>

            <Route path="/:db/account/:periodId?" component={AccountsToolPanel}/>
            <Route path="/:db/report/:periodId/:accountId?/:format?" component={ReportToolPanel}/>
            <Route exact path="/:db/tools/:periodId?/:accountId?/:tool?" component={ToolsToolPanel}/>
            <Route exact path="/:db/tools/:periodId//:tool?" component={ToolsToolPanel}/>
            <Route exact path="/:db/tools//:accountId/:tool?" component={ToolsToolPanel}/>
            <Route exact path="/:db/tools///:tool?" component={ToolsToolPanel}/>
          </div>
        </div>
        <div className="MainPanel Panel">
          <div className="Frame">
            <Route exact path="/_/admin/:arg?" component={Admin}/>

            <Route path="/:db/account/:periodId?" component={Accounts}/>
            <Route path="/:db/report/:periodId//:format" component={Report}/>
            <Route path="/:db/report/:periodId/:accountId/:format" component={Report}/>
            <Route exact path="/:db/tools/:periodId?/:accountId?/:tool?" component={Tools}/>
            <Route exact path="/:db/tools/:periodId//:tool?" component={Tools}/>
            <Route exact path="/:db/tools//:accountId/:tool?" component={Tools}/>
            <Route exact path="/:db/tools///:tool?" component={Tools}/>
          </div>
        </div>
       */ }
      </div>
    );
  }
}

App.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store),
  history: ReactRouterPropTypes.history
};

export default App;
