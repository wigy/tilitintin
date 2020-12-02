import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import AccountLink from '../Components/AccountLink';
import Store from '../Stores/Store';
import AccountModel from '../Models/AccountModel';
import './AccountTable.css';
import { Table, TableBody, TableContainer, TableRow, TableCell, Paper } from '@material-ui/core';

@inject('store')
@observer
class AccountTable extends Component {

  render() {
    const { accounts, headings } = this.props;
    const { db, periodId } = this.props.store;
    let level = 0;
    let titles;
    const headingNumbers = Object.keys(headings);
    const headingLevels = [null, null, null, null, null, null, null, null, null, null];
    let nextHeading = 0;

    return (
      <TableContainer className="AccountTable">
        <Table size="medium" padding="none">
          <TableBody>
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
                  titles.push(
                    <TableRow>
                      <TableCell key={title.id} className={'title level' + level}>{title.text}</TableCell>
                    </TableRow>
                  );
                }
              }
              return (<>
                {titles}
                <TableRow key={account.id}>
                  <TableCell hover className={'account level' + level}><AccountLink db={db} period={periodId} account={account}/></TableCell>
                </TableRow></>);
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

AccountTable.propTypes = {
  store: PropTypes.instanceOf(Store),
  accounts: PropTypes.arrayOf(PropTypes.instanceOf(AccountModel)),
  headings: PropTypes.object
};

export default AccountTable;
