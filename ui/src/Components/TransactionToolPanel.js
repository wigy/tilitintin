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
      this.props.cursor.resetSelected();
      let state = this.state.disabled;
      state[tag] = !state[tag];
      this.setState({disabled: state});
      this.props.store.tools.tagDisabled = state;
    };

    const disableAll = () => {
      this.props.cursor.resetSelected();
      let state = {};
      this.props.store.sortTags().forEach((tag) => (state[tag.tag] = true));
      this.setState({disabled: state});
      this.props.store.tools.tagDisabled = state;
    };

    const enableAll = () => {
      this.props.cursor.resetSelected();
      let state = {};
      this.setState({disabled: state});
      this.props.store.tools.tagDisabled = state;
    };

    let last = null;
    // TODO: Title below should come from AccountModel.toString().
    return (
      <div className="ToolPanel">
        <h1>{this.props.store.account.number} {this.props.store.account.name}</h1>

        <IconButton onClick={enableAll} title="reset" icon="fa-home"></IconButton>
        <IconButton onClick={disableAll} title="disable-all" icon="fa-trash-alt"></IconButton>

        {this.props.store.sortTags().map((tag) => {
          const spacer = (tag.type !== last);
          const className = (this.state.disabled[tag.tag] ? 'IconButton off' : 'IconButton');
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
