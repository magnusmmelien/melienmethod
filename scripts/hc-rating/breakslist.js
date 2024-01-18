//const indexOfMin = arr => arr.reduce((prev, curr, i, a) => curr < a[prev] ? i : prev, 0);
function removeSmallest(numbers) {
    const copy = numbers.slice(0);
    let smallestValue = numbers.indexOf(Math.min(...numbers));
    copy.splice(smallestValue, 1);
    return copy;
}

export class BreaksEntry {
    constructor(inputName) {
        this.name = inputName;
        this.highbreak = 0;
        this.breaks = [];
    }

    static fromJSON(json) {
        var { name, highbreak, breaks } = json;
        //console.log('debug: Player.fromJSON():' + `name=${name}, club=${club}, rating=${rating}, robust=${robust}`);
        //console.log('robust =' + robust + ', typeof(robust) =' + typeof(robust));
        const entry = new BreaksEntry(name);
        entry.setHighbreak(Number(highbreak));
        if (!breaks) breaks = [];
        breaks.forEach(breakData => {
            entry.importBreak(Number(breakData));
        });
        return entry;
    }

    addBreak(x) {
        if (x < 25 || x > 155) {
            console.error('Error: tried to enter break (' + x + ') outside of bounds');
            alert('Error: tried to enter break (' + x + ') outside of bounds');
            return;
            throw new Error('Error: tried to enter break (' + x + ') outside of bounds');
        }
        if (this.breaks.length > 127) {
            console.warn('Maximum number of registered breaks (128) reached; smallest entry will be removed');
            alert('Maximum number of registered breaks (128) reached; smallest entry will be removed');
            removeSmallest(this.breaks);
        }

        if (x > this.highbreak) {
            this.highbreak = x;
            this.breaks.push(x);
            // delete breaks under half of new highbreak? no..?
        }
        else if (x > this.highbreak/2) this.breaks.push(x);
        else console.warn('Tried to add break (' + x + ') to breaks list which is too low compared to players current high break.');
    }
    setHighbreak(x) {this.highbreak = x;}
    importBreak(x) {this.breaks.push(x);}

    getName() {return this.name;}
    getHighbreak() {return this.highbreak;}
    getBreaks() {return this.breaks;}
    getSize() {return this.breaks.length;}
}

export class BreaksList {
    constructor(name) {
        if (name.includes('_')) {
            console.log(`Invalid input while constructing BreaksList ${name}, please try again.`);
            throw new Error(`Invalid input while constructing BreaksList ${name}, please try again.`);
        }
        this.name = name;
        this.entries = [];
    }

    static fromJSON(json) {
        const debugMode = false;
        if (debugMode) {console.log('Debug: fromJSON(json)');}

        //const parsedJSON = JSON.parse(json);
        var { name, entries } = json;
        
        if (debugMode) {console.log('parsedData.name =');}
        if (debugMode) {console.log(name);}
        if (debugMode) {console.log('parsedData.entries =');}
        if (debugMode) {console.log(entries);}
        const breaksList = new BreaksList(name);
        if (debugMode) {console.log('created new breaksList =');}
        if (debugMode) {console.log(breaksList);}
        if (!entries) entries = [];
        entries.forEach(entriesData => {
            //console.log('debug: breaksList.fromJSON(); entriesData =');
            //console.log(entriesData);
            breaksList.addEntry(BreaksEntry.fromJSON(entriesData));
        });
        if (debugMode) {console.log('filled new breaksList =');}
        if (debugMode) {console.log(breaksList);}
        return breaksList;
    }

    addEntry(entry) {
        this.entries.push(entry);
        this.sort();
    }
    addBreak(playerName, x) {
        try {
            var foundEntry = this.entries.find(entry => entry.getName() === playerName);
            if (!foundEntry) {
                this.addEntry(new BreaksEntry(playerName));
                foundEntry = this.entries.find(entry => entry.getName() === playerName);
            }
            foundEntry.addBreak(x);
            this.sort();
        }
        catch(error) {console.error(error);}
    }
    sort() {
        this.entries.sort((a, b) => {
            /* // Would have to import rating list for this...
            const dx = -(a.getHighbreak() - b.getHighbreak());
            if (dx !== 0) return dx;
            return -(a.getPlayer().getRating() - b.getPlayer().getRating()); // negative because highest rating first
            */

            // Sort by highbreak, then number of registered breaks...
            const dx = -(a.getHighbreak() - b.getHighbreak());
            if (dx !== 0) return dx;
            return -(a.getSize() - b.getSize());
        });
    } 

    getPlayers() {
        let names = [];
        for (const player of this.entries) {
            names.push(player.getName());
        }
        return names;
    }
    getEntries() {return this.entries;}
}