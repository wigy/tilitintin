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
            {
              name: 'Balances.balances',
              data: this.store.balances,
              vertical: true
            },
            {
              name: 'Balances.transactions',
              data: this.store.filteredTransactions,
              vertical: true,
              entryColumn: 1,
              subitemExitUp: true,
              subitemUpStopOnNull: true,
              subitemExitDown: true
            }
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
      const ret = this.changeBoxBy(0, +1);
      if (ret) {
        return ret;
      }
    }
    return this.changeIndexBy(+1);
  }

  /**
   * Move one row or index up.
   */
  keyArrowUp() {
    const model = this.getModel();
    if (model) {
      const ret = this.changeBoxBy(0, -1);
      if (ret) {
        return ret;
      }
    }
    return this.changeIndexBy(-1);
  }

  /**
   * Move to the component left.
   */
  keyArrowLeft() {
    const model = this.getModel();
    if (model && model.open && this.row !== null) {
      const ret = this.changeBoxBy(-1, 0);
      if (ret) {
        return ret;
      }
    }
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
    const model = this.getModel();
    if (model && model.open && this.row !== null) {
      const ret = this.changeBoxBy(+1, 0);
      if (ret) {
        return ret;
      }
    }
    const row = this.getRow();
    if (this.componentX < row.length - 1) {
      this.leaveComponent();
      this.componentX++;
      this.enterComponent();
    }
    return {preventDefault: true};
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
   * Toggle entries visible and non-visible.
   */
  keyEnter() {
    const model = this.getModel();
    if (model && model.geometry()) {
      model.toggleOpen();
      if (!model.open) {
        this.column = null;
        this.row = null;
        this.getComponent().moveBox(null, null);
      }
      return {preventDefault: true};
    }
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
        this.row = null;
        this.column = null;
        component.moveBox(null, null);
        component.moveIndex(oldIndex, this.index);
      }
      return {preventDefault: true};
    }
  }

  /**
   * Adjust the currently selected sub-item.
   * @param {Number} dx
   * @param {Number} dy
   */
  changeBoxBy(dx, dy) {
    const model = this.getModel();
    if (model && model.open) {
      const component = this.getComponent();
      const [columns, rows] = model.geometry();
      const {subitemExitUp, subitemExitDown, entryColumn, subitemUpStopOnNull} = component;
      const oldRow = this.row;
      const oldColumn = this.column;
      const oldIndex = this.index;
      if (this.boxUpdate(columns, rows, dx, dy, {subitemExitUp, subitemExitDown, entryColumn, subitemUpStopOnNull})) {
        component.moveBox(oldIndex, this.index, oldColumn, oldRow, this.column, this.row);
        return {preventDefault: true};
      }
    }
  }

  /**
   * Switch directly to another topological component.
   * @param {String} name
   */
  setComponent(name) {
    const component = this.getComponent();
    if (component.name === name) {
      return;
    }
    this.leaveComponent();
    // Find new (x,y) from topology.
    const topology = this.topology();
    for (let y = 0; y < topology.length; y++) {
      for (let x = 0; x < topology[y].length; x++) {
        if (name === topology[y][x].name) {
          this.componentX = x;
          this.componentY = y;
          this.enterComponent();
          return;
        }
      }
    }
    throw new Error(`Cannot find topological component called ${name}.`);
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
   * Set the current location inside the sub-item.
   * @param {Number} column
   * @param {Number} row
   */
  setCell(column, row) {
    if (this.row === null) {
      this.changeBoxBy(column, row + 1);
    } else {
      this.changeBoxBy(column - this.column, row - this.row);
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

  /**
   * Helper to navigate inside rectangular area.
   * @param {Number} N Number of columns.
   * @param {Number} M Number of rows.
   * @param {Number} dx
   * @param {Number} dy
   * @param {Boolean} [options.subitemExitDown]
   * @param {Boolean} [options.subitemExitDown]
   * @param {Number} [options.entryColumn]
   */
  boxUpdate(N, M, dx, dy, options) {
    const oldRow = this.row;
    if (N && M) {
      this.column = (this.column + N + dx) % N;
      if (this.row === null) {
        if (dy > 0) {
          this.row = 0;
          this.column = options.entryColumn || 0;
        } else if (dy < 0) {
          if (this.changeIndexBy(-1)) {
            const model = this.getModel();
            if (model) {
              const rows = model.rows();
              if (rows.length) {
                this.row = rows.length - 1;
                this.column = options.entryColumn || 0;
              }
            }
          }
        }
      } else { // Row not null.
        this.row += dy;
        if (this.row < 0) {
          if (options.subitemExitUp) {
            if (options.subitemUpStopOnNull) {
              // Stop at null.
              this.row = null;
              return true;
            }
            return false;
          } else {
            this.row = oldRow;
          }
        }
        if (this.row >= M) {
          if (options.subitemExitDown) {
            return false;
          } else {
            this.row = M - 1;
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
   * Turn editor on.
   * @param {Boolean} state
   */
  @action.bound
  selectEditing(state = true) {
    console.error('Obsolete call to selectEditing().');
    this.editor = state;
  }
}

export default Cursor;
