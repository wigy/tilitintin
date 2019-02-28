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

  // When a modal is active, this is a reference into it.
  @observable activeModal = null;
  // When editing is active, this points to the model edited.
  @observable editTarget = null;

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

    // Try active modal handler.
    if (!result && this.activeModal && this.activeModal[fn]) {
      result = this.activeModal[fn]();
      if (result && KEY_DEBUG) {
        console.log('Modal:', fn, ':', result);
      }
    }

    // Try model handler.
    const model = this.getModel();
    if (!result && model && model[fn]) {
      result = model[fn](this);
      if (result && KEY_DEBUG) {
        console.log('Model:', fn, ':', result);
      }
    }

    // Try generic handler.
    if (!result && this[fn]) {
      result = this[fn]();
      if (result && KEY_DEBUG) {
        console.log('Cursor:', fn, ':', result);
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

      case 'Reports':
        this.setTopology(page, () => [[]]);
        break;

      case 'Accounts':
        this.setTopology(page, () => [[]]);
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
    if (this.index === null && this.getComponent()) {
      this.enterComponent(this.getComponent());
      return {preventDefault: true};
    }
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
    if (this.index === null && this.getComponent()) {
      this.enterComponent(this.getComponent());
      return {preventDefault: true};
    }
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
   * Leave/close/de-select the current.
   */
  keyEscape() {
    const model = this.getModel();
    if (model && model.open) {
      if (this.row !== null) {
        this.setCell(null, null);
      } else {
        model.toggleOpen();
      }
    } else {
      this.setIndex(null);
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
   * @return {Boolean}
   */
  saveCursor(component) {
    if (!component) {
      return false;
    }
    const name = component.name;
    if (!name) {
      console.error(component);
      throw new Error('Component does not have a name.');
    }
    if (this.index === null) {
      return false;
    }
    this.savedComponents[name] = {
      index: this.index,
      column: this.column,
      row: this.row
    };
    return true;
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
    const component = this.getComponent();
    const oldIndex = this.index;
    this.setCell(null, null);
    if (index === null || index === undefined) {
      this.leaveComponent();
      this.index = null;
      component && component.moveIndex(oldIndex, null);
      return {preventDefault: true};
    }
    if (component) {
      if (index < 0) {
        index = component.length + index;
      }
      if (index >= 0 && index < component.length) {
        this.index = index;
        component.moveIndex(oldIndex, this.index);
      }
      return {preventDefault: true};
    }
  }

  /**
   * Adjust the current index by the given amount, if the component is vertical.
   * @param {Number|null} delta
   */
  changeIndexBy(delta) {
    const component = this.getComponent();
    if (component && component.vertical) {
      return this.setIndex(this.indexUpdate(this.index, component.length, delta));
    }
  }

  /**
   * Set the current location inside the sub-item.
   * @param {Number} column
   * @param {Number} row
   */
  setCell(column, row) {
    if (column === null && row === null) {
      this.changeBoxBy(null, null);
    } else if (this.row === null) {
      this.changeBoxBy(column, row + 1);
    } else {
      this.changeBoxBy(column - this.column, row - this.row);
    }
    return {preventDefault: true};
  }

  /**
   * Adjust the currently selected sub-item.
   * @param {Number|null} dx
   * @param {Number|null} dy
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
   * Reset all selections.
   */
  @action.bound
  resetSelected() {
    const model = this.getModel();
    if (model) {
      model.turnEditorOff(this);
    }
    this.setCell(null, null);
    this.setIndex(null);
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
   * @param {Number|null} index
   * @param {Number} N
   * @param {Number|null} delta
   */
  indexUpdate(index, N, delta) {
    const oldIndex = index;
    if (N) {
      if (delta === null) {
        return null;
      }
      if (oldIndex === undefined || oldIndex === null) {
        return delta < 0 ? N - 1 : 0;
      }
      index += delta;
      if (index < 0) {
        if (oldIndex === 0) {
          index = N - 1;
        } else {
          index = 0;
        }
      } else if (index >= N) {
        if (oldIndex === N - 1) {
          index = 0;
        } else {
          index = N - 1;
        }
      }
      return index;
    }
  }

  /**
   * Helper to navigate inside rectangular area.
   * @param {Number} N Number of columns.
   * @param {Number} M Number of rows.
   * @param {Number|null} dx
   * @param {Number|null} dy
   * @param {Boolean} [options.subitemExitDown]
   * @param {Boolean} [options.subitemExitDown]
   * @param {Number} [options.entryColumn]
   */
  boxUpdate(N, M, dx, dy, options) {
    if (N && M) {
      if (dx === null && dy === null) {
        this.row = null;
        this.column = null;
        return true;
      }
      const oldRow = this.row;
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
}

export default Cursor;
