import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Tag from './Tag';
import IconButton from './IconButton';
import IconSpacer from './IconSpacer';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import './ToolPanel.css';

@inject('store')
@inject('cursor')
@observer
class ToolPanel extends Component {

  componentDidMount() {
    this.props.store.tools.tagDisabled = {};
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }

    const tools = this.props.store.tools;

    const toggle = (tag) => {
      this.props.cursor.resetSelected();
      tools.tagDisabled[tag] = !tools.tagDisabled[tag];
    };

    const disableAll = () => {
      this.props.cursor.resetSelected();
      tools.tagDisabled = {};
      this.props.store.account.tags.forEach((tag) => (tools.tagDisabled[tag.tag] = true));
    };

    const enableAll = () => {
      this.props.cursor.resetSelected();
      tools.tagDisabled = {};
    };

    let last = null;

    if (!this.props.store.account) {
      return '';
    }

    return (
      <div className="ToolPanel">
        <h1>{this.props.store.account.toString()}</h1>

        <IconButton onClick={enableAll} title="reset" icon="fa-home"></IconButton>
        <IconButton onClick={disableAll} title="disable-all" icon="fa-trash-alt"></IconButton>

        {this.props.store.account.tags.map((tag) => {
          const spacer = (tag.type !== last);
          const className = (tools.tagDisabled[tag.tag] ? 'IconButton off' : 'IconButton');
          last = tag.type;
          return (
            <div key={tag.tag}>
              {spacer
                ? <IconSpacer key={`space-${tag.tag}`}/>
                : (<span></span>)
              }
              <div className={className} onClick={() => toggle(tag.tag)}>
                <Tag size="x2" tag={tag}/>
              </div>
            </div>);
        })}
        <div style={{clear: 'both'}}></div>
      </div>
    );
  }
}

ToolPanel.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store)
};

export default ToolPanel;
