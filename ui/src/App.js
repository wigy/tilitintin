import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { Route, withRouter } from 'react-router-dom';
import { inject } from 'mobx-react';
import keydown from 'react-keydown';
import './App.css';
import Balances from './Components/Balances';
import AccountTransactions from './Components/AccountTransactions';
import Accounts from './Components/Accounts';
import ReportsList from './Components/ReportsList';
import Report from './Components/Report';
import Menu from './Components/Menu';
import ReportToolPanel from './Components/ReportToolPanel';
import TransactionToolPanel from './Components/TransactionToolPanel';
import ToolsToolPanel from './Components/ToolsToolPanel';
import ToolsList from './Components/ToolsList';
import Tools from './Components/Tools';
import Login from './Components/Login';
import Cursor from './Stores/Cursor';
import Store from './Stores/Store';

@withRouter
@keydown
@inject('store')
@inject('cursor')
class App extends Component {

  /* eslint camelcase: off */
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { keydown: { event } } = nextProps;
    if (event) {
      let keyName = (
        (event.key.length > 1 && event.shiftKey ? 'Shift+' : '') +
        (event.ctrlKey ? 'Ctrl+' : '') +
        (event.altKey ? 'Alt+' : '') +
        event.key);

      let keyResult = this.props.cursor.handle(keyName);

      if (keyResult) {
        this.props.store.changed = true;
        if (keyResult.preventDefault) {
          event.preventDefault();
        }
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.keydown.event) {
      return this.props.store.hasChanged();
    }
    return true;
  }

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
        <div className="TopPanel Panel">
          <Route exact path="/" component={Menu}/>
          <Route exact path="/:db" component={Menu}/>
          <Route exact path="/:db/txs/:periodId" component={Menu}/>
          <Route exact path="/:db/txs/:periodId/:accountId" component={Menu}/>
          <Route exact path="/:db/account/:periodId" component={Menu}/>
          <Route exact path="/:db/account/:periodId/:accountId" component={Menu}/>
          <Route exact path="/:db/report/:periodId" component={Menu}/>
          <Route exact path="/:db/report/:periodId/:accountId" component={Menu}/>
          <Route exact path="/:db/report/:periodId//:format" component={Menu}/>
          <Route exact path="/:db/report/:periodId/:accountId/:format" component={Menu}/>
          <Route exact path="/:db/tools" component={Menu}/>
          <Route exact path="/:db/tools///:tool" component={Menu}/>
          <Route exact path="/:db/tools/:periodId" component={Menu}/>
          <Route exact path="/:db/tools/:periodId/:accountId" component={Menu}/>
          <Route exact path="/:db/tools/:periodId//:tool" component={Menu}/>
          <Route exact path="/:db/tools/:periodId/:accountId/:tool" component={Menu}/>
        </div>
        <div className="SidePanel Panel">
          <div className="Frame">
            <Route path="/:db/txs/:periodId" component={Balances}/>
            <Route path="/:db/report/:periodId" component={ReportsList}/>
            <Route exact path="/:db/tools" component={ToolsList}/>
            <Route exact path="/:db/tools/:periodId" component={ToolsList}/>
            <Route exact path="/:db/tools///:tool" component={ToolsList}/>
          </div>
        </div>
        <div className="MainTopPanel Panel">
          <div className="Frame">
            <Route path="/:db/txs/:periodId/:accountId" component={TransactionToolPanel}/>
            <Route path="/:db/report/:periodId//:format" component={ReportToolPanel}/>
            <Route path="/:db/report/:periodId/:accountId/:format" component={ReportToolPanel}/>
            <Route exact path="/:db/tools/:periodId" component={ToolsToolPanel}/>
            <Route exact path="/:db/tools/:periodId/:accountId" component={ToolsToolPanel}/>
            <Route exact path="/:db/tools///:tool" component={ToolsToolPanel}/>
            <Route exact path="/:db/tools/:periodId//:tool" component={ToolsToolPanel}/>
            <Route exact path="/:db/tools/:periodId/:accountId/:tool" component={ToolsToolPanel}/>
          </div>
        </div>
        <div className="MainPanel Panel">
          <div className="Frame">
            <Route path="/:db/txs/:periodId/:accountId" component={AccountTransactions}/>
            <Route path="/:db/account/:periodId" component={Accounts}/>
            <Route path="/:db/report/:periodId//:format" component={Report}/>
            <Route path="/:db/report/:periodId/:accountId/:format" component={Report}/>
            <Route exact path="/:db/tools" component={Tools}/>
            <Route exact path="/:db/tools/:periodId/" component={Tools}/>
            <Route exact path="/:db/tools/:periodId/:accountId" component={Tools}/>
            <Route exact path="/:db/tools/:periodId//:tool" component={Tools}/>
            <Route exact path="/:db/tools/:periodId/:accountId/:tool" component={Tools}/>
            <Login />
          </div>
        </div>
      </div>
    );
  }
}

App.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store),
  keydown: PropTypes.any,
  history: ReactRouterPropTypes.history
};

export default App;
