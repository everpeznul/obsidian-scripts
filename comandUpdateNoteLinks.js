const { World } = require('./source/subClasses');
const { update } = require('./source/updateLinks');
const { VOID_PATH, CELESTIA_PATH, VOID_IDENT, CELESTIA_IDENT } = require('./source/vaultConstants');


async function updateNoteLinks(plugin) {

    let ALL_FILES = await plugin.app.vault.getMarkdownFiles();
    let VOID_FILES = ALL_FILES.filter(file => file.path.startsWith(VOID_PATH));
    let CELESTIA_FILES = ALL_FILES.filter(file => file.path.startsWith(CELESTIA_PATH));

    let VOID = new World(VOID_FILES, VOID_PATH, VOID_IDENT);
    let CELESTIA = new World(CELESTIA_FILES, CELESTIA_PATH, CELESTIA_IDENT);

    VOID.files.sort((a, b) => a.basename > b.basename ? 1 : -1);
    CELESTIA.files.sort((a, b) => a.basename > b.basename ? 1 : -1);

    let file = plugin.app.workspace.getActiveFile();

    let GRAPH = await plugin.helpers.suggest(['VOID', 'CELESTIA'], [VOID, CELESTIA]);

    await update(plugin, file, GRAPH, CELESTIA);
}


module.exports = {

    updateNoteLinks
};