import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Tag from './Tag';

export default inject('store')(observer(class Tags extends Component {

  render() {
    return (
      <div className="Tags">
        {this.props.store.sortTags(this.props.tags).map((tag) => (<Tag key={tag.tag} tag={tag}/>))}
      </div>
    );
  }
}));
