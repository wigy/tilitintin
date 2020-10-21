import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Tag from './Tag';
import IconButton from './IconButton';
import IconSpacer from './IconSpacer';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import Title from './Title';
import './ToolPanel.css';
import { Trans } from 'react-i18next';

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
        <Title>{account ? account.toString() : <Trans>No account selected</Trans>}</Title>

        <IconButton onClick={enableAll} title="reset" icon="fas fa-clone"></IconButton>
        <IconButton onClick={disableAll} title="disable-all" icon="far fa-clone"></IconButton>

        {account && account.tags.map((tag) => {
          const needSpacer = last && (tag.type !== last);
          last = tag.type;
          return (
            <>
              {needSpacer && <IconSpacer key={`space-${tag.tag}`}/>}
              <Tag onClick={() => toggle(tag.tag)} disabled={!!tools.tagDisabled[tag.tag]} key={tag.tag} tag={tag}/>
            </>
          );
        })}
      </div>
    );
  }
}

TransactionToolPanel.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store)
};

export default TransactionToolPanel;
