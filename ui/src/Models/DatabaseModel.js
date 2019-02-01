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

  /**
   * Get the store.
   */
  get store() {
    return this.parent;
  }
}

export default DatabaseModel;
