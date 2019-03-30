import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Money from './Money';
import Localize from './Localize';
import SubPanel from './SubPanel';

@translate('translations')
@inject('store')
@observer
class Tools extends Component {

  // TODO: Replace with data from settings table?
  static SALES_VAT_ACCOUNT = '29391';
  static PURCHASE_VAT_ACCOUNT = '29392';

  update(db, periodId, tool) {
    const {database} = this.props.store;
    if (this.fetching) {
      return;
    }
    if (database) {
      this.fetching = true;
      // TODO: Avoid double fetching (e.g. every keypress). Why this is called so often?
      this.props.store.fetchAccountPeriod(db, periodId, database.getAccountByNumber(Tools.SALES_VAT_ACCOUNT).id);
      this.props.store.fetchAccountPeriod(db, periodId, database.getAccountByNumber(Tools.PURCHASE_VAT_ACCOUNT).id);
    }
  }

  componentDidMount() {
    const {db, periodId, tool} = this.props.match.params;
    this.update(db, periodId, tool);
  }

  componentDidUpdate() {
    const {db, periodId, tool} = this.props.match.params;
    this.update(db, periodId, tool);
  }

  render() {

    if (!this.props.store.token) {
      return '';
    }

    const tool = this.props.match.params.tool || 'vat';

    if (tool === 'vat') {
      let salesVAT = 0;
      let purchasesVAT = 0;
      this.props.store.getAllDocuments().forEach((doc) => {
        doc.entries.forEach((entry) => {
          const acc = entry.account.number;
          if (acc === Tools.SALES_VAT_ACCOUNT) {
            salesVAT += entry.total;
          }
          if (acc === Tools.PURCHASE_VAT_ACCOUNT) {
            purchasesVAT += entry.total;
          }
        });
      });

      return (
        <div className="Tools">
          <SubPanel>
            <b><Trans>VAT from purchases</Trans>: <Money cents={purchasesVAT} currency="€"></Money></b><br/>
            <b><Trans>VAT from sales</Trans>: <Money cents={salesVAT} currency="€"></Money></b><br/>
            <b><Trans>{salesVAT + purchasesVAT < 0 ? 'Payable' : 'Receivable'}</Trans>: <Money cents={salesVAT + purchasesVAT} currency="€"></Money></b><br/>
          </SubPanel>
          {this.props.store.getAllDocuments().map((doc) => {
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
}

Tools.propTypes = {
  match: PropTypes.object,
  store: PropTypes.instanceOf(Store)
};
export default Tools;
