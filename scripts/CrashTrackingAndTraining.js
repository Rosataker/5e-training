import Activity from "./Activity.js";
import LogItem from "./LogItem.js";

export default class CrashTrackingAndTraining {

  // These methods handle the listeners that come from the sheet. They don't manpulate
  // anything by themselves, but they call the methods that do.

  static async addItem(actorId){
    let actor = game.actors.get(actorId);
    let allItems = actor.getFlag("5e-training", "testingItems");
    if(!allItems){ allItems = []; }
    let newItem = new Activity;
    let dialogContent = await renderTemplate('modules/5e-training/templates/create-activity-dialog.html', {training: newItem});
    let add = false;
    // Create dialog
    new Dialog({
      title: game.i18n.localize("C5ETRAINING.CreateNewDowntimeActivity"),
      content: dialogContent,
      buttons: {
        yes: {icon: "<i class='fas fa-check'></i>", label: game.i18n.localize("C5ETRAINING.Create"), callback: () => add = true},
        no: {icon: "<i class='fas fa-times'></i>", label: game.i18n.localize("C5ETRAINING.Cancel"), callback: () => add = false},
      },
      default: "yes",
      close: async (html) => {
        if (add) {
          // Set up basic info
          newItem.name = html.find('#nameInput').val();
          newItem.type = html.find('#progressionStyleInput').val();
          newItem.description = html.find('#descriptionInput').val();
          // Progression Type: Ability Check
          if (newItem.type === 'check'){
            newItem.abilityId = game.settings.get("5e-training", "defaultAbility");
            newItem.completionTarget = game.settings.get("5e-training", "totalToComplete");
          }
          // Progression Type: Simple
          else if (newItem.type === 'simple'){
            newItem.completionTarget = game.settings.get("5e-training", "attemptsToComplete");
          }
          // Progression Type: DC
          else if (newItem.type === 'dc'){
            newItem.completionTarget = game.settings.get("5e-training", "defaultDcSuccesses");
            newItem.abilityId = game.settings.get("5e-training", "defaultAbility");
            newItem.dc = game.settings.get("5e-training", "defaultDcDifficulty");
          }
          // Update flags and actor
          allItems.push(newItem);
          await actor.unsetFlag("5e-training", "testingItems");
          await actor.setFlag("5e-training", "testingItems", allItems);
        }
      }
    }).render(true);
  }

  static async editFromSheet(actorId, itemId, DROPDOWN_OPTIONS){
    let actor = game.actors.get(actorId);
    let allItems = actor.getFlag("5e-training", "testingItems");
    let thisItem = allItems.filter(obj => obj.id === itemId)[0];
    let dialogContent = await renderTemplate('modules/5e-training/templates/edit-activity-dialog.html', {training: thisItem, options: DROPDOWN_OPTIONS});
    let updates = {};
    let edit = false;
    // Create dialog
    new Dialog({
      title: game.i18n.localize("C5ETRAINING.EditDowntimeActivity"),
      content: dialogContent,
      buttons: {
        yes: {icon: "<i class='fas fa-check'></i>", label: game.i18n.localize("C5ETRAINING.Edit"), callback: () => edit = true},
        no: {icon: "<i class='fas fa-times'></i>",  label: game.i18n.localize("C5ETRAINING.Cancel"), callback: () => edit = false},
      },
      default: "yes",
      close: async (html) => {
        if (edit) {
          // Set up base values
          updates.name = html.find('#nameInput').val();
          updates.description = html.find('#descriptionInput').val();
          updates.completionTarget = parseInt(html.find('#completionAtInput').val());
          // Reset the ability / tool / skill things
          updates.abilityId = null;
          updates.toolId = null;
          updates.skillId = null;
          // Progression Style: Ability Check
          if (thisItem.type === 'check'){
            let abilitySelection = JSON.parse(html.find('#abilityInput').val());
            if(abilitySelection.type === "ability"){ updates.abilityId = abilitySelection.value; }
            else if(abilitySelection.type === "skill"){ updates.skillId = abilitySelection.value; }
            else if(abilitySelection.type === "tool"){ updates.toolId = abilitySelection.value; }
          }
          // Progression Style: Simple
          else if (thisItem.type === 'simple'){
            // no specific updates for this type
          }
          // Progression Style: DC
          else if (thisItem.type === 'dc'){
            let abilitySelection = JSON.parse(html.find('#abilityInput').val());
            if(abilitySelection.type === "ability"){ updates.abilityId = abilitySelection.value; }
            else if(abilitySelection.type === "skill"){ updates.skillId = abilitySelection.value; }
            else if(abilitySelection.type === "tool"){ updates.toolId = abilitySelection.value; }
            updates.dc = html.find('#dcInput').val();
          }
          await CrashTrackingAndTraining.updateItem(actor.id, itemId, updates);
        }
      }
    }).render(true);
  }

