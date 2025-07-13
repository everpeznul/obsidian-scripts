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

    static Monthly(note) {
        return /^\d{4}-\d{2}$/.test(note.title);
    }
    
    static Quarterly(note) {
        return /^\d{4}-Q\d{1}$/.test(note.title);
    }

    static Yearly(note) {
        return /^\d{4}$/.test(note.title);
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

    static Month(note) {
        let match = note.title.match(/(\d{4}-\d{2})/);
        if (match) {
            return [match[1], true];
        } else {
            return [null, false];
        }
    }

    static Quarter(note) {
        let match = note.title.match(/(\d{4}-Q\d{1})/);
        if (match) {
            return [match[1], true];
        } else {
            return [null, false];
        }
    }

    static Year(note) {
        let match = note.title.match(/(\d{4})/);
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
