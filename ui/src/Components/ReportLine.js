import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Money from './Money';
import './ReportLine.css';

@observer
class ReportLine extends Component {

  render() {
    // TODO: Render correctly according to instructions.
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
        <td className="amount">{amounts && <Money currency="EUR" cents={amounts.all}></Money>}</td>
      </tr>
    );
  }
}

ReportLine.propTypes = {
  line: PropTypes.object.isRequired
};

export default ReportLine;
