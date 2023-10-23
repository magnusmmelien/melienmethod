import Player from './player.js';
import ratingToHC from './player.js';
import { defaultRating, defaultRounding } from './variables.js';

class RatingList {
    constructor(name) {
        if (name.includes('_')) {
            console.log(`Invalid input while constructing RatingList ${name}, please try again.`);
            throw new Error(`Invalid input while constructing RatingList ${name}, please try again.`);
        }
        this.name = name;
        this.players = [];
    }

    toJSON() {
        return {
            name: this.name,
            players: this.players.map(player => JSON.stringify(player.toJSON())) // Convert each player to JSON
        };
    }
    static fromJSON(json) {
        const debugMode = false;
        if (debugMode) {console.log('Debug: fromJSON(json)');}

        const parsedJSON = JSON.parse(json);
        const { name, players } = parsedJSON;
        
        if (debugMode) {console.log('parsedData.name =');}
        if (debugMode) {console.log(name);}
        if (debugMode) {console.log('parsedData.players =');}
        if (debugMode) {console.log(players);}
        const ratingList = new RatingList(name);
        if (debugMode) {console.log('created new ratingList =');}
        if (debugMode) {console.log(ratingList);}
        players.forEach(player => {
            ratingList.addPlayer(Player.fromJSON(player));
        });
        if (debugMode) {console.log('filled new ratingList =');}
        if (debugMode) {console.log(ratingList);}
        return ratingList;
    }
    /*static fromJSON(json) {
        const debugMode = true;
        if (debugMode) {console.log('Debug: fromJSON(json)');}
        const parsedData = JSON.parse(json);
        if (debugMode) {console.log('parsedData =');}
        if (debugMode) {console.log(parsedData);}
        
        if (!parsedData.name || !parsedData.players) {
            throw new Error("Invalid JSON data for RatingList.");
        }
        if (debugMode) {console.log('parsedData.name =');}
        if (debugMode) {console.log(parsedData.name);}
        if (debugMode) {console.log('parsedData.players =');}
        if (debugMode) {console.log(parsedData.players);}
    
        const ratingList = new RatingList(parsedData.name);
        
        for (const playerData of parsedData.players) { // JOBB HER: PRØV forEach playerData in parsedData.players???
            const player = Player.fromJSON(playerData);
            ratingList.addNewPlayer(player.getName(), player.getClub(), player.getRating(), player.getRobust());
        }
    
        if (debugMode) {console.log('new RatingList ratingList =');}
        if (debugMode) {console.log(ratingList);}
        return ratingList;
    }*/

    
    getSize() { return this.players.length; }
    getList() { return this.players; }
    getPlayers() {
        let names = [];
        for (const player of players) {
            names.push(player.getName());
        }
        return names;
    }

    
    addPlayer(player) { // I don't think this will be used
        if (this.getPlayer(player) !== null) {
            throw new Error(`Error: player ${player.getName()} already in list. Please try another name`);
            return;
        }
        this.players.push(player);
        this.players.sort(this.comparePlayersByRating); // Sort players when adding
    }    
    addNewPlayer(fullName, club, estimatedRating = defaultRating, initRobust = 0) {
        if (this.getPlayerByName(fullName) !== null) {
            throw new Error(`Error: player ${fullName} already in list. Please try another name`);
            return;
        }
        this.players.push(new Player(fullName, club, estimatedRating, initRobust));
        this.players.sort(this.comparePlayersByRating); // Sort players when adding
    }
    sort() {
        this.players.sort(a, b => {
            return -(a.getRating() - b.getRating()); // negative because highest rating first
        });
    }

    comparePlayersByRating(playerA, playerB) { return playerB.getRating() - playerA.getRating(); }

    getPlayerByName(name) {
        const foundPlayer = this.players.find(player => player.getName() === name);
        return foundPlayer || null; // Return the found player or null if not found
    }
    getPlayer(inputPlayer) {
        const foundPlayer = this.players.find(player => player.isEqualTo(inputPlayer));
        return foundPlayer || null; // Return the found player or null if not found
    }

    updateRating(player, rating) {
        player.setRating(rating);
        this.players.sort(this.comparePlayersByRating);
    }
    updateRatingName(fullName, rating) {
        let player = this.getPlayerByName(fullName);
        this.updateRating(player, rating);
    }

    getHC(playerA, playerB, rounding = defaultRounding) {
        return ratingToHC(playerA.getRating(), playerB.getRating(), rounding);
    }
    getHCname(nameA, nameB, rounding = defaultRounding) {
        return this.getHC(this.getPlayerByName(nameA), this.getPlayerByName(nameB), rounding);
    }
}

export default RatingList;
