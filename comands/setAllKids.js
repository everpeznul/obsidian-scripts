module.exports = {}

module.exports.onload = async (plugin) => {

    plugin.addCommand({
        id: 'set all kids',
        name: 'Set All Kids',
        callback: async () => {
            let file = plugin.app.workspace.getActiveFile();

            app.vault.read(file).then(content => {
                // Добавляем выражение dataview в конец файла
                let dataviewExpression = `\n---\n\`\`\`dataview\nLIST\nWHERE contains(file.name,"${file.basename}.")\n\`\`\``;
                content += dataviewExpression;

                // Записываем обновленное содержимое обратно в файл
                plugin.app.vault.modify(file, content).catch(error => {
                    // Если произошла ошибка при записи в файл, добавляем сообщение об ошибке в конец файла
                    content += `\n\nОшибка при записи в файл: ${error}`;
                    app.vault.modify(file, content);
                });
            }).catch(error => {
                console.error(`Ошибка при чтении исходного файла: ${error}`);
            });
        }
    });
}
