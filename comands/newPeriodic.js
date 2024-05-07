module.exports = {}

module.exports.onload = async (plugin) => {

    plugin.addCommand({
        id: 'create new periodic',
        name: 'Create New Periodic',
        callback: async () => {

            new Notice('Создание начато');

            let file = plugin.app.workspace.getActiveFile();
            let title = file.basename;

            if (/^\d{4}-\d{2}-\d{2}$/.test(title)) {

                let allFiles = await plugin.app.vault.getMarkdownFiles()
                let voidFiles = allFiles.filter(file => file.path.startsWith('master/<9> void/'));
                let create = ['Сон', 'Мысль', 'Анализ', 'Самоанализ'];
                let name = await plugin.helpers.suggest(create, create);
                name = name.charAt(0).toLowerCase() + name.slice(1);


                let dreamFiles = voidFiles.filter(file => file.basename.startsWith(`${name}.${title}.<`));

                let maxNumber = 0;
                dreamFiles.forEach(file => {
                    const number = parseInt(file.basename.split('.').pop().replace('<', '').replace('>', ''));
                    if (number > maxNumber) {
                        maxNumber = number;
                    }
                });

                const newFileName = `master/<9> void/${name}.${title}.<${maxNumber + 1}>.md`;
                await app.vault.create(newFileName, '\n#').catch(error => {
                    console.error(`Ошибка при создании файла: ${error}`);
                });
            }
            else {

                new Notice('Текущий файл не является ежедневной заметкой')
            }

            new Notice('Создание закончено');
        }
    });
}