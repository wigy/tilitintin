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
    this.vertical = true;
    this.horizontal = false;
  }

  /**
   * Change the current index to the given index.
   * @param {Number} oldIndex
   * @param {Number} index
   */
  @action.bound
  moveIndex(oldIndex, index) {
    if (oldIndex !== null) {
      this.data[oldIndex].leave();
    }
    if (index !== null) {
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
