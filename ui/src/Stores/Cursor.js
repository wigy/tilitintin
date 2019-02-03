import { observable, action } from 'mobx';
import TopologyComponent from './TopologyComponent';

/**
 * Keyboard navigation data.
 */
class Cursor {
  // The name of the current page.
  @observable page = 'App';
  // Screen setup function returning topology as 2-dimensional array `topology[column][row]`.
  @observable topology = [[]];
  @observable componentX = null;
  @observable componentY = null;
  @observable index = null;
  @observable column = null;
  @observable row = null;

  // When a modal is active, this is an object with two members: onCancel and onConfirm.
  @observable activeModal = null; // TODO: This should be in navigator?

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

  @action.bound
  keyArrowDown() {
    const component = this.getComponent();
    if (component && component.vertical) {
      const oldIndex = this.index;
      if (this.indexUpdate(component.length, +1)) {
        component.moveIndex(oldIndex, this.index);
      }
    }
    return {preventDefault: true};
  }

  @action.bound
  keyArrowUp() {
    const component = this.getComponent();
    if (component && component.vertical) {
      const oldIndex = this.index;
      if (this.indexUpdate(component.length, -1)) {
        component.moveIndex(oldIndex, this.index);
      }
    }
    return {preventDefault: true};
  }

  /**
   * Get the current component from the topology.
   * @return {TopologyComponent|null}
   */
  getComponent() {
    const topology = this.topology();
    // Check the X-bounds.
    if (this.componentX >= topology.length) {
      this.componentX = topology.length - 1;
      if (this.componentX < 0) {
        this.componentX = 0;
        return null;
      }
    }
    // Check the y-bounds.
    if (this.componentY >= topology[this.componentX].length) {
      this.componentY = topology[this.componentX].length - 1;
      if (this.componentY < 0) {
        this.componentY = 0;
        return null;
      }
    }
    return new TopologyComponent(topology[this.componentX][this.componentY]);
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
  oldSelected = {};
  oldIndex = {};

  @observable component = null;
  @observable editor = false;

  @action.bound
  selectPage(page) {
    console.error('Obsolete call to selectPage().');
    if (this.page === page) {
      return;
    }

    let component = 'Nothing'; let index = null; let column = null; let row = null;

    if (this.oldSelected[page]) {
      component = this.oldSelected[page].component;
      index = this.oldSelected[page].index;
      column = this.oldSelected[page].column;
      row = this.oldSelected[page].row;
    } else {
      switch (page) {
        case 'Balances':
          component = 'BalanceTable';
          break;
        case 'Reports':
          component = 'Nothing';
          break;
        case 'Accounts':
          component = 'Nothing';
          break;
        default:
          console.error('No default components for page', page);
      }
    }

    this.oldSelected[this.page] = {
      component: this.component,
      index: this.index,
      column: this.column,
      row: this.row
    };

    this.page = page;
    this.component = component;
    this.index = index;
    this.column = column;
    this.row = row;
  }

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
    console.error('Obsolete call to resetIndex().');
    if (arguments.length === 1) {
      index = component;
      component = this.component;
    }
    if (component !== this.component) {
      this.save();
      this.component = component;
    }
    this.index = index;
    this.column = null;
    this.row = null;
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

  /**
   * Save the current position.
   */
  save() {
    if (this.index !== null) {
      this.oldIndex[this.component] = this.index;
    }
  }
}

export default Cursor;