  static async deleteFromSheet(actorId, itemId){
    let dialogContent = await renderTemplate('modules/5e-training/templates/delete-activity-dialog.html');
    let del = false;
    // Create dialog
    new Dialog({
      title: `Delete Downtime Activity`,
      content: dialogContent,
      buttons: {
        yes: {icon: "<i class='fas fa-check'></i>", label: game.i18n.localize("C5ETRAINING.Delete"), callback: () => del = true},
        no: {icon: "<i class='fas fa-times'></i>", label: game.i18n.localize("C5ETRAINING.Cancel"), callback: () => del = false},
      },
      default: "yes",
      close: async (html) => {
        if (del) {
          CrashTrackingAndTraining.deleteItem(actorId, itemId);
        }
      }
    }).render(true);
  }

  static async updateItemProgressFromSheet(actorId, itemId, inputValue){
    let actor = game.actors.get(actorId);
    let allItems = actor.getFlag("5e-training", "testingItems");
    let thisItem = allItems.filter(obj => obj.id === itemId)[0];
    let changeName = "";
    let adjustment = 0;
    let updates = {};

    if(inputValue.charAt(0) === "+"){
      changeName = game.i18n.localize("C5ETRAINING.AdjustProgressValue") + " (+)";
      adjustment = parseInt(inputValue.substr(1).trim());
      updates.progress = CrashTrackingAndTraining.calculateNewProgressValue(actorId, itemId, adjustment, false, true);
    } else if (inputValue.charAt(0) === "-"){
      changeName = game.i18n.localize("C5ETRAINING.AdjustProgressValue") + " (-)";
      adjustment = 0 - parseInt(inputValue.substr(1).trim());
      updates.progress = CrashTrackingAndTraining.calculateNewProgressValue(actorId, itemId, adjustment, false, true);
    } else {
      changeName = game.i18n.localize("C5ETRAINING.AdjustProgressValue") + " (=)";
      adjustment = parseInt(inputValue);
      updates.progress = CrashTrackingAndTraining.calculateNewProgressValue(actorId, itemId, adjustment, true, true);
    }

    CrashTrackingAndTraining.updateItem(actorId, itemId, updates);
    await CrashTrackingAndTraining.checkItemCompletion(actorId, itemId);
  }

  // These methods manipulate Activities directly in some way. Usually called
  // from the sheet listener methodsm but could be called from elsewhere;

