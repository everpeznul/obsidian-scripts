module.exports = {}
module.exports.onload = async (plugin) => {

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
        id: 'update',
        name: 'Update',
        callback: async () => {

            new Notice('Начато обновление ссылок заметки');

            await updateNoteLinks(plugin);

            new Notice('Обновление ссылок заметки закончено');
        }
    });

    async function updateNoteLinks(plugin) {

        let ALL_FILES = await plugin.app.vault.getMarkdownFiles();
        let VOID_FILES = ALL_FILES.filter(file => file.path.startsWith(VOID_PATH));
        let CELESTIA_FILES = ALL_FILES.filter(file => file.path.startsWith(CELESTIA_PATH));

        let VOID = new World(VOID_FILES, VOID_PATH, VOID_IDENT);
        let CELESTIA = new World(CELESTIA_FILES, CELESTIA_PATH, CELESTIA_IDENT);

        VOID.files.sort((a, b) => a.basename > b.basename ? 1 : -1);
        CELESTIA.files.sort((a, b) => a.basename > b.basename ? 1 : -1);

        let file = plugin.app.workspace.getActiveFile();

        let GRAPH = await plugin.helpers.suggest(['VOID', 'CELESTIA'], [VOID, CELESTIA]);

        await update(plugin, file, GRAPH, CELESTIA);
    }

    class Word {
        text;
        content;

        #orderMatch;
        #categoryMatch;

        constructor(word) {

            this.text = word;

            this.#orderMatch = this.text.match(/<\d+>([^.]+)/);
            this.content = this.#orderMatch ? this.#orderMatch[1] : word;

            this.#categoryMatch = this.content.match(/([^.]+)%/);
            this.content = this.#categoryMatch ? this.#categoryMatch[1] : this.content;

        }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

        hasOrder() {

            return this.#orderMatch ? true : false;;
        }

        isOrder() {

            return /^<\d+>$/.test(this.text);
        }

        isCategory() {

            return this.#categoryMatch ? true : false;
        }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

        getFContent() {

            if (this.isOrder()) {

                return this.text.replace("<", "").replace(">", "");
            }
            else {

                let contentFormat = [];

                for (const TEMP of this.content.split("_")) {

                    contentFormat.push(TEMP.charAt(0).toUpperCase() + TEMP.slice(1));
                }

                return contentFormat.join(" ");
            }
        }
    }

    class Ident {

        constructor(founderAlias, ancestorAlias, fatherAlias) {

            this.founderAlias = founderAlias;
            this.ancestorAlias = ancestorAlias;
            this.fatherAlias = fatherAlias;
        }
    }

    class World {

        constructor(files, path, ident) {

            this.files = files;
            this.path = path;
            this.ident = ident;
        }
    }

    class Is {

        constructor() {
        }

        static Dream(note) {

            return note.title.startsWith("сон.");
        }

        static Thought(note) {

            return note.title.startsWith("мысль.");
        }

        static Daily(note) {

            return /^\d{4}-\d{2}-\d{2}$/.test(note.title);
        }

        static Human(note) {

            return /^человек\.[^.]+$/.test(note.title);
        }

        static Note(note) {
            return (!this.Dream(note) && !this.Thought(note) && !this.Daily(note) && !this.Human(note));
        }
    }

    class Has {

        static Date(note) {

            let match = note.title.match(/(\d{4}-\d{2}-\d{2})/);
            if (match) {

                return [match[1], true];
            }
            else {

                return [null, false];
            }
        }

    }

    async function update(plugin, file, graph, celestia) {

        console.log(`---------------------------\n"${file.basename}"\n---------------------------`);

        let title = file.basename;
        let text = await plugin.app.vault.read(file);

        let note = setNote(title, text);

        let links = new Links(note);
        let fLinks = await links.getFLinks(graph, celestia);

        let tags = await Tager.getTags(note, graph, celestia);

        let noteNewText = getNewNoteText(note, fLinks, tags);

        await plugin.app.vault.modify(file, noteNewText);
    }

    function getNewNoteText(note, fLinks, tags) {

        return [fLinks, `\n${tags}\n`, `# ${note.head}\n`, note.content].join("\n");
    }

    class Links {

        async getLinks(note, graph, celestia) {

            let links = [];

            if (note.len === 1) {

                if (Is.Daily(note)) {

                    if (note.title === "0000-00-00") {

                        links = await note.findConnect(celestia, celestia);
                    }
                    else {

                        links = await note.findConnect(graph, celestia);
                    }
                }
                else {

                    let [founderTitle, founderText] = await note.findFounder(celestia, celestia);

                    let founder = new Note(founderTitle, founderText);
                    links.push(founder, founder, founder);
                }
            }
            else {

                links = await note.findConnect(graph, celestia);
            }

            this.founder = links[0];
            this.ancestor = links[1];
            this.father = links[2];
        }

        constructor(note) {

            this.note = note;

        }

        async getFLinks(graph, celestia) {

            await this.getLinks(this.note, graph, celestia)

            let founder = this.founder.getLink(graph.ident.founderAlias);
            let ancestor = this.ancestor.getLink(graph.ident.ancestorAlias);
            let father = this.father.getLink(graph.ident.fatherAlias);

            if (Is.Note(this.note)) {

                //имя содержит дату, но не является ежедневной заметкой
                let [date, OK] = Has.Date(this.note);
                if (OK) {

                    ancestor += `[${graph.ident.fatherAlias}:: [[${date}#${date}|${date}]]]`;
                }
            }

            return [founder, ancestor, father].join("\n");
        }
    }

    class Note {


        //методы установки полей класса

        getTitle(TITLE) {

            return TITLE;
        }

        getWords() {

            let temp = [];
            for (const WORD of this.title.split(".")) {

                temp.push(new Word(WORD));
            }

            return temp;
        }

        getLen() {

            return this.words.length;
        }

        getName() {

            return this.words[this.len - 1];
        }

        getHead() {

            let temp;

            if (this.name.isOrder()) {

                temp = [this.name.getFContent(), this.words[this.len - 2].getFContent()].join(" ");
            }
            else {

                temp = this.name.getFContent();
            }

            return temp;
        }

        getText(TEXT) {

            return TEXT;
        }

        getContent() {

            return this.text.split(/^# .*$/gm).pop();
        }

        //инициализация значений в конструкторе

        constructor(TITLE, TEXT) {
            console.log("Note constructor");

            this.title = this.getTitle(TITLE);
            this.words = this.getWords();
            this.len = this.getLen();
            this.name = this.getName();
            this.head = this.getHead();
            this.text = this.getText(TEXT);
            this.content = this.getContent();
        }

        //методы форматированного доступа к полям класса

        getSWords(start = 0, end = this.len) {

            let temp = [];
            for (let word of this.words.slice(start, end)) {

                temp.push(word.text);
            }

            return temp;
        }

        //методы поиска других заметок

        async find(graph, reqTitle, create = true) {

            let reqFile;

            reqFile = graph.files.find(file => file.basename.endsWith(reqTitle));

            if (!reqFile) {

                if (create) {

                    try {

                        await plugin.app.vault.create(graph.path + reqTitle + ".md", "\n# temp");

                        console.log(`        Заметка "${reqTitle}" успешно создана в "${graph.path}"`);
                    }
                    catch (error) {

                        console.error(`        Ошибка: заметка "${reqTitle}" уже существует в "${graph.path}"`, error);
                    }

                    let filesNew = await plugin.app.vault.getMarkdownFiles();
                    graph.files = filesNew.filter(file => file.path.startsWith(graph.path));
                    graph.files.sort((a, b) => a.basename > b.basename ? 1 : -1);

                    reqFile = graph.files.find(file => file.basename.endsWith(reqTitle));

                    await update(reqFile, graph);
                }
                else {

                    console.error(`        Ошибка: не получилось создать заметку "${reqTitle}" в "${graph.path}"`);

                    return null;
                }
            }

            let fileTitle = reqFile.basename;
            let reqText = await plugin.app.vault.read(reqFile);

            return [fileTitle, reqText];
        }

        async findFounder(graph, celestia) {

            let founderTitle = this.words[0].text;
            console.log(`    Note founder:\n        "${founderTitle}"`);

            let founder = await this.find(graph, founderTitle);

            return founder;
        }

        async findAncestor(graph, celestia) {

            let temp = [];

            if (this.len > 2) {

                for (let i = this.len - 2; i >= 0; i--) {

                    if (!this.words[i].isCategory()) {

                        temp = this.getSWords().slice(0, i + 1).join(".");
                        break;

                    }
                }
            }
            else {

                temp = this.words[0].text;

            }

            let ancestorTitle = temp;

            console.log(`    Note ancestor:\n        "${ancestorTitle}"`);


            let ancestor = await this.find(graph, ancestorTitle);

            return ancestor;
        }

        async findFather(graph, celestia) {

            if (this.len > 1) {

                let fatherTitle = this.getSWords(0, this.len - 1).join(".");

                console.log(`    Note father:\n        "${fatherTitle}"`);

                let father = await this.find(graph, fatherTitle, false);

                if (father != null) {

                    return father;
                }
                else if (fatherTitle.endsWith("%")) {

                    console.log(`    Note father_dif:\n        "${fatherTitle.slice(0, -1)}"`);

                    father = await this.find(graph, fatherTitle.slice(0, -1));

                    return father;
                }
            }
        }

        async findConnect(graph, celestia) {
            console.log("Note connect");

            let [founderTitle, founderText] = await this.findFounder(graph, celestia);
            let [ancestorTitle, ancestorText] = await this.findAncestor(graph, celestia);
            let [fatherTitle, fatherText] = await this.findFather(graph, celestia);

            let founder = new Note(founderTitle, founderText);
            let ancestor = new Note(ancestorTitle, ancestorText);
            let father = new Note(fatherTitle, fatherText);

            return [founder, ancestor, father];
        }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

        logData() {
            console.log("\n");
            console.log(this.title + "\n");
            console.log(this.words + "\n");
            console.log(this.len + "\n");
            console.log(this.name + "\n");
            console.log(this.head + "\n");
            console.log(this.text + "\n");
            console.log(this.content + "\n");

        }

        //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

        getLink(IDENT) {

            return `[${IDENT}:: [[${this.title}#${this.head}|${this.head}]]]`;
        }
    }

    class Human extends Note {

        getHead() {

            return this.name.getFContent().split(" ")[1];
        }

        constructor(TITLE, TEXT) {
            console.log("Human constructor");

            super(TITLE, TEXT);
        }
    }

    class Periodic extends Note {

        constructor(TITLE, TEXT) {
            console.log("Periodic constructor");

            super(TITLE, TEXT);
        }
    }

    class Dream extends Periodic {

        getHead() {

            const DREAM_NUMBER = {

                "1": "Первый",
                "2": "Второй",
                "3": "Третий",
                "4": "Четвёртый",
                "5": "Пятый",
                "6": "Шестой",
                "7": "Седьмой",
                "8": "Восьмой",
                "9": "Девятый"
            };

            return DREAM_NUMBER[this.name.getFContent()];
        }

        constructor(TITLE, TEXT) {
            console.log("Dream constructor");

            super(TITLE, TEXT);
        }

        async findAncestor(graph, celestia) {

            let [date, ok] = Has.Date(this);
            if (ok) {

                console.log(`    Thought ancestor:\n    "${date}"`);
                let ancestor = await this.find(graph, date);

                return ancestor;
            }
        }
        async findFather(graph, celestia) {

            return this.findFounder(graph);
        }
    }

    class Thought extends Periodic {

        getHead() {

            const THOUGHT_NUMBER = {

                "1": "Первая",
                "2": "Вторая",
                "3": "Третья",
                "4": "Четвёртая",
                "5": "Пятая",
                "6": "Шестая",
                "7": "Седьмая",
                "8": "Восьмая",
                "9": "Девятая"
            };

            return THOUGHT_NUMBER[this.name.getFContent()];
        }

        constructor(TITLE, TEXT) {
            console.log("Thought constructor");

            super(TITLE, TEXT);
        }

        async findAncestor(graph, celestia) {

            let [date, ok] = Has.Date(this);
            if (ok) {

                console.log(`Thought ancestor:\n    "${date}"`);
                let ancestor = await this.find(graph, date);

                return ancestor;
            }
        }
        async findFather(graph, celestia) {

            return this.findFounder(graph);
        }
    }

    class Daily extends Periodic {

        constructor(TITLE, TEXT) {
            console.log("Daily constructor");

            super(TITLE, TEXT);
        }

        async findFounder(graph, celestia) {

            let founder;

            let [date, ok] = Has.Date(this);
            if (ok && (date !== "0000-00-00")) {

                founder = await this.find(graph, "0000-00-00");
            }
            else if (ok && date === "0000-00-00") {

                founder = await this.find(celestia, "<1>❤️‍🔥.календарь.периодическая.daily");
            }

            console.log(`    Daily founder:\n    "${date}"`)

            return founder;
        }

        async findAncestor(graph, celestia) {

            return this.findFounder(graph, celestia);
        }

        async findFather(graph, celestia) {

            return this.findFounder(graph, celestia);;
        }
    }

    function setNote(title, text) {

        let note = new Note(title, text);

        if (Is.Thought(note)) {

            note = new Thought(title, text);
        }
        else if (Is.Dream(note)) {

            note = new Dream(title, text);
        }
        else if (Is.Daily(note)) {

            note = new Daily(title, text);
        }

        return note;
    }

    const VOID_PATH = "master/<9> void/";
    const VOID_FOUNDER_ALIAS = "herald";
    const VOID_ANCESTOR_ALIAS = "bubble";
    const VOID_FATHER_ALIAS = "arm";

    const VOID_IDENT = new Ident(VOID_FOUNDER_ALIAS, VOID_ANCESTOR_ALIAS, VOID_FATHER_ALIAS);

    const CELESTIA_PATH = "master/<-9> celestia/";
    const CELESTIA_FOUNER_ALIAS = "archont";
    const CELESTIA_ANCESTOR_ALIAS = "band";
    const CELESTIA_FATHER_ALIAS = "mate";

    const CELESTIA_IDENT = new Ident(CELESTIA_FOUNER_ALIAS, CELESTIA_ANCESTOR_ALIAS, CELESTIA_FATHER_ALIAS);

    class Tager {

        constructor() {


        }

        static async getTags(note, graph, celestia) {

            let temp = [];

            let mainTag = await this.getMainTag(note, graph, celestia);
            temp.push(mainTag);

            /*
            for (let tag of this.getCategoryTags(note)) {
    
                tepm.push(tag);
            }
            */

            return temp;
        }

        static async getMainTag(note, graph, celestia) {

            //должно гарантироваться, что note прошла через setNote()
            let [founder_title, founder_text] = await note.findFounder(graph, celestia);

            let title = founder_title;

            let tag;

            if (title.includes("❤️‍🔥")) {

                tag = "реализация";
            }
            else if (title.includes("🪨")) {

                tag = "саморазвитие";
            }
            else if (title.includes("🌊")) {

                tag = "личное";
            }
            else if (title.includes("🌬️")) {

                tag = "духовность";
            }

            return `#${tag}`;
        }

        static getCategoryTags(note) {

            return [];
        }
    }
};


