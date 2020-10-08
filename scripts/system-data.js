export function formatAbilitiesForDropdown(){
  return [
     { value: "str", label: game.i18n.localize("C5ETRAINING.Ability")+": "+game.i18n.localize("C5ETRAINING.AbilityStr") },
     { value: "dex", label: game.i18n.localize("C5ETRAINING.Ability")+": "+game.i18n.localize("C5ETRAINING.AbilityDex") },
     { value: "con", label: game.i18n.localize("C5ETRAINING.Ability")+": "+game.i18n.localize("C5ETRAINING.AbilityCon") },
     { value: "int", label: game.i18n.localize("C5ETRAINING.Ability")+": "+game.i18n.localize("C5ETRAINING.AbilityInt") },
     { value: "wis", label: game.i18n.localize("C5ETRAINING.Ability")+": "+game.i18n.localize("C5ETRAINING.AbilityWis") },
     { value: "cha", label: game.i18n.localize("C5ETRAINING.Ability")+": "+game.i18n.localize("C5ETRAINING.AbilityCha") }
   ];
}

export function formatSkillsForDropdown(){
  return [
    { value: "acr", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillAcr") },
    { value: "ani", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillAni") },
    { value: "arc", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillArc") },
    { value: "ath", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillAth") },
    { value: "dec", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillDec") },
    { value: "his", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillHis") },
    { value: "ins", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillIns") },
    { value: "inv", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillInv") },
    { value: "itm", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillItm") },
    { value: "med", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillMed") },
    { value: "nat", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillNat") },
    { value: "per", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillPer") },
    { value: "prc", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillPrc") },
    { value: "prf", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillPrf") },
    { value: "rel", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillRel") },
    { value: "slt", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillSlt") },
    { value: "ste", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillSte") },
    { value: "sur", label: game.i18n.localize("C5ETRAINING.Skill")+": "+game.i18n.localize("C5ETRAINING.SkillSur") }
  ];
}

export function formatChoicesForSettings(){
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
