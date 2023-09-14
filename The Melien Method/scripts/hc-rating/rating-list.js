import Player from './player.js';
import ratingToHC from './player.js';
import { defaultRating, defaultRounding } from './variables.js';

class RatingList {
    constructor(name) {
        if (name.includes('_')) {
            console.log(`Invalid input while constructing RatingList ${name}, please try again.`);
            throw new Error(`Invalid input while constructing RatingList ${name}, please try again.`);
            return;
        }
        this.name = name;
        this.players = [];
    }
    
    getSize() { return this.players.length; }
    getList() { return this.players; }
    getPlayers() {
        let names = [];
        for (const player of players) {
            names.push(player.getName());
        }
        return names;
    }

    /*
    // I don't think this will be used
    addPlayer(player) { 
        if (this.getPlayer(player) != null) {
            console.log('Tried to add player already in rating list');
            return;
        }
        this.players.push(player);
        this.players.sort(this.comparePlayersByRating); // Sort players when adding
    }
    */
    
    addNewPlayer(fullName, club, estimatedRating = defaultRating, initRobust = 0) {
        if (this.getPlayerByName(fullName) === null) {
            throw new Error(`Error: player ${fullName} already in list. Please try another name`);
            return;
        }
        this.players.push(Player(fullName, club, estimatedRating, initRobust));
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
