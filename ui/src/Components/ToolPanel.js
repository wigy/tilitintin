import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Tag from './Tag';
import './ToolPanel.css';

export default inject('store')(observer(class ToolPanel extends Component {

  update({db, periodId, accountId}) {
    this.props.store.getAccountPeriod(db, accountId, periodId);
  }

  componentWillReceiveProps(props) {
    this.update(props.match.params);
  }

  componentDidMount() {
    this.update(this.props.match.params);
  }

  render() {
    let last = null;
    return (
      <div className="ToolPanel">
        <h1>{this.props.store.title}</h1>
          {this.props.store.sortTags().map((tag) => {
            const spacer = (last && tag.type !== last);
            last = tag.type;
            return (
              <div key={tag.tag}>
                {spacer ?
                  (<span style={{float: 'left'}}>&nbsp;&nbsp;&nbsp;</span>) :
                  (<span></span>)
                }

                <Tag toggle={false} size="x2" tag={tag}/>
              </div>)
          })}
          &nbsp;&nbsp;&nbsp;TODO: Filtering tools using these icons.
        <div style={{clear: 'both'}}></div>
      </div>
    );
  }
}));
