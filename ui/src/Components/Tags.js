import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Tag from './Tag';

export default inject('store')(observer(class Tags extends Component {

  render() {
    const tags = this.props.store.tags;
    // TODO: Sort to tag order.
    return (
      <div className="Tags">
        {this.props.tags.map((tag) => (<Tag key={tag} name={tag} tag={tags[tag]}/>))}
      </div>
    );
  }
}));
