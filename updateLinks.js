const { World, update } = require('/Users/everpeznul/sync/obsidian/obsidian-scripts/vaultClasses');
const { VOID_IDENT, CELESTIA_IDENT } = require('/Users/everpeznul/sync/obsidian/obsidian-scripts/vaultConstants');

module.exports = {}

module.exports.onload = async (plugin) => {

    plugin.addCommand({
        id: 'update links of note',
        name: 'Update Links of Note',
        callback: async () => {

            new Notice('Начато обновление ссылок');

            let ALL_FILES = await plugin.app.vault.getMarkdownFiles();
            let VOID_FILES = ALL_FILES.filter(file => file.path.startsWith(VOID_IDENT.path));
            let CELESTIA_FILES = ALL_FILES.filter(file => file.path.startsWith(CELESTIA_IDENT.path));

            let VOID = new World(VOID_FILES, VOID_IDENT);
            let CELESTIA = new World(CELESTIA_FILES, CELESTIA_IDENT);

            VOID.files.sort((a, b) => a.basename > b.basename ? 1 : -1);
            CELESTIA.files.sort((a, b) => a.basename > b.basename ? 1 : -1);

            let FILE = plugin.app.workspace.getActiveFile();

            let WORLD = await plugin.helpers.suggest(['VOID', 'CELESTIA'], [VOID, CELESTIA]);

            await update(FILE, WORLD, CELESTIA, plugin);

            new Notice('Обновление ссылок закончено');
        }
    });
}