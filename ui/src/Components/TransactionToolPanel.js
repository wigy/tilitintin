import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Tag from './Tag';
import IconButton from './IconButton';
import IconSpacer from './IconSpacer';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import './ToolPanel.css';
import Title from './Title';

@inject('store')
@inject('cursor')
@observer
class TransactionToolPanel extends Component {

  componentDidMount() {
    this.props.store.tools.tagDisabled = {};
  }

  render() {
    if (!this.props.store.token) {
      return '';
    }

    const { account, tools } = this.props.store;

    const toggle = (tag) => {
      this.props.cursor.leaveComponent();
      this.props.cursor.resetSelected();
      tools.tagDisabled[tag] = !tools.tagDisabled[tag];
      this.props.cursor.enterComponent();
    };

    const disableAll = () => {
      this.props.cursor.leaveComponent();
      this.props.cursor.resetSelected();
      tools.tagDisabled = {};
      account.tags.forEach((tag) => (tools.tagDisabled[tag.tag] = true));
      this.props.cursor.enterComponent();
    };

    const enableAll = () => {
      this.props.cursor.leaveComponent();
      this.props.cursor.resetSelected();
      tools.tagDisabled = {};
      this.props.cursor.enterComponent();
    };

    let last = null;

    return (
      <div className="ToolPanel">
        <Title>{account ? account.toString() : 'No account selected'}</Title>

        <IconButton onClick={enableAll} title="reset" icon="fas fa-clone"></IconButton>
        <IconButton onClick={disableAll} title="disable-all" icon="far fa-clone"></IconButton>

        {account && account.tags.map((tag) => {
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
        <div style={{ clear: 'both' }}></div>
      </div>
    );
  }
}

TransactionToolPanel.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store)
};

export default TransactionToolPanel;
