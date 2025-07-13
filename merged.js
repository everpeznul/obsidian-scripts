
// 🔹 FOLDER: ./source/class/tool
// FILE: ./source/class/tool/modal-confirmation.js
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



// 🔹 FOLDER: ./source/class/note
// FILE: ./source/class/note/noteTags.js
const { setNote } = require('../../scripts/setNote');

class Tager {
    constructor() {}

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
        let tempFile = await note.findFounder(graph, celestia);
        let tempNote = setNote(tempFile[0], tempFile[1]);
        let [founder_title, founder_text] = await tempNote.findFounder(
            celestia,
            celestia,
        );

        let title = founder_title;

        let tag;

        if (title.includes('❤️‍🔥')) {
            tag = 'реализация';
        } else if (title.includes('🪨')) {
            tag = 'личное';
        } else if (title.includes('🌊')) {
            tag = 'духовность';
        } else if (title.includes('🌬️')) {
            tag = 'саморазвитие';
        }

        return `#${tag}`;
    }

    static getCategoryTags(note) {
        return [];
    }
}

module.exports = {
    Tager,
};



// 🔹 FOLDER: ./source/class/note
// FILE: ./source/class/note/note.js
const { Word } = require('./note-subClasses');
const { getPlugin } = require('../../core/store-plugin');

const plugin = getPlugin();

class Note {
    //методы установки полей класса

    getTitle(TITLE) {
        return TITLE;
    }

    getWords() {
        let temp = [];
        for (const WORD of this.title.split('.')) {
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
            temp = [
                this.name.getFContent(),
                this.words[this.len - 2].getFContent(),
            ].join(' ');
        } else {
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
        console.log('Note constructor');

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

        reqFile = graph.files.find((file) => file.basename.endsWith(reqTitle));

        if (!reqFile) {
            if (create) {
                const { update } = require('../../scripts/update.js');

                try {
                    await plugin.app.vault.create(
                        graph.path + reqTitle + '.md',
                        '\n# temp',
                    );

                    console.log(
                        `        Заметка "${reqTitle}" успешно создана в "${graph.path}"`,
                    );
                } catch (error) {
                    console.error(
                        `        Ошибка: заметка "${reqTitle}" уже существует в "${graph.path}"`,
                        error,
                    );
                }

                let filesNew = await plugin.app.vault.getMarkdownFiles();
                graph.files = filesNew.filter((file) =>
                    file.path.startsWith(graph.path),
                );
                graph.files.sort((a, b) => (a.basename > b.basename ? 1 : -1));

                reqFile = graph.files.find((file) =>
                    file.basename.endsWith(reqTitle),
                );

                await update(reqFile, graph);
            } else {
                console.error(
                    `        Ошибка: не получилось создать заметку "${reqTitle}" в "${graph.path}"`,
                );

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
                    temp = this.getSWords()
                        .slice(0, i + 1)
                        .join('.');
                    break;
                }
            }
        } else {
            temp = this.words[0].text;
        }

        let ancestorTitle = temp;

        console.log(`    Note ancestor:\n        "${ancestorTitle}"`);

        let ancestor = await this.find(graph, ancestorTitle);

        return ancestor;
    }

    async findFather(graph, celestia) {
        if (this.len > 1) {
            let fatherTitle = this.getSWords(0, this.len - 1).join('.');

            console.log(`    Note father:\n        "${fatherTitle}"`);

            let father = await this.find(graph, fatherTitle, false);

            if (father != null) {
                return father;
            } else if (fatherTitle.endsWith('%')) {
                console.log(
                    `    Note father_dif:\n        "${fatherTitle.slice(
                        0,
                        -1,
                    )}"`,
                );

                father = await this.find(graph, fatherTitle.slice(0, -1));

                return father;
            }
        }
    }

