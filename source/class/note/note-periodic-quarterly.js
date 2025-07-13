const { Has } = require('./note-subClasses');
const { Periodic } = require('./note-periodic');

class Quarterly extends Periodic {
    constructor(TITLE, TEXT) {
        console.log('Quarterly constructor');

        super(TITLE, TEXT);
    }

    async findFounder(graph, celestia) {
        let founder;

        let [date, ok] = Has.Quarter(this);
        if (ok && date !== '0000-Q0') {
            founder = await this.find(graph, '0000-Q0');
        } else if (ok && date === '0000-Q0') {
            founder = await this.find(
                celestia,
                '<4>❤️‍🔥.календарь.tasks.периодическая.quarterly',
            );
        }

        console.log(`    Quarterly founder:\n    "${date}"`);

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
    Quarterly,
};
