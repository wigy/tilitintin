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
   * Construct a sorting function for sorting model instances.
   */
  static sorter(reverse = false) {
    const one = reverse ? -1 : 1;
    return (a, b) => (a.getSortKey() < b.getSortKey() ? -one : (
      a.getSortKey() > b.getSortKey() ? one : 0
    ));
  }
}

export default Model;
