const { setNote } = require('./setNote');
const { Links } = require('../class/note/links');
const { Tager } = require('../class/note/noteTags');
const { getPlugin } = require('../core/store-plugin');

const plugin = getPlugin();

async function update(file, graph, celestia) {
    console.log(
        `---------------------------\n"${file.basename}"\n---------------------------`,
    );

    let title = file.basename;
    let text = await plugin.app.vault.read(file);
    let note = setNote(title, text);

    let links = new Links(note);
    let fLinks = await links.getFLinks(graph, celestia);
    let tags = await Tager.getTags(note, graph, celestia);

    let metadata = getNoteMetadata(file);
    let noteNewText = getNewNoteText(note, fLinks, tags, metadata);

    await plugin.app.vault.modify(file, noteNewText);
}

function getNoteMetadata(file) {
    const { ctime, mtime } = file.stat;
    return {
        createdAt: formatDate(ctime),
        updatedAt: formatDate(mtime)
    };
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
}

function getNewNoteText(note, fLinks, tags, metadata) {
    return [
        `[Дата создания:: [[${metadata.createdAt}]]]`,
        `[Дата изменения:: [[${metadata.updatedAt}]]]`,
        fLinks,
        `\n${tags}\n`,
        `# ${note.head}\n`,
        note.content
    ].join('\n');
}

module.exports = {
    update,
};
