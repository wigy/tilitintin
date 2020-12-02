import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import AccountModel from '../Models/AccountModel';
import './AccountLink.css';
import { Link } from '@material-ui/core';

@withTranslation('translations')
class AccountLink extends Component {

  state = {
    hasHovered: false,
    showStar: false
  };

  onToggleFavorite() {
    this.props.account.FAVORITE = !this.props.account.FAVORITE;
    this.setState({});
    this.props.account.save();
  }

  render() {
    const dst = '/' + this.props.db + '/account/' + this.props.period + '/' + this.props.account.id;
    const fav = this.props.account.FAVORITE;
    const title = fav ? this.props.t('Remove favorite status') : this.props.t('Mark as a favorite');
    return (
      <div
        className={'AccountLink' + (fav ? ' favorite' : '')}
        onMouseEnter={() => this.setState({ hasHovered: true, showStar: true })}
        onMouseLeave={() => this.setState({ showStar: false })}>
        <Link to={dst}>{this.props.account.toString()}</Link>
        {
          this.state.hasHovered &&
            <span title={title} className={this.state.showStar ? 'show-star' : 'hide-star'} onClick={() => this.onToggleFavorite()}>
              &nbsp;<i className="far fa-star"></i>
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
  t: PropTypes.any
};

export default AccountLink;