  static async progressItem(actorId, itemId){
    let actor = game.actors.get(actorId);
    let allItems = actor.getFlag("5e-training", "testingItems");
    let thisItem = allItems.filter(obj => obj.id === itemId)[0];
    let updates = {progress: thisItem.progress, changes: thisItem.changes};

    // Progression Type: Ability Check or DC - ABILITY
    if (!!thisItem.abilityId){
      let abilityName = game.i18n.localize("C5ETRAINING.Ability" + thisItem.abilityId.charAt(0).toUpperCase() + thisItem.abilityId.slice(1));
      // Roll to increase progress
      actor.rollAbilityTest(thisItem.abilityId).then(async function(r){
        let rollMode = CrashTrackingAndTraining.getRollMode(r._formula);
        let attemptName = game.i18n.localize("C5ETRAINING.Roll") + " " + abilityName + " (" + rollMode + ")";
        updates.progress = CrashTrackingAndTraining.calculateNewProgressValue(actorId, itemId, r._total, false, false);
        let logItem = new LogItem(attemptName, "progress", thisItem.progress, updates.progress);
        updates.changes.push(logItem);
        CrashTrackingAndTraining.updateItem(actorId, itemId, updates);
        await CrashTrackingAndTraining.checkItemCompletion(actorId, itemId);
      });
    }

    // Progression Type: Ability Check or DC - SKILL
    else if (!!thisItem.skillId){
      let skillName = game.i18n.localize("C5ETRAINING.Skill" + thisItem.skillId.charAt(0).toUpperCase() + thisItem.skillId.slice(1));
      // Roll to increase progress
      actor.rollSkill(thisItem.skillId).then(async function(r){
        let rollMode = CrashTrackingAndTraining.getRollMode(r._formula);
        let attemptName = game.i18n.localize("C5ETRAINING.Roll") + " " + skillName + " (" + rollMode + ")";
        updates.progress = CrashTrackingAndTraining.calculateNewProgressValue(actorId, itemId, r._total, false, false);
        let logItem = new LogItem(attemptName, "progress", thisItem.progress, updates.progress);
        updates.changes.push(logItem);
        CrashTrackingAndTraining.updateItem(actorId, itemId, updates);
        await CrashTrackingAndTraining.checkItemCompletion(actorId, itemId);
      });
    }

    // Progression Type: Ability Check or DC - TOOL
    else if (!!thisItem.toolId){
      let tool = actor.getOwnedItem(thisItem.toolId);
      if(tool){
        let toolName = tool.name;
        // Roll to increase progress
        tool.rollToolCheck().then(async function(r){
          let rollMode = CrashTrackingAndTraining.getRollMode(r._formula);
          let attemptName = game.i18n.localize("C5ETRAINING.Roll") + " " + toolName + " (" + rollMode + ")";
          updates.progress = CrashTrackingAndTraining.calculateNewProgressValue(actorId, itemId, r._total, false, false);
          let logItem = new LogItem(attemptName, "progress", thisItem.progress, updates.progress);
          updates.changes.push(logItem);
          CrashTrackingAndTraining.updateItem(actorId, itemId, updates);
          await CrashTrackingAndTraining.checkItemCompletion(actorId, itemId);
        });
      } else {
        ui.notifications.warn("Crash's 5e Downtime Tracking: " + game.i18n.localize("C5ETRAINING.ToolNotFoundWarning"));
      }
    }

    // Progression Type: Simple
    else if (thisItem.type === 'simple'){
      let activityName = game.i18n.localize("C5ETRAINING.Attempt") + " (" + game.i18n.localize("C5ETRAINING.Simple") + ")";
      updates.progress = CrashTrackingAndTraining.calculateNewProgressValue(actorId, itemId, 1, false, false);
      let logItem = new LogItem(attemptName, "progress", thisItem.progress, updates.progress);
      updates.changes.push(logItem);
      CrashTrackingAndTraining.updateItem(actorId, itemId, updates);
      await CrashTrackingAndTraining.checkItemCompletion(actorId, itemId);
    }

    // Error handling
    else {
      //TODO: stuff
    }

  }

  static async deleteItem(actorId, itemId){
    let actor = game.actors.get(actorId);
    let allItems = actor.getFlag("5e-training", "testingItems");
    let thisItem = allItems.filter(obj => obj.id === itemId)[0];
    let itemIndex = allItems.findIndex(obj => obj.id === thisItem.id);

    allItems.splice(itemIndex, 1);

    await actor.unsetFlag("5e-training", "testingItems");
    await actor.setFlag("5e-training", "testingItems", allItems);
  }

