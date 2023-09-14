import * as variabels from './variables.js';
import Club from './club.js';


function f_exp(ratingDelta) {
    if (typeof ratingDelta === 'number') {
        const trueHC = variabels.hcMax * (1 - Math.exp(-variabels.beta * Math.abs(ratingDelta)));
        if (ratingDelta < 0) { return -trueHC; }
        return trueHC;
    } else {
        throw new Error('Input into f_exp() must be a number');
    }
}

function ratingToHC(ratingA, ratingB, rounding = variabels.defaultRounding) {
    if (typeof ratingA != 'number' || typeof ratingB != 'number' || typeof rounding != 'number') {
        throw new Error('Input into ratingToHC() must be a number');
    }
    else {
        const ratingDelta = ratingA - ratingB;
        const trueHC = f_exp(ratingDelta);
        return Math.round(trueHC / rounding) * rounding; // return to nearest multiple of "rounding"
    }
}

function hcToRating(hc) {
    if (typeof hc != 'number') {
        throw new Error('Input into hcToRating() must be a number');
    }
    else {
        if (hc === 0) {return 0;}
        const absRatingDelta = -(1 / beta) * Math.log(1 - (Math.abs(hc) / variabels.hcMax));
        if (hc < 0) {return -absRatingDelta;}
        return absRatingDelta;
    }
}

class Robustness { // enum type: robustness
    static low = 0;
    static medium = 1;
    static high = 2;
}

function robustLevel(robust) {
    if (robust <= 1.1 && robust >= 0) { // 1.1 because this code could potentially produce numbers marginally bigger than 1, but that doesn't matter
        if (robust >= variabels.robustHigh) {return Robustness.high;}
        if (robust >= variabels.robustMedium) {return Robustness.medium;}
        return Robustness.low;
    }
    throw new Error('Robustness out of bounds');
    return Robustness.high;
}

// Define the Player class
class Player {
    constructor(name, club, rating = variabels.defaultRating, robust = 0) {
        if (name.includes(';') || club.includes(';') || typeof rating != 'number' || typeof robust != 'number') {
            console.log(`Invalid input while constructing player ${name}, please try again.`);
            throw new Error(`Invalid input while constructing player ${name}, please try again.`);
            return;
        }
        this.name = name;
        this.club = club; // i think we'll keep this as a string (and not an object)...
        this.rating = rating;
        this.robust = robust;

        this.updateK();
        //club.incSize();
    }

    // Getters and setters
    getName() { return this.name; }
    getClub() { return this.club; }
    getRating() { return this.rating; }
    setRating(newRating) {
        this.rating = newRating;
        this.updateRobust();
    }
    getRobust() { return this.robust; }
    getRobustLevel() { return robustLevel(this.robust); }
    setRobust(newRobust) { this.robust = newRobust; }

    updateRobust() {
        if (this.robust <= 1.1 && this.robust >= 0) { // 1.1 because this code could potentially produce numbers marginally bigger than 1, but that doesn't matter
            this.robust += (1 - this.robust) * variabels.robustnessCoeff;
            this.updateK();
            return;
        }
        throw new Error(`Robustness out of bounds in updateRobust() for: ${this.name}`);
    }

    updateK() {
        if (robust > variabels.robustHigh) {
            this.Kfactor = variabels.initKfactor;
            return;
        }
        if (robust > variabels.robustMedium) {
            this.Kfactor = 1.5 * variabels.initKfactor;
            return;
        }
        this.Kfactor = 2 * variabels.initKfactor;
    }

    isEqualTo(otherPlayer) {
        return this.name === otherPlayer.name && this.rating === otherPlayer.rating 
        && this.club === otherPlayer.club && this.robust === otherPlayer.robust;
    }

    transferClub(newClub) {
        this.club.setSize(this.club.getSize() - 1);
        this.club = newClub;
        this.club.incSize();
    }
    //transferNation(newNation) {this.nation = newNation;} // not in use!
}

export default Player;