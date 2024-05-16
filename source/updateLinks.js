const { setNote } = require('./noteClasses');

const { Links } = require('./links');
const { Tager } = require('./tags');


async function update(plugin, file, graph, celestia) {

    console.log(`---------------------------\n"${file.basename}"\n---------------------------`);

    let title = file.basename;
    let text = await plugin.app.vault.read(file);

    let note = setNote(title, text);

    let links = new Links(note);
    let fLinks = await links.getFLinks(graph, celestia);

    let tags = await Tager.getTags(note, graph, celestia);

    let noteNewText = getNewNoteText(note, fLinks, tags);

    await plugin.app.vault.modify(file, noteNewText);
}

function getNewNoteText(note, fLinks, tags) {

    return [fLinks, `\n${tags}\n`, `# ${note.head}\n`, note.content].join("\n");
}


module.exports = {

    update
};