import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Configuration from '../Configuration';
import { inject, observer } from 'mobx-react';
import Tag from './Tag';
import IconSpacer from './IconSpacer';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import Title from './Title';
import { Trans } from 'react-i18next';
import './TransactionToolPanel.css';
import { Button } from '@material-ui/core';
import i18n from '../i18n';
import IconButton from './IconButton';

@inject('store')
@inject('cursor')
@observer
class TransactionToolPanel extends Component {

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

    let last = null;

    return (
      <div className="TransactionToolPanel">
        <Title>{account ? account.toString() : <Trans>No account selected</Trans>}</Title>

        <div className="icons">
          <div className="buttons">
            <Button onClick={openAll} variant="contained" color="primary"><Trans>Show Details</Trans></Button>
            <Button onClick={closeAll} variant="contained" color="primary"><Trans>Hide Details</Trans></Button>
            <Button onClick={enableAll} variant="contained" color="primary"><Trans>Show All</Trans></Button>
            <Button onClick={disableAll} variant="contained" color="primary"><Trans>Hide All</Trans></Button>
            <IconButton onClick={() => this.onDownload(db, periodId, accountId)} title="download-csv" icon="download" />
          </div>

          <div className="tags">
            {account && account.tags.map((tag) => {
              const needSpacer = (tag.type !== last);
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
