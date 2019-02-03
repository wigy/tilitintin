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
}

export default NavigationTargetModel;
