function setNote(title, text) {

    let note = new Note(title, text);

    if (Is.Thought(note)) {

        note = new Thought(title, text);
    }
    else if (Is.Dream(note)) {

        note = new Dream(title, text);
    }
    else if (Is.Daily(note)) {

        note = new Daily(title, text);
    }

    return note;
}