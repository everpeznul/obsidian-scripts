const { setNote } = require("./setNote");

const { Links } = require("../class/links");
const { Tager } = require("../class/noteTags");
const { getPlugin } = require("../core/store-plugin");

const plugin = getPlugin();

async function update(file, graph, celestia) {
  console.log(
    `---------------------------\n"${file.basename}"\n---------------------------`
  );

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
  update,
};
