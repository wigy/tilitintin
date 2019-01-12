import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Money from './Money';
import './ReportLine.css';

@observer
class ReportLine extends Component {

  render() {
    let { name, number, amounts, bold, italic, hideTotal, tab, pageBreak, isAccount } = this.props.line;

    if (isAccount) {
      name = `${number} ${name}`;
    }

    // Decorate text based on instructions.
    const decor = (text) => {
      if (bold) {
        text = <b>{text}</b>;
      }
      if (italic) {
        text = <i>{text}</i>;
      }
      return text;
    };

    // Rendering functions per type.
    const render = {
      // Name of the entry.
      name: (column) => <td key={column.name} className={'name tab' + tab}>{decor(name)}</td>,
      // Render currency value.
      numeric: (column) => <td key={column.name}>{
        amounts && !hideTotal ? (
          decor(amounts[column.name] === null ? '–' : <Money currency="EUR" cents={amounts[column.name]}></Money>)
        ) : ''
      }</td>
    };

    return (
      <tr className={'ReportLine' + (pageBreak ? ' pageBreak' : '')}>
        {this.props.columns.map((column) => column.type && render[column.type] && render[column.type](column))}
      </tr>
    );
  }
}

ReportLine.propTypes = {
  columns: PropTypes.array,
  line: PropTypes.object.isRequired
};

export default ReportLine;
