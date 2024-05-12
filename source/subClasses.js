

let plugin;

function setPlugin2(plug) {

    plugin = plug;
}

class Ident {

    path;

    founderAlias;
    ancestorAlias;
    fatherAlias;

    constructor(path, founderAlias, ancestorAlias, fatherAlias) {

        this.path = path;

        this.founderAlias = founderAlias;
        this.ancestorAlias = ancestorAlias;
        this.fatherAlias = fatherAlias;
    }
}

class World {

    files;
    ident;

    constructor(files, ident) {

        this.files = files;
        this.ident = ident;
    }
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

class Links {
    note;

    founder;
    ancestor;
    father;

    ident;

    constructor(note, IDENT, founder, ancestor, father) {

        this.note = note;

        this.founder = founder;
        this.ancestor = ancestor;
        this.father = father;

        this.ident = IDENT;

    }

    getFLinks() {

        let FOUNDER_RETURN = this.founder.getLink(this.ident.founderAlias);
        let ANCESTOR_RETURN = this.ancestor.getLink(this.ident.ancestorAlias);
        let FATHER_RETURN = this.father.getLink(this.ident.fatherAlias);

        if (Is.Note(this.note)) {
            //имя содержит дату, но не является ежедневной заметкой
            let [date, OK] = Has.Date(this.note);
            if (OK) {
                ANCESTOR_RETURN += `[${this.ident.ancestorAlias}:: [[${date}#${date}|${date}]]]`;
            }
        }

        return [FOUNDER_RETURN, ANCESTOR_RETURN, FATHER_RETURN].join("\n");
    }
}


module.exports = {

    setPlugin2,
    Ident,
    World,
    Word,
    Is,
    Has,
    Links
};