  static async updateItem(actorId, itemId, updates){
    let actor = game.actors.get(actorId);
    let allItems = actor.getFlag("5e-training", "testingItems");
    let thisItem = allItems.filter(obj => obj.id === itemId)[0];

    if(updates.hasOwnProperty('abilityId')){ thisItem.abilityId = updates.abilityId; }
    if(updates.hasOwnProperty('categoryId')){ thisItem.categoryId = updates.categoryId; }
    if(updates.hasOwnProperty('completionTarget')){ thisItem.completionTarget = updates.completionTarget; }
    if(updates.hasOwnProperty('customFields')){ thisItem.customFields = updates.customFields; }
    if(updates.hasOwnProperty('dc')){ thisItem.dc = updates.dc; }
    if(updates.hasOwnProperty('description')){ thisItem.description = updates.description; }
    if(updates.hasOwnProperty('img')){ thisItem.img = updates.img; }
    if(updates.hasOwnProperty('name')){ thisItem.name = updates.name; }
    if(updates.hasOwnProperty('progress')){ thisItem.progress = updates.progress; }
    if(updates.hasOwnProperty('skillId')){ thisItem.skillId = updates.skillId; }
    if(updates.hasOwnProperty('toolId')){ thisItem.toolId = updates.toolId; }

    await actor.unsetFlag("5e-training", "testingItems");
    await actor.setFlag("5e-training", "testingItems", allItems);
  }

  // These are helper methods. They don't do any manipulation themselves.

  static async checkItemCompletion(actorId, itemId){
    let actor = game.actors.get(actorId);
    let allItems = actor.getFlag("5e-training", "testingItems");
    let thisItem = allItems.filter(obj => obj.id === itemId)[0];

    if(thisItem.progress >= thisItem.completionTarget){
      let alertFor = game.settings.get("5e-training", "announceCompletionFor");
      let isPc = actor.isPC;
      let sendIt;

      switch(alertFor){
        case "none":
          sendIt = false;
          break;
        case "both":
          sendIt = true;
          break;
        case "npc":
          sendIt = !isPc;
          break
        case "pc":
          sendIt = isPc;
          break;
        default:
          sendIt = false;
      }

      if (sendIt){
        console.log("Crash's 5e Downtime Tracking | " + actor.name + " " + game.i18n.localize("C5ETRAINING.CompletedADowntimeActivity"));
        let chatHtml = await renderTemplate('modules/5e-training/templates/completion-message.html', {actor:actor, activity:thisItem});
        ChatMessage.create({content: chatHtml});
      }
    }
  }

  static calculateNewProgressValue(actorId, itemId, change, absolute = false, ignoreDc = false){
    let actor = game.actors.get(actorId);
    let allItems = actor.getFlag("5e-training", "testingItems");
    let thisItem = allItems.filter(obj => obj.id === itemId)[0];
    let newProgress = thisItem.progress;

    if(absolute){
      newProgress = change; // If absolute is true, we straight up override the progress
    } else {
      if(!!thisItem.dc){ // If there's a DC set
        if(change >= thisItem.dc){ newProgress = thisItem.progress + 1; } // We beat the DC, increase progress by 1.
        if(ignoreDc){ newProgress = thisItem.progress + change; }
      } else {
        newProgress = thisItem.progress + change; // There is no DC set, so we can just adjust
      }
    }

    if(newProgress > thisItem.completionTarget){
      newProgress = thisItem.completionTarget;
    } else if (newProgress < 0){
      newProgress = 0;
    }
    return newProgress;
  }

  static getRollMode(formula){
    let d20Roll = formula.split(" ")[0];
    if(d20Roll === "2d20kh"){ return  game.i18n.localize("C5ETRAINING.Advantage"); }
    else if(d20Roll === "2d20kl"){ return game.i18n.localize("C5ETRAINING.Disadvantage"); }
    else { return game.i18n.localize("C5ETRAINING.Normal"); }
  }

  static getItemRollName(actorId, itemId){
    let actor = game.actors.get(actorId);
    let allItems = actor.getFlag("5e-training", "testingItems");
    let thisItem = allItems.filter(obj => obj.id === itemId)[0];
    if(thisItem.abilityId){
      return game.i18n.localize("C5ETRAINING.Ability" + thisItem.abilityId.charAt(0).toUpperCase() + thisItem.abilityId.slice(1));
    } else if(thisItem.skillId){
      return game.i18n.localize("C5ETRAINING.Skill" + thisItem.skillId.charAt(0).toUpperCase() + thisItem.skillId.slice(1));
    } else if(thisItem.toolId){
      let tool = actor.items.filter(obj => obj.id === thisItem.toolId)[0];
      if(tool){ return tool.name; }
      else { return "["+game.i18n.localize("C5ETRAINING.InvalidTool")+"]"; }
    } else {
      return "???"
    }
  }

