import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

@observer
class ReportLine extends Component {

  render() {
    // TODO: Render according to instructions.
    return (
      <div className="ReportLine">
        {JSON.stringify(this.props.line)}
      </div>
    );
  }
}

ReportLine.propTypes = {
  line: PropTypes.object.isRequired
};

export default ReportLine;
