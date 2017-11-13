import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import BalanceLine from '../Components/BalanceLine';

export default inject('store')(observer(class Period extends Component {

  constructor(props) {
    super(props);
    this.state = {balances: []};
  }

  componentDidMount() {
    this.props.store.getPeriod(this.props.match.params.db, this.props.match.params.id)
    .then(data => this.setState({balances: data.balances}));
  }

  render() {
    return (
      <div className="Period">
        <h1>Period</h1>
        {this.state.balances.map(balance => (<BalanceLine period={this.props.match.params.id} key={balance.id} line={balance} />))}
        </div>
    );
  }
}));
