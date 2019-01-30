import Model from './Model';

class EntryModel extends Model {

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // Tags extracted from the description.
      tags: []
    }, init);
  }
}

export default EntryModel;
