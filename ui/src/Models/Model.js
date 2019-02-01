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
