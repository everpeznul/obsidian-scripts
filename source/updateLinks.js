const { setPlugin2, Ident, World, Word, Is, Has, Links } = require('./subClasses');
const { setPlugin1, Note, Human, Periodic, Dream, Thought, Daily } = require('./noteClasses');


async function update(FILE, WORLD, CELESTIA, plug) {

    plugin = plug;

    console.log(`---------------------------\n"${FILE.basename}"\n---------------------------`);

    let TITLE = FILE.basename;
    const TEXT = await plugin.app.vault.read(FILE);

    let note = new Note(TITLE, TEXT);

    if (Is.Thought(note)) {

        note = new Thought(TITLE, TEXT);
    }
    else if (Is.Dream(note)) {

        note = new Dream(TITLE, TEXT);
    }
    else if (Is.Daily(note)) {

        note = new Daily(TITLE, TEXT);
    }

    let l = [];

    if (note.len === 1) {
        if (Is.Daily(note)) {

            if (note.title === "0000-00-00") {

                l = await note.findConnect(CELESTIA, CELESTIA);
            }
            else {

                l = await note.findConnect(WORLD, CELESTIA);
            }
        }
        else {

            let [founderTitle, founderText] = await note.findFounder(CELESTIA, CELESTIA);

            let f = new Note(founderTitle, founderText);
            l.push(f, f, f);
        }
    }
    else {

        l = await note.findConnect(WORLD, CELESTIA);
    }

    let [founder, ancestor, father] = l;

    let links = new Links(note, WORLD.ident, founder, ancestor, father);

    let tag = await note.findTag(WORLD, CELESTIA);

    const NOTE_TEXT_NEW = [links.getFLinks(), tag, `# ${note.head}`, note.content].join("\n");

    await plugin.app.vault.modify(FILE, NOTE_TEXT_NEW);
}


module.exports = {

    update
};