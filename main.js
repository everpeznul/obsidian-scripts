module.exports = {}
module.exports.onload = async (plugin) => {

    const path = require('path');

    const vaultBasePath = plugin.app.vault.adapter.basePath;

    const { setPlugin1 } = require(path.join(vaultBasePath, 'obsidian-scripts/comands/source/note-Classes'));
    const { setPlugin2 } = require(path.join(vaultBasePath, 'obsidian-scripts/comands/source/note-subClasses'));

    const { setPlugin } = require(path.join(vaultBasePath, 'obsidian-scripts/source/core/store-plugin'));

    setPlugin(plugin);

    setPlugin1(plugin);
    setPlugin2(plugin);

    const { updateAllLinks } = require(path.join(vaultBasePath, 'obsidian-scripts/comands/comand-UpdateAllLinks'));
    const { updateNoteLinks } = require(path.join(vaultBasePath, 'obsidian-scripts/comands/comand-UpdateNoteLinks'));
    const { newPeriodicNote } = require(path.join(vaultBasePath, 'obsidian-scripts/comands/comand-NewPeriodicNote'));
    
    const { Modal } = plugin.passedModules.obsidian;

    class ConfirmationModal extends Modal {

        constructor(app, message, action) {
            super(app);

            this.modalEl.addClass('confirm-modal');

            this.contentEl.createEl('p', { text: message });

            this.contentEl.createDiv('modal-button-container', (buttonsEl) => {

                buttonsEl.createEl('button', { text: 'Отмена' }).addEventListener('click', () => this.close());

                const btnConfirm = buttonsEl.createEl('button', {
                    attr: { type: 'submit' },
                    cls: 'mod-cta',
                    text: 'Подтвердить',
                });

                btnConfirm.addEventListener('click', async (_e) => {
                    this.close();
                    await action();
                });

                setTimeout(() => btnConfirm.focus(), 50);
            });
        }
    }

    plugin.addCommand({
        id: 'update links of note',
        name: 'Update Links of Note',
        callback: async () => {

            new Notice('Начато обновление ссылок заметки');

            await updateNoteLinks(plugin);

            new Notice('Обновление ссылок заметки закончено');
        }
    });

    plugin.addCommand({
        id: 'update links of vault',
        name: 'Update Links of Vault',
        callback: async () => {

            new ConfirmationModal(plugin.app, 'Это действие обновит ссылки во всех файлах. Вы уверены?', async () => {

                new Notice('Начато обновление ссылок хранилища');

                await updateAllLinks(plugin);

                new Notice('Обновление ссылок хранилища закончено');
            }).open();
        }
    });

    plugin.addCommand({
        id: 'create new periodic',
        name: 'Create New Periodic',
        callback: async () => {
            new Notice('Создание начато');

            await newPeriodicNote(plugin);

            new Notice('Создание закончено');
        }
    });
};


