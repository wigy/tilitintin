import { extendObservable } from 'mobx';

class Model {

  constructor(parent, variables, init = {}) {
    this.parent = parent;
    this.variables = Object.keys(variables);
    if (!parent) {
      console.warn(`No parent given for ${this.constructor.name}: ${JSON.stringify(variables)}`);
    }
    extendObservable(this, variables);
    init = this.initialize(init);
    Object.keys(variables).forEach((key) => {
      if (key in init) {
        this[key] = init[key];
      }
    });
  }

  /**
   * Construct a JSON-object compatible with DB format.
   */
  toJSON() {
    let ret = {};
    this.variables.forEach((k) => (ret[k] = this[k]));
    return ret;
  }

  /**
   * Get the name of class without 'Model' postfix.
   */
  getObjectType() {
    throw new Error(`Model does not implement getObjectType().`);
  }

  /**
   * If sortable model, get the value to be used for sorting (default: use `id`).
   */
  getSortKey() {
    return this.id;
  }

  /**
   * Hook to modify initialization arguments.
   * @param {Object} data
   */
  initialize(data) {
    return data;
  }

  /**
   * Get DOM-element ID for the object.
   * @return {String}
   */
  getId() {
    console.error(`Model for ${this.getObjectType()} does not implement getId().`);
  }

  /**
   * Get detail viewing URL for the object.
   * @return {String}
   */
  getUrl() {
    console.error(`Model for ${this.getObjectType()} does not implement getUrl().`);
  }

  /**
   * Get CSS-classes for the object.
   * @return {String}
   */
  getClasses() {
    return this.getObjectType();
  }

  /**
   * Get visual presentation of the given field: if there is `get.<field>` function, use it, otherwise field value itself.
   * @param {String} field
   */
  getView(field) {
    const name = `get.${field}`;
    return name in this ? this[name]() : this[field];
  }

  /**
   * Get visual presentation of the given field for editable value. Defaults to view.
   * @param {String} field
   */
  getEdit(field) {
    const name = `get.edit.${field}`;
    return name in this ? this[name]() : this.getView(field);
  }

  /**
   * Check if the value can be converted to the given field.
   * @param {String} field
   * @param {Any} value
   * @return {ReactElement|null} Error message if not valid.
   */
  validate(field, value) {
    const name = `validate.${field}`;
    return name in this ? this[name](value) : true;
  }

  /**
   * Calculate proposal for the field value based on partial value given.
   * @param {String} field
   * @param {String} value
   */
  async proposal(field, value) {
    const name = `proposal.${field}`;
    return name in this ? this[name](value) : null;
  }

  /**
   * Change the value of one field of this model.
   * @param {String} field
   * @param {Any} value
   */
  async change(field, value) {
    const name = `change.${field}`;
    if (name in this) {
      this[name](value);
      return;
    }
    this[field] = value;
  }

  /**
   * Write this instance to the store.
   */
  async save() {
    const name = `save${this.getObjectType()}`;
    if (!this.store[name]) {
      throw new Error(`Store does not have ${name}() function.`);
    }
    return this.store[name](this);
  }

  /**
   * Get the store.
   */
  get store() {
    return this.parent ? this.parent.store : null;
  }

  /**
   * Get the settings.
   */
  get settings() {
    return this.store.settings;
  }

  /**
   * Construct a sorting function for sorting model instances.
   */
  static sorter(reverse = false) {
    const one = reverse ? -1 : 1;
    const cmp = (a, b) => (a < b ? -one : (a > b ? one : 0));
    return (a, b) => {
      const aKey = a.getSortKey();
      const bKey = b.getSortKey();
      if (aKey instanceof Array && bKey instanceof Array) {
        const N = Math.max(aKey.length, bKey.length);
        for (let i = 0; i < N; i++) {
          let res = cmp(aKey[i], bKey[i]);
          if (res) {
            return res;
          }
          return 0;
        }
      } else {
        return cmp(aKey, bKey);
      }
    };
  }
}

export default Model;
