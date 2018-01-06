import React from 'react';
import BalanceLine from './BalanceLine';

const BalanceTable = (props) => {
  return (
    <table className="BalanceTable">
      <tbody>
        {props.balances.map(balance => (<BalanceLine period={props.period} key={balance.id} line={balance} />))}
      </tbody>
    </table>
  );
};

export default BalanceTable;
