const { getPlugin } = require('../../core/store-plugin');

const plugin = getPlugin();
const { Modal } = plugin.passedModules.obsidian;

class ConfirmationModal extends Modal {
    constructor(app, message, action) {
        super(app);

        this.modalEl.addClass('confirm-modal');

        this.contentEl.createEl('p', { text: message });

        this.contentEl.createDiv('modal-button-container', (buttonsEl) => {
            buttonsEl
                .createEl('button', { text: 'Отмена' })
                .addEventListener('click', () => this.close());

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

module.exports = {
    ConfirmationModal,
};
