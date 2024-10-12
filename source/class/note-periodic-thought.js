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
