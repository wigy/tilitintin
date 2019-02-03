import { action } from 'mobx';

/**
 * Description of some collection of navigational objects.
 */
class TopologyComponent {
  constructor(comp) {
    this.data = comp.data;
    this.vertical = true;
    this.horizontal = false;
  }

  @action.bound
  moveIndex(oldIndex, index) {
    if (oldIndex !== null) {
      this.data[oldIndex].leave();
    }
    if (index !== null) {
      this.data[index].select();
      const el = document.getElementById(this.data[index].getId());
      el.scrollIntoView({block: 'center', inline: 'center'});
    }
  }

  /**
   * Get the number of items in the collection.
   */
  get length() {
    return this.data.length;
  }
}

export default TopologyComponent;
