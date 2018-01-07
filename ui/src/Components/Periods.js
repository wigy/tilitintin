import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PeriodLink from '../Components/PeriodLink';

export default inject('store')(observer(class Periods extends Component {

  render() {
    const {db} = this.props.match.params;
    let periods = this.props.store.periods[db];
    if (!periods) {
      return '';
    }
    periods = Object.values(periods);
    return (
      <div className="Periods">
        {periods.map(period => (<PeriodLink key={period.id} db={db} period={period}/>))}
      </div>
    );
  }
}));
