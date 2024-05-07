const { Ident } = require('/Users/everpeznul/sync/myObsidian/obsidian-scripts/vaultClasses');

const VOID_PATH = "master/<9> void/";
const VOID_FOUNDER_ALIAS = "herald";
const VOID_ANCESTOR_ALIAS = "bubble";
const VOID_FATHER_ALIAS = "arm";

const VOID_IDENT = new Ident(VOID_PATH, VOID_FOUNDER_ALIAS, VOID_ANCESTOR_ALIAS, VOID_FATHER_ALIAS);

const CELESTIA_PATH = "master/<-9> celestia/";
const CELESTIA_FOUNER_ALIAS = "archont";
const CELESTIA_ANCESTOR_ALIAS = "band";
const CELESTIA_FATHER_ALIAS = "mate";

const CELESTIA_IDENT = new Ident(CELESTIA_PATH, CELESTIA_FOUNER_ALIAS, CELESTIA_ANCESTOR_ALIAS, CELESTIA_FATHER_ALIAS);

module.exports = {

    VOID_IDENT,
    CELESTIA_IDENT
};