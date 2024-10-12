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
