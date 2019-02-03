import { observable, action } from 'mobx';
import TopologyComponent from './TopologyComponent';

/**
 * Keyboard navigation data.
 */
class Cursor {
  // The name of the current page.
  @observable page = 'App';
  @observable componentX = null;
  @observable componentY = null;
  @observable index = null;
  @observable column = null;
  @observable row = null;

  // When a modal is active, this is an object with two members: onCancel and onConfirm.
  @observable activeModal = null; // TODO: This should be in navigator?

  // Storage for cursor locations for inactive components.
  savedComponents = {};
  // Screen setup function returning topology as 2-dimensional array `topology[row][column]`.
  topology = null;

  @action.bound
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
  @action.bound
  keyArrowDown() {
    return this.changeIndexBy(+1);
  }

  /**
   * Move one row or index up.
   */
  @action.bound
  keyArrowUp() {
    return this.changeIndexBy(-1);
  }

  /**
   * Move couple rows or indices down.
   */
  @action.bound
  keyPageDown() {
    return this.changeIndexBy(+10);
  }

  /**
   * Move couple rows or indices up.
   */
  @action.bound
  keyPageUp() {
    return this.changeIndexBy(-10);
  }

  /**
   * Move to the first index.
   */
  @action.bound
  keyHome() {
    return this.setIndex(0);
  }

  /**
   * Move to the last index.
   */
  @action.bound
  keyEnd() {
    return this.setIndex(-1);
  }

  /**
   * Move to the component left.
   */
  @action.bound
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
  @action.bound
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
    const component = this.getTopologyComponent();
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
    const component = this.getTopologyComponent();
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
    const component = this.getTopologyComponent();
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
      return;
    }
    const component = this.getTopologyComponent();
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
    if (!this.topology) {
      return [];
    }
    const topology = this.topology();
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
  getTopologyComponent() {
    if (!this.topology) {
      return null;
    }

    const topology = this.topology();
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
   * Get the component pointed by the index in the current topology component.
   * @return {Model|null}
   */
  getComponent() {
    if (this.index !== null) {
      const topoComp = this.getTopologyComponent();
      return topoComp ? topoComp.getIndex(this.index) : null;
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

  /**
   * Change the current component.
   * @param {String} component
   */
  componentUpdate(component, N) {
    console.error('Obsolete call to componentUpdate().');
    this.save();
    let index = this.oldIndex[component] || 0;
    if (!N) {
      index = null;
    } else if (index >= N) {
      index = N - 1;
    }
    return {component, index};
  }
}

export default Cursor;
