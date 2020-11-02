export default class Activity {
  constructor (name = game.i18n.localize("C5ETRAINING.NewDowntimeActivity"), type = "check"){
    // User defined
    this.name = name;
    this.type = type;

    // varies on type
    if (this.type === 'check'){ this.completionTarget = game.settings.get("5e-training", "totalToComplete"); }
    else if (this.type === 'dc'){ this.completionTarget = game.settings.get("5e-training", "totalToComplete"); }
    else if (this.type === 'simple'){ this.completionTarget = game.settings.get("5e-training", "attemptsToComplete"); }
    else { this.completionTarget = 100; }

    // Auto generated
    this.abilityId = null;            //for ability checks
    this.categoryId = null;
    this.changes = [];
    this.customFields = [];
    this.dc = null;                   //for dc checks
    this.description = "";
    this.id = randomID();
    this.img = "icons/svg/d20.svg";
    this.progress = 0;
    this.skillId = null;              //for skill checks
    this.toolId = null;               //for tools
  }

  // Increases the activity's progress and logs the change
  adjustProgress(newVal, skipLogging=false){
    let oldVal = this.progress;
    this.progress = newVal;
    if(!skipLogging) addLogEntry("progress", oldVal, newVal);
  }

  // Returns the activity's progress as a percent
  getProgressAsPercent(){
    let decimal = Math.min(100,(100 * this.progress / this.completionTarget)).toFixed(0);
    return decimal + "%";
  }

}

// WIP - Still trying to figure out how I wanna do this.
// Meant to be tacked onto Activities by being placed into the customFields array...

export class CustomActivityField {
  constructor(name = "Custom Field", value = null){
    this.name = name;
    this.value = value;
  }
}


//////////////////////////////////////////////////


export class ActivityCategory {
  constructor(name = "New Category"){
    // User defined
    this.name = name;
    // Auto generated
    this.id = randomID();
  }
}
