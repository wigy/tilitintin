import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { inject } from 'mobx-react';
import keydown from 'react-keydown';
import './App.css';
import Balances from './Components/Balances';
import AccountTransactions from './Components/AccountTransactions';
import Accounts from './Components/Accounts';
import Reports from './Components/Reports';
import Menu from './Components/Menu';
import ToolPanel from './Components/ToolPanel';
import Login from './Components/Login';

// TODO: Inject this to elsewhere and see if full redraw is still needed.
export default keydown(inject('store')(class App extends Component {

  componentWillReceiveProps( nextProps ) {
    const { keydown: { event } } = nextProps;
    if ( event ) {
      if (this.props.store.pressKey(event.key)) {
        event.preventDefault();
      }
    }
  }

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
          <Route exact path="/:db/report/:periodId/:accountId" component={Menu}/>
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
}));
