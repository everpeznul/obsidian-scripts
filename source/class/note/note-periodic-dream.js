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
