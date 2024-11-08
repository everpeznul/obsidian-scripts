const {
    Note,
    Human,
    Periodic,
    Daily,
    Dream,
    Thought,
} = require('../class/note/index-note');
const { Is } = require('../class/note/note-subClasses');

function setNote(title, text) {
    let note = new Note(title, text);

    if (Is.Thought(note)) {
        note = new Thought(title, text);
    } else if (Is.Dream(note)) {
        note = new Dream(title, text);
    } else if (Is.Daily(note)) {
        note = new Daily(title, text);
    }

    return note;
}

module.exports = {
    setNote,
};
