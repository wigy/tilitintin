import { observable, action } from 'mobx';

/**
 * Keyboard navigation data.
 *
 */
class Cursor {
  @observable page = 'App';
  @observable component = null;
  @observable index = null;
  @observable column = null;
  @observable row = null;
  @observable editor = false;

  // When a modal is active, this is an object with two members: onCancel and onConfirm.
  @observable activeModal = null;

  oldSelected = {};
  oldIndex = {};

  /**
   * Reset selections.
   */
  @action.bound
  resetSelected() {
    this.index = null;
    this.column = null;
    this.row = null;
    this.editor = false;
  }

  /**
   * Select the current navigation target.
   * @param {String} page
   */
  @action.bound
  selectPage(page) {

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
   * Move directly to the given index of the given component.
   */
  @action.bound
  selectIndex(component, index = null) {
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
    this.column = column;
    this.row = row;
  }

  /**
   * Turn editor on.
   * @param {Boolean} state
   */
  @action.bound
  selectEditing(state = true) {
    this.editor = state;
  }

  /**
   * Helper to change index counter and wrap it around boundaries.
   * @param {Number} index
   * @param {Number} N
   * @param {Number} delta
   */
  indexUpdate(index, N, delta) {
    const oldIndex = index;
    if (N) {
      if (index === null) {
        if (index === undefined || index === null) {
          index = delta < 0 ? N - 1 : 0;
        }
      } else {
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
      }
      return {index};
    }
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
