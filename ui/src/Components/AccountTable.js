import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import AccountLink from '../Components/AccountLink';
import './AccountTable.css';

@inject('store')
@observer
class AccountTable extends Component {

  render() {
    const {accounts, headings} = this.props;
    const {periodId} = this.props.store;
    let level = 0; let titles;
    return (
      <div className="AccountTable">
        {accounts.map(account => {

          titles = headings[account.number] || [];

          return (
            <div key={account.id}>
              {titles.map((title) => {
                level = title.level;
                return <div key={title.id} className={'title level' + level}>{title.text}</div>;
              })}
              <div className={'account level' + level}><AccountLink period={periodId} account={account}/></div>
            </div>);
        })}
      </div>
    );
  }
}

export default AccountTable;
