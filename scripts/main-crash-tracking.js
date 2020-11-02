// Imports
import AuditLog from "./AuditLog.js";
import CrashTrackingAndTraining from "./CrashTrackingAndTraining.js";

// Register Handlebars Helpers
Handlebars.registerHelper("trainingCompletion", function(item) {
  let percentComplete = Math.min(100,(100 * item.progress / item.completionTarget)).toFixed(0);
  return percentComplete;
});

Handlebars.registerHelper("progressionStyle", function(actor, item) {
  let typeString = "";
  if(item.type === "simple"){
    typeString = game.i18n.localize("C5ETRAINING.Simple");
  } else if(item.type === "check"){
    typeString = CrashTrackingAndTraining.getItemRollName(actor._id, item.id);
  } else if(item.type === "dc"){
    typeString = CrashTrackingAndTraining.getItemRollName(actor._id, item.id)+" (" + game.i18n.localize("C5ETRAINING.DC") + item.dc + ")";
  }
    return typeString;
});

// Register Game Settings and get templates
Hooks.once("init", () => {
  CrashTrackingAndTraining.preloadTemplates();
  CrashTrackingAndTraining.registerGameSettings();
});

// Add the tab to the sheet
Hooks.on(`renderActorSheet`, (app, html, data) => {
  addTrainingTab(app, html, data).then(function(){
    if (app.activateCrashTrainingTab) {
      app._tabs[0].activate("training");
    }
  });
});

// Module Hooks
Hooks.on(`CrashTrainingTabReady`, (app, html, data) => {
  console.log("Crash's 5e Downtime Tracking | Downtime tab ready!");
});

// Adds the training tab to the sheet and starts up the event listeners
async function addTrainingTab(app, html, data) {

  // Determine if we should show the downtime tab
  let showTrainingTab = false;
  if(data.isCharacter){ showTrainingTab = game.settings.get("5e-training", "enableTraining"); }
  else if(data.isNPC){ showTrainingTab = game.settings.get("5e-training", "enableTrainingNpc"); }

  if (showTrainingTab){

    // Get our actor and our flags
    let actor = game.actors.entities.find(a => a.data._id === data.actor._id);
    let trainingItems = await actor.getFlag("5e-training", "testingItems");
    if (!trainingItems) { trainingItems = []; }

    // Update the nav menu
    let tabName = game.settings.get("5e-training", "tabName");
    let trainingTabBtn = $('<a class="item" data-tab="training">' + tabName + '</a>');
    let tabs = html.find('.tabs[data-group="primary"]');
    tabs.append(trainingTabBtn);

    // Create the tab content
    let sheet = html.find('.sheet-body');
    let trainingTabHtml = $(await renderTemplate('modules/5e-training/templates/training-tab.html', data));
    sheet.append(trainingTabHtml);

    // Set up our big list of dropdown options
    let actorTools = getActorTools(actor);
    const ABILITIES = CrashTrackingAndTraining.formatAbilitiesForDropdown();
    const SKILLS = CrashTrackingAndTraining.formatSkillsForDropdown();
    const DROPDOWN_OPTIONS = ABILITIES.concat(SKILLS.concat(actorTools));

    // ADD NEW DOWNTIME ACTIVITY
    html.find('.crash-training-add').click(async (event) => {
      event.preventDefault();
      console.log("Crash's 5e Downtime Tracking | Create Downtime Activity excuted!");
      await CrashTrackingAndTraining.addItem(actor.id);
    });

    // EDIT DOWNTIME ACTIVITY
    html.find('.crash-training-edit').click(async (event) => {
      event.preventDefault();
      let itemId = event.currentTarget.id.replace('crash-edit-','');
      await CrashTrackingAndTraining.editFromSheet(actor.id, itemId, DROPDOWN_OPTIONS);
    });

    // DELETE DOWNTIME ACTIVITY
    html.find('.crash-training-delete').click(async (event) => {
      event.preventDefault();
      let itemId = event.currentTarget.id.replace('crash-delete-','');
      await CrashTrackingAndTraining.deleteFromSheet(actor.id, itemId);
    });

    // EDIT PROGRESS VALUE
    html.find('.crash-training-override').change(async (event) => {
      event.preventDefault();
      let field = event.currentTarget;
      let itemId = event.currentTarget.id.replace('crash-override-','');
      if(isNaN(field.value)){
        ui.notifications.warn("Crash's 5e Downtime Tracking: " + game.i18n.localize("C5ETRAINING.InvalidNumberWarning"));
      } else {
        CrashTrackingAndTraining.updateItemProgressFromSheet(actor.id, itemId, field.value);
      }
    });

    // ROLL TO TRAIN
    html.find('.crash-training-roll').click(async (event) => {
      event.preventDefault();
      let itemId = event.currentTarget.id.replace('crash-roll-','');
      await CrashTrackingAndTraining.progressItem(actor.id, itemId);
    });

    // TOGGLE DESCRIPTION
    // Modified version of _onItemSummary from dnd5e system located in
    // dnd5e/module/actor/sheets/base.js
    html.find('.crash-training-toggle-desc').click(async (event) => {
      event.preventDefault();
      let fieldId = event.currentTarget.id;
      let itemId = event.currentTarget.id.replace('crash-toggle-desc-','');
      let thisItem = trainingItems.filter(obj => obj.id === itemId)[0];
      let desc = thisItem.description || "";
      let li = $(event.currentTarget).parents(".item");

      if ( li.hasClass("expanded") ) {
        let summary = li.children(".item-summary");
        summary.slideUp(200, () => summary.remove());
      } else {
        let div = $(`<div class="item-summary">${desc}</div>`);
        li.append(div.hide());
        div.slideDown(200);
      }
      li.toggleClass("expanded");

    });

    // OPEN AUDIT LOG
    html.find('.crash-training-audit').click(async (event) => {
      event.preventDefault();
      new AuditLog(actor).render(true);
    });

    // Set Training Tab as Active
    html.find('.tabs .item[data-tab="training"]').click(ev => {
      app.activateCrashTrainingTab = true;
    });

    // Unset Training Tab as Active
    html.find('.tabs .item:not(.tabs .item[data-tab="training"])').click(ev => {
      app.activateCrashTrainingTab = false;
    });

  }

  //Tab is ready
  Hooks.call(`CrashTrainingTabReady`, app, html, data);
}

// Gets and formats an array of tools the actor has in their inventory. Used for selection menus
function getActorTools(actor){
  let items = actor.data.items;
  let tools = items.filter(item => item.type === "tool");
  let formatted = tools.map(obj => {
    let newObj = {};
    newObj.value = obj._id;
    newObj.type = "tool"
    newObj.label = game.i18n.localize("C5ETRAINING.Tool") + ": " + obj.name;
    return newObj;
  });
  return formatted;
}


// Open crap up for other people to use
export function crashTNT(){
  function createActivity(actorId){
    CrashTrackingAndTraining.addItem(actorId);
  }
  function deleteActivity(actorId, itemId){
    CrashTrackingAndTraining.deleteItem(actorId, itemId);
  }
  function updateActivity(actorId, itemId, changes){
    CrashTrackingAndTraining.updateItem(actorId, itemId, changes);
  }

  return {
    createActivity: createActivity,
    deleteActivity: deleteActivity,
    updateActivity: updateActivity
  };
}


Hooks.on(`ready`, () => {
	window.CrashTNT = crashTNT();
});
