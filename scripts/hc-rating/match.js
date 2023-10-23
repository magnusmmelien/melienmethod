import { KfactorFrameCoeff, KfactorMatchCoeff, ratingNormFactor, initKfactor, robustHigh, robustMedium } from './variables.js';
//import { hcToRating } from './player.js';
import { Player, hcToRating } from './player.js';

function dumbTest() {
    var test = new Player();
}

function exScoreElo(ratingDelta) { //expected score of playerA
	return 1 / (1 + Math.pow(10, (-ratingDelta) / ratingNormFactor));
}

function newRatingElo(rating, score, exScore, Kfactor = initKfactor) {
    return rating + Kfactor * (score - exScore);
}

function effKfactor(playerA, playerB) { //returns the K_eff for playerA
    const robustA = playerA.getRobust();
	const robustB = playerB.getRobust();

	if (robustA > robustHigh) {
		if (robustB > robustHigh) { return initKfactor; }
		if (robustB > robustMedium) { return 0.75 * initKfactor; }
		return 0.5 * initKfactor;
	}
	if (robustA > robustMedium) {
		if (robustB > robustMedium) { return 1.5 * initKfactor; }
		return initKfactor;
	}
	return 2 * initKfactor;
}

export class MatchState {
    static null = 0;
    static live = 1;
    static finished = 2;
}

export class HCsystem {
    static match = 0;
    static frame = 1;
}

export class DistanceType {
    static bestOf = 0;
    static justFrames = 1;
}

export class Match {
    constructor(id, playerA, playerB, totalDistance = 0, HC = 0, 
        distanceType = DistanceType.bestOf, enumHCsystem = HCsystem.frame) 
    {
        this.id = id;

        this.playerA = playerA;
        this.playerB = playerB;
        this.totalDistance = totalDistance;
        this.HC = HC;
        this.distanceType = distanceType;
        this.enumHCsystem = enumHCsystem;

        this.state = MatchState.null;
        this.scoreA = 0;
        this.scoreB = 0;
        this.currentRatingA = playerA.getRating();
        this.currentRatingB = playerB.getRating();
        this.deltaA = 0;
        this.deltaB = 0;
    }

    toJSON() {
        return {
            id: this.id,

            playerA: this.playerA.toJSON(), // Convert playerA to JSON
            playerB: this.playerB.toJSON(), // Convert playerB to JSON
            totalDistance: this.totalDistance,
            HC: this.HC,
            distanceType: this.distanceType,
            enumHCsystem: this.enumHCsystem,

            state: this.state,
            scoreA: this.scoreA,
            scoreB: this.scoreB,
            currentRatingA: this.currentRatingA,
            currentRatingB: this.currentRatingB,
            deltaA: this.deltaA,
            deltaB: this.deltaB
        };
    }
    static fromJSON(json) {
        const parsedJSON = JSON.parse(json);
        const { id, playerA, playerB, totalDistance, HC, distanceType, enumHCsystem, state, scoreA, scoreB, currentRatingA, currentRatingB, deltaA, deltaB } = parsedJSON;
        const match = new Match(id, playerA, playerB, totalDistance, HC, distanceType, enumHCsystem);
        match.state = state;
        match.scoreA = scoreA;
        match.scoreB = scoreB;
        match.currentRatingA = currentRatingA;
        match.currentRatingB = currentRatingB;
        match.deltaA = deltaA;
        match.deltaB = deltaB;
        return match;
    }

    updateRatingFromMatch() {
        const postHC_ratingDelta = this.playerA.getRating() - this.playerB.getRating() - hcToRating(this.HC);
        const exScoreA = exScoreElo(postHC_ratingDelta);
        const exScoreB = 1 - exScoreA;
    
        const playerA_Keff = effKfactor(this.playerA, this.playerB);
        const playerB_Keff = effKfactor(this.playerB, this.playerA);
    
        if (this.enumHCsystem === HCsystem.match) {
            let matchScoreA = 0;
            let matchScoreB = 0;
            if (this.scoreA < this.scoreB) { //playerB wins
                matchScoreA = 0;
                matchScoreB = 1;
            }
            else if (this.scoreA === this.scoreB) { //draw
                matchScoreA = 0.5;
                matchScoreB = 0.5;
            }
            else { //playerA wins
                matchScoreA = 1;
                matchScoreB = 0;
            }
            this.playerA.setRating(newRatingElo(this.playerA.getRating(), matchScoreA, exScoreA, playerA_Keff * (1 - Math.exp(-KfactorMatchCoeff * this.totalDistance)))); //the extra factor behind playerA_Keff is just a coeff that quickly approaches 1 (just so that longer matches count a little heavier in the ratings)
            this.playerB.setRating(newRatingElo(this.playerB.getRating(), matchScoreB, exScoreB, playerB_Keff * (1 - Math.exp(-KfactorMatchCoeff * this.totalDistance))));
        }
        else if (enumHCsystem == HCsystem.frame) {
            const totalFramesPlayed = this.scoreA + this.scoreB;
            this.playerA.setRating(newRatingElo(this.playerA.getRating(), 1.0 * scoreA / totalFramesPlayed, exScoreA, playerA_Keff * (1 - Math.exp(-KfactorFrameCoeff * totalFramesPlayed))));
            this.playerB.setRating(newRatingElo(this.playerB.getRating(), 1.0 * scoreB / totalFramesPlayed, exScoreB, playerB_Keff * (1 - Math.exp(-KfactorFrameCoeff * totalFramesPlayed))));
        }
        
    }

