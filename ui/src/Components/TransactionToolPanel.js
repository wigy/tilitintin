import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Configuration from '../Configuration';
import { inject, observer } from 'mobx-react';
import Tag from './Tag';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import Title from './Title';
import { Trans } from 'react-i18next';
import i18n from '../i18n';
import IconButton from './IconButton';
import { action } from 'mobx';

@inject('store')
@inject('cursor')
@observer
class TransactionToolPanel extends Component {

  @action
  componentDidMount() {
    this.props.store.tools.tagDisabled = {};
  }

  onDownload = (db, periodId, accountId) => {
    const store = this.props.store;
    const lang = i18n.language;
    const url = `${Configuration.API_URL}/db/${db}/report/account/${periodId}/${accountId}?csv&lang=${lang}`;

    fetch(url, {
      method: 'GET',
      headers: new Headers({
        Authorization: 'Bearer ' + store.token
      })
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = `transactions-${periodId}-${accountId}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  };

  render() {
    if (!this.props.store.token) {
      return '';
    }

    const { account, tools, db, periodId, accountId } = this.props.store;

    const toggle = (tag) => {
      const moveCursor = this.props.cursor.inComponent('Balances.transactions');
      if (moveCursor) {
        this.props.cursor.leaveComponent();
        this.props.cursor.resetSelected();
      }
      tools.tagDisabled[tag] = !tools.tagDisabled[tag];
      if (moveCursor) {
        this.props.cursor.enterComponent();
      }
    };

    const disableAll = () => {
      const moveCursor = this.props.cursor.inComponent('Balances.transactions');
      if (moveCursor) {
        this.props.cursor.leaveComponent();
        this.props.cursor.resetSelected();
      }
      tools.tagDisabled = {};
      account.tags.forEach((tag) => (tools.tagDisabled[tag.tag] = true));
      if (moveCursor) {
        this.props.cursor.enterComponent();
      }
    };

    const enableAll = () => {
      const moveCursor = this.props.cursor.inComponent('Balances.transactions');
      if (moveCursor) {
        this.props.cursor.leaveComponent();
        this.props.cursor.resetSelected();
      }
      tools.tagDisabled = {};
      if (moveCursor) {
        this.props.cursor.enterComponent();
      }
    };

    const openAll = () => {
      this.props.store.transactions.forEach(tx => {
        if (!tx.open && tx.document.number > 1) {
          tx.toggleOpen();
        }
      });
    };

    const closeAll = () => {
      this.props.store.transactions.forEach(tx => {
        if (tx.open) {
          tx.toggleOpen();
        }
      });
    };

    const hasTags = account && account.tags && account.tags.length > 0;
    let last = null;

    return (
      <div className="TransactionToolPanel">
        <Title>{account ? account.toString() : <Trans>No account selected</Trans>}</Title>

        <div>
          <IconButton onClick={openAll} title="show-details" icon="zoom-in" />
          <IconButton onClick={closeAll} title="hide-details" icon="zoom-out" />
          <IconButton disabled={!hasTags} onClick={enableAll} title="show-all" icon="show-all" />
          <IconButton disabled={!hasTags} onClick={disableAll} title="hide-all" icon="hide-all" />
          <IconButton onClick={() => this.onDownload(db, periodId, accountId)} title="download-csv" icon="download" />
        </div>

        <div style={{ marginBottom: '1rem', marginLeft: '1rem', marginRight: '1rem' }}>
          {hasTags && account.tags.map((tag, idx) => {
            const needSpacer = (idx > 0 && tag.type !== last);
            last = tag.type;
            return (
              <React.Fragment key={tag.tag}>
                {needSpacer && <div style={{ marginTop: '5px' }}/>}
                <Tag onClick={() => toggle(tag.tag)} disabled={!!tools.tagDisabled[tag.tag]} tag={tag}/>
              </React.Fragment>
            );
          })}
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
