import { observable, action } from 'mobx';
import TopologyComponent from './TopologyComponent';

const KEY_DEBUG = false;

/**
 * Keyboard navigation handler and current cursor data storage.
 */
class Cursor {
  // The name of the current page.
  @observable page = 'None';
  @observable componentX = null;
  @observable componentY = null;
  @observable index = null;
  @observable column = null;
  @observable row = null;

  // When a modal is active, this is an object with two members: onCancel and onConfirm.
  @observable activeModal = null;

  // Storage for cursor locations for inactive components.
  savedComponents = {};
  // Screen setup function returning topology as 2-dimensional array `topology[row][column]`.
  topology = null;

  constructor(store) {
    this.store = store;
  }
  /**
   * Update navigation structures in the store based on the key pressed.
   * @param {String} key
   * @return {Object}
   */
  @action.bound
  handle(key) {
    let result;
    const keyName = (key.length === 1 ? 'Text' : key);
    const fn = 'key' + keyName.replace(/\+/g, '');

    // Try model handler.
    const model = this.getModel();
    if (model && model[fn]) {
      result = model[fn](this);
      if (result && KEY_DEBUG) {
        console.log(fn, ':', result);
      }
    }

    // Try generic handler.
    if (!result && this[fn]) {
      result = this[fn]();
      if (result && KEY_DEBUG) {
        console.log(fn, ':', result);
      }
    }

    if (result) {
      return result;
    }

    if (KEY_DEBUG) {
      console.log(`No handler for key '${key}'.`);
    }

    return null;
  }

  /**
   * Set up the topology for the page.
   * @param {String} name
   */
  @action.bound
  selectPage(page) {
    switch (page) {
      case 'Balances':
        this.setTopology(page, () => [
          [
            {name: 'Balances.balances', data: this.store.balances},
            {name: 'Balances.transactions', data: this.store.filteredTransactions}
          ]
        ]);
        break;
      default:
        this.setTopology(page, () => [[]]);
        console.error(`No topology defined for page ${page}.`);
    }
  }

  /**
   * Disable focus change using tab-key.
   */
  keyTab() {
    return {preventDefault: true};
  }
  keyShiftTab() {
    return {preventDefault: true};
  }

  /**
   * Set up the topology function.
   * @param {String} page
   * @param {() => Object[][]} topology
   */
  setTopology(page, topology) {
    if (this.page === page) {
      return;
    }
    this.page = page;
    this.topology = topology;
    this.componentX = 0;
    this.componentY = 0;
    this.index = null;
    this.column = null;
    this.row = null;
  }

  /**
   * Move one row or index down.
   */
  keyArrowDown() {
    const model = this.getModel();
    if (model && model.open) {

    }
    return this.changeIndexBy(+1);
  }

  /**
   * Move one row or index up.
   */
  keyArrowUp() {
    return this.changeIndexBy(-1);
  }

  /**
   * Move couple rows or indices down.
   */
  keyPageDown() {
    return this.changeIndexBy(+10);
  }

  /**
   * Move couple rows or indices up.
   */
  keyPageUp() {
    return this.changeIndexBy(-10);
  }

  /**
   * Move to the first index.
   */
  keyHome() {
    return this.setIndex(0);
  }

  /**
   * Move to the last index.
   */
  keyEnd() {
    return this.setIndex(-1);
  }

  /**
   * Move to the component left.
   */
  keyArrowLeft() {
    if (this.componentX > 0) {
      this.leaveComponent();
      this.componentX--;
      this.enterComponent();
    }
    return {preventDefault: true};
  }

  /**
   * Move to the component right.
   */
  keyArrowRight() {
    const row = this.getRow();
    if (this.componentX < row.length - 1) {
      this.leaveComponent();
      this.componentX++;
      this.enterComponent();
    }
    return {preventDefault: true};
  }

  /**
   * Hook that is called when we are leaving the current component.
   */
  leaveComponent() {
    const component = this.getComponent();
    if (component) {
      this.saveCursor(component);
      component.moveIndex(this.index, null);
    }
    this.index = null;
    this.row = null;
    this.column = null;
  }

  /**
   * Hook that is called when we have just entered the current component.
   */
  enterComponent() {
    const component = this.getComponent();
    if (component) {
      this.loadCursor(component);
      component.moveIndex(null, this.index);
    }
  }

  /**
   * Save the current cursor position for the component.
   * @param {TopologyComponent} component
   */
  saveCursor(component) {
    if (!component) {
      return;
    }
    const name = component.name;
    if (!name) {
      console.error(component);
      throw new Error('Component does not have a name.');
    }
    this.savedComponents[name] = {
      index: this.index,
      column: this.column,
      row: this.row
    };
  }

  /**
   * Load the current cursor position for the component.
   * @param {TopologyComponent} component
   */
  loadCursor(component) {
    if (!component) {
      return;
    }
    const name = component.name;
    if (!name) {
      console.error(component);
      throw new Error('Component does not have a name.');
    }
    if (this.savedComponents[name]) {
      this.index = this.savedComponents[name].index;
      this.column = this.savedComponents[name].column;
      this.row = this.savedComponents[name].row;
    } else {
      this.index = 0;
      this.row = null;
      this.column = null;
    }
  }

