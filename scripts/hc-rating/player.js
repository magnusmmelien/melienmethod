import * as variables from './variables.js';
//import Club from './club.js';


function f_exp(ratingDelta) {
    if (typeof ratingDelta === 'number') {
        const trueHC = variables.hcMax * (1 - Math.exp(-variables.beta * Math.abs(ratingDelta)));
        if (ratingDelta < 0) { return -trueHC; }
        return trueHC;
    } else {
        throw new Error('Input into f_exp() must be a number');
    }
}

export function ratingToHC(ratingA, ratingB, rounding = variables.defaultRounding) {
    if (typeof ratingA != 'number' || typeof ratingB != 'number' || typeof rounding != 'number') {
        throw new Error('Input into ratingToHC() must be a number');
    }
    else {
        const ratingDelta = ratingA - ratingB;
        const trueHC = f_exp(ratingDelta);
        if (trueHC > variables.hcMax - 1) return variables.hcMax;
        return Math.round(trueHC / rounding) * rounding; // return to nearest multiple of "rounding"
    }
}

export function hcToRating(hc) {
    if (typeof hc != 'number') {
        throw new Error('Input into hcToRating() must be a number');
    }
    else {
        if (hc === 0) {return 0;}
        const absRatingDelta = -(1 / variables.beta) * Math.log(1 - (Math.abs(hc) / variables.hcMax));
        if (hc < 0) {return -absRatingDelta;}
        return absRatingDelta;
    }
}

class Robustness { // enum type: robustness
    static low = 'Low';
    static medium = 'Medium';
    static high = 'High';
}

function robustLevel(robust) {
    if (robust <= 1.1 && robust >= 0) { // 1.1 because this code could potentially produce numbers marginally bigger than 1, but that doesn't matter
        if (robust >= variables.robustHigh) {return Robustness.high;}
        if (robust >= variables.robustMedium) {return Robustness.medium;}
        return Robustness.low;
    }
    console.warn('Warning: Robustness out of bounds');
    //throw new Error('Robustness out of bounds');
    return Robustness.high;
}

// Define the Player class
export class Player {
    constructor(name, club, rating = variables.defaultRating, robust = 0, pbBreak = 0) {
        if (name.includes(';') || club.includes(';') || typeof rating != 'number' || typeof robust != 'number' || 
                typeof pbBreak != 'number' || pbBreak<0 || pbBreak>155) 
        {
            console.log(`Invalid input while constructing player ${name}, please try again.`);
            throw new Error(`Invalid input while constructing player ${name}, please try again.`);
        }
        this.name = name;
        this.club = club; // i think we'll keep this as a string (and not an object)...
        this.rating = rating;
        this.robust = robust;
        if (isNaN(pbBreak)) {
            console.warn('Creating player: ' + name + '. Personal best break is NaN. Set to 0.');
            pbBreak = 0;
        }
        this.pbBreak = pbBreak;

        //this.updateK();
        //club.incSize();
    }

    /*toJSON() {
        return {
            name: this.name,
            club: this.club,
            rating: this.rating,
            robust: this.robust
        };
    }*/
    static fromJSON(json) {
        //const parsedJSON = JSON.parse(json);
        const { name, club, rating, robust, pbBreak } = json;
        //console.log('debug: Player.fromJSON():' + `name=${name}, club=${club}, rating=${rating}, robust=${robust}`);
        //console.log('robust =' + robust + ', typeof(robust) =' + typeof(robust));
        return new Player(name, club, Number(rating), Number(robust), Number(pbBreak));
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
    getPbBreak() { return this.pbBreak; }
    setPbBreak(newhb) { 
        if (typeof newhb != 'number' || newhb < this.pbBreak || newhb > 155) {throw new Error('Tried to update pbBreak for ( ' + this.name + ' ): Invalid break.');}
        this.pbBreak = newhb; 
    }

    updateRobust() {
        if (this.robust <= 1.1 && this.robust >= 0) { // 1.1 because this code could potentially produce numbers marginally bigger than 1, but that doesn't matter
            this.robust += (1 - this.robust) * variables.robustnessCoeff;
            //this.updateK();
            return;
        }
        throw new Error(`Robustness out of bounds in updateRobust() for: ${this.name}`);
    }

    // Don't think we need this (i.e. a player has a personalized associated K-factor since the effKfactor()-function only uses Player.getRobustness()...)
    /*updateK() {
        if (this.robust > variabels.robustHigh) {
            this.Kfactor = variabels.initKfactor;
            return;
        }
        if (this.robust > variabels.robustMedium) {
            this.Kfactor = 1.5 * variabels.initKfactor;
            return;
        }
        this.Kfactor = 2 * variabels.initKfactor;
    }*/

    isEqualTo(otherPlayer) {
        return this.name === otherPlayer.name && this.rating === otherPlayer.rating && this.club === otherPlayer.club && this.robust === otherPlayer.robust;
        return this.name === otherPlayer.name;
    }

    transferClub(newClub) {
        this.club.setSize(this.club.getSize() - 1);
        this.club = newClub;
        this.club.incSize();
    }
    //transferNation(newNation) {this.nation = newNation;} // not in use!
}

export default Player;