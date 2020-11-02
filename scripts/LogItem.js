export default class LogItem {
  constructor(actionName = "???", valueChanged = "progress", oldValue = 0, newValue = 0){

    // User defined
    this.actionName = actionName;
    this.valueChanged = valueChanged;
    this.oldValue = oldValue;
    this.newValue = newValue;

    // Auto generated
    this.id = randomID();
    this.user = game.user.name;
    this.timestamp = new Date();
    this.dismissed = false;
    this.note = "";

  }
}
