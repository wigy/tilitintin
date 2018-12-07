import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Tag from './Tag';
import './ToolPanel.css';

@inject('store')
@observer
class ToolPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {disabled: {}};
    this.props.store.tools.tagDisabled = {};
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }

    const toggle = (tag) => {
      let state = this.state.disabled;
      state[tag] = !state[tag];
      this.setState({disabled: state});
      this.props.store.tools.tagDisabled = state;
    };

    const disableAll = () => {
      let state = {};
      this.props.store.sortTags().forEach((tag) => state[tag.tag]=true);
      this.setState({disabled: state});
      this.props.store.tools.tagDisabled = state;
    };

    const enableAll = () => {
      let state = {};
      this.setState({disabled: state});
      this.props.store.tools.tagDisabled = state;
    };

    let last = null;
    return (
      <div className="ToolPanel">
        <h1>{this.props.store.title}</h1>
        <div className="toggle-button" title="Reset" onClick={enableAll}>
          <div className="fa-icon">
            <i className="fas fa-home fa-2x"></i>
          </div>
        </div>
        <div className="toggle-button" title="Disable All" onClick={disableAll}>
          <div className="fa-icon">
            <i className="fas fa-trash-alt fa-2x"></i>
          </div>
        </div>

        {this.props.store.sortTags().map((tag) => {
            const spacer = (tag.type !== last);
            const className = (this.state.disabled[tag.tag] ? 'toggle-button off' : 'toggle-button');
            last = tag.type;
            return (
              <div key={tag.tag}>
                {spacer ?
                  (<span style={{float: 'left'}}>&nbsp;&nbsp;&nbsp;</span>) :
                  (<span></span>)
                }
                <div className={className} onClick={() => toggle(tag.tag)}>
                  <Tag size="x2" tag={tag}/>
                </div>
              </div>)
          })}
        <div style={{clear: 'both'}}></div>
      </div>
    );
  }
}

export default ToolPanel;
