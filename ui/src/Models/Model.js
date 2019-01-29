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
}

export default Model;
