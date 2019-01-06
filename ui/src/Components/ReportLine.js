import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Money from './Money';
import './ReportLine.css';

@observer
class ReportLine extends Component {

  render() {
    let { name, number, amounts, bold, italic, hideTotal, column, pageBreak, isAccount } = this.props.line;
    if (isAccount) {
      name = `${number} ${name}`;
    }
    if (bold) {
      name = <b>{name}</b>;
    }
    if (italic) {
      name = <i>{name}</i>;
    }
    if (hideTotal) {
      amounts = null;
    }

    return (
      <tr className={'ReportLine' + (pageBreak ? ' pageBreak' : '')}>
        <td className={'name column' + column}>{name}</td>
        {this.props.columns.map((column) => <td key={column.name}>
          {amounts && amounts[column.name] && <Money currency="EUR" cents={amounts[column.name]}></Money>}
        </td>)}
      </tr>
    );
  }
}

ReportLine.propTypes = {
  columns: PropTypes.array,
  line: PropTypes.object.isRequired
};

export default ReportLine;
