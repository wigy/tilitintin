import { computed, observable } from 'mobx';

class Settings {

  @observable settings = {
    'income-statement-tag-types': undefined,
    'vat-sales-account': undefined,
    'vat-purchases-account': undefined,
    'vat-receivable-account': undefined,
    'vat-payable-account': undefined
  };

  defaults = {
    'income-statement-tag-types': [],
    'vat-sales-account': '29391',
    'vat-purchases-account': '29392',
    'vat-receivable-account': '1763',
    'vat-payable-account': '2939'
  };

  /**
   * Set new values.
   * @param {Object} values
   */
  update(values) {
    Object.assign(this.settings, values);
  }

  /**
   * Reset to the defaults.
   */
  reset() {
    Object.keys(this.defaults).forEach((name) => (this.settings[name] = undefined));
  }

  /**
   * Get a value for the setting.
   * @param {String} name
   */
  get(name) {
    if (this.settings[name] !== undefined) {
      return this.settings[name];
    }
    return this.defaults[name];
  }

  @computed
  get VAT_SALES_ACCOUNT() { return this.get('vat-sales-account'); }
  @computed
  get VAT_PURCHASES_ACCOUNT() { return this.get('vat-purchases-account'); }
  @computed
  get VAT_RECEIVABLE_ACCOUNT() { return this.get('vat-receivable-account'); }
  @computed
  get VAT_PAYABLE_ACCOUNT() { return this.get('vat-payable-account'); }
}

export default Settings;
