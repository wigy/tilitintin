import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Money from './Money';
import './ReportLine.css';

@observer
class ReportLine extends Component {

  render() {
    let { name, number, amounts, bold, italic, hideTotal, tab, pageBreak, isAccount, fullWidth } = this.props.line;
    const columns = this.props.columns;
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

    // Construct table cell.
    const td = (column, content, extras = {}) => <td
      key={column.name}
      colSpan={fullWidth === undefined ? 1 : columns.length}
      className={column.type + (extras.className ? ' ' + extras.className : '') }>{content}</td>;

    // Rendering functions per type.
    const render = {
      // Name of the entry.
      name: (column) => td(column, decor(name), {className: 'tab' + (tab || 0)}),
      // Render currency value.
      numeric: (column) => td(column,
        amounts && !hideTotal ? (
          decor(amounts[column.name] === null ? '–' : <Money currency="EUR" cents={amounts[column.name]}></Money>)
        ) : ''
      )
    };

    return (fullWidth !== undefined
      ? <tr className={'ReportLine' + (pageBreak ? ' pageBreak' : '')}>
        {columns[fullWidth].type && render[columns[fullWidth].type] && render[columns[fullWidth].type](columns[fullWidth])}
      </tr>
      : <tr className={'ReportLine' + (pageBreak ? ' pageBreak' : '')}>
        {columns.map((column) => column.type && render[column.type] && render[column.type](column))}
      </tr>
    );
  }
}

ReportLine.propTypes = {
  columns: PropTypes.array,
  line: PropTypes.object.isRequired
};

export default ReportLine;
