import Model from './Model';

class DatabaseModel extends Model {

  constructor(parent, init = {}) {
    super(parent, {
      // Name of the database.
      name: null
    }, init);
  }

  getSortKey() {
    return this.name;
  }
}

export default DatabaseModel;
