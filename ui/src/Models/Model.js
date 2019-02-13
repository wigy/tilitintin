import { extendObservable } from 'mobx';

class Model {

  constructor(parent, variables, init = {}) {
    this.parent = parent;
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
   * Get the name of class without 'Model' postfix.
   */
  getObjectType() {
    return this.constructor.name.replace(/Model$/, '');
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
   * @param {Any} value
   * @return {String|null} Error message if not valid.
   */
  validate(field, value) {
    const name = `validate.${field}`;
    return name in this ? this[name](value) : true;
  }

  /**
   * Get the store.
   */
  get store() {
    return this.parent ? this.parent.store : null;
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
