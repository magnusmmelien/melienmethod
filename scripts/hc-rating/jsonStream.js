// import Player from './player.js';
import RatingList from './rating-list.js';
import Match from './match.js';

// At some point: add functionality to change "filepath" --> "(Firebase) Realtime database"


export function listToJSON_local(ratingList, filepath) {
    const json = JSON.stringify(ratingList, null, 2); // The 'null, 2' argument makes the JSON string human-readable with an indentation of 2 spaces.
    //const json = ratingList.toJSON();
    //console.log('Debug: listToJSON_local(); json =');
    //console.log(json);
    localStorage.setItem(filepath, json);
    console.log('Rating list data saved to local storage (' + filepath + ')');
}
// export functionlistToJSON_db(ratingList, filepath) {}
export function listFromJSON_local(filepath, debugMode = false) {
    if (debugMode) {console.log('debug: listFromJSON_local; filepath = ' + filepath);}
    
    var content = null;
    try {
        content = localStorage.getItem(filepath);
    }
    catch (error) {
        console.log('debug: listFromJSON_local; test 1')
        console.error(error);
    }
    if (debugMode) {
        console.log('debug: listFromJSON_local; content = ');
        console.log(content);
    }

    if (content) {
        if (debugMode) {
            console.log('debug: listFromJSON_local; found content! content = ');
            console.log(content);
        }
        //const ratingListData = JSON.parse(content);
        //const ratingList = RatingList.fromJSON(ratingListData); // Use the fromJSON method to reconstruct the RatingList
        const ratingList = RatingList.fromJSON(content);
        console.log(`Rating list successfully retrieved from local storage (${filepath})`);
        return ratingList;
    } else {
        console.log(`No rating list was found in local storage (${filepath})`);
        throw new Error('Error: failed to retrieve rating list data from: (' + filepath + ')');
    }
}
// export function listFromJSON_db(filepath) {}


export function matchesToJSON_local(matches, filepath) {
    const matchesData = matches.map(match => match.toJSON());
    const json = JSON.stringify(matchesData, null, 2); // The 'null, 2' argument makes the JSON string human-readable with an indentation of 2 spaces.

    localStorage.setItem(filepath, json);
    console.log('Matches data saved to local storage.');
}
// export function matchesToJSON_db(matches, filepath) {}

export function matchesFromJSON_local(ratingList, filepath) {
    const content = localStorage.getItem(filepath);

    if (content) {
        const matchesData = JSON.parse(content);
        const matches = matchesData.map(matchData => {
            return new Match(
                matchData.id,
                ratingList.getPlayerByName(matchData.playerA.getName()),
                ratingList.getPlayerByName(matchData.playerB.getName()),
                matchData.totalDistance,
                matchData.HC,
                matchData.distanceType,
                matchData.enumHCsystem
            );
        });
        console.log(`Matches successfully retrieved from (${filepath})`);
        return matches;
    } else {
        console.log(`No matches were found in local storage (${filepath})`);
        console.alert(`No matches were found in local storage (${filepath})`);
        
        throw new Error('Error: failed to retrieve match list data from: (' + filepath + ')');
        return null;
    }
}
// export function matchesFromJSON_db(ratingList, filepath) {}