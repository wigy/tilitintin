import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Loader from 'react-loader-spinner';
import Store from '../Stores/Store';

@inject('store')
@observer
class Loading extends Component {

  render() {
    return <Loader type="ThreeDots" visible={this.props.visible} width={50} height={50} timeout={1000} color="rgb(0,0,93)" />;
  }
}

Loading.propTypes = {
  always: PropTypes.bool,
  visible: PropTypes.bool,
  store: PropTypes.instanceOf(Store)
};

export default Loading;
