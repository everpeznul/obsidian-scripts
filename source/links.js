const { Is, Has } = require('./subClasses');
const { Note } = require('./noteClasses');


class Links {

    async getLinks(note, graph, celestia) {

        let links = [];

        if (note.len === 1) {

            if (Is.Daily(note)) {

                if (note.title === "0000-00-00") {

                    links = await note.findConnect(celestia, celestia);
                }
                else {

                    links = await note.findConnect(graph, celestia);
                }
            }
            else {

                let [founderTitle, founderText] = await note.findFounder(celestia, celestia);

                let founder = new Note(founderTitle, founderText);
                links.push(founder, founder, founder);
            }
        }
        else {

            links = await note.findConnect(graph, celestia);
        }

        this.founder = links[0];
        this.ancestor = links[1];
        this.father = links[2];
    }

    constructor(note) {

        this.note = note;

    }

    async getFLinks(graph, celestia) {

        await this.getLinks(this.note, graph, celestia)

        let founder = this.founder.getLink(graph.alias.founder);
        let ancestor = this.ancestor.getLink(graph.alias.ancestor);
        let father = this.father.getLink(graph.alias.father);

        if (Is.Note(this.note)) {

            //имя содержит дату, но не является ежедневной заметкой
            let [date, OK] = Has.Date(this.note);
            if (OK) {

                ancestor += `[${graph.alias.ancestor}:: [[${date}#${date}|${date}]]]`;
            }
        }

        return [founder, ancestor, father].join("\n");
    }
}


module.exports = {

    Links
};