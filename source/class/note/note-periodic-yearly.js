const { Has } = require('./note-subClasses');
const { Periodic } = require('./note-periodic');

class Yearly extends Periodic {
    constructor(TITLE, TEXT) {
        console.log('Yearly constructor');

        super(TITLE, TEXT);
    }

    async findFounder(graph, celestia) {
        let founder;

        let [date, ok] = Has.Year(this);
        if (ok && date !== '0000') {
            founder = await this.find(graph, '0000');
        } else if (ok && date === '0000') {
            founder = await this.find(
                celestia,
                '<4>❤️‍🔥.календарь.tasks.периодическая.monthly',
            );
        }

        console.log(`    Yearly founder:\n    "${date}"`);

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
    Yearly,
};
