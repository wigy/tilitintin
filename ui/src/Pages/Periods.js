import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PeriodLink from '../Components/PeriodLink';

export default inject('store')(observer(class Periods extends Component {

  constructor(props) {
    super(props);
    this.state = {periods: []};
  }

  componentDidMount() {
    this.props.store.getPeriods(this.props.match.params.db)
      .then(periods => this.setState({periods: periods}));
  }

  render() {
    return (
      <div className="Periods">
        <h1>Periods</h1>
        {this.props.store.periods.map(period => (<PeriodLink key={period.id} db={this.props.match.params.db} period={period}/>))}
      </div>
    );
  }
}));
