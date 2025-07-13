const { Has } = require('./note-subClasses');
const { Periodic } = require('./note-periodic');

class Monthly extends Periodic {
    constructor(TITLE, TEXT) {
        console.log('Monthly constructor');

        super(TITLE, TEXT);
    }

    async findFounder(graph, celestia) {
        let founder;

        let [date, ok] = Has.Month(this);
        if (ok && date !== '0000-00') {
            founder = await this.find(graph, '0000-00');
        } else if (ok && date === '0000-00') {
            founder = await this.find(
                celestia,
                '<4>❤️‍🔥.календарь.tasks.периодическая.monthly',
            );
        }

        console.log(`    Monthly founder:\n    "${date}"`);

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
    Monthly,
};
