import Model from './Model'

class HeadingModel extends Model {

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // The account number that this heading refers to.
      number: null,
      // Numeric level 0...N-1.
      level: null,
      // Heading text.
      text: null
    }, init)
  }

  /**
   * Get the database this entry belongs to.
   */
  get database() {
    return this.parent
  }

  getObjectType() {
    return 'Heading'
  }
}

export default HeadingModel
