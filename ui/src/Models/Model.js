import { extendObservable } from 'mobx';

class Model {

  constructor(variables, init = {}) {
    extendObservable(this, variables);
    Object.keys(variables).forEach((key) => {
      if (key in init) {
        this[key] = init[key];
      }
    });
  }

  /**
   * If sortable, get the value to be used for sorting.
   */
  getSortKey() {
    return null;
  }

  /**
   * Construct a sorting function for model instances.
   */
  static sorter() {
    return (a, b) => (a.getSortKey() < b.getSortKey() ? -1 : (
      a.getSortKey() > b.getSortKey() ? 1 : 0
    ));
  }
}

export default Model;