    async findConnect(graph, celestia) {
        console.log('Note connect');

        let [founderTitle, founderText] = await this.findFounder(
            graph,
            celestia,
        );
        let [ancestorTitle, ancestorText] = await this.findAncestor(
            graph,
            celestia,
        );
        let [fatherTitle, fatherText] = await this.findFather(graph, celestia);

        let founder = new Note(founderTitle, founderText);
        let ancestor = new Note(ancestorTitle, ancestorText);
        let father = new Note(fatherTitle, fatherText);

        return [founder, ancestor, father];
    }

    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    logData() {
        console.log('\n');
        console.log(this.title + '\n');
        console.log(this.words + '\n');
        console.log(this.len + '\n');
        console.log(this.name + '\n');
        console.log(this.head + '\n');
        console.log(this.text + '\n');
        console.log(this.content + '\n');
    }

    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    getLink(IDENT) {
        return `[${IDENT}:: [[${this.title}#${this.head}|${this.head}]]]`;
    }
}

module.exports = {
    Note,
};



// 🔹 FOLDER: ./source/class/note
// FILE: ./source/class/note/note-subClasses.js
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
        this.content = this.#categoryMatch
            ? this.#categoryMatch[1]
            : this.content;
    }

    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    hasOrder() {
        return this.#orderMatch ? true : false;
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
            return this.text.replace('<', '').replace('>', '');
        } else {
            let contentFormat = [];

            for (const TEMP of this.content.split('_')) {
                contentFormat.push(
                    TEMP.charAt(0).toUpperCase() + TEMP.slice(1),
                );
            }

            return contentFormat.join(' ');
        }
    }
}

class Alias {
    constructor(fouder, ancestor, father) {
        this.fouder = fouder;
        this.ancestor = ancestor;
        this.father = father;
    }
}

class World {
    constructor(files, path, alias) {
        this.files = files;
        this.path = path;
        this.alias = alias;
    }
}

class Is {
    constructor() {}

    static Dream(note) {
        return note.title.startsWith('сон.');
    }

    static Thought(note) {
        return note.title.startsWith('мысль.');
    }

    static Daily(note) {
        return /^\d{4}-\d{2}-\d{2}$/.test(note.title);
    }

    static Weekly(note) {
        return /^\d{4}-W\d{2}$/.test(note.title);
    }

    static Human(note) {
        return /^человек\.[^.]+$/.test(note.title);
    }

    static Note(note) {
        return (
            !this.Dream(note) &&
            !this.Thought(note) &&
            !this.Daily(note) &&
            !this.Human(note)
        );
    }
}

class Has {
    static Date(note) {
        let match = note.title.match(/(\d{4}-\d{2}-\d{2})/);
        if (match) {
            return [match[1], true];
        } else {
            return [null, false];
        }
    }

    static Week(note) {
        let match = note.title.match(/(\d{4}-W\d{2})/);
        if (match) {
            return [match[1], true];
        } else {
            return [null, false];
        }
    }
}

module.exports = {
    Word,
    Alias,
    World,
    Is,
    Has,
};



// 🔹 FOLDER: ./source/class/note
// FILE: ./source/class/note/note-periodic.js
const { Note } = require('./note');

class Periodic extends Note {
    constructor(TITLE, TEXT) {
        console.log('Periodic constructor');

        super(TITLE, TEXT);
    }
}

module.exports = {
    Periodic,
};



// 🔹 FOLDER: ./source/class/note
// FILE: ./source/class/note/note-periodic-weekly.js
const { Has } = require('./note-subClasses');
const { Periodic } = require('./note-periodic');

class Weekly extends Periodic {
    constructor(TITLE, TEXT) {
        console.log('Weekly constructor');

        super(TITLE, TEXT);
    }

    async findFounder(graph, celestia) {
        let founder;

        let [date, ok] = Has.Week(this);
        if (ok && date !== '0000-W00') {
            founder = await this.find(graph, '0000-W00');
        } else if (ok && date === '0000-W00') {
            founder = await this.find(
                celestia,
                '<4>❤️‍🔥.календарь.tasks.периодическая.weekly',
            );
        }

        console.log(`    Weekly founder:\n    "${date}"`);

        return founder;
    }

