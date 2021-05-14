import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import Money from './Money'
import Localize from './Localize'
import './ReportLine.css'
import { TableRow, TableCell } from '@material-ui/core'

@observer
class ReportLine extends Component {

  render() {
    let {
      id, name, number, amounts, bold, error, italic, hideTotal, tab, pageBreak,
      isAccount, fullWidth, needLocalization, useRemainingColumns, bigger
    } = this.props.line

    const columns = this.props.columns
    if (isAccount) {
      name = `${number} ${name}`
    }

    // Decorate text based on instructions.
    const decor = (text) => {
      if (bold) {
        text = <b>{text}</b>
      }
      if (italic) {
        text = <i>{text}</i>
      }
      if (error) {
        text = <span style={{ color: 'red' }}>{text}</span>
      }
      return text
    }

    // Construct table cell.
    const td = (column, content, extras = {}) => {
      const classNames = column.type + (extras.className ? ' ' + extras.className : '')

      return <TableCell
        key={column.name}
        colSpan={extras.colSpan !== undefined ? extras.colSpan : (fullWidth === undefined ? 1 : columns.length)}
        className={classNames}>{content}</TableCell>
    }

    // Rendering functions per type.
    const render = {
      // ID of the entry.
      id: (column, extras = {}) => td(column, decor(id)),
      // Name of the entry.
      name: (column, extras = {}) => td(column, decor(needLocalization ? <Localize>{name}</Localize> : name), { ...extras, className: 'tab' + (tab || 0) }),
      // Render currency value.
      numeric: (column, extras = {}) => td(column,
        amounts && !hideTotal && amounts[column.name] !== ''
          ? (
              decor(amounts[column.name] === null ? '–' : <Money currency="EUR" cents={amounts[column.name]}></Money>)
            )
          : ''
      )
    }

    const classNames = 'ReportLine' + (pageBreak ? ' pageBreak' : '') + (bigger ? ' bigger' : '')

    if (fullWidth !== undefined) {
      return <TableRow className={classNames}>
        {columns[fullWidth].type && render[columns[fullWidth].type] && render[columns[fullWidth].type](columns[fullWidth])}
      </TableRow>
    }

    if (useRemainingColumns !== undefined) {
      const ret = []
      for (let i = 0; i <= useRemainingColumns; i++) {
        ret.push(columns[i].type && render[columns[i].type] && render[columns[i].type](columns[i], {
          colSpan: i === useRemainingColumns ? columns.length - useRemainingColumns : 1
        }))
      }
      return <TableRow className={classNames}>{ret}</TableRow>
    }

    return <TableRow className={classNames}>
      {columns.map((column) => column.type && render[column.type] && render[column.type](column))}
    </TableRow>
  }
}

ReportLine.propTypes = {
  columns: PropTypes.array,
  line: PropTypes.object.isRequired
}

export default ReportLine
