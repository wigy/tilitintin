import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import Store from '../Stores/Store';
import Settings from '../Stores/Settings';
import Money from './Money';
import Localize from './Localize';
import SubPanel from './SubPanel';

@translate('translations')
@inject('store')
@inject('settings')
@observer
class ToolsForVAT extends Component {

  update(db, periodId) {
    const {database} = this.props.store;
    if (this.fetching) {
      return;
    }
    if (database) {
      this.fetching = true;
      // TODO: Avoid double fetching (e.g. every keypress). Why this is called so often?
      // TODO: We could clear all documents at this point to reduce unnecessary calculations.
      this.props.store.fetchAccountPeriod(db, periodId, database.getAccountByNumber(this.props.settings.VAT_SALES_ACCOUNT).id);
      this.props.store.fetchAccountPeriod(db, periodId, database.getAccountByNumber(this.props.settings.VAT_PURCHASES_ACCOUNT).id);
    }
  }

  componentDidMount() {
    const {db, periodId} = this.props;
    this.update(db, periodId);
  }

  componentDidUpdate() {
    const {db, periodId} = this.props;
    this.update(db, periodId);
  }

  render() {

    if (!this.props.store.token) {
      return '';
    }
    if (!this.props.store.period) {
      return '';
    }

    const VAT = this.props.store.period.VATSummary;
    const { VAT_SALES_ACCOUNT, VAT_PURCHASES_ACCOUNT, VAT_RECEIVABLE_ACCOUNT, VAT_PAYABLE_ACCOUNT } = this.props.settings;
    const vatSalesAccount = this.props.store.database.getAccountByNumber(VAT_SALES_ACCOUNT);
    const vatPurchasesAccount = this.props.store.database.getAccountByNumber(VAT_PURCHASES_ACCOUNT);
    const vatPayableAccount = this.props.store.database.getAccountByNumber(VAT_PAYABLE_ACCOUNT);
    const vatReceivableAccount = this.props.store.database.getAccountByNumber(VAT_RECEIVABLE_ACCOUNT);
    const payable = this.props.store.period.getBalanceByNumber(VAT_PAYABLE_ACCOUNT);
    const receivable = this.props.store.period.getBalanceByNumber(VAT_RECEIVABLE_ACCOUNT);
    return (
      <div className="Tools">
        <SubPanel>
          <b>
            <Link to={vatReceivableAccount.getUrl()}>
              <Trans>Current VAT receivable</Trans>: <Money cents={receivable ? receivable.total : 0} currency="€"></Money>
            </Link>
            <br/>
            <Link to={vatPayableAccount.getUrl()}>
              <Trans>Current VAT payable</Trans>: <Money cents={payable ? payable.total : 0} currency="€"></Money>
            </Link>
            <br/>
            <br/>
            <Link to={vatPurchasesAccount.getUrl()}>
              <Trans>Cumulated VAT from purchases</Trans>: <Money cents={VAT.purchases} currency="€"></Money>
            </Link>
            <br/>
            <Link to={vatSalesAccount.getUrl()}>
              <Trans>Cumulated VAT from sales</Trans>: <Money cents={VAT.sales} currency="€"></Money>
            </Link>
            <br/>
            <Trans>{VAT.sales + VAT.purchases < 0 ? 'Payable to add' : 'Receivable to add'}</Trans>: <Money cents={VAT.sales + VAT.purchases} currency="€"></Money><br/>
          </b>
        </SubPanel>
        {this.props.store.period && this.props.store.period.openVATDocuments.map((doc) => {
          return <div key={doc.id}>
            <Localize>{`{${doc.date}}`}</Localize>
            <br/>
            { doc.entries.map((entry) => {
              return <div key={entry.id}>
                <b> {entry.account.toString()} </b>
                {entry.text || <span style={{color: 'red'}}><Trans>Description missing</Trans></span>}
                <span> </span><Money cents={entry.total} currency="€"></Money>
              </div>;
            })
            }
            <br />
          </div>;
        })}
      </div>
    );
  }
}

ToolsForVAT.propTypes = {
  db: PropTypes.string,
  periodId: PropTypes.string,
  settings: PropTypes.instanceOf(Settings),
  store: PropTypes.instanceOf(Store)
};
export default ToolsForVAT;
