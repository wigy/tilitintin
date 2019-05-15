import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import AccountLink from '../Components/AccountLink';
import Store from '../Stores/Store';
import AccountModel from '../Models/AccountModel';
import './AccountTable.css';

@inject('store')
@observer
class AccountTable extends Component {

  render() {
    const {accounts, headings} = this.props;
    const {db, periodId} = this.props.store;
    let level = 0;
    let titles;
    const headingNumbers = Object.keys(headings);
    let headingLevels = [null, null, null, null, null, null, null, null, null, null];
    let nextHeading = 0;

    return (
      <div className="AccountTable">
        {accounts.map(account => {
          while (headingNumbers[nextHeading] <= account.number) {
            headings[headingNumbers[nextHeading]].forEach((heading) => {
              headingLevels[heading.level] = heading;
              for (let j = heading.level + 1; j < headingLevels.length; j++) {
                headingLevels[j] = null;
              }
            });
            nextHeading++;
          }
          titles = [];
          for (let i = 0; i < headingLevels.length; i++) {
            const title = headingLevels[i];
            headingLevels[i] = null;
            if (title) {
              level = i;
              titles.push(<div key={title.id} className={'title level' + level}>{title.text}</div>);
            }
          }
          return (
            <div key={account.id}>
              {titles}
              <div className={'account level' + level}><AccountLink db={db} period={periodId} account={account}/></div>
            </div>);
        })}
      </div>
    );
  }
}

AccountTable.propTypes = {
  store: PropTypes.instanceOf(Store),
  accounts: PropTypes.arrayOf(PropTypes.instanceOf(AccountModel)),
  headings: PropTypes.object
};

export default AccountTable;