  static sortAZ(unsortedItems){
    let sortedItems = unsortedItems.sort((a, b) => (a.name > b.name) ? 1 : -1);
    return sortedItems;
  }

  // Migration methods - WIP

  static async convertLegacyActivitesForActor(actorId) {
    let actor = game.actors.get(actorId);
    let newItems = [];
    let oldItems = await actor.getFlag("5e-training", "trainingItems");

    for(var i = 0; i < oldActivities.length; i++){
      // Set up the initial activity
      let oldActivity = oldActivities[i];
      let name = oldActivity.name;
      let type = oldActivity.type;
      let completionTarget = oldActivity.completionAt;
      let description = oldActivity.description;
      let newActivity = new Activity();

      // Add to newActivityArray
      newActivities.push(newActivity);
    }

    return newActivities;
  }

  // Startup Methods

  static async preloadTemplates(){
    const templatePaths = [
      "modules/5e-training/templates/partials/ability.html",
      "modules/5e-training/templates/partials/simple.html",
      "modules/5e-training/templates/partials/dc.html"
    ];
    return loadTemplates(templatePaths);
  }

  static registerGameSettings(){
    game.settings.register("5e-training", "enableTraining", {
      name: game.i18n.localize("C5ETRAINING.ShowDowntimeTabPc"),
      hint: game.i18n.localize("C5ETRAINING.ShowDowntimeTabPcHint"),
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });

    game.settings.register("5e-training", "enableTrainingNpc", {
      name: game.i18n.localize("C5ETRAINING.ShowDowntimeTabNpc"),
      hint: game.i18n.localize("C5ETRAINING.ShowDowntimeTabNpcHint"),
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });

    game.settings.register("5e-training", "tabName", {
      name: game.i18n.localize("C5ETRAINING.DowntimeTabName"),
      hint: game.i18n.localize("C5ETRAINING.DowntimeTabNameHint"),
      scope: "world",
      config: true,
      default: "Downtime",
      type: String
    });

    game.settings.register("5e-training", "defaultAbility", {
      name: game.i18n.localize("C5ETRAINING.DefaultAbility"),
      hint: game.i18n.localize("C5ETRAINING.DefaultAbilityHint"),
      scope: "world",
      config: true,
      type: String,
      choices: CrashTrackingAndTraining.formatChoicesForSettings(),
      default: "int",
    });

    game.settings.register("5e-training", "totalToComplete", {
      name: game.i18n.localize("C5ETRAINING.DefaultAbilityCompletion"),
      hint: game.i18n.localize("C5ETRAINING.DefaultAbilityCompletionHint"),
      scope: "world",
      config: true,
      default: 300,
      type: Number
    });

    game.settings.register("5e-training", "attemptsToComplete", {
      name: game.i18n.localize("C5ETRAINING.DefaultSimpleCompletion"),
      hint: game.i18n.localize("C5ETRAINING.DefaultSimpleCompletionHint"),
      scope: "world",
      config: true,
      default: 10,
      type: Number
    });

    game.settings.register("5e-training", "defaultDcDifficulty", {
      name: game.i18n.localize("C5ETRAINING.DefaultDcDifficulty"),
      hint: game.i18n.localize("C5ETRAINING.DefaultDcDifficultyHint"),
      scope: "world",
      config: true,
      default: 10,
      type: Number
    });

    game.settings.register("5e-training", "defaultDcSuccesses", {
      name: game.i18n.localize("C5ETRAINING.DefaultDcSuccesses"),
      hint: game.i18n.localize("C5ETRAINING.DefaultDcSuccessesHint"),
      scope: "world",
      config: true,
      default: 5,
      type: Number
    });

    game.settings.register("5e-training", "announceCompletionFor", {
      name: game.i18n.localize("C5ETRAINING.AnnounceActivityCompletionFor"),
      hint: game.i18n.localize("C5ETRAINING.AnnounceActivityCompletionForHint"),
      scope: "world",
      config: true,
      type: String,
      choices: {
        "pc": game.i18n.localize("C5ETRAINING.PcsOnly"),
        "npc": game.i18n.localize("C5ETRAINING.NpcsOnly"),
        "both": game.i18n.localize("C5ETRAINING.PcsAndNpcs"),
        "none": game.i18n.localize("C5ETRAINING.None"),
      },
      default: "pc"
    });
  }

