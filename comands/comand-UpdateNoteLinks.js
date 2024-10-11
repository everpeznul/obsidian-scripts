const { World } = require('./source/note-subClasses');
const { update } = require('./source/vault-updateLinks');
const { VOID_PATH, CELESTIA_PATH, VOID_IDENT, CELESTIA_IDENT } = require('./source/vault-Constants');


async function updateNoteLinks(plugin) {

    let ALL_FILES = await plugin.app.vault.getMarkdownFiles();
    let VOID_FILES = ALL_FILES.filter(file => file.path.startsWith(VOID_PATH));
    let CELESTIA_FILES = ALL_FILES.filter(file => file.path.startsWith(CELESTIA_PATH));

    let VOID = new World(VOID_FILES, VOID_PATH, VOID_IDENT);
    let CELESTIA = new World(CELESTIA_FILES, CELESTIA_PATH, CELESTIA_IDENT);

    VOID.files.sort((a, b) => a.basename > b.basename ? 1 : -1);
    CELESTIA.files.sort((a, b) => a.basename > b.basename ? 1 : -1);

    let file = plugin.app.workspace.getActiveFile();

    let GRAPH;
    if (file.path.includes(VOID_PATH)) {

        GRAPH = VOID;
    } else if (file.path.includes(CELESTIA_PATH)) {

        GRAPH = CELESTIA;
    } else {

        new Notice('Файл не принадлежит ни к VOID, ни к CELESTIA.');
        return;
    }
    await update(plugin, file, GRAPH, CELESTIA);
}


module.exports = {

    updateNoteLinks
};