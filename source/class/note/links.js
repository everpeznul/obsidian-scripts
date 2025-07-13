const { Is, Has } = require('./note-subClasses');
const { Note } = require('./note');

function getLocalISOWeek(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return null;

    const day = date.getDay() || 7; // воскресенье = 7
    date.setDate(date.getDate() + 4 - day); // перейти к четвергу ISO-недели

    const yearStart = new Date(date.getFullYear(), 0, 1);
    const diff = (date - yearStart) / 86400000;

    const week = Math.ceil((diff + 1) / 7);
    const year = date.getFullYear();

    return `${year}-W${String(week).padStart(2, '0')}`;
}

function getQuarter(title) {
    const monthMatch = title.match(/^(\d{4})-(0[1-9]|1[0-2])/);
    if (!monthMatch) return null;
    
    const year = monthMatch[1];
    const month = parseInt(monthMatch[2]);
    const quarter = Math.ceil(month / 3);
    
    return `${year}-Q${quarter}`;
}

function getMonthFromWeek(weekTitle) {
    const match = weekTitle.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return null;
    
    const year = parseInt(match[1]);
    const week = parseInt(match[2]);
    
    // Рассчитываем дату первого дня недели (понедельник)
    const jan4 = new Date(year, 0, 4); // 4 января всегда в первой неделе ISO
    const firstWeekStart = new Date(jan4.getTime() - (jan4.getDay() || 7 - 1) * 24 * 60 * 60 * 1000);
    
    // Добавляем нужное количество недель
    const weekStart = new Date(firstWeekStart.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    
    const monthNum = String(weekStart.getMonth() + 1).padStart(2, '0');
    return `${weekStart.getFullYear()}-${monthNum}`;
}

function getQuarterFromWeek(weekTitle) {
    const month = getMonthFromWeek(weekTitle);
    if (!month) return null;
    
    const monthMatch = month.match(/^(\d{4})-(\d{2})$/);
    if (!monthMatch) return null;
    
    const year = monthMatch[1];
    const monthNum = parseInt(monthMatch[2]);
    const quarter = Math.ceil(monthNum / 3);
    
    return `${year}-Q${quarter}`;
}

function getQuarterFromMonth(monthTitle) {
    const match = monthTitle.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
    if (!match) return null;
    
    const year = match[1];
    const month = parseInt(match[2]);
    const quarter = Math.ceil(month / 3);
    
    return `${year}-Q${quarter}`;
}


class Links {
    constructor(note) {
        this.note = note;
    }

    async getLinks(note, graph, celestia) {
        let links = [];

        if (note.len === 1) {
            if (Is.Daily(note)) {
                if (note.title === '0000-00-00') {
                    links = await note.findConnect(celestia, celestia);
                } else {
                    links = await note.findConnect(graph, celestia);
                }
            } else if (Is.Weekly(note)) {
                if (note.title === '0000-W00') {
                    links = await note.findConnect(celestia, celestia);
                } else {
                    links = await note.findConnect(graph, celestia);
                }
            } else if (Is.Monthly(note)) {
                if (note.title === '0000-00') {
                    links = await note.findConnect(celestia, celestia);
                } else {
                    links = await note.findConnect(graph, celestia);
                }
            } else if (Is.Quarterly(note)) {
                if (note.title === '0000-Q0') {
                    links = await note.findConnect(celestia, celestia);
                } else {
                    links = await note.findConnect(graph, celestia);
                }
            } else if (Is.Yearly(note)) {
                if (note.title === '0000') {
                    links = await note.findConnect(celestia, celestia);
                } else {
                    links = await note.findConnect(graph, celestia);
                }
            } else {
                let [founderTitle, founderText] = await note.findFounder(
                    celestia,
                    celestia,
                );

                let founder = new Note(founderTitle, founderText);
                links.push(founder, founder, founder);
            }
        } else {
            links = await note.findConnect(graph, celestia);
        }

        this.founder = links[0];
        this.ancestor = links[1];
        this.father = links[2];
    }

    async getFLinks(graph, celestia) {
        await this.getLinks(this.note, graph, celestia);

        let founder = this.founder.getLink(graph.alias.founder);
        let ancestor = this.ancestor.getLink(graph.alias.ancestor);
        let father = this.father.getLink(graph.alias.father);

        if (Is.Note(this.note)) {
            //имя содержит дату, но не является ежедневной заметкой
            let [date, dateok] = Has.Date(this.note);
            if (dateok) {
                ancestor += `\n[${graph.alias.ancestor}:: [[${date}#${date}|${date}]]]`;
            }

            let [week, weekok] = Has.Week(this.note);
            if (weekok) {
                ancestor += `\n[${graph.alias.ancestor}:: [[${week}#${week}|${week}]]]`;
            }

            let [month, monthok] = Has.Month(this.note);
            if (monthok) {
                ancestor += `\n[${graph.alias.ancestor}:: [[${month}#${month}|${month}]]]`;
            }

            let [quarter, quarterok] = Has.Quarter(this.note);
            if (quarterok) {
                ancestor += `\n[${graph.alias.ancestor}:: [[${quarter}#${quarter}|${quarter}]]]`;
            }

            let [year, yearok] = Has.Year(this.note);
            if (yearok) {
                ancestor += `\n[${graph.alias.ancestor}:: [[${year}#${year}|${year}]]]`;
            }
        }

        if (Is.Daily(this.note)) {

            const week = getLocalISOWeek(this.note.title);
            if (week) {
                ancestor += `\n[${graph.alias.ancestor}:: [[${week}#${week}|${week}]]]`;
            }
            
            const quarter = getQuarter(this.note.title);
            if (quarter) {
                ancestor += `\n[${graph.alias.ancestor}:: [[${quarter}#${quarter}|${quarter}]]]`;
            }
        }

        if (Is.Weekly(this.note)) {
            // Месяц (в котором начинается неделя)
            const month = getMonthFromWeek(this.note.title);
            if (month) {
                ancestor += `\n[${graph.alias.ancestor}:: [[${month}#${month}|${month}]]]`;
            }
            
            // Квартал
            const quarter = getQuarterFromWeek(this.note.title);
            if (quarter) {
                ancestor += `\n[${graph.alias.ancestor}:: [[${quarter}#${quarter}|${quarter}]]]`;
            }
        }

        if (Is.Monthly(this.note)) {
            // Квартал
            const quarter = getQuarterFromMonth(this.note.title);
            if (quarter) {
                ancestor += `\n[${graph.alias.ancestor}:: [[${quarter}#${quarter}|${quarter}]]]`;
            }
        }

        return [founder, ancestor, father].join('\n');
    }
}

module.exports = {
    Links,
};
