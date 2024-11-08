module.exports = {};
module.exports.onload = async (plugin) => {
    const path = require('path');

    const vaultBasePath = plugin.app.vault.adapter.basePath;

    const { setPlugin } = require(path.join(vaultBasePath, 'obsidian-scripts/source/core/store-plugin'));

    setPlugin(plugin);

    const { ConfirmationModal } = require(path.join(vaultBasePath, 'obsidian-scripts/source/class/tool/modal-confirmation'))

    plugin.addCommand({
        id: 'update links of note',
        name: 'Update Links of Note',
        callback: async () => {
            const { updateNoteLinks } = require(path.join(
                vaultBasePath,
                'obsidian-scripts/comands/comand-UpdateNoteLinks',
            ));
            new Notice('Начато обновление ссылок заметки');

            await updateNoteLinks();

            new Notice('Обновление ссылок заметки закончено');
        },
    });

    plugin.addCommand({
        id: 'update links of vault',
        name: 'Update Links of Vault',
        callback: async () => {
            new ConfirmationModal(plugin.app, 'Это действие обновит ссылки во всех файлах. Вы уверены?', async () => {
                const { updateAllLinks } = require(path.join(
                    vaultBasePath,
                    'obsidian-scripts/comands/comand-UpdateAllLinks',
                ));

                new Notice('Начато обновление ссылок хранилища');

                await updateAllLinks();

                new Notice('Обновление ссылок хранилища закончено');
            }).open();
        },
    });

    plugin.addCommand({
        id: 'create new periodic',
        name: 'Create New Periodic',
        callback: async () => {
            const { newPeriodicNote } = require(path.join(
                vaultBasePath,
                'obsidian-scripts/comands/comand-NewPeriodicNote',
            ));

            new Notice('Создание начато');

            await newPeriodicNote();

            new Notice('Создание закончено');
        },
    });
};
