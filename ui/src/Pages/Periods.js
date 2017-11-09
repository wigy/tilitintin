import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PeriodLink from '../Components/PeriodLink';

export default inject('store')(observer(class Periods extends Component {

  render() {
    return (
      <div className="Periods">
        <h1>Periods</h1>
        {this.props.store.periods.map(period => (<PeriodLink key={period.id} period={period}/>))}
      </div>
    );
  }
}));
