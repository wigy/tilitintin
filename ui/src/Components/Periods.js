import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PeriodLink from '../Components/PeriodLink';

export default inject('store')(observer(class Periods extends Component {

  componentDidMount() {
    const {db} = this.props.match.params;
    this.props.store.getPeriods(db);
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }

    const {db} = this.props.match.params;
    let periods = this.props.store.periods;
    return (
      <div className="Periods">
        {periods.map(period => (<PeriodLink key={period.id} db={db} period={period}/>))}
      </div>
    );
  }
}));
