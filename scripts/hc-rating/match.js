import { KfactorFrameCoeff, KfactorMatchCoeff, KfactorJustFramesCoeff, ratingNormFactor, initKfactor, robustHigh, robustMedium } from './variables.js';
//import { hcToRating } from './player.js';
import { Player, hcToRating } from './player.js';


function exScoreElo(ratingDelta) { //expected score of playerA
	return 1 / (1 + Math.pow(10, (-ratingDelta) / ratingNormFactor));
}

function newRatingElo(rating, score, exScore, Kfactor = initKfactor) {
    return rating + Kfactor * (score - exScore);
}

function effKfactor(playerA, playerB) { //returns the K_eff for playerA
    const robustA = playerA.getRobust();
	const robustB = playerB.getRobust();

	if (robustA >= robustHigh) {
		if (robustB >= robustHigh) { return initKfactor; }
		if (robustB >= robustMedium) { return 0.75 * initKfactor; }
		return 0.5 * initKfactor;
	}
	if (robustA >= robustMedium) {
		if (robustB >= robustMedium) { return 1.5 * initKfactor; }
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

        if (playerA instanceof Player && playerB instanceof Player) {
            this.playerA = playerA;
            this.playerB = playerB;
        } else {
            try {
                this.playerA = new Player(playerA.name, playerA.club, Number(playerA.rating), Number(playerA.robust));
                this.playerB = new Player(playerB.name, playerB.club, Number(playerB.rating), Number(playerB.robust));
            } catch(error) {
                console.error('Error: failed to construct Match. Input not instance of Player.' + error.message);
                alert('Error: failed to construct Match. Input not "instanceof" Player.' + error.message);
            }
        }
        this.totalDistance = totalDistance;
        this.HC = HC;
        this.distanceType = distanceType;
        this.enumHCsystem = enumHCsystem;

        this.state = MatchState.null;
        this.scoreA = 0;
        this.scoreB = 0;
        this.breaksA = [];
        this.breaksB = [];
        
        
        /*console.log('debug: new Match: playerA =');
        console.log(this.playerA);
        /*const test = new Player("Test Name", "Test club", 1234, 0.7);
        const test2 = new Player("new Name", "Test club", 1274, 0.7);
        console.log('debug: new Match: testplayer =');
        console.log(test);
        console.log('is playerA instanceof Player =');
        console.log(this.playerA instanceof Player);
        /*console.log('debug: new Match: typeof(playerA) =');
        console.log(typeof(playerA));
        console.log('debug: new Match: typeof(testplayer) =');
        console.log(typeof(test));*/
        
        
        this.currentRatingA = this.playerA.getRating();
        this.currentRatingB = this.playerB.getRating();
        this.deltaA = 0;
        this.deltaB = 0;
    }

    /*toJSON() {
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
    }*/
    static fromJSON(json, ratingList) {
        //const parsedJSON = JSON.parse(json);
        try {
            const { id, playerA, playerB, totalDistance, HC, distanceType, enumHCsystem, state, scoreA, scoreB, breaksA, breaksB, currentRatingA, currentRatingB, deltaA, deltaB } = json;
            //console.log('mytest: fromJSON: playerA =');
            //console.log(ratingList.getPlayerByName(playerA.name));
            const match = new Match(Number(id), ratingList.getPlayerByName(playerA.name), ratingList.getPlayerByName(playerB.name), 
                Number(totalDistance), Number(HC), Number(distanceType), Number(enumHCsystem));
            match.state = Number(state);
            match.scoreA = Number(scoreA);
            match.scoreB = Number(scoreB);
            if (breaksA) match.breaksA = breaksA;
            else match.breaksA = [];
            if (breaksB) match.breaksB = breaksB;
            else match.breaksB = [];
            match.currentRatingA = Number(currentRatingA);
            match.currentRatingB = Number(currentRatingB);
            match.deltaA = Number(deltaA);
            match.deltaB = Number(deltaB);
            //console.log(match);

            return match;
        } catch(error) {
            console.error('Error: init match fromJSON(). ' + error.message);
        }
    }

    updateRatingFromMatch() {
        const postHC_ratingDelta = this.playerA.getRating() - this.playerB.getRating() - hcToRating(this.HC);
        const exScoreA = exScoreElo(postHC_ratingDelta);
        const exScoreB = 1 - exScoreA;
    
        var playerA_Keff = effKfactor(this.playerA, this.playerB);
        var playerB_Keff = effKfactor(this.playerB, this.playerA);
    
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
            this.playerA.setRating(newRatingElo(this.playerA.getRating(), matchScoreA, exScoreA, playerA_Keff * (1 - Math.exp( - KfactorMatchCoeff * Math.pow(this.totalDistance, 1/2))))); //the extra factor behind playerA_Keff is just a coeff that quickly approaches 1 (just so that longer matches count a little heavier in the ratings)
            this.playerB.setRating(newRatingElo(this.playerB.getRating(), matchScoreB, exScoreB, playerB_Keff * (1 - Math.exp( - KfactorMatchCoeff * Math.pow(this.totalDistance, 1/2)))));
        }
        else if (this.enumHCsystem == HCsystem.frame) {
            const totalFramesPlayed = this.scoreA + this.scoreB;
            if (this.distanceType === DistanceType.justFrames) {
                playerA_Keff *= KfactorJustFramesCoeff;
                playerB_Keff *= KfactorJustFramesCoeff;
            }
            this.playerA.setRating(newRatingElo(this.playerA.getRating(), 1.0 * this.scoreA / totalFramesPlayed, exScoreA, playerA_Keff * (1 - Math.exp(- KfactorFrameCoeff * Math.pow(totalFramesPlayed, 1/3)))));
            this.playerB.setRating(newRatingElo(this.playerB.getRating(), 1.0 * this.scoreB / totalFramesPlayed, exScoreB, playerB_Keff * (1 - Math.exp(- KfactorFrameCoeff * Math.pow(totalFramesPlayed, 1/3)))));
        }
        
    }

    startMatch() {this.state = MatchState.live;}

    updateScore(a, b) {
        this.scoreA = a;
        this.scoreB = b;
        this.state = MatchState.live;
    }
    incA() { this.scoreA++; }
    incB() { this.scoreB++; }
    decA() { if (this.scoreA > 0) this.scoreA--; }
    decB() { if (this.scoreB > 0) this.scoreB--; }
    addBreakA(x) { this.breaksA.push(x); }
    addBreakB(x) { this.breaksB.push(x); }

    isMatchFinished() {
        if (this.scoreA === 0 && this.scoreB === 0) { return false; }
        const isBestOf = this.distanceType === DistanceType.bestOf;
        if (!isBestOf && this.scoreA + this.scoreB > 0) { return true; }

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
        { return false; }
        return true;
    }
    finishMatch(finalScoreA = this.scoreA, finalScoreB = this.scoreB) {
        if (this.state === MatchState.finished) {
            console.log("Error: tried to finish match which is already finished");
            throw new Error("Error: tried to finish match which is already finished");
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

        if (this.scoreA === 0 && this.scoreB === 0) {
            throw new Error(`Error: tried to finish match[${this.id}] 0-0; not allowed!`);
        }
        if (isBestOf && (!(onePlayerAboveHalf || bothExactlyAtHalf) || tooManyFramesBestOf) )
        {
            // OBS OBS(!): SHOULD BE AN ABORT OR WARNING HERE - NOT JUST CONTINUE...
            if (confirm(`Error: this match (ID = ${this.id}) does not seem to have reached it's natural 
            conclusion. Would you like to change the "distance type" to "just frames" and finish?`)
                == true) {
                    this.enumHCsystem = HCsystem.frame;
                    this.distanceType = DistanceType.justFrames;
            } else { throw new Error(`Error: aborted finishing of match[${this.id}]`); }
        }

        // This means that rating is updated from what your rating is NOW (not when match was started). This is by design!!
            // The only time this will have an impact is if you participate in 2 (or more) matches at once and you finish the 2nd match before the 1st.
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
    setDistanceType(type) {this.distanceType = type;}
    setDistance(d) {this.totalDistance = d;}
    setHC(x) {this.HC = x;}
    setHCsystem(urs) {this.enumHCsystem = urs;}
    setBreaksA(breaks) {this.breaksA = breaks;}
    setBreaksB(breaks) {this.breaksB = breaks;}

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
    getBreaksA() {return this.breaksA;}
    getBreaksB() {return this.breaksB;}
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
