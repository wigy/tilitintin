import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import AccountModel from '../Models/AccountModel';
import { Icon, Link, Typography } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import ReactRouterPropTypes from 'react-router-prop-types';

@withRouter
@withTranslation('translations')
class AccountLink extends Component {

  state = {
    showStar: false
  };

  onToggleFavorite() {
    this.props.account.FAVORITE = !this.props.account.FAVORITE;
    this.setState({});
    this.props.account.save();
  }

  render() {
    const { account } = this.props;
    const dst = '/' + this.props.db + '/account/' + this.props.period + '/' + account.id;
    const title = account.FAVORITE ? this.props.t('Remove favorite status') : this.props.t('Mark as a favorite');
    return (
      <div
        onMouseEnter={() => this.setState({ showStar: true })}
        onMouseLeave={() => this.setState({ showStar: false })}>
        <Link href="#" onClick={() => this.props.history.push(dst)}>
          <Typography display="inline" color={account.FAVORITE ? 'secondary' : 'primary'}>
            {account.toString()}
          </Typography>
        </Link>
        {
          this.state.showStar &&
            <span title={title} onClick={() => this.onToggleFavorite()}>
              &nbsp;<Icon style={{ fontSize: '90%' }} className="far fa-heart" />
            </span>
        }
      </div>
    );
  }
}

AccountLink.propTypes = {
  account: PropTypes.instanceOf(AccountModel),
  db: PropTypes.string,
  period: PropTypes.number,
  history: ReactRouterPropTypes.history,
  t: PropTypes.any
};

export default AccountLink;
