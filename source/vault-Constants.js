const { Alias, World } = require("./class/note-subClasses");

const VOID_FOUNDER_ALIAS = "herald";
const VOID_ANCESTOR_ALIAS = "bubble";
const VOID_FATHER_ALIAS = "arm";

const VOID_PATH = "master/<9> void/";
const VOID_IDENT = new Alias(
  VOID_FOUNDER_ALIAS,
  VOID_ANCESTOR_ALIAS,
  VOID_FATHER_ALIAS
);

/*
const PURGATORY_FOUNDER_ALIAS = "herald";
const PURGATORY_ANCESTOR_ALIAS = "bubble";
const PURGATORY_FATHER_ALIAS = "arm";

const PURGATORY_PATH = "master/<9> void/";
const PURGATORY_IDENT = new Alias(PURGATORY_FOUNDER_ALIAS, PURGATORY_ANCESTOR_ALIAS, PURGATORY_FATHER_ALIAS);
*/

const LIMB_FOUNDER_ALIAS = "herald";
const LIMB_ANCESTOR_ALIAS = "bubble";
const LIMB_FATHER_ALIAS = "arm";

const LIMB_PATH = "master/<9> void/";
const LIMB_IDENT = new Alias(
  LIMB_FOUNDER_ALIAS,
  LIMB_ANCESTOR_ALIAS,
  LIMB_FATHER_ALIAS
);

const CELESTIA_FOUNER_ALIAS = "archont";
const CELESTIA_ANCESTOR_ALIAS = "band";
const CELESTIA_FATHER_ALIAS = "mate";

const CELESTIA_PATH = "master/<-9> celestia/";
const CELESTIA_IDENT = new Alias(
  CELESTIA_FOUNER_ALIAS,
  CELESTIA_ANCESTOR_ALIAS,
  CELESTIA_FATHER_ALIAS
);

module.exports = {
  VOID_PATH,
  VOID_IDENT,
  //PURGATORY_PATH,
  //PURGATORY_IDENT,
  LIMB_PATH,
  LIMB_IDENT,
  CELESTIA_PATH,
  CELESTIA_IDENT,
};
