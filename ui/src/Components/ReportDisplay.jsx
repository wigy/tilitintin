import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { withTranslation } from 'react-i18next'
import ReportLine from './ReportLine'
import Localize from './Localize'
import './ReportDisplay.css'
import ReportModel from '../Models/ReportModel'
import i18n from '../i18n'
import { TableContainer, TableBody, Table, TableRow, TableCell } from '@material-ui/core'

@withTranslation('translations')
@observer
class ReportHeader extends Component {

  render() {
    const { report } = this.props

    if (!report) {
      return ''
    }

    const lang = i18n.language
    const columns = report.columns.length

    return [
      <TableRow key="1" className="heading1">
        <TableCell colSpan={columns}>
          <span className="report-title">{this.props.t('report-' + report.format)}</span>
          <span style={{ float: 'right' }}>{report.meta.businessName}</span>
        </TableCell>
      </TableRow>,
      <TableRow key="2" className="heading2">
        <TableCell colSpan={columns}>
          <span>{new Date().toLocaleDateString(lang)}</span>
          <span style={{ float: 'right' }}>{report.meta.businessId}</span>
        </TableCell>
      </TableRow>,
      <TableRow key="3" className="columns">
        {report.columns.map((column) => <TableCell key={column.name} className={column.type}>
          <Localize>{column.title}</Localize>
        </TableCell>)}
      </TableRow>
    ]
  }
}

ReportHeader.propTypes = {
  report: PropTypes.instanceOf(ReportModel),
  t: PropTypes.func
}

@observer
class ReportDisplay extends Component {

  render() {
    const { report } = this.props
    if (!report) {
      return ''
    }
    return (
      <div className="ReportDisplay">
        <TableContainer>
          <Table className="ReportDisplayTable" size="medium" padding="none">
            <TableBody>
              <ReportHeader report={this.props.report}></ReportHeader>
              {report.data.map((line, idx) => <ReportLine key={idx} line={line} columns={report.columns}></ReportLine>)}
            </TableBody>
          </Table>
          <div className={`EndOfReport ${report.format}`} />
        </TableContainer>
      </div>
    )
  }
}

ReportDisplay.propTypes = {
  report: PropTypes.instanceOf(ReportModel)
}

export default ReportDisplay
