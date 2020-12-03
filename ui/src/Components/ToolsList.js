import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { inject, observer } from 'mobx-react';
import { withTranslation, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Cursor from '../Stores/Cursor';
import Title from './Title';
import { List, ListItem, Avatar, ListItemAvatar, ListItemText } from '@material-ui/core';
import { withRouter } from 'react-router-dom';

@withRouter
@withTranslation('translations')
@inject('store')
@inject('cursor')
@observer
class ToolsList extends Component {

  componentDidMount() {
    this.props.cursor.selectPage('Tools', this);
  }

  url(page) {
    const { store } = this.props;
    return '/' + (store.db || '_') + '/tools/' + (store.periodId || '') + '/' + ((store.account && store.account.id) || '') + '/' + page;
  }

  keyText(cursor, key) {
    const { store } = this.props;
    if (key === '1') {
      this.props.history.push(this.url('databases'));
      return { preventDefault: true };
    }
    if (key === '2' && store.db) {
      this.props.history.push(this.url('periods'));
      return { preventDefault: true };
    }
    if (key === '3' && store.periodId) {
      this.props.history.push(this.url('documents'));
      return { preventDefault: true };
    }
    if (key === '4' && store.periodId) {
      this.props.history.push(this.url('vat'));
      return { preventDefault: true };
    }
  }

  render() {
    const { store, history, match } = this.props;
    if (!store.token) {
      return '';
    }

    return (
      <div>
        <Title><Trans>Tools</Trans></Title>
        <List>
          <ListItem button selected={match.params.tool === 'databases'} onClick={() => history.push(this.url('databases'))}>
            <ListItemAvatar color="primary">
              <Avatar>1</Avatar>
            </ListItemAvatar>
            <ListItemText primary={<Trans>Databases</Trans>}/>
          </ListItem>
          <ListItem button selected={match.params.tool === 'periods'} disabled={!store.db} onClick={() => history.push(this.url('periods'))}>
            <ListItemAvatar color="primary">
              <Avatar>2</Avatar>
            </ListItemAvatar>
            <ListItemText primary={<Trans>Periods</Trans>} />
          </ListItem>
          <ListItem button selected={match.params.tool === 'documents'} disabled={!store.periodId} onClick={() => history.push(this.url('documents'))}>
            <ListItemAvatar color="primary">
              <Avatar>3</Avatar>
            </ListItemAvatar>
            <ListItemText primary={<Trans>Documents</Trans>} />
          </ListItem>
          <ListItem button selected={match.params.tool === 'vat'} disabled={!store.periodId} onClick={() => history.push(this.url('vat'))}>
            <ListItemAvatar color="primary">
              <Avatar>4</Avatar>
            </ListItemAvatar>
            <ListItemText primary={<Trans>Value Added Tax</Trans>} />
          </ListItem>
        </List>
      </div>
    );
  }
}

ToolsList.propTypes = {
  cursor: PropTypes.instanceOf(Cursor),
  match: PropTypes.object,
  history: ReactRouterPropTypes.history.isRequired,
  store: PropTypes.instanceOf(Store)
};

export default ToolsList;