  static formatAbilitiesForDropdown(){
    return [
       { value: "str", type:"ability", label: game.i18n.localize("C5ETRAINING.Ability")+": "+game.i18n.localize("C5ETRAINING.AbilityStr") },
       { value: "dex", type:"ability", label: game.i18n.localize("C5ETRAINING.Ability")+": "+game.i18n.localize("C5ETRAINING.AbilityDex") },
       { value: "con", type:"ability", label: game.i18n.localize("C5ETRAINING.Ability")+": "+game.i18n.localize("C5ETRAINING.AbilityCon") },
       { value: "int", type:"ability", label: game.i18n.localize("C5ETRAINING.Ability")+": "+game.i18n.localize("C5ETRAINING.AbilityInt") },
       { value: "wis", type:"ability", label: game.i18n.localize("C5ETRAINING.Ability")+": "+game.i18n.localize("C5ETRAINING.AbilityWis") },
       { value: "cha", type:"ability", label: game.i18n.localize("C5ETRAINING.Ability")+": "+game.i18n.localize("C5ETRAINING.AbilityCha") }
     ];
  }

  static formatSkillsForDropdown(){
    return [
      { value: "acr", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillAcr") },
      { value: "ani", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillAni") },
      { value: "arc", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillArc") },
      { value: "ath", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillAth") },
      { value: "dec", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillDec") },
      { value: "his", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillHis") },
      { value: "ins", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillIns") },
      { value: "inv", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillInv") },
      { value: "itm", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillItm") },
      { value: "med", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillMed") },
      { value: "nat", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillNat") },
      { value: "per", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillPer") },
      { value: "prc", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillPrc") },
      { value: "prf", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillPrf") },
      { value: "rel", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillRel") },
      { value: "slt", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillSlt") },
      { value: "ste", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillSte") },
      { value: "sur", type:"skill", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillSur") }
    ];
  }

  static formatChoicesForSettings(){
    return {
      "str": game.i18n.localize("C5ETRAINING.AbilityStr"),
      "dex": game.i18n.localize("C5ETRAINING.AbilityDex"),
      "con": game.i18n.localize("C5ETRAINING.AbilityCon"),
      "int": game.i18n.localize("C5ETRAINING.AbilityInt"),
      "wis": game.i18n.localize("C5ETRAINING.AbilityWis"),
      "cha": game.i18n.localize("C5ETRAINING.AbilityCha"),
      "acr": game.i18n.localize("C5ETRAINING.SkillAcr"),
      "ani": game.i18n.localize("C5ETRAINING.SkillAni"),
      "arc": game.i18n.localize("C5ETRAINING.SkillArc"),
      "ath": game.i18n.localize("C5ETRAINING.SkillAth"),
      "dec": game.i18n.localize("C5ETRAINING.SkillDec"),
      "his": game.i18n.localize("C5ETRAINING.SkillHis"),
      "ins": game.i18n.localize("C5ETRAINING.SkillIns"),
      "inv": game.i18n.localize("C5ETRAINING.SkillInv"),
      "itm": game.i18n.localize("C5ETRAINING.SkillItm"),
      "med": game.i18n.localize("C5ETRAINING.SkillMed"),
      "nat": game.i18n.localize("C5ETRAINING.SkillNat"),
      "per": game.i18n.localize("C5ETRAINING.SkillPer"),
      "prc": game.i18n.localize("C5ETRAINING.SkillPrc"),
      "prf": game.i18n.localize("C5ETRAINING.SkillPrf"),
      "rel": game.i18n.localize("C5ETRAINING.SkillRel"),
      "slt": game.i18n.localize("C5ETRAINING.SkillSlt"),
      "ste": game.i18n.localize("C5ETRAINING.SkillSte"),
      "sur": game.i18n.localize("C5ETRAINING.SkillSur")
    };
  }

}
