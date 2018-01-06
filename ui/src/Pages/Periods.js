import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PeriodLink from '../Components/PeriodLink';

export default inject('store')(observer(class Periods extends Component {

  render() {
    let periods = this.props.store.periods[this.props.match.params.db];
    if (!periods) {
      return '';
    }
    periods = Object.values(periods);
    return (
      <div className="Periods">
        {periods.map(period => (<PeriodLink key={period.id} db={this.props.match.params.db} period={period}/>))}
      </div>
    );
  }
}));
