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
