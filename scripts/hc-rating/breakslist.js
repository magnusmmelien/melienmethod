import Player from './player.js';
import RatingList from './rating-list.js';
import { listName } from './variables.js';
import { getDatabase, ref, onValue, child, push, update, get } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { database, matchCounterRef, clubsRef } from './database_init.js'; 

var ratingList = new RatingList(listName);
const ratingListRef = ref(database, `${listName}_RatingList`);
onValue(ratingListRef, (snapshot) => {
    ratingList = RatingList.fromJSON(snapshot.val());
    //console.log('test: breakslist.js; ratingList =', ratingList);
});

//const indexOfMin = arr => arr.reduce((prev, curr, i, a) => curr < a[prev] ? i : prev, 0);
function removeSmallest(numbers) {
    const copy = numbers.slice(0);
    let smallestValue = numbers.indexOf(Math.min(...numbers));
    copy.splice(smallestValue, 1);
    return copy;
}

export function resetPbBreaks(ratingList) {
    const updates = {};
    fetch('scripts/hc-rating/data/highbreakList2024.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();  
        })
        .then(data => {
            console.log(data);
            for (const key in data) {
                //console.log('test: key =', key);
                try {
                    console.log(`test: oldHighbreaks[${key}] = ${data[key]}.`);
                    ratingList.getPlayerByName(key).forcePbBreak(data[key]);
                }
                catch(error) {console.warn('Force reset pb break: ', error);}
            }
            console.log('debug: resetPbBreak: ratingList post =', ratingList);
            updates[listName + '_RatingList'] = ratingList;
            console.log('supertest');
            update(ref(database), updates);
        }).catch(error => console.error('Force reset pb breaks: Failed to fetch data:', error)); 
}

export class BreaksEntry {
    constructor(inputName) {
        this.name = inputName;
        this.highbreak = 0;
        this.breaks = [];
    }

    static fromJSON(json) {
        var { name, highbreak, breaks } = json;
        //console.log('debug: Player.fromJSON():' + `player=${player}, club=${club}, rating=${rating}, robust=${robust}`);
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
            throw new Error('Error: tried to enter break (' + x + ') outside of bounds');
            return;
        }
        if (this.breaks.length > 127) {
            console.warn('Maximum number of registered breaks (128) reached; smallest entry will be removed');
            alert('Maximum number of registered breaks (128) reached; smallest entry will be removed');
            removeSmallest(this.breaks);
        }
        const pbBreak = ratingList.getPlayerByName(this.name).getPbBreak();
        //console.log('test5: pbBreak = ' + pbBreak);
        //console.log('test2: addBreak('+x+'); this.pbBreak = '+pbBreak+';');
        if (x > pbBreak/2) { // if bigger than 50% of all time highbreak
            if (x > this.highbreak) { // if bigger than this year's highbreak
                this.highbreak = x;
                if (x > pbBreak) {  // if bigger than all time highbreak 
                    //console.log('test x: '); 
                    ratingList.getPlayerByName(this.name).setPbBreak(x); 
                    const updates = {};
                    updates[listName + '_RatingList'] = ratingList;
                    update(ref(database), updates);
                }
            }
            this.breaks.push(x); // then add break to this years breaksList
        }
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
        const { name, entries } = json;
        
        if (debugMode) {console.log('parsedData.name =');}
        if (debugMode) {console.log(name);}
        if (debugMode) {console.log('parsedData.entries =');}
        if (debugMode) {console.log(entries);}
        const breaksList = new BreaksList(name);
        if (debugMode) {console.log('created new breaksList =');}
        if (debugMode) {console.log(breaksList);}
        //if (!entries) entries = [];
        const entriesArr = [].concat(entries || []);
        entriesArr.forEach(entriesData => {
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
    addBreaks(playerName, inputList) {
        if ((inputList === undefined || inputList.length == 0)) {return;} // if there are no breaks to add
        try {
            var foundEntry = this.entries.find(entry => entry.getName() === playerName);
            if (!foundEntry) {
                this.addEntry(new BreaksEntry(playerName));
                foundEntry = this.entries.find(entry => entry.getName() === playerName);
            }
            inputList.forEach(inputBreak => {
                foundEntry.addBreak(inputBreak);
            });
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

            // Sort by number of registered breaks, then highbreak... 
            const n = -(a.getSize() - b.getSize());
            if (n !== 0) return n;
            return -(a.getHighbreak() - b.getHighbreak());
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