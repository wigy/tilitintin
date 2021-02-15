import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import Store from '../Stores/Store';
import Settings from '../Stores/Settings';
import Money from './Money';
import Localize from './Localize';
import SubPanel from './SubPanel';
import Tag from './Tag';

@withTranslation('translations')
@inject('store')
@inject('settings')
@observer
class ToolsForVAT extends Component {

  render() {

    if (!this.props.store.token) {
      return '';
    }
    if (!this.props.store.period) {
      return '';
    }

    const VAT = this.props.store.period.VATSummary;
    const {
      VAT_SALES_ACCOUNT,
      VAT_PURCHASES_ACCOUNT,
      VAT_RECEIVABLE_ACCOUNT,
      VAT_PAYABLE_ACCOUNT,
      VAT_DELAYED_RECEIVABLE_ACCOUNT,
      VAT_DELAYED_PAYABLE_ACCOUNT
    } = this.props.settings;

    const vatSalesAccount = this.props.store.database.getAccountByNumber(VAT_SALES_ACCOUNT);
    const vatPurchasesAccount = this.props.store.database.getAccountByNumber(VAT_PURCHASES_ACCOUNT);
    const vatPayableAccount = this.props.store.database.getAccountByNumber(VAT_PAYABLE_ACCOUNT);
    const vatReceivableAccount = this.props.store.database.getAccountByNumber(VAT_RECEIVABLE_ACCOUNT);
    const vatDelayedPayableAccount = this.props.store.database.getAccountByNumber(VAT_DELAYED_PAYABLE_ACCOUNT);
    const vatDelayedReceivableAccount = this.props.store.database.getAccountByNumber(VAT_DELAYED_RECEIVABLE_ACCOUNT);

    if (!vatSalesAccount || !vatPurchasesAccount || !vatPayableAccount || !vatReceivableAccount) {
      return (
        <div className="Tools">
          <SubPanel>
            <Trans>This database does not have configured VAT accounts.</Trans>
          </SubPanel>
        </div>);
    }

    const payable = this.props.store.period.getBalanceByNumber(VAT_PAYABLE_ACCOUNT);
    const receivable = this.props.store.period.getBalanceByNumber(VAT_RECEIVABLE_ACCOUNT);
    const payableDelayed = this.props.store.period.getBalanceByNumber(VAT_DELAYED_PAYABLE_ACCOUNT);
    const receivableDelayed = this.props.store.period.getBalanceByNumber(VAT_DELAYED_RECEIVABLE_ACCOUNT);
    const openVATDocuments = this.props.store.period ? this.props.store.period.openVATDocuments : [];

    // Split by tags.
    const VAT_TAG_TYPES = ['Osakas', 'Rahasto']; // TODO: Get from configuration or mark in tag model.
    const validTags = new Set(
      Object.values(this.props.store.database.tagsByTag)
        .filter(tag => VAT_TAG_TYPES.includes(tag.type))
        .map(tag => tag.tag)
    );

    const vatByTag = {};
    let vatByNoTag = null;
    let hasTags = false;

    const addVatByTags = (tags, amount) => {
      tags = tags.filter(tag => validTags.has(tag));
      if (!tags.length) {
        vatByNoTag = (vatByNoTag || 0) + amount;
        return;
      }
      hasTags = true;
      const share = (amount >= 0 ? Math.ceil(amount / tags.length) : Math.floor(amount / tags.length));
      tags.forEach((tag) => {
        const delta = (amount >= 0 ? Math.min(amount, share) : Math.max(amount, share));
        vatByTag[tag] = (vatByTag[tag] || 0) + delta;
        amount -= delta;
      });
    };
    for (const doc of openVATDocuments) {
      for (const entry of doc.entries) {
        if (entry.account_id === vatSalesAccount.id || entry.account_id === vatPurchasesAccount.id) {
          addVatByTags(entry.tagNames, entry.total);
        }
      }
    }

    return (
      <div className="Tools">
        <SubPanel>
          <b>
            <Link to={vatReceivableAccount.getUrl()}>
              <Trans>Current VAT receivable</Trans>: <Money cents={receivable ? receivable.total : 0} currency="€"></Money>
            </Link>
            &nbsp;
            {
              receivableDelayed &&
              <Link to={vatReceivableAccount.getUrl()}>
                (<Trans>Delayed VAT</Trans>: <Money cents={receivableDelayed.total} currency="€"></Money>)
              </Link>
            }
            <br/>
            <Link to={vatPayableAccount.getUrl()}>
              <Trans>Current VAT payable</Trans>: <Money cents={payable ? payable.total : 0} currency="€"></Money>
            </Link>
            &nbsp;
            {
              payableDelayed &&
              <Link to={vatDelayedPayableAccount.getUrl()}>
                (<Trans>Delayed VAT</Trans>: <Money cents={payableDelayed.total} currency="€"></Money>)
              </Link>
            }
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
        { hasTags &&
          <SubPanel>
            <b><Trans>Cumulated VAT by tags</Trans>:</b>
            <table>
              <tbody>
                {Object.entries(vatByTag).map(([tag, amount]) => <tr key={tag}>
                  <td width="48px"><Tag size="x2" tag={this.props.store.database.getTag(tag)} /></td>
                  <td width="48px">{tag}</td>
                  <td>{this.props.store.database.getTag(tag).name}</td>
                  <td><Money cents={amount} currency="€"></Money></td>
                </tr>)}
                {vatByNoTag && <tr>
                  <td></td>
                  <td></td>
                  <td><Trans>Entries that has no tags</Trans></td>
                  <td><Money cents={vatByNoTag} currency="€"></Money></td>
                </tr>}
              </tbody>
            </table>
          </SubPanel>
        }
        {openVATDocuments.map((doc) => {
          return <div key={doc.id}>
            <Localize>{`{${doc.date}}`}</Localize>
            <br/>
            { doc.entries.map((entry) => {
              return <div key={entry.id}>
                <b> {entry.account.toString()} </b>
                {entry.text || <span style={{ color: 'red' }}><Trans>Description missing</Trans></span>}
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
