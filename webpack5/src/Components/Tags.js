import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Store from '../Stores/Store';
import TagModel from '../Models/TagModel';
import { Avatar } from '@material-ui/core';

@inject('store')
@observer
class Tags extends Component {

  render() {
    return (
      <div style={{ display: 'flex' }}>
        {this.props.tags.map((tag) => (
          <Avatar style={{ height: '24px', width: '24px' }} variant="rounded" key={tag.tag} src={tag.url}/>
        ))}
      </div>
    );
  }
}

Tags.propTypes = {
  store: PropTypes.instanceOf(Store),
  tags: PropTypes.arrayOf(PropTypes.instanceOf(TagModel))
};

export default Tags;
