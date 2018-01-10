import React from 'react';
import BalanceLine from './BalanceLine';

const BalanceTable = (props) => {
  return (
    <table className="BalanceTable">
      <tbody>
        {props.balances.map(balance => (<BalanceLine key={balance.id} db={props.db} periodId={props.periodId} line={balance} />))}
      </tbody>
    </table>
  );
};

export default BalanceTable;
