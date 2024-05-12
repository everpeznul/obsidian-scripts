const { World } = require('./source/subClasses');
const { update } = require('./source/updateLinks');
const { VOID_IDENT, CELESTIA_IDENT } = require('./source/vaultConstants');

let CELESTIA;
let VOID;

async function updateAllLinks(plugin) {

    let ALL_FILES = await plugin.app.vault.getMarkdownFiles();
    let VOID_FILES = ALL_FILES.filter(file => file.path.startsWith(VOID_IDENT.path));
    let CELESTIA_FILES = ALL_FILES.filter(file => file.path.startsWith(CELESTIA_IDENT.path));

    VOID = new World(VOID_FILES, VOID_IDENT);
    CELESTIA = new World(CELESTIA_FILES, CELESTIA_IDENT);

    VOID.files.sort((a, b) => a.basename > b.basename ? 1 : -1);
    CELESTIA.files.sort((a, b) => a.basename > b.basename ? 1 : -1);

    for (const FILE of CELESTIA.files) {

        await update(FILE, CELESTIA, CELESTIA, plugin);
    }

    for (const FILE of VOID.files) {

        await update(FILE, VOID, CELESTIA, plugin)
    }
}

module.exports = {

    updateAllLinks
};