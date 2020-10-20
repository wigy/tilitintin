import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import BalanceModel from '../Models/BalanceModel';
import { action } from 'mobx';
import { Link } from 'react-router-dom';
import Cursor from '../Stores/Cursor';
import Money from './Money';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { Trans } from 'react-i18next';

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

@inject('cursor')
@observer
class BalanceTable extends Component {

  @action.bound
  onClick(idx) {
    this.props.cursor.setComponent('Balances.balances');
    this.props.cursor.setIndex(idx, { noScroll: true });
  }

  render() {

    return (
      <TableContainer component={Paper}>
        <Table className="BalanceTable" size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="center"><Trans>#</Trans></TableCell>
              <TableCell align="left"><Trans>Name</Trans></TableCell>
              <TableCell align="right"><Trans>Balance</Trans></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.balances.map((balance, idx) => (
              <TableRow key={balance.account_id} id={balance.getId()} className={balance.getClasses()}>
                <TableCell component="th" scope="row">
                  <Link onClick={() => this.onClick()} to={balance.getUrl()}>{balance.account.number}</Link>
                </TableCell>
                <TableCell align="left">
                  <Link onClick={() => this.onClick()} to={balance.getUrl()}>{balance.account.name}</Link>
                </TableCell>
                <TableCell align="right">
                  <Link onClick={() => this.onClick(idx)} to={balance.getUrl()}><Money cents={balance.total} currency="EUR"/></Link>
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
};

export default BalanceTable;
