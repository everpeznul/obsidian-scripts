module.exports = {}

module.exports.onload = async (plugin) => {

    plugin.addCommand({
        id: 'format links',
        name: 'Format Links',
        callback: async () => {

            let file = plugin.app.workspace.getActiveFile();

            app.vault.read(file).then(content => {

                let links = content.match(/\[\[(.*?)\]\]/g);

                for (let i = 0; i < links.length; i++) {
                    let link = links[i];
                    let noteName = link.substring(2, link.length - 2);

                    if (noteName.includes('#')) continue;

                    // Получаем все файлы в хранилище
                    let allFiles = plugin.app.vault.getMarkdownFiles();

                    // Ищем файл заметки среди всех файлов
                    let noteFile = allFiles.find(f => f.basename === noteName);

                    if (noteFile) {
                        // Получаем кэш файла
                        let fileCache = app.metadataCache.getFileCache(noteFile);

                        // Ищем первый заголовок в кэше файла
                        let firstHeading = fileCache.headings ? fileCache.headings[0].heading : '';

                        if (firstHeading) {
                            text = firstHeading.charAt(0).toLowerCase() + firstHeading.slice(1)

                            // Заменяем ссылку на новый формат
                            content = content.replace(link, `[[${noteName}#${firstHeading}|${text}]]`);
                        } else {
                            // Если заголовок не найден, заменяем ссылку на сообщение об ошибке
                            content = content.replace(link, `${link} - (Ошибка: заголовок первого уровня не найден)`);
                        }
                    } else {
                        // Если файл заметки не найден, заменяем ссылку на сообщение об ошибке
                        content = content.replace(link, `${link} - (Ошибка: файл заметки не найден)`);
                    }
                }

                // Записываем обновленное содержимое обратно в файл
                app.vault.modify(file, content).catch(error => {
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