module.exports = {}
module.exports.onload = async (plugin) => {

    const { updateAllLinks } = require('/Users/everpeznul/sync/myObsidian/obsidian-scripts/comands/comandUpdateAllLinks');
    const { updateNoteLinks } = require('/Users/everpeznul/sync/myObsidian/obsidian-scripts/comands/comandUpdateNoteLinks');
    const { newPeriodicNote } = require('/Users/everpeznul/sync/myObsidian/obsidian-scripts/comands/newPeriodicNote');

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

            await newPeriodicNoteK(plugin);

            new Notice('Создание закончено');
        }
    });
};


