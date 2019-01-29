import Model from './Model';

class AccountModel extends Model {

  constructor(init = {}) {
    super({
      id: null,
      name: null,
      number: null,
      type: null,
      tags: []
    }, init);
  }

  toString() {
    return `${this.number} ${this.name}`;
  }
}

export default AccountModel;
