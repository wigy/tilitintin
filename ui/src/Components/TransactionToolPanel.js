import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Tag from './Tag';
import IconButton from './IconButton';
import IconSpacer from './IconSpacer';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import Title from './Title';
import { Trans } from 'react-i18next';
import './TransactionToolPanel.css';

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
      <div className="TransactionToolPanel">
        <Title>{account ? account.toString() : <Trans>No account selected</Trans>}</Title>

        <div className="icons">
          <div className="buttons">
            <IconButton onClick={enableAll} title="reset" icon="far fa-check-circle"></IconButton>
            <IconButton onClick={disableAll} title="disable-all" icon="far fa-circle"></IconButton>
          </div>

          <div className="tags">
            {account && account.tags.map((tag) => {
              const needSpacer = last && (tag.type !== last);
              last = tag.type;
              return (
                <React.Fragment key={tag.tag}>
                  {needSpacer && <IconSpacer/>}
                  <Tag onClick={() => toggle(tag.tag)} disabled={!!tools.tagDisabled[tag.tag]} tag={tag}/>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

TransactionToolPanel.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  store: PropTypes.instanceOf(Store)
};

export default TransactionToolPanel;
