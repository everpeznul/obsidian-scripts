module.exports = {}

module.exports.onload = async (plugin) => {

    plugin.addCommand({
        id: 'update old',
        name: 'Update old',
        callback: async () => {

            console.log('Мы начали ебашить');

            const voidPath = "master/<9> void/";
            const voidFounder = "herald";
            const voidAncestor = "bubble";
            const voidFather = "arm";
            const voidIdent = [voidPath, voidFounder, voidAncestor, voidFather];

            const celestiaPath = "master/<-9> celestia/";
            const celestiaFounder = "archont";
            const celestiaAncestor = "band";
            const celestiaFather = "mate";
            const celestiaIdent = [celestiaPath, celestiaFounder, celestiaAncestor, celestiaFather];

            const allFiles = await plugin.app.vault.getMarkdownFiles();
            const celestiaFiles = allFiles.filter(file => file.path.startsWith(celestiaIdent[0]));
            const voidFiles = allFiles.filter(file => file.path.startsWith(voidIdent[0]));

            celestiaFiles.sort((a, b) => a.basename > b.basename ? 1 : -1);
            voidFiles.sort((a, b) => a.basename > b.basename ? 1 : -1);

            await update(celestiaFiles, voidFiles, celestiaIdent, voidIdent);

            console.log('Неужели блять мы дошли до конца');

        }
    });
    //сделать слово заглавным
    function toHeadword(word) {

        return word.charAt(0).toUpperCase() + word.slice(1);
    }
    //привести к виду имени
    function toName(phrase) {

        let [word1, word2, word3] = phrase.split("_");

        return [toHeadword(word1), toHeadword(word2), toHeadword(word3)].join(" ");
    }
    //сделать фразу заглавной
    function toHeadPhrase(phrase) {
        return (phrase.charAt(0).toUpperCase() + phrase.slice(1)).split("_").join(" ")
    }
    //обновить ссылки
    async function update(celestiaFiles, voidFiles, celestiaIdent, voidIdent) {
        await iterate(celestiaFiles, celestiaFiles, celestiaIdent);
        await iterate(voidFiles, celestiaFiles, voidIdent);
    }
    //пройтись по каждому набору файлов
    async function iterate(files, celestiaFiles, ident) {

        for (const note of files) {

            console.log(note.basename);


            const noteTitle = note.basename;
            const noteText = await plugin.app.vault.read(note);

            let founder, ancestor, father, heading;

            if (!noteTitle.startsWith("сон.") & !noteTitle.startsWith("@")) {

                if (noteTitle.split(".").length === 1) {

                    founder = await getFounder(noteTitle, celestiaFiles);
                    ancestor = [[founder[0]], [founder[1]]];
                    father = founder;

                }
                else {

                    founder = await getFounder(noteTitle, files);
                    ancestor = await getAncestor(noteTitle, files);
                    father = await getFather(noteTitle, files);

                }

                heading = `# ${setHeading(noteTitle)}`;
                content = getContent(noteText);

                //имя содержит дату
                let match = noteTitle.match(/\d{4}-\d{2}-\d{2}/);
                if (match) {

                    const date = match[0];
                    //заметка не ежедневная
                    if (date != noteTitle) {

                        ancestor = [[ancestor[0], date], [ancestor[1], date]]
                        //заметка о мыслях
                        if (noteTitle.startsWith("мысль.")) {

                            const dreamNumber = {
                                "1": "# Первая",
                                "2": "# Вторая",
                                "3": "# Третья",
                                "4": "# Четвёртая",
                                "5": "# Пятая",
                                "6": "# Шестая",
                                "7": "# Седьмая",
                                "8": "# Восьмая",
                                "9": "# Девятая"
                            };
                            ancestor = [[date], [date]]

                            heading = dreamNumber[noteTitle.split(".")[2].charAt(1)];

                        }
                    }
                    //ежедневная заметка
                    else {

                        founder = ["0000-00-00", "0000-00-00"];
                        ancestor = [["0000-00-00"], ["0000-00-00"]];
                        father = ["0000-00-00", "0000-00-00"];

                    }
                }

                const links = getLinks(ident, founder, ancestor, father);
                const noteTextNew = [links, heading, content].join("\n");

                await plugin.app.vault.modify(note, noteTextNew);
            }
        }
    }

    async function getFounder(noteTitle, files) {

        const noteFirstWord = noteTitle.split(".")[0];
        const founder = files.find(file => file.basename.endsWith(noteFirstWord));

        let founderTitle = "Не найден";
        let founderHead = "Не найден";

        if (founder) {

            founderTitle = founder.basename;

            const founderText = await plugin.app.vault.read(founder);
            founderHead = getHeading(founderText);

        }

        return [founderTitle, founderHead];
    }

    async function getAncestor(noteTitle, files, noteText) {

        const noteTitlePart = noteTitle.split(".");

        let ancestorTitle;
        let ancestorHead = "Лопнул";

        if (noteTitlePart.length > 2) {

            for (let i = noteTitlePart.length - 2; i >= 0; i--) {

                if (!noteTitlePart[i].endsWith("%")) {

                    ancestorTitle = noteTitlePart.slice(0, i + 1).join(".");
                    break;

                }
            }
        } else {

            ancestorTitle = noteTitlePart[0];

        }

        const ancestor = files.find(file => file.basename.endsWith(ancestorTitle));

        if (ancestor) {

            ancestorTitle = ancestor.basename;

            const ancestorText = await plugin.app.vault.read(ancestor);
            ancestorHead = getHeading(ancestorText);

        }

        return [[ancestorTitle], [ancestorHead]];
    }

    async function getFather(noteTitle, files, noteText) {

        const noteLastDotIndex = noteTitle.lastIndexOf(".");

        let fatherTitle = noteLastDotIndex !== -1 ? noteTitle.substring(0, noteLastDotIndex) : noteTitle;
        let fatherHead = "Ушёл за хлебом";

        let father = files.find(file => file.basename.endsWith(fatherTitle));

        if (father) {

            fatherTitle = father.basename;

            const fatherText = await plugin.app.vault.read(father);
            fatherHead = getHeading(fatherText);

        } else if (fatherTitle.split(".")[fatherTitle.split(".").length - 1].endsWith("%")) {

            let indexProcent = fatherTitle.lastIndexOf("%");

            fatherTitle = fatherTitle.substring(0, indexProcent);

            father = files.find(file => file.basename.endsWith(fatherTitle));

            if (father) {

                fatherTitle = father.basename;

                const fatherText = await plugin.app.vault.read(father);
                fatherHead = getHeading(fatherText);

            } else {

                fatherHead = "Ушёл за хлебом без %";

            }
        }

        return [fatherTitle, fatherHead];
    }
    //обрабатывает текущую заметку, делая заголовок для неё
    function setHeading(noteTitle) {

        const regexOrder = /<(\d+)>(.*)/;
        const regexHuman = /^человек\.([а-яёËА-Яa-zA-Z_]*)$/;

        const noteName = noteTitle.split(".")[noteTitle.split(".").length - 1];

        let noteHead;

        let match = noteName.match(/<\d+>/);
        if (match) {

            if (/<\d+>/.test(noteName)) {

                const fatherName = deleteSymb(noteTitle.split(".")[noteTitle.split(".").length - 2]);

                noteHead = [noteName.replace("<", "").replace(">", ""), fatherName].join(" ");

                return noteHead

            }

        }

        match = noteTitle.match(regexHuman);
        if (match) {

            noteHead = toName(match[1]);

        } else {

            noteHead = toHeadPhrase(noteName);

        }

        noteHead = deleteSymb(noteHead);

        return noteHead;
    }

    function deleteSymb(word) {

        const regexOrder = /<\d+>([а-яёËА-Яa-zA-Z_]*)/;
        const regexCategory = /([а-яёËА-Яa-zA-Z_]*)%/;

        let wordNew = word;

        let match = word.match(regexOrder);
        if (match) {

            wordNew = match[1];

        }

        match = wordNew.match(regexCategory);
        if (match) {

            wordNew = match[1];

        }

        return wordNew;
    }

    function getContent(noteText) {

        const regex = /^#.*$/gm;

        let sections = noteText.split(regex);
        let noteContent = sections[sections.length - 1];

        return noteContent;
    }
    //вытаскивает из заметки последний заголовок первого уровня
    function getHeading(noteText) {

        const regex = /^# (.*)$/gm;

        let matches = noteText.match(regex);
        let lastMatch = matches ? matches.map(match => match.replace(regex, '$1')).pop() : null;

        return lastMatch;
    }

    function getLink(linkType, title, head) {

        return `[${linkType}:: [[${title}#${head}|${head}]]]`;
    }

    function getLinks(ident, founder, ancestor, father) {

        let founder_return = getLink(ident[1], founder[0], founder[1]);
        let ancestor_return = [];

        for (let i = 0; i < ancestor[0].length; i++) {

            ancestor_return.push(getLink(ident[2], ancestor[0][i], ancestor[1][i]));

        }

        ancestor_return = ancestor_return.join("\n");
        let father_return = getLink(ident[3], father[0], father[1]);

        return [founder_return, ancestor_return, father_return].join("\n");
    }
}