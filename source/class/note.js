const { Word } = require("./note-subClasses");
const { getPlugin } = require("../core/store-plugin");

const plugin = getPlugin();

class Note {
  //методы установки полей класса

  getTitle(TITLE) {
    return TITLE;
  }

  getWords() {
    let temp = [];
    for (const WORD of this.title.split(".")) {
      temp.push(new Word(WORD));
    }

    return temp;
  }

  getLen() {
    return this.words.length;
  }

  getName() {
    return this.words[this.len - 1];
  }

  getHead() {
    let temp;

    if (this.name.isOrder()) {
      temp = [
        this.name.getFContent(),
        this.words[this.len - 2].getFContent(),
      ].join(" ");
    } else {
      temp = this.name.getFContent();
    }

    return temp;
  }

  getText(TEXT) {
    return TEXT;
  }

  getContent() {
    return this.text.split(/^# .*$/gm).pop();
  }

  //инициализация значений в конструкторе

  constructor(TITLE, TEXT) {
    console.log("Note constructor");

    this.title = this.getTitle(TITLE);
    this.words = this.getWords();
    this.len = this.getLen();
    this.name = this.getName();
    this.head = this.getHead();
    this.text = this.getText(TEXT);
    this.content = this.getContent();
  }

  //методы форматированного доступа к полям класса

  getSWords(start = 0, end = this.len) {
    let temp = [];
    for (let word of this.words.slice(start, end)) {
      temp.push(word.text);
    }

    return temp;
  }

  //методы поиска других заметок

  async find(graph, reqTitle, create = true) {
    let reqFile;

    reqFile = graph.files.find((file) => file.basename.endsWith(reqTitle));

    if (!reqFile) {
      if (create) {
        const { update } = require("./vault-updateLinks");

        try {
          await plugin.app.vault.create(
            graph.path + reqTitle + ".md",
            "\n# temp"
          );

          console.log(
            `        Заметка "${reqTitle}" успешно создана в "${graph.path}"`
          );
        } catch (error) {
          console.error(
            `        Ошибка: заметка "${reqTitle}" уже существует в "${graph.path}"`,
            error
          );
        }

        let filesNew = await plugin.app.vault.getMarkdownFiles();
        graph.files = filesNew.filter((file) =>
          file.path.startsWith(graph.path)
        );
        graph.files.sort((a, b) => (a.basename > b.basename ? 1 : -1));

        reqFile = graph.files.find((file) => file.basename.endsWith(reqTitle));

        await update(reqFile, graph);
      } else {
        console.error(
          `        Ошибка: не получилось создать заметку "${reqTitle}" в "${graph.path}"`
        );

        return null;
      }
    }

    let fileTitle = reqFile.basename;
    let reqText = await plugin.app.vault.read(reqFile);

    return [fileTitle, reqText];
  }

  async findFounder(graph, celestia) {
    let founderTitle = this.words[0].text;
    console.log(`    Note founder:\n        "${founderTitle}"`);

    let founder = await this.find(graph, founderTitle);

    return founder;
  }

  async findAncestor(graph, celestia) {
    let temp = [];

    if (this.len > 2) {
      for (let i = this.len - 2; i >= 0; i--) {
        if (!this.words[i].isCategory()) {
          temp = this.getSWords()
            .slice(0, i + 1)
            .join(".");
          break;
        }
      }
    } else {
      temp = this.words[0].text;
    }

    let ancestorTitle = temp;

    console.log(`    Note ancestor:\n        "${ancestorTitle}"`);

    let ancestor = await this.find(graph, ancestorTitle);

    return ancestor;
  }

  async findFather(graph, celestia) {
    if (this.len > 1) {
      let fatherTitle = this.getSWords(0, this.len - 1).join(".");

      console.log(`    Note father:\n        "${fatherTitle}"`);

      let father = await this.find(graph, fatherTitle, false);

      if (father != null) {
        return father;
      } else if (fatherTitle.endsWith("%")) {
        console.log(
          `    Note father_dif:\n        "${fatherTitle.slice(0, -1)}"`
        );

        father = await this.find(graph, fatherTitle.slice(0, -1));

        return father;
      }
    }
  }

  async findConnect(graph, celestia) {
    console.log("Note connect");

    let [founderTitle, founderText] = await this.findFounder(graph, celestia);
    let [ancestorTitle, ancestorText] = await this.findAncestor(
      graph,
      celestia
    );
    let [fatherTitle, fatherText] = await this.findFather(graph, celestia);

    let founder = new Note(founderTitle, founderText);
    let ancestor = new Note(ancestorTitle, ancestorText);
    let father = new Note(fatherTitle, fatherText);

    return [founder, ancestor, father];
  }

  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

  logData() {
    console.log("\n");
    console.log(this.title + "\n");
    console.log(this.words + "\n");
    console.log(this.len + "\n");
    console.log(this.name + "\n");
    console.log(this.head + "\n");
    console.log(this.text + "\n");
    console.log(this.content + "\n");
  }

  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

  getLink(IDENT) {
    return `[${IDENT}:: [[${this.title}#${this.head}|${this.head}]]]`;
  }
}

module.exports = {
  Note,
};
