const { World } = require('../source/class/note/note-subClasses');
const { update } = require('../source/scripts/update');
const {
    VOID_PATH,
    CELESTIA_PATH,
    VOID_IDENT,
    CELESTIA_IDENT,
} = require('../source/vault-Constants');
const { getPlugin } = require('../source/core/store-plugin');

const plugin = getPlugin();

async function updateAllLinks() {
    let ALL_FILES = await plugin.app.vault.getMarkdownFiles();
    let VOID_FILES = ALL_FILES.filter((file) =>
        file.path.startsWith(VOID_PATH),
    );
    let CELESTIA_FILES = ALL_FILES.filter((file) =>
        file.path.startsWith(CELESTIA_PATH),
    );

    let VOID = new World(VOID_FILES, VOID_PATH, VOID_IDENT);
    let CELESTIA = new World(CELESTIA_FILES, CELESTIA_PATH, CELESTIA_IDENT);

    VOID.files.sort((a, b) => (a.basename > b.basename ? 1 : -1));
    CELESTIA.files.sort((a, b) => (a.basename > b.basename ? 1 : -1));

    for (let file of CELESTIA.files) {
        await update(file, CELESTIA, CELESTIA);
    }

    for (let file of VOID.files) {
        await update(file, VOID, CELESTIA);
    }
}

module.exports = {
    updateAllLinks,
};
