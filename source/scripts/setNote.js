const {
    Note,
    Human,
    Periodic,
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Yearly,
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
    } else if (Is.Weekly(note)) {
        note = new Weekly(title, text);
    } else if (Is.Monthly(note)) {
        note = new Monthly(title, text);
    } else if (Is.Quarterly(note)) {
        note = new Quarterly(title, text);
    } else if (Is.Yearly(note)) {
        note = new Yearly(title, text);
    } 

    return note;
}

module.exports = {
    setNote,
};
