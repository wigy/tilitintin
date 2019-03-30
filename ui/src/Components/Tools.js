import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Settings from '../Stores/Settings';
import Money from './Money';
import Localize from './Localize';
import SubPanel from './SubPanel';

@translate('translations')
@inject('store')
@inject('settings')
@observer
class Tools extends Component {

  update(db, periodId, tool) {
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
      const VAT = this.props.store.period ? this.props.store.period.VATSummary : {sales: 0, purchases: 0};

      return (
        <div className="Tools">
          <SubPanel>
            <b><Trans>VAT from purchases</Trans>: <Money cents={VAT.purchases} currency="€"></Money></b><br/>
            <b><Trans>VAT from sales</Trans>: <Money cents={VAT.sales} currency="€"></Money></b><br/>
            <b><Trans>{VAT.sales + VAT.purchases < 0 ? 'Payable' : 'Receivable'}</Trans>: <Money cents={VAT.sales + VAT.purchases} currency="€"></Money></b><br/>
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
}

Tools.propTypes = {
  match: PropTypes.object,
  settings: PropTypes.instanceOf(Settings),
  store: PropTypes.instanceOf(Store)
};
export default Tools;
