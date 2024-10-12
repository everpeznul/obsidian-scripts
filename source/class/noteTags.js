const { setNote } = require("../scripts/setNote");

class Tager {
  constructor() {}

  static async getTags(note, graph, celestia) {
    let temp = [];

    let mainTag = await this.getMainTag(note, graph, celestia);
    temp.push(mainTag);

    /*
        for (let tag of this.getCategoryTags(note)) {

            tepm.push(tag);
        }
        */

    return temp;
  }

  static async getMainTag(note, graph, celestia) {
    //должно гарантироваться, что note прошла через setNote()
    let tempFile = await note.findFounder(graph, celestia);
    let tempNote = setNote(tempFile[0], tempFile[1]);
    let [founder_title, founder_text] = await tempNote.findFounder(
      celestia,
      celestia
    );

    let title = founder_title;

    let tag;

    if (title.includes("❤️‍🔥")) {
      tag = "реализация";
    } else if (title.includes("🪨")) {
      tag = "саморазвитие";
    } else if (title.includes("🌊")) {
      tag = "личное";
    } else if (title.includes("🌬️")) {
      tag = "духовность";
    }

    return `#${tag}`;
  }

  static getCategoryTags(note) {
    return [];
  }
}

module.exports = {
  Tager,
};
