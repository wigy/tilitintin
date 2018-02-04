import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

export default inject('store')(observer(class ToolPanel extends Component {

  update({db, periodId, accountId}) {
    this.props.store.getAccountPeriod(db, accountId, periodId);
  }

  componentWillReceiveProps(props) {
    this.update(props.match.params);
  }

  componentDidMount() {
    this.update(this.props.match.params);
  }

  render() {
    console.log(this.props.store.sortTags())
    return (
      <div className="ToolPanel">
        <h1>{this.props.store.title}</h1>
      </div>
    );
  }
}));
