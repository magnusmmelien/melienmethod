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
// import Match from './match.js';
import { toFile, fromFile, matchesToFile, matchesFromFile } from './fileStream.js';


/*
// import from files
function initialize(listName = 'Norway') {
    const writeToFileCont = true;
    const filename = `${listName}_RatingList.txt`;

    var ratingList = new RatingList(listName); // You need to create an instance of the RatingList class with "new"
    var nullMatches = []; var liveMatches = []; var finishedMatches = [];

    try {
        ratingList = fromFile(filename);
        nullMatches = matchesFromFile('nullMatches.txt');
        liveMatches = matchesFromFile('liveMatches.txt');
        finishedMatches = matchesFromFile('finishedMatches.txt');
    }
    catch (error) {
        console.error('An error reading from files occurred: ', error.message);
    }
}*/

// wait while user uses website

// export to files when finished (and possibly continuously during on interaction)
function saveAll(ratingList, nullMatches, liveMatches, finishedMatches) {
    toFile(ratingList);
    matchesToFile(nullMatches, 'nullMatches.txt');
    matchesToFile(liveMatches, 'liveMatches.txt');
    matchesToFile(finishedMatches, 'finishedMatches.txt');
}

// Initialize: (import from files)
const listName = 'Norway';
const writeToFileCont = true;
const filename = `${listName}_RatingList.txt`;

var ratingList = new RatingList(listName); // You need to create an instance of the RatingList class with "new"
var nullMatches = []; var liveMatches = []; var finishedMatches = [];

try {
    // ratingList = fromFile('data/' + filename);
    ratingList = fromFile('data/Norway_RatingList.txt');
    nullMatches = matchesFromFile(ratingList, 'data/nullMatches.txt');
    liveMatches = matchesFromFile(ratingList, 'data/liveMatches.txt');
    finishedMatches = matchesFromFile(ratingList, 'data/finishedMatches.txt');
    
    console.log('Read files successfully');
}
catch (error) {
    console.error('An error reading from files occurred: ', error.message);
}