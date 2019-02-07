import NavigationTargetModel from '../Models/NavigationTargetModel';
import { action } from 'mobx';

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
    this.name = comp.name;
    this.data = comp.data;
    this.vertical = comp.vertical;
    this.horizontal = comp.horizontal;
    this.subitemExitUp = comp.subitemExitUp;
    this.subitemExitDown = comp.subitemExitDown;
  }

  /**
   * Change the current index to the given index.
   * @param {Number} oldIndex
   * @param {Number} index
   */
  @action.bound
  moveIndex(oldIndex, index) {
    if (oldIndex !== null && this.data[oldIndex]) {
      this.data[oldIndex].leave();
    }
    if (index !== null && this.data[index]) {
      if (!(this.data[index] instanceof NavigationTargetModel)) {
        console.error(this.data[index]);
        throw new Error(`Invalid navigation target not inherited from NavigationTargetModel.`);
      }
      this.data[index].enter();
      const el = document.getElementById(this.data[index].getId());
      if (el) {
        el.scrollIntoView({block: 'center', inline: 'center'});
      }
    }
  }

  /**
   * Change the current sub-item.
   * @param {Number} oldColumn
   * @param {Number} oldRow
   * @param {Number} column
   * @param {Number} row
   */
  @action.bound
  moveBox(index, oldColumn, oldRow, column, row) {
    if (this.data[index]) {
      const rows = this.data[index].rows();
      if (oldRow !== null && oldRow >= 0 && oldRow < rows.length) {
        rows[oldRow].leaveSub(oldColumn);
      }
      if (row !== null && row >= 0 && row < rows.length) {
        rows[row].enterSub(column);
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
      return null;
    }
    return this.data[index];
  }

  /**
   * Get the number of items in the collection.
   */
  get length() {
    return this.data.length;
  }
}

export default TopologyComponent;
