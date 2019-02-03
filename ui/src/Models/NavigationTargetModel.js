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
  open =false;

  /**
   * Add classes according to the flags.
   */
  getClasses() {
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
}

export default NavigationTargetModel;
