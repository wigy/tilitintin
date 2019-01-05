import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Money from './Money';

@observer
class ReportLine extends Component {

  render() {
    // TODO: Render correctly according to instructions.
    const { name, amounts } = this.props.line;
    return (
      <tr className="ReportLine">
        <td className="title">{name}</td>
        <td className="amount">{amounts && <Money currency="EUR" cents={amounts.all}></Money>}</td>
      </tr>
    );
  }
}

ReportLine.propTypes = {
  line: PropTypes.object.isRequired
};

export default ReportLine;
