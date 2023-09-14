/*
// class Club: name (location), size, list<id, Player*>
// class Player: name, club, rating, robust (robustLevel, Kfactor)
// class RatingList: name, size, list<Plaver&>
// enum RobustLevel
// class Match
// enum DistType
// enum MatchState
// enum HCsystem
// class Match: playerA, playerB, hc, state, distType, hcSystem, matchState, scoreA, scoreB
*/

import RatingList from './rating-list.js';
import { toFile, fromFile, matchesToFile, matchesFromFile } from './fileStream.js';



// import from files
function initialize(listName = 'Trondheim Snooker') {
    const writeToFileCont = true;
    const filename = `${listName}_RatingList.txt`;

    let ratingList = new RatingList(listName); // You need to create an instance of the RatingList class with "new"
    let nullMatches = []; let liveMatches = []; let finishedMatches = [];

    try {
        ratingList = fromFile(filename);
        nullMatches = matchesFromFile('nullMatches.txt');
        liveMatches = matchesFromFile('liveMatches.txt');
        finishedMatches = matchesFromFile('finishedMatches.txt');
    }
    catch (error) {
        console.error('An error reading from files occurred: ', error.message);
    }
}

// wait while user uses website

// export to files when finished (and possibly continuously during on interaction)
function saveAll(ratingList, nullMatches, liveMatches, finishedMatches) {
    toFile(ratingList);
    matchesToFile(nullMatches, 'nullMatches.txt');
    matchesToFile(liveMatches, 'liveMatches.txt');
    matchesToFile(finishedMatches, 'finishedMatches.txt');
}