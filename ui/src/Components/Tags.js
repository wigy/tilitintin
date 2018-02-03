import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Tag from './Tag';

export default inject('store')(observer(class Tags extends Component {

  render() {
    const tags = this.props.store.tags;
    const show = this.props.tags.sort((a, b) => ((tags[a] && tags[a].order) || 99999) - ((tags[b] && tags[b].order) || 99999));
    return (
      <div className="Tags">
        {show.map((tag) => (<Tag key={tag} name={tag} tag={tags[tag]}/>))}
      </div>
    );
  }
}));
