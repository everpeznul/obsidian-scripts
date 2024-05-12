const { } = require('./vaultConstants');
const { setPlugin2, Ident, World, Word, Is, Has, Links } = require('./subClasses');



let plugin

function setPlugin1(plug) {

    plugin = plug;
}

class Note {

    title;   //строка
    words;   //массив Word
    len;     //число
    name;    //Word
    head;    //строка
    text;    //строка
    content; //строка

    constructor(TITLE, TEXT) {

        console.log("Note constructor");

        //title
        this.title = TITLE;

        //words
        this.words = [];
        for (const WORD of this.title.split(".")) {

            this.words.push(new Word(WORD));
        }

        //len
        this.len = this.words.length;

        //name
        this.name = this.words[this.len - 1];

        //head
        if (this.name.isOrder()) {

            this.head = [this.name.getFContent(), this.words[this.len - 2].getFContent()].join(" ");
        }
        else {

            this.head = this.name.getFContent();
        }

        //text
        this.text = TEXT;

        //content
        this.content = this.text.split(/^# .*$/gm).pop();
    }

    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    getSWords(start = 0, end = this.len) {

        let temp = [];
        for (let i = start; i < end; i++) {

            temp.push(this.words[i].text);

        }

        return temp;
    }

    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    async find(WORLD, TITLE, CREATE = true) {

        let FILE;

        FILE = WORLD.files.find(file => file.basename.endsWith(TITLE));

        if (!FILE && CREATE) {

            try {

                await plugin.app.vault.create(WORLD.ident.path + TITLE + ".md", "\n# temp");

                console.log(`        Заметка "${TITLE}" успешно создана в "${WORLD.ident.path}"`);
            }
            catch {

                console.error(`        Ошибка: не получилось создать заметку "${TITLE}" в "${WORLD.ident.path}"`, error);
            }

            let NEW_FILES = await plugin.app.vault.getMarkdownFiles();
            WORLD.files = NEW_FILES.filter(file => file.path.startsWith(WORLD.ident.path));
            WORLD.files.sort((a, b) => a.basename > b.basename ? 1 : -1);

            FILE = WORLD.files.find(file => file.basename.endsWith(TITLE));

            await update(FILE, WORLD);

        }
        else if (!CREATE) {

            return FILE;
        }

        let fileTitle = FILE.basename;
        let TEXT = await plugin.app.vault.read(FILE);

        return [fileTitle, TEXT];
    }

    async findFounder(WORLD, CELESTIA) {

        const FOUNDER_TITLE = this.words[0].text;
        console.log(`    Note founder:\n        "${FOUNDER_TITLE}"`);

        const FOUNDER = await this.find(WORLD, FOUNDER_TITLE);

        return FOUNDER;
    }

    async findAncestor(WORLD, CELESTIA) {

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

        const ANCESTOR_TITLE = temp;

        console.log(`    Note ancestor:\n        "${ANCESTOR_TITLE}"`);


        const ANCESTOR = await this.find(WORLD, ANCESTOR_TITLE);

        return ANCESTOR;
    }

    async findFather(WORLD, CELESTIA) {

        if (this.len > 1) {

            const FATHER_TITLE = this.getSWords(0, this.len - 1).join(".");

            console.log(`    Note father:\n        "${FATHER_TITLE}"`);

            let FATHER = await this.find(WORLD, FATHER_TITLE, false);

            if (FATHER) {

                return [FATHER.basename, await plugin.app.vault.read(FATHER)];
            }
            else if (FATHER_TITLE.endsWith("%")) {

                console.log(`    Note father_dif:\n        "${FATHER_TITLE.slice(0, -1)}"`);

                FATHER = await this.find(WORLD, FATHER_TITLE.slice(0, -1));

                return FATHER;
            }
        }
    }

    async findConnect(WORLD, CELESTIA) {
        console.log("Note connect");

        let [founderTitle, founderText] = await this.findFounder(WORLD, CELESTIA);
        let [ancestorTitle, ancestorText] = await this.findAncestor(WORLD, CELESTIA);
        let [fatherTitle, fatherText] = await this.findFather(WORLD, CELESTIA);

        let founder = new Note(founderTitle, founderText);
        let ancestor = new Note(ancestorTitle, ancestorText);
        let father = new Note(fatherTitle, fatherText);

        return [founder, ancestor, father];
    }

    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    async findTag(WORLD, CELESTIA) {

        let file = await this.findFounder(CELESTIA, CELESTIA);
        let title = file[0];
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

        return `\n#${tag}`;
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

    constructor(TITLE, TEXT) {
        console.log("Human constructor");

        super(TITLE, TEXT);


        //head
        this.head = this.name.getFContent().split(" ")[1];
    }
}

class Periodic extends Note {

    constructor(TITLE, TEXT) {

        super(TITLE, TEXT);
        console.log("this is periodic constructor");

    }
}

class Dream extends Periodic {

    constructor(TITLE, TEXT) {
        console.log("Dream constructor");

        super(TITLE, TEXT);

        //head
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
        this.head = DREAM_NUMBER[this.name.getFContent()];
    }

    async findAncestor(WORLD, CELESTIA) {

        const [DATE, OK] = Has.Date(this);
        if (OK) {

            console.log(`    Thought ancestor:\n    "${DATE}"`);
            const ANCESTOR = await this.find(WORLD, DATE);

            return ANCESTOR;
        }
    }
    async findFather(WORLD, CELESTIA) {

        return this.findFounder(WORLD);
    }
}

class Thought extends Periodic {

    constructor(TITLE, TEXT) {
        console.log("Thought constructor");

        super(TITLE, TEXT);

        //head
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
        this.head = THOUGHT_NUMBER[this.name.getFContent()];
    }

    async findAncestor(WORLD, CELESTIA) {

        const [DATE, OK] = Has.Date(this);
        if (OK) {

            console.log(`Thought ancestor:\n    "${DATE}"`);
            const ANCESTOR = await this.find(WORLD, DATE);

            return ANCESTOR;
        }
    }
    async findFather(WORLD, CELESTIA) {

        return this.findFounder(WORLD);
    }
}

class Daily extends Periodic {

    constructor(TITLE, TEXT) {
        console.log("Daily constructor");

        super(TITLE, TEXT);
    }

    async findFounder(WORLD, CELESTIA) {

        let FOUNDER;

        const [DATE, OK] = Has.Date(this);
        if (OK && (DATE !== "0000-00-00")) {

            FOUNDER = await this.find(WORLD, "0000-00-00");
        }
        else if (OK && DATE === "0000-00-00") {

            FOUNDER = await this.find(CELESTIA, "<1>❤️‍🔥.календарь.периодическая.daily");
        }

        console.log(`    Daily founder:\n    "${DATE}"`)

        return FOUNDER;
    }

    async findAncestor(WORLD, CELESTIA) {

        return this.findFounder(WORLD, CELESTIA);
    }

    async findFather(WORLD, CELESTIA) {

        return this.findFounder(WORLD, CELESTIA);;
    }

    async findTag(WORLD, CELESTIA) {

        let [founder_title, founder_text] = await this.findFounder(WORLD, CELESTIA);
        let note = new Note(founder_title, founder_text);

        if (Is.Daily(note)) {

            note = new Daily(founder_title, founder_text);
        }

        let new_founder = await note.findFounder(CELESTIA, CELESTIA);
        let title = new_founder[0];

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

        return `\n#${tag}`;
    }
}

module.exports = {

    setPlugin1,
    Note,
    Human,
    Periodic,
    Dream,
    Thought,
    Daily
};