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

  // List of modals on the page.
  @observable activeModal = [];
  // When editing is active, this points to the model edited.
  @observable editTarget = null;
  // If set, key handler is disabled.
  @observable disabled = false;

  // Storage for cursor locations for inactive components.
  savedComponents = {};
  // Storage for last components for page.
  savedPages = {};
  // Screen setup function returning topology as 2-dimensional array `topology[row][column]`.
  topology = null;
  // Component that has selected the page last time.
  currentPageComponent = null;
  // Menu component of the system.
  menuComponent = null;

  constructor(store) {
    this.store = store;
    document.addEventListener('keydown', (event) => {
      if (this.disabled || !event || !event.key) {
        return;
      }
      const keyName = (
        (event.key.length > 1 && event.shiftKey ? 'Shift+' : '') +
        (event.ctrlKey ? 'Ctrl+' : '') +
        (event.altKey ? 'Alt+' : '') +
        event.key);
      const keyResult = this.handle(keyName);
      if (keyResult && keyResult.preventDefault) {
        event.preventDefault();
      }
    });
  }

  /**
   * Select the current modal.
   * @param {Component} modal
   */
  addModal(modal) {
    this.activeModal.push(modal);
  }

  /**
   * Turn the current modal off.
   * @param {Component|null} modal
   */
  removeModal(modal) {
    this.activeModal.splice(this.activeModal.indexOf(modal), 1);
  }

  /**
   * Turn off handler.
   */
  disableHandler() {
    this.disabled = true;
  }

  /**
   * Turn on handler.
   */
  enableHandler() {
    this.disabled = false;
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
    const parts = keyName.split('+');
    if (parts.length > 1 && parts[parts.length - 1].length === 1) {
      parts[parts.length - 1] = parts[parts.length - 1].toUpperCase();
    }
    if (parts[parts.length - 1] === ' ') {
      parts[parts.length - 1] = 'Space';
    }
    const fn = 'key' + parts.join('');

    // Try active modal handler.
    if (!result && this.activeModal.length) {
      for (let i = 0; i < this.activeModal.length; i++) {
        if (this.activeModal[i].props.isVisible) {
          if (!this.activeModal[i][fn]) {
            return null;
          }
          result = this.activeModal[i][fn](this, key);
          if (result && KEY_DEBUG) {
            console.log('Modal:', fn, ':', result);
          }
        }
      }
    }

    // Try model handler.
    const model = this.getModel();
    if (!result && model && model[fn]) {
      result = model[fn](this, key);
      if (result && KEY_DEBUG) {
        console.log('Model:', fn, ':', result);
      }
    }

    // Try page component handler.
    if (!result && this.currentPageComponent && this.currentPageComponent[fn]) {
      result = this.currentPageComponent[fn](this, key);
      if (result && KEY_DEBUG) {
        console.log('Page component:', fn, ':', result);
      }
    }

    // Try menu handler.
    if (!result && this.menuComponent && this.menuComponent[fn]) {
      result = this.menuComponent[fn](this, key);
      if (result && KEY_DEBUG) {
        console.log('Menu component:', fn, ':', result);
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
      console.log(`No handler ${fn} for key '${key}'.`);
    }

    return null;
  }

  /**
   *
   * @param {Component} component
   */
  registerMenu(component) {
    this.menuComponent = component;
  }

  /**
   * Set up the topology for the page.
   * @param {String} name
   * @param {Component} component
   */
  @action.bound
  selectPage(page, component) {

    this.currentPageComponent = component;

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
              entryColumn: 0,
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

      case 'Tools':
        this.setTopology(page, () => [[]]);
        break;

      case 'Dashboard':
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
    return { preventDefault: true };
  }

  keyShiftTab() {
    return { preventDefault: true };
  }

  /**
   * Set up the topology function and change the page.
   * @param {String} page
   * @param {() => Object[][]} topology
   */
  setTopology(page, topology) {
    if (this.page === page) {
      return;
    }
    this.leaveComponent();
    this.leavePage();
    this.page = page;
    this.topology = topology;
    this.enterPage();
    this.enterComponent();
  }

  /**
   * Save current component for the page.
   */
  leavePage() {
    const { componentX, componentY } = this;
    this.savedPages[this.page] = { componentX, componentY };
  }

  /**
   * Restore current component for the page.
   */
  enterPage() {
    if (this.savedPages[this.page]) {
      const { componentX, componentY } = this.savedPages[this.page];
      this.componentX = componentX;
      this.componentY = componentY;
    } else {
      this.componentX = 0;
      this.componentY = 0;
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
    } else {
      this.index = null;
      this.row = null;
      this.column = null;
    }
  }

  /**
   * Check if the given component is currently selected.
   * @param {String} name
   */
  inComponent(name) {
    const component = this.getComponent();
    return component && component.name === name;
  }

  /**
   * Move one row or index down.
   */
  keyArrowDown() {
    if (this.index === null && this.getComponent()) {
      this.enterComponent(this.getComponent());
      return { preventDefault: true };
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
      return { preventDefault: true };
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
    return { preventDefault: true };
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
    return { preventDefault: true };
  }

  /**
   * Move couple rows or indices down.
   */
  keyPageDown() {
    const model = this.getModel();
    if (model && model.open) {
      const geo = model.geometry();
      if (geo[1] > 10) {
        const ret = this.changeBoxBy(0, +10);
        if (ret) {
          const el = document.getElementById(`tx${model.document.id}-row${this.row}`);
          if (el) {
            el.scrollIntoView({ block: 'center', inline: 'center' });
          }
          return ret;
        }
      }
    }
    return this.changeIndexBy(+10);
  }

  /**
   * Move couple rows or indices up.
   */
  keyPageUp() {
    const model = this.getModel();
    if (model && model.open) {
      const geo = model.geometry();
      if (geo[1] > 10) {
        const ret = this.changeBoxBy(0, -Math.min(10, this.row + 1));
        if (ret) {
          const el = document.getElementById(`tx${model.document.id}-row${this.row}`);
          if (el) {
            el.scrollIntoView({ block: 'center', inline: 'center' });
          }
          return ret;
        }
      }
    }
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
      return { preventDefault: true };
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
    return { preventDefault: true };
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
      if (this.savedComponents[name].index >= component.length) {
        this.setIndex(component.length ? component.length - 1 : null);
        return;
      }
      this.setIndex(this.savedComponents[name].index);
      this.setCell(this.savedComponents[name].column, this.savedComponents[name].row);
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
   * @param {Boolean} options.noScroll
   */
  setIndex(index, options = {}) {
    const component = this.getComponent();
    const oldIndex = this.index;
    this.setCell(null, null);
    if (index === null || index === undefined) {
      this.leaveComponent();
      this.index = null;
      component && component.moveIndex(oldIndex, null, options);
      return { preventDefault: true };
    }
    if (component) {
      if (index < 0) {
        index = component.length + index;
      }
      if (index >= 0 && index < component.length) {
        this.index = index;
        component.moveIndex(oldIndex, this.index, options);
      }
      return { preventDefault: true };
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
    const model = this.getModel();
    if (model) {
      model.turnEditorOff(this);
    }
    if (column === null && row === null) {
      this.changeBoxBy(null, null);
    } else if (this.row === null) {
      const component = this.getComponent();
      component.moveBox(this.index, this.index, null, null, column, row);
      this.column = column;
      this.row = row;
    } else {
      this.changeBoxBy(column - this.column, row - this.row);
    }
    return { preventDefault: true };
  }

  /**
   * Adjust the currently selected sub-item.
   * @param {Number|null} dx
   * @param {Number|null} dy
   */
  changeBoxBy(dx, dy) {
    const component = this.getComponent();
    const { subitemExitUp, subitemExitDown, entryColumn, subitemUpStopOnNull } = component || {};
    const model = this.getModel();

    // Helper to adjust cursor inside 2-dimensional box.
    const tryBoxUpdate = () => {
      const [columns, rows] = model.geometry();
      const oldRow = this.row;
      const oldColumn = this.column;
      const oldIndex = this.index;
      if (this.boxUpdate(columns, rows, dx, dy, { subitemExitUp, subitemExitDown, entryColumn, subitemUpStopOnNull })) {
        component.moveBox(oldIndex, this.index, oldColumn, oldRow, this.column, this.row);
        return { preventDefault: true };
      }
    };

    if (model && model.open && dy >= 0) {
      return tryBoxUpdate();
    } else if (dy < 0) {
      if (this.row === null) {
        const index = (this.index + dy + component.length) % component.length;
        const model = this.getModel(index);
        if (model && model.open && this.setIndex(index)) {
          const [, rows] = model.geometry();
          return this.setCell(entryColumn || 0, rows - 1);
        }
      } else if (model) {
        return tryBoxUpdate();
      }
    }
  }

  /**
   * Reset all selections.
   */
  @action.bound
  resetSelected() {
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
  getModel(index = this.index) {
    if (index !== null) {
      const comp = this.getComponent();
      return comp ? comp.getIndex(index) : null;
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
   * @param {Boolean} [options.subitemExitUp]
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
          this.row = dy - 1;
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
