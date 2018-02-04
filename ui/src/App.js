import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Route } from 'react-router-dom';
import './App.css';
import Periods from './Components/Periods';
import Period from './Components/Period';
import Account from './Components/Account';
import Accounts from './Components/Accounts';
import Reports from './Components/Reports';
import DbLinks from './Components/DbLinks';
import Menu from './Components/Menu';
import ToolPanel from './Components/ToolPanel';

export default inject('store')(observer(class App extends Component {

  render() {
    let user = '';
    let password = '';

    const login = () => {
      this.props.store.login(user, password);
    };

    // TODO: Some refactoring needed here to remove code duplication.
    // TODO: Move login to separate component.
    if (!this.props.store.token) {
      return (
        <div className="App">
          <div className="TopPanel Panel">
          TODO: Design visuals on this page.
          </div>
          <div className="SidePanel Panel">
          </div>
          <div className="MainTopPanel Panel">
          <h1>Tilitintin</h1>
          </div>
          <div className="MainPanel Panel">
            User: <input onChange={(event) => user=event.target.value} name="user"/><br/>
            Password: <input onChange={(event) => password=event.target.value} name="password" type="password"/><br/>
            <input onClick={login} type="submit"/>
          </div>
        </div>
      );
    }
    return (
      <div className="App">
        <div className="TopPanel Panel">
          TODO: Neat display components for these.
          <DbLinks />
          <Route path="/:db" component={Periods}/>
          <Route path="/:db" component={Menu}/>
        </div>
        <div className="SidePanel Panel">
          <div className="Frame">
            <Route path="/:db/period/:periodId" component={Period}/>
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
            <Route path="/:db/period/:periodId/:accountId" component={Account}/>
          </div>
        </div>
      </div>
    );
  }
}));