  /**
   * Adjust the current index by the given amount, if the component is vertical.
   * @param {Number} delta
   */
  changeIndexBy(delta) {
    const component = this.getComponent();
    if (component && component.vertical) {
      const oldIndex = this.index;
      if (this.indexUpdate(component.length, delta)) {
        component.moveIndex(oldIndex, this.index);
      }
    }
    return {preventDefault: true};
  }

  /**
   * Set the current index to the given number, if it is valid. Negative number counts from the end.
   * @param {Number|null|undefined} index
   */
  setIndex(index) {
    if (index === null || index === undefined) {
      this.index = null;
      this.row = null;
      this.column = null;
      return;
    }
    const component = this.getComponent();
    if (component) {
      if (index < 0) {
        index = component.length + index;
      }
      if (index >= 0 && index < component.length) {
        const oldIndex = this.index;
        this.index = index;
        component.moveIndex(oldIndex, this.index);
      }
    }
    return {preventDefault: true};
  }

  /**
   * Get an array of components from the current row.
   * @return {TopologyComponent[]}
   */
  getRow() {
    const topology = this.getTopology();
    if (!topology) {
      return [];
    }
    if (this.componentY >= topology.length) {
      this.componentY = topology.length - 1;
      if (this.componentY < 0) {
        this.componentY = 0;
      }
    }
    if (topology.length) {
      return topology[this.componentY].map((comp) => new TopologyComponent(comp));
    } else {
      return [];
    }
  }

  /**
   * Get the current component from the topology.
   * @return {TopologyComponent|null}
   */
  getComponent() {
    const topology = this.getTopology();
    if (!topology) {
      return null;
    }

    // Check the X-bounds.
    if (this.componentY >= topology.length) {
      this.componentY = topology.length - 1;
      if (this.componentY < 0) {
        this.componentY = 0;
        return null;
      }
    }
    // Check the y-bounds.
    if (this.componentX >= topology[this.componentY].length) {
      this.componentX = topology[this.componentY].length - 1;
      if (this.componentX < 0) {
        this.componentX = 0;
        return null;
      }
    }
    return new TopologyComponent(topology[this.componentY][this.componentX]);
  }

  /**
   * Get the current topology.
   */
  getTopology() {
    return (this.topology && this.topology()) || null;
  }

  /**
   * Get the model pointed by the index in the current topology component.
   * @return {Model|null}
   */
  getModel() {
    if (this.index !== null) {
      const comp = this.getComponent();
      return comp ? comp.getIndex(this.index) : null;
    }
  }

  /**
   * Helper to change index counter and wrap it around boundaries.
   * @param {Number} N
   * @param {Number} delta
   */
  indexUpdate(N, delta) {
    const oldIndex = this.index;
    if (N) {
      if (this.index === undefined || this.index === null) {
        this.index = delta < 0 ? N - 1 : 0;
      } else {
        this.index += delta;
        if (this.index < 0) {
          if (oldIndex === 0) {
            this.index = N - 1;
          } else {
            this.index = 0;
          }
        } else if (this.index >= N) {
          if (oldIndex === N - 1) {
            this.index = 0;
          } else {
            this.index = N - 1;
          }
        }
      }
      return true;
    }
  }

  // TODO: Refactor all this.
  // ------------------------------------------------------------------------------------

  @observable component = null;
  @observable editor = false;

  /**
   * Reset selections.
   */
  @action.bound
  resetSelected() {
    console.error('Obsolete call to resetSelected().');
    this.index = null;
    this.column = null;
    this.row = null;
    this.editor = false;
  }

  /**
   * Move directly to the given index of the given component.
   */
  @action.bound
  selectIndex(component, index = null) {
    console.error('Obsolete call to selectIndex().');
  }

  /**
   * Move directly to the given (column, row) location.
   */
  @action.bound
  selectCell(column, row) {
    console.error('Obsolete call to selectCel().');
    this.column = column;
    this.row = row;
  }

  /**
   * Turn editor on.
   * @param {Boolean} state
   */
  @action.bound
  selectEditing(state = true) {
    console.error('Obsolete call to selectEditing().');
    this.editor = state;
  }

  /**
   * Helper to navigate inside rectangular area.
   * @param {Number} column
   * @param {Number} row
   * @param {Number} N
   * @param {Number} M
   * @param {Number} dx
   * @param {Number} dy
   */
  boxUpdate(column, row, N, M, dx, dy, entryColumn = 0) {
    console.error('Obsolete call to boxUpdate().');
    if (N && M) {
      column = (column + N + dx) % N;
      if (row === null) {
        row = 0;
        column = entryColumn;
      } else {
        row += dy;
        if (row < 0) {
          row = null;
          column = null;
        }
        if (row >= M) {
          row = M - 1;
        }
      }
      return {column, row};
    }
  }
}

export default Cursor;
