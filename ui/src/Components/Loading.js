import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Loader from 'react-loader-spinner';
import Store from '../Stores/Store';

@inject('store')
@observer
class Loading extends Component {

  render() {
    return <Loader type="ThreeDots" visible={this.props.always || this.props.store.loading} width={50} height={50} timeout={5000} color="rgb(0,0,93)" />;
  }
}

Loading.propTypes = {
  always: PropTypes.bool,
  store: PropTypes.instanceOf(Store)
};

export default Loading;