    startMatch() {this.state = MatchState.live;}

    updateScore(a, b) {
        this.scoreA = a;
        this.scoreB = b;
        this.state = MatchState.live;
    }

    finishMatch(finalScoreA, finalScoreB) {
        if (this.state === MatchState.finished) {
            console.log("Error: tried to finish match which is already finished");
            return;
        }
        this.scoreA = finalScoreA;
        this.scoreB = finalScoreB;
        
        //Note: if match isn't finished:

        const isBestOf = this.distanceType === DistanceType.bestOf;
        const playerAisAboveHalf = 1.0 * this.scoreA > (1.0 * this.totalDistance) / 2;
        const playerBisAboveHalf = 1.0 * this.scoreB > (1.0 * this.totalDistance) / 2;
        const bothPlayersAboveHalf = playerAisAboveHalf && playerBisAboveHalf;
        const atLeastOnePlayerOverHalf = playerAisAboveHalf || playerBisAboveHalf;
        const onePlayerAboveHalf = atLeastOnePlayerOverHalf && !bothPlayersAboveHalf;
        const playerAexactlyAtHalf = 1.0 * this.scoreA === this.totalDistance / 2.0;
        const playerBexactlyAtHalf = 1.0 * this.scoreB === this.totalDistance / 2.0;
        const bothExactlyAtHalf = playerAexactlyAtHalf && playerBexactlyAtHalf;

        const tooManyFramesBestOfA = 1.0 * this.scoreA >= this.totalDistance / 2.0 + 1;
        const tooManyFramesBestOfB = 1.0 * this.scoreB >= this.totalDistance / 2.0 + 1;
        const tooManyFramesBestOf = tooManyFramesBestOfA || tooManyFramesBestOfB;

        if (isBestOf && (!(onePlayerAboveHalf || bothExactlyAtHalf) || tooManyFramesBestOf) )
        {
            console.log("Error: this match does not seem to have reached it's natural conclusion.");
            this.enumHCsystem = HCsystem.frame;
            this.distanceType = DistanceType.justFrames;
        }

        this.currentRatingA = this.playerA.getRating();
        this.currentRatingB = this.playerB.getRating();

        this.state = MatchState.finished;
        this.updateRatingFromMatch();

        this.deltaA = this.playerA.getRating() - this.currentRatingA;
        this.deltaB = this.playerB.getRating() - this.currentRatingB;
    }

    updateState(newState) {this.state = newState;}
    updateCurrentRatingA(r) {this.currentRatingA = r;}
    updateCurrentRatingB(r) {this.currentRatingB = r;}
    setDeltaA(d) {this.deltaA = d;}
    setDeltaB(d) {this.deltaB = d;}

    getID() {return this.id;}
    getPlayerA() {return this.playerA;}
    getPlayerB() {return this.playerB;}
    getHC() {return this.HC;}
    getDistanceType() {return this.distanceType;}
    getDistance() {return this.totalDistance;}
    getHCsystem() {return this.enumHCsystem;}
    getState() {return this.state;}
    getScoreA() {return this.scoreA;}
    getScoreB() {return this.scoreB;}
    getOrigRatingA() {return this.currentRatingA;}
    getOrigRatingB() {return this.currentRatingB;}
    getDeltaA() {return this.deltaA;}
    getDeltaB() {return this.deltaB;}

    print() {
        console.log(`Match: ${this.state}`);
        
        console.log(`Player A: ${this.playerA.getName()} (${this.playerA.getRating()})`);
        console.log("vs.");
        console.log(`Player B: ${this.playerB.getName()} (${this.playerB.getRating()})`);
        console.log(`Score A: ${this.scoreA} - Score B: ${this.scoreB}`);
        if (this.distanceType === DistanceType.bestOf) {
            console.log(`Best-of: ${this.totalDistance}`);
        }
        else {
            console.log("Free-frames:");
        }
        console.log(`HC: ${this.HC}`);
    }
    matchToString() {
        return 
        `
        ${this.playerA.getName()};${this.playerA.getClub()};${this.playerB.getName()};${this.playerB.getClub()};
        ${this.totalDistance};${this.HC};${this.distanceType};${this.enumHCsystem};
        ${this.state};${this.scoreA};${this.scoreB};
        ${this.currentRatingA};${this.currentRatingB};${this.deltaA};${this.deltaB}
        ${this.id};
        `;
    }
}

export function matchFromString(line, list) {
    const data = line.split(';');
    let match = Match(data[15], list.getPlayerByName(data[0]), list.getPlayerByName(data[2]), data[4], data[5], data[6], data[7]);
    match.updateState(data[8]);
    match.updateScore(data[9], data[10]);
    match.updateCurrentRatingA(data[11]);
    match.updateCurrentRatingB(data[12]);
    match.setDeltaA(data[13]);
    match.setDeltaB(data[14]);
    return match;
}

export default Match;
