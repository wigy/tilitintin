import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { translate, Trans } from 'react-i18next';
import Store from '../Stores/Store';
import Money from './Money';
import Localize from './Localize';

@translate('translations')
@inject('store')
@observer
class Tools extends Component {

  update(db, periodId, tool) {
    const {database} = this.props.store;
    if (this.fetching) {
      return;
    }
    if (database) {
      this.fetching = true;
      // TODO: Avoid double fetching (e.g. every keypress).
      this.props.store.fetchAccountPeriod(db, periodId, database.getAccountByNumber('29391').id);
      this.props.store.fetchAccountPeriod(db, periodId, database.getAccountByNumber('29392').id);
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
      return (
        <div className="Tools">
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
