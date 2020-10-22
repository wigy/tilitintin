import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import BalanceModel from '../Models/BalanceModel';
import { action } from 'mobx';
import { Link, withRouter } from 'react-router-dom';
import Cursor from '../Stores/Cursor';
import Money from './Money';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { Trans, withTranslation } from 'react-i18next';
import ReactRouterPropTypes from 'react-router-prop-types';

@inject('cursor')
@observer
class BalanceLine extends Component {

  render() {
    const { balance } = this.props;
    const dst = balance.getUrl();
    return (
      <tr id={balance.getId()} className={balance.getClasses()}>
        <td className="number"><Link onClick={() => this.onClick()} to={dst}>{balance.account && balance.account.number}</Link></td>
        <td className="name"><Link onClick={() => this.onClick()} to={dst}>{balance.account && balance.account.name}</Link></td>
        <td className="balance"><Link onClick={() => this.onClick()} to={dst}><Money cents={balance.total} currency="EUR"/></Link></td>
      </tr>
    );
  }
}

BalanceLine.propTypes = {
  balance: PropTypes.instanceOf(BalanceModel),
  cursor: PropTypes.instanceOf(Cursor),
  index: PropTypes.number
};

@withRouter
@withTranslation('translations')
@inject('cursor')
@observer
class BalanceTable extends Component {

  @action.bound
  onClick(idx, url) {
    this.props.cursor.setComponent('Balances.balances');
    this.props.cursor.setIndex(idx, { noScroll: true });
    this.props.history.push(url);
  }

  render() {

    return (
      <TableContainer component={Paper}>
        <Table className="BalanceTable" size="medium" padding="none">
          <TableHead>
            <TableRow>
              <TableCell variant="head" align="center"><Trans>#</Trans></TableCell>
              <TableCell variant="head" align="left"><Trans>Name</Trans></TableCell>
              <TableCell variant="head" align="right"><Trans>Balance</Trans></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.balances.map((balance, idx) => (
              <TableRow
                key={balance.account_id}
                id={balance.getId()}
                hover
                className={balance.getClasses()}
                onClick={() => this.onClick(idx, balance.getUrl())}
              >
                <TableCell component="th" scope="row">
                  {balance.account.number}
                </TableCell>
                <TableCell align="left">
                  {balance.account.name}
                </TableCell>
                <TableCell align="right">
                  <Money cents={balance.total} currency="EUR"/>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

BalanceTable.propTypes = {
  balances: PropTypes.arrayOf(PropTypes.instanceOf(BalanceModel)),
  cursor: PropTypes.instanceOf(Cursor),
  history: ReactRouterPropTypes.history,
};

export default BalanceTable;
