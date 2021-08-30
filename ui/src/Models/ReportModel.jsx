import clone from 'clone'
import { action } from 'mobx'
import Model from './Model'

class ReportModel extends Model {

  constructor(parent, init = {}) {
    super(parent, {
      format: null,
      // Order number.
      order: null,
      // Meta data associated with the report.
      meta: {},
      // A mapping from option names to their types given as strings.
      options: {},
      // Selected values for report options.
      config: {},
      // A list of entries of this document.
      entries: [],
      // Description of columns.
      columns: [],
      // URL used for fetching the report.
      url: null,
      // Report data if loaded.
      data: []
    }, init)
  }

  getSortKey() {
    return this.order
  }

  getObjectType() {
    return 'Report'
  }

  /**
   * Recommended file name for the report.
   */
  fileName() {
    return this.format + '.csv'
  }

  /**
   * Initialize config from options.
   * @param {Object} data
   */
  initialize(data) {
    data = clone(data)
    if (data.options) {
      data.config = data.config || {}
      Object.keys(data.options).forEach((option) => {
        if (!(option in data.config)) {
          const [type, arg1, arg2] = data.options[option].split(':')
          switch (type) {
            case 'boolean':
              data.config[option] = arg1 === 'true'
              break
            case 'radio':
              data.config[option] = arg2 === 'default'
              break
            default:
              throw new Error(`No initializer for report option type '${type}'.`)
          }
        }
      })
    }
    return data
  }

  /**
   * Construct URL for the back-end data.
   */
  getUrl() {
    const options = []
    Object.keys(this.options).forEach((option) => {
      options.push(`${option}=${encodeURIComponent(JSON.stringify(this.config[option]))}`)
    })
    const url = '/db/' + this.database.name + '/report/' + this.format + '/' + this.period.id + (options.length ? '?' + options.join('&') : '')
    return url
  }

  /**
   * Collect fields from the downloaded report data.
   * @param {String} url
   * @param {Object} data
   */
  @action
  setData(url, data) {
    this.url = url
    this.columns = data.columns || []
    this.meta = data.meta || {}
    this.data = data.data || []
  }

  clear() {
    this.setData(null, {})
  }

  /**
   * Get the period this document belongs to.
   */
  get period() {
    return this.parent
  }

  /**
   * Get the database this document belongs to.
   */
  get database() {
    return this.parent.database
  }
}

export default ReportModel
