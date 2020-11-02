Hey congrats, you've found my alpha build. This shit's probably super broken.

# API Info 

### CrashTNT.createActivity(actorId)
Ex: `CrashTNT.createActivity("7zsnIFs1ezVnzX5L")`

Params
- `actorId` is a string that matches the id of the actor you'd like to create an Activity on. It's case sensitive.

Returns
- Nothing. This method will open the activity creation dialog. Upon dialog submission, the Activity will be added to the chosen actor.

---

### CrashTNT.deleteActivity(actorId, itemId)
Ex: `CrashTNT.deleteActivity("7zsnIFs1ezVnzX5L","c5watavuro")`

Params
- `actorId` is a string that matches the id of the actor that owns the Activity you'd like to delete. It's case sensitive.
- `itemId` is a string that matches the id of the Activity you'd like to delete. It's case sensitive.

Returns
- Nothing. This method will delete the selected Activity from the selected actor.

---

### CrashTNT.updateActivity(actorId, itemId, changes)
Ex: `CrashTNT.updateActivity("7zsnIFs1ezVnzX5L", "c5watavuro", {name: 'Cool New Name', progress: 17, img:'icons/svg/biohazard.svg'})`

Params
- `actorId` is a string that matches the id of the actor that owns the Activity you'd like to change. It's case sensitive.
- `itemId` is a string that matches the id of the Activity you'd like to change. It's case sensitive.
- `changes` is an object. Its keys can be any key that an Activity object normally has except for id

Returns
- Nothing. This method will update the selected Activity, replacing the values of each of the Activity's properties with the values for each key specified in the `changes` object.

---

### CrashTNT.getActivitiesForActor(actorId)
Ex: `CrashTNT.getActivitiesForActor("7zsnIFs1ezVnzX5L")`

Params
- `actorId` is a string that matches the id of the actor you'd like to get activities for. It's case sensitive.

Returns
- An array of Activity objects

---

### CrashTNT.getActivitiesForActorByName(actorName)
Ex: `CrashTNT.getActivitiesForActorByName("Val Fletcher")`

Params
- `actorName` is a string that matches the name of the actor you'd like to get activities for. It's case sensitive.

Returns
- An array of Activity objects
