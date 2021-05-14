import Model from './Model'
import Configuration from '../Configuration'

class TagModel extends Model {

  constructor(parent, init = {}) {
    super(parent, {
      id: null,
      // String to be recognized as a tag without `[]`.
      tag: null,
      // Description of the tag.
      name: null,
      // URL to the image for the tag.
      picture: null,
      // Any string as a grouping category for the tag.
      type: null,
      // Order number of the tag for display.
      order: null
    }, init)
  }

  getSortKey() {
    return this.order
  }

  getObjectType() {
    return 'Tag'
  }

  /**
   * Construct URL for API image viewer.
   */
  get url() {
    return `${Configuration.API_URL}/db/${this.store.db}/tags/${this.id}/view?token=${this.store.token}`
  }

  /**
   * Extract tags and text from the description string.
   * @param {string} desc
   * @return [String, String[]] Description and list of tags.
   */
  static desc2tags(desc) {
    const ret = [desc, []]
    const regex = /^((\[[a-zA-Z0-9]+\])+)\s*(.*)/.exec(desc)
    if (regex && regex[1]) {
      ret[0] = regex[3]
      ret[1] = regex[1].substr(1, regex[1].length - 2).split('][')
    }
    return ret
  }
}

export default TagModel
