module.exports = {}
module.exports.onload = async (plugin) => {

    const { setPlugin1 } = require('/Users/everpeznul/myObsidian/obsidian-scripts/source/noteClasses');
    const { setPlugin2 } = require('/Users/everpeznul/myObsidian/obsidian-scripts/source/subClasses');

    setPlugin1(plugin);
    setPlugin2(plugin);

    const { updateAllLinks } = require('/Users/everpeznul/myObsidian/obsidian-scripts/comandUpdateAllLinks');
    const { updateNoteLinks } = require('/Users/everpeznul/myObsidian/obsidian-scripts/comandUpdateNoteLinks');
    const { newPeriodicNote } = require('/Users/everpeznul/myObsidian/obsidian-scripts/comandNewPeriodicNote');

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

    console.log(process.cwd());


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