    async findAncestor(graph, celestia) {
        return this.findFounder(graph, celestia);
    }

    async findFather(graph, celestia) {
        return this.findFounder(graph, celestia);
    }
}

module.exports = {
    Weekly,
};



// 🔹 FOLDER: ./source/class/note
// FILE: ./source/class/note/note-periodic-thought.js
const { Has } = require('./note-subClasses');
const { Periodic } = require('./note-periodic');

class Thought extends Periodic {
    getHead() {
        const THOUGHT_NUMBER = {
            1: 'Первая',
            2: 'Вторая',
            3: 'Третья',
            4: 'Четвёртая',
            5: 'Пятая',
            6: 'Шестая',
            7: 'Седьмая',
            8: 'Восьмая',
            9: 'Девятая',
        };

        return THOUGHT_NUMBER[this.name.getFContent()];
    }

    constructor(TITLE, TEXT) {
        console.log('Thought constructor');

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

module.exports = {
    Thought,
};



// 🔹 FOLDER: ./source/class/note
// FILE: ./source/class/note/note-periodic-dream.js
const { Has } = require('./note-subClasses');
const { Periodic } = require('./note-periodic');

class Dream extends Periodic {
    getHead() {
        const DREAM_NUMBER = {
            1: 'Первый',
            2: 'Второй',
            3: 'Третий',
            4: 'Четвёртый',
            5: 'Пятый',
            6: 'Шестой',
            7: 'Седьмой',
            8: 'Восьмой',
            9: 'Девятый',
        };

        return DREAM_NUMBER[this.name.getFContent()];
    }

    constructor(TITLE, TEXT) {
        console.log('Dream constructor');

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

module.exports = {
    Dream,
};



// 🔹 FOLDER: ./source/class/note
// FILE: ./source/class/note/note-periodic-daily.js
const { Has } = require('./note-subClasses');
const { Periodic } = require('./note-periodic');

class Daily extends Periodic {
    constructor(TITLE, TEXT) {
        console.log('Daily constructor');

        super(TITLE, TEXT);
    }

    async findFounder(graph, celestia) {
        let founder;

        let [date, ok] = Has.Date(this);
        if (ok && date !== '0000-00-00') {
            founder = await this.find(graph, '0000-00-00');
        } else if (ok && date === '0000-00-00') {
            founder = await this.find(
                celestia,
                '<4>❤️‍🔥.календарь.периодическая.daily',
            );
        }

        console.log(`    Daily founder:\n    "${date}"`);

        return founder;
    }

    async findAncestor(graph, celestia) {
        return this.findFounder(graph, celestia);
    }

    async findFather(graph, celestia) {
        return this.findFounder(graph, celestia);
    }
}

module.exports = {
    Daily,
};



// 🔹 FOLDER: ./source/class/note
// FILE: ./source/class/note/note-human.js
const { Note } = require('./note');

class Human extends Note {
    getHead() {
        return this.name.getFContent().split(' ')[1];
    }

    constructor(TITLE, TEXT) {
        console.log('Human constructor');

        super(TITLE, TEXT);
    }
}

module.exports = {
    Human,
};



// 🔹 FOLDER: ./source/class/note
// FILE: ./source/class/note/links.js
const { Is, Has } = require('./note-subClasses');
const { Note } = require('./note');

function getLocalISOWeek(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return null;

    const day = date.getDay() || 7; // воскресенье = 7
    date.setDate(date.getDate() + 4 - day); // перейти к четвергу ISO-недели

    const yearStart = new Date(date.getFullYear(), 0, 1);
    const diff = (date - yearStart) / 86400000;

    const week = Math.ceil((diff + 1) / 7);
    const year = date.getFullYear();

    return `${year}-W${String(week).padStart(2, '0')}`;
}

class Links {
    constructor(note) {
        this.note = note;
    }

    async getLinks(note, graph, celestia) {
        let links = [];

        if (note.len === 1) {
            if (Is.Daily(note)) {
                if (note.title === '0000-00-00') {
                    links = await note.findConnect(celestia, celestia);
                } else {
                    links = await note.findConnect(graph, celestia);
                }
            } else if (Is.Weekly(note)) {
                if (note.title === '0000-W00') {
                    links = await note.findConnect(celestia, celestia);
                } else {
                    links = await note.findConnect(graph, celestia);
                }
            } else {
                let [founderTitle, founderText] = await note.findFounder(
                    celestia,
                    celestia,
                );

                let founder = new Note(founderTitle, founderText);
                links.push(founder, founder, founder);
            }
        } else {
            links = await note.findConnect(graph, celestia);
        }

        this.founder = links[0];
        this.ancestor = links[1];
        this.father = links[2];
    }

    async getFLinks(graph, celestia) {
        await this.getLinks(this.note, graph, celestia);

        let founder = this.founder.getLink(graph.alias.founder);
        let ancestor = this.ancestor.getLink(graph.alias.ancestor);
        let father = this.father.getLink(graph.alias.father);

        if (Is.Note(this.note)) {
            //имя содержит дату, но не является ежедневной заметкой
            let [date, OK] = Has.Date(this.note);
            if (OK) {
                ancestor += `[${graph.alias.ancestor}:: [[${date}#${date}|${date}]]]`;
            }
        }

        if (Is.Daily(this.note)) {
            const week = getLocalISOWeek(this.note.title);
            if (week) {
                ancestor += `\n[${graph.alias.ancestor}:: [[${week}#${week}|${week}]]]`;
            }
        }

        return [founder, ancestor, father].join('\n');
    }
}

module.exports = {
    Links,
};



// 🔹 FOLDER: ./source/class/note
// FILE: ./source/class/note/index-note.js
const { Note } = require('./note');
const { Human } = require('./note-human');
const { Periodic } = require('./note-periodic');
const { Daily } = require('./note-periodic-daily');
const { Weekly } = require('./note-periodic-weekly');
const { Thought } = require('./note-periodic-thought');
const { Dream } = require('./note-periodic-dream');

module.exports = {
    Note,
    Human,
    Periodic,
    Daily,
    Weekly,
    Dream,
    Thought,
};



// 🔹 FOLDER: ./source/scripts
// FILE: ./source/scripts/update.js
const { setNote } = require('./setNote');
const { Links } = require('../class/note/links');
const { Tager } = require('../class/note/noteTags');
const { getPlugin } = require('../core/store-plugin');

const plugin = getPlugin();

async function update(file, graph, celestia) {
    console.log(
        `---------------------------\n"${file.basename}"\n---------------------------`,
    );

    let title = file.basename;
    let text = await plugin.app.vault.read(file);
    let note = setNote(title, text);

    let links = new Links(note);
    let fLinks = await links.getFLinks(graph, celestia);
    let tags = await Tager.getTags(note, graph, celestia);

    let metadata = getNoteMetadata(file);
    let noteNewText = getNewNoteText(note, fLinks, tags, metadata);

    await plugin.app.vault.modify(file, noteNewText);
}

function getNoteMetadata(file) {
    const { ctime, mtime } = file.stat;
    return {
        createdAt: formatDate(ctime),
        updatedAt: formatDate(mtime)
    };
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
}

function getNewNoteText(note, fLinks, tags, metadata) {
    return [
        `[Дата создания:: [[${metadata.createdAt}]]]`,
        `[Дата изменения:: [[${metadata.updatedAt}]]]`,
        fLinks,
        `\n${tags}\n`,
        `# ${note.head}\n`,
        note.content
    ].join('\n');
}

module.exports = {
    update,
};



// 🔹 FOLDER: ./source/scripts
// FILE: ./source/scripts/setNote.js
const {
    Note,
    Human,
    Periodic,
    Daily,
    Weekly,
    Dream,
    Thought,
} = require('../class/note/index-note');
const { Is } = require('../class/note/note-subClasses');

function setNote(title, text) {
    let note = new Note(title, text);

    if (Is.Thought(note)) {
        note = new Thought(title, text);
    } else if (Is.Dream(note)) {
        note = new Dream(title, text);
    } else if (Is.Daily(note)) {
        note = new Daily(title, text);
    } else if (Is.Weekly(note)) {
        note = new Weekly(title, text);
    }

    return note;
}

module.exports = {
    setNote,
};



// 🔹 FOLDER: ./source/core
// FILE: ./source/core/store-plugin.js
let plugin = null;

function setPlugin(p) {
  plugin = p;
}

function getPlugin() {
  if (!plugin) {
    throw new Error("Plugin has not been initialized");
  }
  return plugin;
}

module.exports = {
  setPlugin,
  getPlugin,
};



// 🔹 FOLDER: ./source
// FILE: ./source/vault-Constants.js
const { Alias, World } = require('./class/note/note-subClasses');

const VOID_FOUNDER_ALIAS = 'herald';
const VOID_ANCESTOR_ALIAS = 'bubble';
const VOID_FATHER_ALIAS = 'arm';

const VOID_PATH = 'master/<9> void/';
const VOID_IDENT = new Alias(
    VOID_FOUNDER_ALIAS,
    VOID_ANCESTOR_ALIAS,
    VOID_FATHER_ALIAS,
);

/*
const PURGATORY_FOUNDER_ALIAS = "herald";
const PURGATORY_ANCESTOR_ALIAS = "bubble";
const PURGATORY_FATHER_ALIAS = "arm";

const PURGATORY_PATH = "master/<9> void/";
const PURGATORY_IDENT = new Alias(PURGATORY_FOUNDER_ALIAS, PURGATORY_ANCESTOR_ALIAS, PURGATORY_FATHER_ALIAS);
*/

const LIMB_FOUNDER_ALIAS = 'herald';
const LIMB_ANCESTOR_ALIAS = 'bubble';
const LIMB_FATHER_ALIAS = 'arm';

const LIMB_PATH = 'master/<9> void/';
const LIMB_IDENT = new Alias(
    LIMB_FOUNDER_ALIAS,
    LIMB_ANCESTOR_ALIAS,
    LIMB_FATHER_ALIAS,
);

const CELESTIA_FOUNER_ALIAS = 'archont';
const CELESTIA_ANCESTOR_ALIAS = 'band';
const CELESTIA_FATHER_ALIAS = 'mate';

const CELESTIA_PATH = 'master/<-9> celestia/';
const CELESTIA_IDENT = new Alias(
    CELESTIA_FOUNER_ALIAS,
    CELESTIA_ANCESTOR_ALIAS,
    CELESTIA_FATHER_ALIAS,
);

module.exports = {
    VOID_PATH,
    VOID_IDENT,
    //PURGATORY_PATH,
    //PURGATORY_IDENT,
    LIMB_PATH,
    LIMB_IDENT,
    CELESTIA_PATH,
    CELESTIA_IDENT,
};



// 🔹 FOLDER: ./comands
// FILE: ./comands/comand-UpdateNoteLinks.js
const { World } = require('../source/class/note/note-subClasses');
const { update } = require('../source/scripts/update');
const {
    VOID_PATH,
    CELESTIA_PATH,
    VOID_IDENT,
    CELESTIA_IDENT,
} = require('../source/vault-Constants');
const { getPlugin } = require('../source/core/store-plugin');

const plugin = getPlugin();

async function updateNoteLinks() {
    let ALL_FILES = await plugin.app.vault.getMarkdownFiles();
    let VOID_FILES = ALL_FILES.filter((file) =>
        file.path.startsWith(VOID_PATH),
    );
    let CELESTIA_FILES = ALL_FILES.filter((file) =>
        file.path.startsWith(CELESTIA_PATH),
    );

    let VOID = new World(VOID_FILES, VOID_PATH, VOID_IDENT);
    let CELESTIA = new World(CELESTIA_FILES, CELESTIA_PATH, CELESTIA_IDENT);

    VOID.files.sort((a, b) => (a.basename > b.basename ? 1 : -1));
    CELESTIA.files.sort((a, b) => (a.basename > b.basename ? 1 : -1));

    let file = plugin.app.workspace.getActiveFile();

    let GRAPH;
    if (file.path.includes(VOID_PATH)) {
        GRAPH = VOID;
    } else if (file.path.includes(CELESTIA_PATH)) {
        GRAPH = CELESTIA;
    } else {
        new Notice('Файл не принадлежит ни к VOID, ни к CELESTIA.');
        return;
    }
    await update(file, GRAPH, CELESTIA);
}

module.exports = {
    updateNoteLinks,
};



// 🔹 FOLDER: ./comands
// FILE: ./comands/comand-UpdateAllLinks.js
const { World } = require('../source/class/note/note-subClasses');
const { update } = require('../source/scripts/update');
const {
    VOID_PATH,
    CELESTIA_PATH,
    VOID_IDENT,
    CELESTIA_IDENT,
} = require('../source/vault-Constants');
const { getPlugin } = require('../source/core/store-plugin');

const plugin = getPlugin();

async function updateAllLinks() {
    let ALL_FILES = await plugin.app.vault.getMarkdownFiles();
    let VOID_FILES = ALL_FILES.filter((file) =>
        file.path.startsWith(VOID_PATH),
    );
    let CELESTIA_FILES = ALL_FILES.filter((file) =>
        file.path.startsWith(CELESTIA_PATH),
    );

    let VOID = new World(VOID_FILES, VOID_PATH, VOID_IDENT);
    let CELESTIA = new World(CELESTIA_FILES, CELESTIA_PATH, CELESTIA_IDENT);

    VOID.files.sort((a, b) => (a.basename > b.basename ? 1 : -1));
    CELESTIA.files.sort((a, b) => (a.basename > b.basename ? 1 : -1));

    for (let file of CELESTIA.files) {
        await update(file, CELESTIA, CELESTIA);
    }

    for (let file of VOID.files) {
        await update(file, VOID, CELESTIA);
    }
}

module.exports = {
    updateAllLinks,
};



// 🔹 FOLDER: ./comands
// FILE: ./comands/comand-NewPeriodicNote.js
const { getPlugin } = require("../source/core/store-plugin");

const plugin = getPlugin();

async function newPeriodicNote() {
  let file = plugin.app.workspace.getActiveFile();
  let title = file.basename;

  if (/^\d{4}-\d{2}-\d{2}$/.test(title)) {
    let allFiles = await plugin.app.vault.getMarkdownFiles();
    let voidFiles = allFiles.filter((file) =>
      file.path.startsWith("master/<9> void/")
    );
    let create = ["Сон", "Мысль", "Анализ", "Самоанализ"];
    let name = await plugin.helpers.suggest(create, create);
    name = name.charAt(0).toLowerCase() + name.slice(1);

    let dreamFiles = voidFiles.filter((file) =>
      file.basename.startsWith(`${name}.${title}.<`)
    );

    let maxNumber = 0;
    dreamFiles.forEach((file) => {
      const number = parseInt(
        file.basename.split(".").pop().replace("<", "").replace(">", "")
      );
      if (number > maxNumber) {
        maxNumber = number;
      }
    });

    const newFileName = `master/<9> void/${name}.${title}.<${
      maxNumber + 1
    }>.md`;
    await app.vault.create(newFileName, "").catch((error) => {
      console.error(`Ошибка при создании файла: ${error}`);
    });
  } else {
    new Notice("Заметка не является ежедневной");
  }
}

module.exports = {
  newPeriodicNote,
};



// 🔹 FOLDER: .
// FILE: ./main.js
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


