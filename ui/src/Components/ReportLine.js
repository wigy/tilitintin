import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Money from './Money';
import Localize from './Localize';
import './ReportLine.css';

@observer
class ReportLine extends Component {

  render() {
    let { id, name, number, amounts, bold, italic, hideTotal, tab, pageBreak,
      isAccount, fullWidth, needLocalization, useRemainingColumns } = this.props.line;

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
      colSpan={extras.colSpan !== undefined ? extras.colSpan : (fullWidth === undefined ? 1 : columns.length)}
      className={column.type + (extras.className ? ' ' + extras.className : '') }>{content}</td>;

    // Rendering functions per type.
    const render = {
      // ID of the entry.
      id: (column, extras = {}) => td(column, decor(id)),
      // Name of the entry.
      name: (column, extras = {}) => td(column, decor(needLocalization ? <Localize>{name}</Localize> : name), {...extras, className: 'tab' + (tab || 0)}),
      // Render currency value.
      numeric: (column, extras = {}) => td(column,
        amounts && !hideTotal ? (
          decor(amounts[column.name] === null ? '–' : <Money currency="EUR" cents={amounts[column.name]}></Money>)
        ) : ''
      )
    };

    if (fullWidth !== undefined) {
      return <tr className={'ReportLine' + (pageBreak ? ' pageBreak' : '')}>
        {columns[fullWidth].type && render[columns[fullWidth].type] && render[columns[fullWidth].type](columns[fullWidth])}
      </tr>;
    }

    if (useRemainingColumns !== undefined) {
      let ret = [];
      for (let i = 0; i <= useRemainingColumns; i++) {
        ret.push(columns[i].type && render[columns[i].type] && render[columns[i].type](columns[i], {
          colSpan: i === useRemainingColumns ? columns.length - useRemainingColumns : 1
        }));
      }
      return <tr className={'ReportLine' + (pageBreak ? ' pageBreak' : '')}>{ret}</tr>;
    }

    return <tr className={'ReportLine' + (pageBreak ? ' pageBreak' : '')}>
      {columns.map((column) => column.type && render[column.type] && render[column.type](column))}
    </tr>;
  }
}

ReportLine.propTypes = {
  columns: PropTypes.array,
  line: PropTypes.object.isRequired
};

export default ReportLine;
