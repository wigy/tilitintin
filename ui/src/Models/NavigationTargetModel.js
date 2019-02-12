import { observable } from 'mobx';
import Model from './Model';

class NavigationTargetModel extends Model {

  // If set, this object is currently selected.
  @observable
  selected =false;
  // If set, this object is currently being edited.
  @observable
  editable =false;
  // If set, this object is extended to show its details (if applicable).
  @observable
  open = false;
  // If set, then this object is now in editing mode (if applicable).
  @observable
  edit = false;
  // If set, the named sub-item column is currently selected.
  @observable
  column = null;
  // If set, this model is marked for deletion.
  @observable
  askForDelete = false;

  /**
   * Add classes according to the flags and possibly for the given (column, row) sub-item.
   */
  getClasses(column = null, row = null) {
    return super.getClasses() +
      (this.selected ? ' selected' : '') +
      (this.editable ? 'editable' : '') +
      (this.open ? ' open' : '');
  }

  /**
   * Find the DOM-element corresponding this element.
   */
  getElement() {
    const id = this.getId();
    return id ? document.getElementById(id) || null : null;
  }

  /**
   * Cursor has entered this model.
   */
  enter() {
    this.selected = true;
  }

  /**
   * Cursor has left this model.
   */
  leave() {
    this.selected = false;
  }

  /**
   * Cursor has entered to the sub-item of this model.
   */
  enterSub(columnNumber) {
    this.column = this.columns()[columnNumber];
  }

  /**
   * Cursor has left the sub-item of this model.
   */
  leaveSub(columnNumber) {
    this.column = null;
  }

  /**
   * Get the names of columns if this model has sub-items.
   */
  columns() {
    return [];
  }

  /**
   * Get the sub-item instances if this model has any.
   */
  rows() {
    return [];
  }

  /**
   * Get the geometry [columns, rows] of the sub-items or null if not supported.
   */
  geometry() {
    const rows = this.rows();
    if (!rows.length) {
      console.warn(`Cannot find any rows() for ${this.getObjectType()}Model.`);
      return null;
    }
    const columns = rows[0].columns();
    if (!columns.length) {
      console.warn(`Cannot find any columns() for ${rows[0].getObjectType()}Model.`);
      return null;
    }
    return [columns.length, rows.length];
  }

  /**
   * Check if this model can be edited now.
   */
  canEdit() {
    return false;
  }

  /**
   * Change the opened state.
   */
  toggleOpen() {
    if (!this.geometry()) {
      throw new Error(`No geometry defined for ${this.getObjectType()}Model (needs functions column() and rows()).`);
    }
    this.open = !this.open;
  }

  /**
   * Mark this model for deletion request.
   */
  markForDeletion() {
    this.askForDelete = true;
  }

  /**
   * Remove deletion request.
   */
  cancelDeletion() {
    this.askForDelete = false;
  }

  /**
   * Start editing if capable.
   */
  turnEditorOn(cursor) {
    if (this.canEdit()) {
      this.edit = true;
      cursor.editTarget = this;
    }
  }

  /**
   * Stop editing.
   */
  turnEditorOff(cursor) {
    this.edit = false;
    cursor.editTarget = null;
  }
}

export default NavigationTargetModel;
