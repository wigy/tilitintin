import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Tag from './Tag';
import Store from '../Stores/Store';

@inject('store')
@observer
class Tags extends Component {

  render() {
    return (
      <div className="Tags">
        {this.props.store.sortTags(this.props.tags).map((tag) => (<Tag key={tag.tag} tag={tag}/>))}
      </div>
    );
  }
}

Tags.propTypes = {
  store: PropTypes.instanceOf(Store),
  tags: PropTypes.object
};

export default Tags;
