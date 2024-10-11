class Daily extends Periodic {

    constructor(TITLE, TEXT) {
        console.log("Daily constructor");

        super(TITLE, TEXT);
    }

    async findFounder(graph, celestia) {

        let founder;

        let [date, ok] = Has.Date(this);
        if (ok && date !== "0000-00-00") {

            founder = await this.find(graph, "0000-00-00");
        }
        else if (ok && date === "0000-00-00") {

            founder = await this.find(celestia, "<1>❤️‍🔥.календарь.периодическая.daily");
        }

        console.log(`    Daily founder:\n    "${date}"`)

        return founder;
    }

    async findAncestor(graph, celestia) {

        return this.findFounder(graph, celestia);
    }

    async findFather(graph, celestia) {

        return this.findFounder(graph, celestia);;
    }
}