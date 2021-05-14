import NavigationTargetModel from '../Models/NavigationTargetModel'
import { action } from 'mobx'

/**
 * Description of some collection of navigational objects.
 *
 * Components inside the data are formatted as
 * [
 *    [componentX 0 componentY 0],
 *    [componentX 0 componentY 1],
 *    [componentX 0 componentY 2, componentX 1 componentY 2, componentX 2 componentY 2]
 *    [componentX 0 componentY 3, componentX 1 componentY 3],
 * ]
 *
 */
class TopologyComponent {
  constructor(comp) {
    Object.assign(this, comp)
  }

  /**
   * Change the current index to the given index.
   * @param {Number} oldIndex
   * @param {Number} index
   * @param {Boolean} options.noScroll
   */
  @action.bound
  moveIndex(oldIndex, index, options = {}) {
    if (oldIndex !== null && this.data[oldIndex]) {
      this.data[oldIndex].leave()
    }
    if (index !== null && this.data[index]) {
      if (!(this.data[index] instanceof NavigationTargetModel)) {
        console.error(this.data[index])
        throw new Error('Invalid navigation target not inherited from NavigationTargetModel.')
      }
      this.data[index].enter()
      const el = document.getElementById(this.data[index].getId())
      if (el && !options.noScroll) {
        el.scrollIntoView({ block: 'center', inline: 'center' })
      }
    }
  }

  /**
   * Change the current sub-item.
   * @param {Number} oldIndex
   * @param {Number} index
   * @param {Number} oldColumn
   * @param {Number} oldRow
   * @param {Number} column
   * @param {Number} row
   */
  @action.bound
  moveBox(oldIndex, index, oldColumn, oldRow, column, row) {
    if (this.data[oldIndex]) {
      const rows = this.data[oldIndex].rows()
      if (oldRow !== null && oldRow >= 0 && oldRow < rows.length) {
        rows[oldRow].leaveSub(oldColumn)
      }
    }
    if (this.data[index]) {
      const rows = this.data[index].rows()
      if (row !== null && row >= 0 && row < rows.length) {
        rows[row].enterSub(column)
      }
    }
  }

  /**
   * Get the model pointed by the index.
   * @param {Number} index
   * @return {Model|null}
   */
  getIndex(index) {
    if (index < 0 || index >= this.length) {
      return null
    }
    return this.data[index]
  }

  /**
   * Get the number of items in the collection.
   */
  get length() {
    return this.data.length
  }
}

export default TopologyComponent
