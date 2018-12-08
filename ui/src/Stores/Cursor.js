import { observable } from 'mobx';

/**
 * Keyboard navigation data.
 * {
 *   selected: {
 *     page: 'Balances',
 *     component: 'BalanceTable',
 *     index: 2,
 *     column: null,
 *     row: null,
 *     editor: 'abc'
 *   },
 *   oldSelected: {
 *     Reports: { component, index, column, row },
 *     ...
 *   }
 * }
*/
class Cursor {
  @observable page = 'App';
  @observable component = null;
  @observable index = null;
  @observable column = null;
  @observable row = null;
  @observable editor = false;
  oldSelected = {};

  /**
   * Reset selections.
   */
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
  selectPage(page) {

    if (this.page === page) {
      return;
    }

    let component = 'Nothing', index = null, column = null, row = null;

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
}

export default Cursor;
