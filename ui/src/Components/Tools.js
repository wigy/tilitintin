import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Store from '../Stores/Store';

@inject('store')
@observer
class Tools extends Component {

  update(db, periodId, tool) {
  }

  componentDidMount() {
    const {db, periodId, tool} = this.props.match.params;
    this.update(db, periodId, tool);
  }

  componentDidUpdate() {
    const {db, periodId, tool} = this.props.match.params;
    this.update(db, periodId, tool);
  }

  render() {

    if (!this.props.store.token) {
      return '';
    }

    const tool = this.props.match.params.tool || 'vat';

    if (tool === 'vat') {
      return (
        <div className="Tools">
        </div>
      );
    }
  }
}

Tools.propTypes = {
  match: PropTypes.object,
  store: PropTypes.instanceOf(Store)
};
export default Tools;
