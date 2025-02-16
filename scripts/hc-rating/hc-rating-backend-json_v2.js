import { Player, hcToRating, ratingToHC } from './player.js';
import RatingList from './rating-list.js';
import { Match, MatchState, DistanceType, HCsystem } from './match.js';
import { BreaksList, BreaksEntry, resetPbBreaks } from './breakslist.js';
import { listToJSON_local, listFromJSON_local, matchesToJSON_local, matchesFromJSON_local } from './jsonStream.js';
import * as variables from './variables.js';
import { listName } from './variables.js';
import { refreshOnce, roundedToFixed, autocomplete } from './hc-rating-util.js';
// import { toggleExpand, startMatch_frontend, finishMatch_frontend, deleteMatch_frontend, toggleDeletePopup } from './hc-rating-frontend.js';
// Database:
import { getDatabase, ref, onValue, child, push, update, get } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { database, matchCounterRef, clubsRef } from './database_init.js'; 

class LoadSystem {
    static db = 'Firebase_database';
    static local = 'local storage';
    static init = 'initialize';
}

// Initialize: (import)
const globalLoadSystem = LoadSystem.db;
const writeToFileCont = true;
const debugWrite = false;
const year = new Date().getFullYear(); const month = new Date().getMonth();
var ratingList = new RatingList(listName);
var nullMatches = []; var liveMatches = []; var finishedMatches = [];
var breaksList = new BreaksList(listName);
const dbRef = ref(getDatabase());
const nullMatchesRef = ref(database, `${listName}_nullMatches`);
const liveMatchesRef = ref(database, `${listName}_liveMatches`);
const finishedMatchesRef = ref(database, `${listName}_finishedMatches`);


if (!writeToFileCont) console.warn('Warning: writeTFileCont (write to db continuously) is off (false)!');


// Backend functional functions
function createNewPlayer_backend() {
    document.getElementById('error-message-newPlayer').classList.remove('show');
    var init_robust = 0;
    var init_rating = variables.defaultRating;
    var init_highbreak = 0;
    
    if (document.getElementById('button-advanced').classList.contains('active')) { // advanced
        if (!['', ' ', '\n'].includes(document.getElementById('newplayer-rating-input').value)) {
            init_rating = Number(document.getElementById('newplayer-rating-input').value);
        }
        if (!['', ' ', '\n'].includes(document.getElementById('newplayer-highbreak-input').value)) {
            init_highbreak = Number(document.getElementById('newplayer-highbreak-input').value);
        }
        
        if (document.getElementById('choose-robustness-high').classList.contains('active')) {
            init_robust = variables.robustHigh;
        } else if (document.getElementById('choose-robustness-medium').classList.contains('active')) {
            init_robust = variables.robustMedium;
        }
    }
    try {
        ratingList.addNewPlayer(document.getElementById('newplayer-name-input').value, 
            document.getElementById('newplayer-club-input').value, init_rating, init_robust, init_highbreak);
        //console.log('test1: ', ratingList);
        
        // Database:
        if (writeToFileCont) {
            const updates = {};
            updates[listName + '_RatingList'] = ratingList;
            update(ref(database), updates);
        }
    }
    catch(error) {
        console.error(error);
        document.getElementById('error-message-newPlayer').classList.add('show');
        return;
    }
    
    togglePlayerPopup();
    redraw_rl();
    autocomplete(document.getElementById("newmatch-playerA-input"), ratingList.getPlayers());
    autocomplete(document.getElementById("newmatch-playerB-input"), ratingList.getPlayers());
    autocomplete(document.getElementById("hcCalc-playerA-input"), ratingList.getPlayers());
    autocomplete(document.getElementById("hcCalc-playerB-input"), ratingList.getPlayers());
    autocomplete(document.getElementById("hcCalc-playerR-input"), ratingList.getPlayers());
    autocomplete(document.getElementById("estimate-playerR-input"), ratingList.getPlayers());
}
document.getElementById('newplayer-confirm').addEventListener("click", function() {createNewPlayer_backend();});
function createNewMatch_backend() {
    document.getElementById('error-message-newMatch').classList.remove('show');
    // create new match here:
    //const url = 'scripts/hc-rating/data/matchCounter.json';
    //var matchCounter = 0;
    // Fetch the JSON data
    /*fetch(url)
    .then(response => response.json())
    .then(data => {
        // Increment the value
        matchCounter = Number(data) + 1;

        // Update the JSON file with the new value
        fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(matchCounter)
        });
    }).catch(error => console.error('Error:', error));
    */


    try{
        const playerA = ratingList.getPlayerByName(document.getElementById('newmatch-playerA-input').value);
        const playerB = ratingList.getPlayerByName(document.getElementById('newmatch-playerB-input').value);
        if (playerA == null || playerB == null) {throw new Error('Error: couldnt find both players.');}
        var distanceType = DistanceType.bestOf;
        if (document.getElementById('button-free-frames').classList.contains('active')) distanceType = DistanceType.justFrames;
        var distance = 0;
        if (distanceType === DistanceType.bestOf) {
            if (document.getElementById('match-distance-input').value === '') distance = 5; // default distance
            else {distance = Number(document.getElementById('match-distance-input').value);}
        }
        var hc = 0;
        if (document.getElementById('button-HC').classList.contains('active')) {
            if (document.getElementById('newmatch-HC-input').value === '') { // i.e. "left empty"
                hc = ratingToHC(playerA.getRating(), playerB.getRating());
                //hc = ratingList.getHC(playerA, playerB);
            } 
            else {hc = Number(document.getElementById('newmatch-HC-input').value);}
        }
        var urs = HCsystem.frame;
        if (document.getElementById('button-match').classList.contains('active')) {urs = HCsystem.match;}
        
        nullMatches.unshift(new Match(++matchCounter, playerA, playerB, distance, hc, distanceType, urs));

        // Database:
        if (writeToFileCont) {
            const updates = {};
            // update match counter
            updates['matchCounter'] = matchCounter;
            // update name_nullMatches
            updates[listName + '_nullMatches'] = nullMatches;
            update(ref(database), updates);
        }
    } 
    catch(error) {
        console.error(error);
        document.getElementById('error-message-newMatch').classList.add('show');
        return;
    }

    // close window
    toggleMatchPopup();
    redraw_ml();
    // matchtable[0].scrollIntoView..?
}
document.getElementById('newmatch-confirm').addEventListener("click", function() {createNewMatch_backend();});

// Visual functions
// Copied functions from 'hc-rating-frontend.js' because it can't be a module (i.e. use "export")...
function toggleExpand(i) {
    const expandButton = document.getElementById(`match-${i}-expand`);
    const infoRow = document.getElementById(`match-${i}-info`);
    const breakRow = document.getElementById(`match-${i}-break`);
    expandButton.classList.toggle("active");
    infoRow.classList.toggle("active");
    breakRow.classList.toggle("active");

    // check if match is finished to see if edit-button should be displayed:
    const matchRow = document.getElementById(`match-${i}`);
    const editButton = document.getElementById(`match-${i}-edit`);
    
    /* // I think this is already handled in the popuplateMatchList-funcions..?
    if (matchRow.classList.contains("match-finished")) {
        editButton.style = "display: none;";
    } else {
        editButton.style = "display: block;";
    }
    */
}
function toggleEditPopup_backend() {
    document.getElementById("popup-edit").classList.toggle("active");
    if (!document.getElementById("popup-edit").classList.contains('active')) {return;}

    document.getElementById("edit-scoreA-input").value = ""; // fill in what the actual match is...
    document.getElementById("edit-scoreB-input").value = "";
    document.getElementById("edit-distance-input").value = "";
    document.getElementById("edit-HC-input").value = "";
    
    const id = Number(document.getElementById('confirm-edit-button').name);
    const match = getMatch(id);

    document.getElementById('edit-scoreA-input').value = match.getScoreA();
    document.getElementById('edit-scoreB-input').value = match.getScoreB();

    let distanceTypeString = 'best-of';
    if (match.getDistanceType() === DistanceType.justFrames) {distanceTypeString = 'free-frames';}
    toggleDistanceType(distanceTypeString, 'edit');

    document.getElementById('edit-distance-input').value = match.getDistance();

    if (document.getElementById("popup-edit-HC-row").classList.contains("active")) {toggleHC('edit');}
    document.getElementById('edit-HC-input').value = match.getHC();
    if (match.getHC() !== 0) {
        toggleHC('edit');
    }

    let ursString = 'frames';
    if (match.getHCsystem() === HCsystem.match) {ursString = 'match';}
    toggleURS(ursString, 'edit');

    document.getElementById('edit-breaksA-input').value = match.getBreaksA().join(', ');
    document.getElementById('edit-breaksB-input').value = match.getBreaksB().join(', ');
}
function toggleFinishPopup_backend() {
    document.getElementById("popup-finish").classList.toggle("active");
}
function toggleDeletePopup_backend() {
    document.getElementById("popup-delete").classList.toggle("active");
}
function hcCalcCheckHC_backend() {
    const myElement = document.getElementById('output-HC');
    const block = document.getElementById('output-HC-block');
    document.getElementById('hcCalc-playerR-input').value = '';
    document.getElementById('hcCalc-ratingR-input').value = '';
    document.getElementById('hcCalc-hcEstimate-input').value = '';
    document.getElementById('output-rating').textContent = '';
    document.getElementById('error-message-hcCalc').classList.remove('show');

    myElement.textContent = 'error';
    if (document.getElementById('button-by-name').classList.contains('active')) {
        try {
            const playerA = ratingList.getPlayerByName(document.getElementById('hcCalc-playerA-input').value);
            const playerB = ratingList.getPlayerByName(document.getElementById('hcCalc-playerB-input').value);
            console.log('debug: ratingList =');
            console.log(ratingList);
            console.log('debug: player A =');
            console.log(playerA);
            myElement.textContent = ratingToHC(playerA.getRating(), playerB.getRating());
        } catch (error) {
            console.error(error);
            document.getElementById('error-message-hcCalc').classList.add('show');
            return;
        }
    } else if (document.getElementById('button-by-rating').classList.contains('active')) {
        try {
            const ratingAtext = document.getElementById('hcCalc-ratingA-input').value;
            const ratingBtext = document.getElementById('hcCalc-ratingB-input').value;
            if (!ratingAtext || !ratingBtext) {throw new Error('Error: please fill in all required information.')}
            myElement.textContent = ratingToHC(Number(ratingAtext), Number(ratingBtext));
        } catch (error) {
            console.error(error);
            document.getElementById('error-message-hcCalc').classList.add('show');
            return;
        }
    }

    myElement.classList.remove('animation');
    document.getElementById('output-rating').classList.remove('animation');
    setTimeout(function() {myElement.classList.add('animation')}, 100);

    block.classList.remove('block');
    document.getElementById('output-rating-block').classList.remove('block');
    setTimeout(function() {block.classList.add('block')}, 100);
}
document.getElementById('check-HC').addEventListener("click", function () { hcCalcCheckHC_backend(); });
function hcCalcCheckRating_backend() {
    const myElement = document.getElementById('output-rating');
    const block = document.getElementById('output-rating-block');
    document.getElementById('hcCalc-playerA-input').value = '';
    document.getElementById('hcCalc-playerB-input').value = '';
    document.getElementById('hcCalc-ratingA-input').value = '';
    document.getElementById('hcCalc-ratingB-input').value = '';
    document.getElementById('output-HC').textContent = '';
    document.getElementById('error-message-hcCalc').classList.remove('show');

    myElement.textContent = 'error';
    if (document.getElementById('button-by-name').classList.contains('active')) {
        try {
            const inputHC = - Number(document.getElementById('hcCalc-hcEstimate-input').value); //negative because we enter it in the opposite order
            const playerRtext = document.getElementById('hcCalc-playerR-input').value;
            if (Math.abs(inputHC) >= variables.hcMax || !playerRtext) {throw new Error('Error: please fill in all required information')};
            myElement.textContent = roundedToFixed(ratingList.getPlayerByName(playerRtext).getRating() + hcToRating(inputHC));
        } catch (error) { 
            console.error(error);
            document.getElementById('error-message-hcCalc').classList.add('show');
            return;
        }
    } else if (document.getElementById('button-by-rating').classList.contains('active')) {
        try {
            const inputHC = - Number(document.getElementById('hcCalc-hcEstimate-input').value);
            const inputRatingText = document.getElementById('hcCalc-ratingR-input').value;
            if (Math.abs(inputHC) >= variables.hcMax || !inputRatingText) {throw new Error('Error: please fill in all required information')};
            myElement.textContent = roundedToFixed(Number(inputRatingText) + hcToRating(inputHC));
        } catch (error) {
            console.error(error);
            document.getElementById('error-message-hcCalc').classList.add('show');
            return;
        }
    }

    myElement.classList.remove('animation');
    document.getElementById('output-HC').classList.remove('animation');
    setTimeout(function() {myElement.classList.add('animation')}, 100);

    block.classList.remove('block');
    document.getElementById('output-HC-block').classList.remove('block');
    setTimeout(function() {block.classList.add('block')}, 100);
}
document.getElementById('check-rating').addEventListener("click", function () { hcCalcCheckRating_backend(); });
function estimateCheckRating() {
    const myElement = document.getElementById('output-rating-estimate');
    const block = document.getElementById('output-rating-block-estimate');
    document.getElementById('error-message-estimate').classList.remove('show');

    myElement.textContent = 'error';
    if (document.getElementById('button-by-name-estimate').classList.contains('active')) {
        try {
            const inputHC = - Number(document.getElementById('estimate-hcEstimate-input').value); //negative because we enter it in the opposite order
            const playerRtext = document.getElementById('estimate-playerR-input').value;
            if (Math.abs(inputHC) >= variables.hcMax || !playerRtext) {throw new Error('Error: please fill in all required information')};
            myElement.textContent = roundedToFixed(ratingList.getPlayerByName(playerRtext).getRating() + hcToRating(inputHC));
        } catch (error) { 
            console.error(error);
            document.getElementById('error-message-estimate').classList.add('show');
            return;
        }
    } else if (document.getElementById('button-by-rating-estimate').classList.contains('active')) {
        try {
            const inputHC = - Number(document.getElementById('estimate-hcEstimate-input').value);
            const inputRatingText = document.getElementById('estimate-ratingR-input').value;
            if (Math.abs(inputHC) >= variables.hcMax || !inputRatingText) {throw new Error('Error: please fill in all required information')};
            myElement.textContent = roundedToFixed(Number(inputRatingText) + hcToRating(inputHC));
        } catch (error) {
            console.error(error);
            document.getElementById('error-message-estimate').classList.add('show');
            return;
        }
    }

    myElement.classList.remove('animation');
    document.getElementById('output-rating-estimate').classList.remove('animation');
    setTimeout(function() {myElement.classList.add('animation')}, 100);

    block.classList.remove('block');
    document.getElementById('output-rating-block-estimate').classList.remove('block');
    setTimeout(function() {block.classList.add('block')}, 100);
}
document.getElementById('check-rating-estimate').addEventListener("click", function () { estimateCheckRating(); });
function confirmEstimate() {
    try {
        const myElement = document.getElementById('output-rating-estimate');
        if (myElement.textContent === 'error' || myElement.textContent === '') throw new Error('Invalid rating output');
        document.getElementById('newplayer-rating-input').value = Number(myElement.textContent);
        toggleEstimatePopup();
    }
    catch(error) {
        console.error(error);
        document.getElementById('error-message-estimate').classList.add('show');
    }
    
}
document.getElementById('estimateConfirmButton').addEventListener("click", function () { confirmEstimate(); });


// Backend functional functions
function startMatch_backend(id) {
    var match = getMatch(id);
    nullMatches.splice(nullMatches.indexOf(match), 1);
    match.startMatch();

    liveMatches.unshift(match);

    try {
        // update db:
        // null and liveMatches
        if (writeToFileCont) {
            const updates = {};
            // update name_nullMatches
            updates[listName + '_nullMatches'] = nullMatches;
            // update name_liveMatches
            updates[listName + '_liveMatches'] = liveMatches;
            update(ref(database), updates);
        }
    } catch(error) {
        console.error('Error starting (updating db) match (id = ' + id + '): ' + error.message + '\nPlease contact admin.');
        alert('Error starting (updating db) match (id = ' + id + '): ' + error.message + '\nPlease contact admin.');
    }

    redraw_ml();
}
function finishMatch_backend() {
    // finish match backend
    const match = getMatch(Number(document.getElementById('confirm-finish-button').name), 'live');
    try {
        match.finishMatch();
        liveMatches.splice(liveMatches.indexOf(match), 1);

        finishedMatches.unshift(match);
        updateBreaksList(match);
    }
    catch(error) {
        console.error('Error: unable to finish match (backend):\n' + error.message);
        alert('Error: unable to finish match (backend):\n' + error.message);
        redraw();
        return;
    }

    try {
        // update db:
        // liveMatches AND finishedMatches
        if (writeToFileCont) {
            const updates = {};
            // update name_liveMatches
            updates[listName + '_liveMatches'] = liveMatches;
            // update name_archive
            // archive: this match
            var newArchiveKey = push(ref(database, `${listName}_archive/data/${year}/${month}`)).key;
            updates[`${listName}_archive/data/${year}/${month}/${newArchiveKey}`] = match;
            console.log('debug: successfully archived finished match!');
            // update name_finishedMatches
            if (finishedMatches.length > 32) finishedMatches.pop();
            updates[listName + '_finishedMatches'] = finishedMatches;
            // update rating list
            updates[listName + '_RatingList'] = ratingList;
            // update breaks list
            //console.log('test: breaksList = ');
            //console.log(breaksList);
            updates[listName + '_BreaksList/data/' + year] = breaksList;

            update(ref(database), updates);
        }
    } catch(error) {
        console.error('Error finishing (updating db) match (id = ' + match.getID() + '): ' + error.message + '\nPlease contact admin.');
        alert('Error finishing (updating db) match (id = ' + match.getID() + '): ' + error.message + '\nPlease contact admin.');
    }

    // close confirm window
    toggleFinishPopup_backend();
    redraw();
}
document.getElementById('confirm-finish-button').addEventListener("click", function () {
    if (!getMatch(Number(this.name)).isMatchFinished()) {
        toggleFinishPopup();
        toggleNotFinishPopup();
    } else {
        finishMatch_backend(); 
    }
});
document.getElementById('confirm-not-finish-button').addEventListener("click", function () { 
    const match = getMatch(Number(document.getElementById('confirm-finish-button').name));
    
    match.setHCsystem(HCsystem.frame);
    match.setDistanceType(DistanceType.justFrames);
    finishMatch_backend(); 
    toggleFinishPopup();
    toggleNotFinishPopup();
});
function deleteMatch_backend() {
    //delete match id backend
    try {
        const match = getMatch(Number(document.getElementById('confirm-delete-button').name));
        const updates = {};

        if (match.getState() === MatchState.null) {
            nullMatches.splice(nullMatches.indexOf(match), 1); 
            // update name_nullMatches
            updates[listName + '_nullMatches'] = nullMatches;
        }
        else if (match.getState() === MatchState.live) {
            liveMatches.splice(liveMatches.indexOf(match), 1);
            // update name_liveMatches
            updates[listName + '_liveMatches'] = liveMatches;
        }
        else throw new Error(`Error: failed to delete match (id = ${document.getElementById('confirm-delete-button').name})`);

        // update db:
        if (writeToFileCont) update(ref(database), updates);

    } catch(error) {
        console.error(error);
        alert('Error deleting match: ' + error.message + '\nPlease contact admin.');
    }
    
    //close confirm window
    toggleDeletePopup_backend();
    redraw_ml();
}
document.getElementById('confirm-delete-button').addEventListener("click", function () { deleteMatch_backend(); });
function updateMatch_backend() {
    try {
        // update match stats
        const id = Number(document.getElementById('confirm-edit-button').name);
        const match = getMatch(id);

        // score
        if (match.getState() === MatchState.live) {
            match.updateScore(Number(document.getElementById('edit-scoreA-input').value), 
                Number(document.getElementById('edit-scoreB-input').value));
        }
        // distance type
        if (document.getElementById('edit-button-best-of').classList.contains('active')) {match.setDistanceType(DistanceType.bestOf);}
        else {match.setDistanceType(DistanceType.justFrames);}
        // distance
        match.setDistance(Number(document.getElementById('edit-distance-input').value));
        // hc
        if (document.getElementById('edit-button-HC').classList.contains('active')) { // hc is checked "on"
            if (['', ' ', '\n'].includes(document.getElementById('edit-HC-input').value)) { // i.e. "left empty"
                match.setHC(ratingToHC(match.getPlayerA().getRating(), match.getPlayerB().getRating()));
                //match.setHC(ratingList.getHC(match.getPlayerA(), match.getPlayerB()));
            } else {
                match.setHC(Number(document.getElementById('edit-HC-input').value));
            }
        } else {
            match.setHC(0);
        }
        //urs
        if (document.getElementById('edit-button-match').classList.contains('active')) {match.setHCsystem(HCsystem.match);}
        else {match.setHCsystem(HCsystem.frame);}

        // breaks
        if (document.getElementById('edit-breaksA-input').value !== match.getBreaksA().join(', ')) {
            //update breaks for A
            const inputString = document.getElementById('edit-breaksA-input').value;
            var xxx = inputString.split(', ');
            for (let i = 0; i < xxx.length; i++) {
                //console.log(Number(xxx[i]));
                if (Number(xxx[i]) < 25 || Number(xxx[i]) > 155) {
                    console.error('Error: tried to enter a break (' + xxx[i] + ') out of bounds (skipped).');
                    xxx.splice(i, 1);
                }
            }
            match.setBreaksA(xxx);
            //console.log('update breaks for A: inputString = ' + inputString + ' ; xxx = ' + xxx + ' ; getBreaksA() = ' + match.getBreaksA());
        }
        if (document.getElementById('edit-breaksB-input').value !== match.getBreaksB().join(', ')) {
            //update breaks for B
            const inputString = document.getElementById('edit-breaksB-input').value;
            var xxx = inputString.split(', ');
            for (let i = 0; i < xxx.length; i++) {
                //console.log(Number(xxx[i]));
                if (Number(xxx[i]) < 25 || Number(xxx[i]) > 155) {
                    console.error('Error: tried to enter a break (' + xxx[i] + ') out of bounds (skipped).');
                    xxx.splice(i, 1);
                }
            }
            match.setBreaksB(xxx);
            //console.log('update breaks for B: inputString = ' + inputString + ' ; xxx = ' + xxx + ' ; getBreaksB() = ' + match.getBreaksB());
        }

        // update db:
        if (writeToFileCont) {
            const updates = {};
            if (match.getState() === MatchState.null) {
                // update name_nullMatches
                updates[listName + '_nullMatches'] = nullMatches;
            }
            else if (match.getState() === MatchState.live) {
                // update name_liveMatches
                updates[listName + '_liveMatches'] = liveMatches;
            }
            else throw new Error('Ops! This was not supposed to happen... did you try to delete a finished match??? dunno...');
            update(ref(database), updates);
        }

    } catch(error) {
        const id = Number(document.getElementById('confirm-edit-button').name);
        console.error('Error trying to update match stats for match id = ' + id+ '.\nPlease contact admin.');
        alert('Error trying to update match stats for match id = ' + id + '.\nPlease contact admin.');
    }

    // close edit window
    toggleEditPopup_backend();
    redraw_ml();
}
document.getElementById('confirm-edit-button').addEventListener("click", function () { updateMatch_backend(); });
function addBreak_backend(i, x) {
    // i: match id
    // x: playerA = "A", playerB = "B"

    const myInput = document.getElementById(`match-${i}-break${x}input`);

    if (myInput.classList.contains('show')) { // input field is showing
        // try to add break
        if (myInput.value >= 25 && myInput.value <= 155) {
            try {
                const myBreak = Number(myInput.value);
                setTimeout(function() {
                    // just test: no db - just text
                    //console.log(getMatch(i));
                    //console.log(liveMatches);
                    if (x === 'A') getMatch(i).addBreakA(myBreak);
                    else if (x === 'B') getMatch(i).addBreakB(myBreak);
                    //console.log(getMatch(i));
                    //console.log(liveMatches);
                    //document.getElementById(`match-${i}-breaks${x}`).textContent += `, ${myBreak}`;
                    // Database:
                    if (writeToFileCont) {
                        const updates = {};
                        // update match counter
                        updates[listName + '_liveMatches'] = liveMatches;
                        update(ref(database), updates);
                    }
                }, 250);
            }
            catch(error) {
                alert(error);
                throw new Error(error);
            }
        }
        else if (myInput.value) alert('Error: invalid break.');
    }
    else { // input field is not showing now --> so it will open now --> give focus
        myInput.focus();
    }
    
    myInput.value = '';
    myInput.classList.toggle('show');
}
function updateBreaksList(match) {
    try {
        if (match.getState() !== MatchState.finished) throw new Error('Tried to register breaks from un-finished match (id = ' + match.getID());
        const nameA = match.getPlayerA().getName();
        const nameB = match.getPlayerB().getName();
        /*match.getBreaksA().forEach(x => {
            breaksList.addBreak(nameA, x);
        });
        match.getBreaksB().forEach(x => {
            breaksList.addBreak(nameB, x);
        });*/
        //console.log('test: match.getBreaksA() =', match.getBreaksA());
        breaksList.addBreaks(nameA, match.getBreaksA());
        breaksList.addBreaks(nameB, match.getBreaksB());
    }
    catch(error) {console.error(error);}    
}


// Graphics functions
function populateRatingListTable(ratingList) {
    const table = document.getElementById('list-table-rating').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    const players = ratingList.getList();
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const row = table.insertRow(-1);

        const positionCell = row.insertCell(0);
        const nameCell = row.insertCell(1);
        nameCell.classList.add('rating-list-name');
        const clubCell = row.insertCell(2);
        const ratingCell = row.insertCell(3);
        ratingCell.classList.add('rating-list-rating');
        const robustnessCell = row.insertCell(4);
        const scrollCell = row.insertCell(5);
        scrollCell.style = 'padding: 0.25rem';

        positionCell.innerHTML = `<p class="position">${i + 1}</p>`;
        nameCell.innerHTML = player.getName();
        clubCell.innerHTML = `<img class="club-logo" src="images/${player.getClub()}_logo.png" title="${player.getClub()}" onerror="this.src = 'images/default_logo.png'" alt="">`;
        ratingCell.innerHTML = roundedToFixed(player.getRating());
        robustnessCell.innerHTML = `<p class="robustness robustness-${player.getRobustLevel().toLowerCase()}">${player.getRobustLevel()}</p>`;
    }
}
function populateMatchListRow_main(match, mainRow) {
    const myID = match.getID();
    // NULL / GENERAL
    
        //position
        const positionCell = document.createElement('td');
        const positionParagraph = document.createElement('p');
        positionParagraph.classList.add('position');
        positionParagraph.id = `match-${myID}-number`;
        positionParagraph.textContent = myID;
        positionCell.appendChild(positionParagraph);
        mainRow.appendChild(positionCell);

        //logo a
        const logoAcell = document.createElement('td');
        /*logoAcell.style = "padding: 0;";
        const logoAimg = document.createElement('img');
        logoAimg.classList.add('club-logo');
        logoAimg.classList.add('club-logo-match');
        logoAimg.id = `match-${myID}-clubA`;
        logoAimg.src = `images/${match.getPlayerA().getClub()}_logo.png`;
        logoAimg.onerror = "this.src = 'images/default_logo.png'";*/
        logoAcell.innerHTML = `<img id="match-${myID}-clubA" class="club-logo club-logo-match" 
            src="images/${match.getPlayerA().getClub()}_logo.png" title="${match.getPlayerA().getClub()}" 
            onerror="this.src = 'images/default_logo.png'" alt="" style="padding: 0;">`;
        //logoAcell.appendChild(logoAimg);
        mainRow.appendChild(logoAcell);

        //playerA
        const playerAcell = document.createElement('td');
        playerAcell.style = "text-align: right;";
        playerAcell.id = `match-${myID}-playerA`;
        playerAcell.textContent = match.getPlayerA().getName();
        if (match.getHC() < 0) { playerAcell.textContent += ` (${Math.abs(match.getHC())})`; }
        mainRow.appendChild(playerAcell);

        //scores
        const scoreCell = document.createElement('td');
        const scoreDivA = document.createElement('div');
        scoreDivA.classList.add('score-div');
        const matchInfo = document.createElement('div');
        matchInfo.classList.add('match-info');
        const scoreDivB = document.createElement('div');
        scoreDivB.classList.add('score-div');
        
        const scoreA = document.createElement('div');
        scoreA.id = `match-${myID}-scoreA`;
        scoreA.textContent = match.getScoreA();
        if (match.getState() === MatchState.null) { scoreA.textContent = '-'; }
        if (match.getState() === MatchState.live) { scoreA.classList.add('score'); }
        scoreDivA.appendChild(scoreA);
        
        const matchDistance = document.createElement('span');
        matchDistance.id = `match-${myID}-distance`;
        matchDistance.textContent = `( ${match.getDistance()} )`;
        if (match.getDistanceType() === DistanceType.justFrames) { matchDistance.textContent = '( - )'; }
        matchInfo.appendChild(matchDistance);
        const toggleExpandButton = document.createElement('button');
        toggleExpandButton.classList.add('expand');
        if (trackExpand.includes(myID)) toggleExpandButton.classList.add('active');
        toggleExpandButton.id = `match-${myID}-expand`;
        toggleExpandButton.onclick = function() { toggleExpand(myID); };
        matchInfo.appendChild(toggleExpandButton);

        const scoreB = document.createElement('div');
        scoreB.id = `match-${myID}-scoreB`;
        scoreB.textContent = match.getScoreB();
        if (match.getState() === MatchState.null) { scoreB.textContent = '-'; }
        if (match.getState() === MatchState.live) { scoreB.classList.add('score'); }
        scoreDivB.appendChild(scoreB);

        scoreCell.appendChild(scoreDivA);
        scoreCell.appendChild(matchInfo);
        scoreCell.appendChild(scoreDivB);
        mainRow.appendChild(scoreCell);

        //playerB
        const playerBcell = document.createElement('td');
        playerBcell.style = "text-align: left;";
        playerBcell.id = `match-${myID}-playerB`;
        playerBcell.textContent = match.getPlayerB().getName();
        if (match.getHC() > 0) { playerBcell.textContent += ` (${Math.abs(match.getHC())})`; }
        mainRow.appendChild(playerBcell);

        //logo b
        const logoBcell = document.createElement('td');
        /*logoAcell.style = "padding: 0;";
        const logoBimg = document.createElement('img');
        logoBimg.classList.add('club-logo');
        logoBimg.classList.add('club-logo-match');
        logoBimg.id = `match-${myID}-clubB`;
        logoBimg.src = `images/${match.getPlayerB().getClub()}_logo.png`;
        logoBimg.onerror = "this.src = 'images/default_logo.png'";
        */
        logoBcell.innerHTML = `<img id="match-${myID}-clubB" class="club-logo club-logo-match" 
            src="images/${match.getPlayerB().getClub()}_logo.png" onerror="this.src = 'images/default_logo.png'" 
            title ="${match.getPlayerB().getClub()}" alt="" style="padding: 0;">`;
        //logoBcell.appendChild(logoBimg);
        mainRow.appendChild(logoBcell);

        //buttons
        const buttonsCell = document.createElement('td');
        const startButton = document.createElement('button');
        startButton.classList.add('match-button');
        startButton.id = `match-${myID}-start`;
        startButton.textContent = 'Start';
        startButton.onclick = function() { 
            startMatch_backend(myID); 
        };
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('match-button');
        deleteButton.classList.add('delete');
        deleteButton.id = `match-${myID}-delete`;
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() { 
            document.getElementById('confirm-delete-button').name = myID; 
            // this is so that when you click confirm you can know which match to DELETE by the current "name" of the button...
            toggleDeletePopup_backend(); 
        };
        if (match.getState() !== MatchState.finished) {
            buttonsCell.appendChild(startButton);
            buttonsCell.appendChild(deleteButton);
        }
        mainRow.appendChild(buttonsCell);

        // extra cell for scrollbar..?
        const scrollCell = document.createElement('td');
        scrollCell.style = 'padding: 0.25rem';
        mainRow.appendChild(scrollCell);
    

    // LIVE
    if (match.getState() === MatchState.live) {
        mainRow.className = "";
        mainRow.classList.add('match-live');

        //add the score buttons
        const plusButtonA = document.createElement('button');
        const minusButtonA = document.createElement('button');
        const plusButtonB = document.createElement('button');
        const minusButtonB = document.createElement('button');

        plusButtonA.id = `match-${myID}-score-button-plus-left`;
        minusButtonA.id = `match-${myID}-score-button-minus-left`;
        plusButtonB.id = `match-${myID}-score-button-plus-right`;
        minusButtonB.id = `match-${myID}-score-button-minus-right`;

        plusButtonA.classList.add('score-button');
        plusButtonA.classList.add('score-button-plus-left');
        minusButtonA.classList.add('score-button');
        minusButtonA.classList.add('score-button-minus-left');
        plusButtonB.classList.add('score-button');
        plusButtonB.classList.add('score-button-plus-right');
        minusButtonB.classList.add('score-button');
        minusButtonB.classList.add('score-button-minus-right');

        const myIndex = liveMatches.indexOf(match);
        plusButtonA.addEventListener("click", function() { 
            getMatch(myID, 'live').incA(); scoreA.textContent = match.getScoreA(); 
            // update db:
            if (writeToFileCont) {
                const updates = {};
                // update match/scoreA
                updates[`${listName}_liveMatches/${myIndex}/scoreA`] = match.getScoreA();
                update(ref(database), updates);
            }
        });
        minusButtonA.addEventListener("click", function() { 
            getMatch(myID, 'live').decA(); scoreA.textContent = match.getScoreA(); 
            // update db:
            if (writeToFileCont) {
                const updates = {};
                // update match/scoreA
                updates[`${listName}_liveMatches/${myIndex}/scoreA`] = match.getScoreA();
                update(ref(database), updates);
            }            
        });
        plusButtonB.addEventListener("click", function() { 
            getMatch(myID, 'live').incB(); scoreB.textContent = match.getScoreB(); 
            // update db:
            if (writeToFileCont) {
                const updates = {};
                // update match/scoreB
                updates[`${listName}_liveMatches/${myIndex}/scoreB`] = match.getScoreB();
                update(ref(database), updates);
            }   
        });
        minusButtonB.addEventListener("click", function() { 
            getMatch(myID, 'live').decB(); scoreB.textContent = match.getScoreB(); 
            // update db:
            if (writeToFileCont) {
                const updates = {};
                // update match/scoreB
                updates[`${listName}_liveMatches/${myIndex}/scoreB`] = match.getScoreB();
                update(ref(database), updates);
            } 
        });

        const plusButtonAspan = document.createElement('span');
        const minusButtonAspan = document.createElement('span');
        const plusButtonBspan = document.createElement('span');
        const minusButtonBspan = document.createElement('span');

        plusButtonAspan.classList.add('plus-sign');
        plusButtonAspan.innerHTML = '&plus;';
        minusButtonAspan.classList.add('minus-sign');
        minusButtonAspan.innerHTML = '&minus;';
        plusButtonBspan.classList.add('plus-sign');
        plusButtonBspan.innerHTML = '&plus;';
        minusButtonBspan.classList.add('minus-sign');
        minusButtonBspan.innerHTML = '&minus;';

        plusButtonA.appendChild(plusButtonAspan);
        minusButtonA.appendChild(minusButtonAspan);
        plusButtonB.appendChild(plusButtonBspan);
        minusButtonB.appendChild(minusButtonBspan);

        scoreDivA.appendChild(plusButtonA);
        scoreDivA.removeChild(scoreA);
        scoreDivA.appendChild(scoreA);
        scoreDivA.appendChild(minusButtonA);
        scoreDivB.appendChild(plusButtonB);
        scoreDivB.removeChild(scoreB);
        scoreDivB.appendChild(scoreB);
        scoreDivB.appendChild(minusButtonB);

        //remove start button, add finish button
        buttonsCell.removeChild(startButton);
        const finishButton = document.createElement('button');
        finishButton.classList.add('match-button');
        finishButton.id = `match-${myID}-finish`;
        finishButton.textContent = 'Finish';
        finishButton.onclick = function () { 
            // this is so that when you click confirm you can know which match to FINISH by the current "name" of the button...
            document.getElementById('confirm-finish-button').name = myID;
            toggleFinishPopup_backend();
        };
        buttonsCell.appendChild(finishButton);
        // to get the order of the buttons right:
        buttonsCell.removeChild(deleteButton);
        buttonsCell.appendChild(deleteButton);
        
        //update visuals???
    }

    // FINISHED
    if (match.getState() === MatchState.finished) {
        mainRow.className = "";
        mainRow.classList.add('match-finished');

        toggleExpandButton.classList.add('expand-finished');

        //winner colours
        if (match.getScoreA() > match.getScoreB()) {
            playerAcell.classList.add('winner');
            scoreDivA.classList.add('winner');
        } else if ((match.getScoreA() < match.getScoreB())) {
            playerBcell.classList.add('winner');
            scoreDivB.classList.add('winner');
        } else {            
            playerAcell.classList.add('tie');
            scoreDivA.classList.add('tie');
            playerBcell.classList.add('tie');
            scoreDivB.classList.add('tie');
        }

        
        /* //remove the score buttons (i think these won't be added so this is redundant..?)
        scoreDivA.removeChild(document.getElementById(`match-${match.getID()}-score-button-plus-left`));
        scoreDivA.removeChild(document.getElementById(`match-${match.getID()}-score-button-minus-left`));
        scoreDivB.removeChild(document.getElementById(`match-${match.getID()}-score-button-plus-right`));
        scoreDivB.removeChild(document.getElementById(`match-${match.getID()}-score-button-minus-right`));
        */
        
        //remove the state buttons
        //buttonsCell.removeChild(startButton); 
        //buttonsCell.removeChild(finishButton); //hopefully redundant
        //buttonsCell.removeChild(deleteButton);

        //update visuals???
    }
}
function populateMatchListRow_info(match, infoRow) {
    // NULL / GENERAL
    
        const cell1 = document.createElement('td');
        infoRow.appendChild(cell1);
        const cell2 = document.createElement('td');
        infoRow.appendChild(cell2);

        const ratingAcell = document.createElement('td');
        ratingAcell.id = `match-${match.getID()}-ratingA`;
        ratingAcell.style = "text-align: right;";
        ratingAcell.textContent = roundedToFixed(match.getOrigRatingA(), 1);
        infoRow.appendChild(ratingAcell);

        const ursCell = document.createElement('td');
        ursCell.id = `match-${match.getID()}-urs`;
        if (match.getHCsystem() === HCsystem.match) {ursCell.textContent = 'URS: match'}
        if (match.getHCsystem() === HCsystem.frame) {ursCell.textContent = 'URS: frame'}
        infoRow.appendChild(ursCell);
        
        const ratingBcell = document.createElement('td');
        ratingBcell.id = `match-${match.getID()}-ratingB`;
        ratingBcell.style = "text-align: left;";
        ratingBcell.textContent = roundedToFixed(match.getOrigRatingB(), 1);
        infoRow.appendChild(ratingBcell);

        
        const cell3 = document.createElement('td');
        infoRow.appendChild(cell3);

        const editButtonCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.onclick = function() { 
            document.getElementById('confirm-edit-button').name = match.getID(); 
            // this is so that when you click confirm you can know which match to EDIT by the current "name" of the button...
            toggleEditPopup_backend(match.getID()); };
        editButton.classList.add('match-button');
        editButton.id = `match-${match.getID()}-edit`;
        editButton.style = "display: block;";
        editButton.textContent = 'Edit';
        editButtonCell.appendChild(editButton);
        infoRow.appendChild(editButtonCell);

        // extra cell for scrollbar..?
        const scrollCell = document.createElement('td');
        scrollCell.style = 'padding: 0.25rem';
        infoRow.appendChild(scrollCell);
    

    // LIVE
    if (match.getState() === MatchState.live) {
        infoRow.classList.add('match-live');
    }
    
    // FINISHED
    if (match.getState() === MatchState.finished) {
        infoRow.classList.add('match-finished');

        //add deltas
        if (match.getDeltaA() < 0) {
            ratingAcell.innerHTML = `<span class="rating-loss">&minus; 
                ${Math.abs(roundedToFixed(match.getDeltaA(), 1))}</span>${roundedToFixed(match.getOrigRatingA(), 1)}`; 
            ratingBcell.innerHTML = `${roundedToFixed(match.getOrigRatingB(), 1)}
                <span class="rating-win">&plus; ${Math.abs(roundedToFixed(match.getDeltaB(), 1))}</span>`; 
        } else if (match.getDeltaA() > 0) {
            ratingAcell.innerHTML = `<span class="rating-win">&plus; 
                ${Math.abs(roundedToFixed(match.getDeltaA(), 1))}</span>${roundedToFixed(match.getOrigRatingA(), 1)}`; 
            ratingBcell.innerHTML = `${roundedToFixed(match.getOrigRatingB(), 1)}
                <span class="rating-loss">&minus; ${Math.abs(roundedToFixed(match.getDeltaB(), 1))}</span>`;
        }

        //remove the state buttons
        editButtonCell.removeChild(editButton);

        //update visuals???
    }
}
function populateMatchListRow_break(match, breakRow) {
    // NULL / GENERAL
    // not visable until live

    // LIVE
    if (match.getState() === MatchState.live) {
        const myID = match.getID();

        breakRow.classList.add('match-live');
        
        const cell1 = document.createElement('td');
        breakRow.appendChild(cell1);
        const cell2 = document.createElement('td');
        breakRow.appendChild(cell2);

        const breakAcell = document.createElement('td');
        breakAcell.style = "text-align: right;";
        breakAcell.innerHTML = `<div id="match-${myID}-breaksA" style="display: inline-block;">${match.getBreaksA().join(', ')}</div>`;
        breakAcell.innerHTML += '&emsp;';
        //breakAcell.innerHTML += `<input id="match-${myID}-breakAinput" type="number" placeholder="25+" class="input-break" min="25" max="155">`;
        const breakAinput = document.createElement('input');
        breakAinput.id = `match-${myID}-breakAinput`;
        breakAinput.type = 'number';
        breakAinput.placeholder = '25+';
        breakAinput.classList.add('input-break');
        breakAinput.min = '25';
        breakAinput.max = '155';
        breakAinput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                addBreak_backend(myID, 'A');
            }
        });
        breakAcell.appendChild(breakAinput);
        //breakAcell.innerHTML += `<button id="match-${match.getID()}-breakAbutton" onclick="addBreak_backend(${match.getID()}, 'A')" class="score-button addBreak">&plus;</button>`;
        const breakAbutton = document.createElement('button');
        breakAbutton.id = `match-${myID}-breakAbutton`;
        breakAbutton.classList.add('score-button', 'addBreak');
        breakAbutton.innerHTML = '&plus;';
        breakAbutton.addEventListener("click", function() {
            addBreak_backend(myID, 'A');
        });
        breakAcell.appendChild(breakAbutton);
        breakRow.appendChild(breakAcell);

        const breaksCell = document.createElement('td');
        breaksCell.id = `match-${myID}-breaks`;
        breaksCell.innerHTML = 'Breaks:';
        breaksCell.style = 'padding-top: 1rem; padding-bottom: 0.5rem;';
        breakRow.appendChild(breaksCell);
        
        const breakBcell = document.createElement('td');
        breakBcell.style = "text-align: left;";
        //breakBcell.innerHTML = `<input id="match-${myID}-breakBinput" type="number" placeholder="25+" class="input-break" min="25" max="155">`;
        const breakBinput = document.createElement('input');
        breakBinput.id = `match-${myID}-breakBinput`;
        breakBinput.type = 'number';
        breakBinput.placeholder = '25+';
        breakBinput.classList.add('input-break');
        breakBinput.min = '25';
        breakBinput.max = '155';
        breakBinput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                addBreak_backend(myID, 'B');
            }
        });
        breakBcell.appendChild(breakBinput);
        //breakBcell.innerHTML += `<button id="match-${match.getID()}-breakBbutton" onclick="addBreak_backend(${match.getID()}, 'B')" class="score-button addBreak">&plus;</button>`;
        const breakBbutton = document.createElement('button');
        breakBbutton.id = `match-${myID}-breakBbutton`;
        breakBbutton.classList.add('score-button', 'addBreak');
        breakBbutton.innerHTML = '&plus;';
        breakBbutton.addEventListener("click", function() {
            addBreak_backend(myID, 'B');
        });
        breakBcell.appendChild(breakBbutton);
        const breaksBdiv = document.createElement('div');
        breaksBdiv.id = `match-${myID}-breaksB`;
        breaksBdiv.style = 'display: inline-block;';
        breaksBdiv.innerHTML = '&emsp;' + match.getBreaksB().join(', ');
        breakBcell.appendChild(breaksBdiv);
        //breakBcell.innerHTML += `&emsp;<div id="match-${match.getID()}-breaksB" style="display: inline-block;">${match.getBreaksB().join(', ')}</div>`;
        breakRow.appendChild(breakBcell);

        const cell3 = document.createElement('td');
        breakRow.appendChild(cell3);

        const cell4 = document.createElement('td');
        breakRow.appendChild(cell4);

        // extra cell for scrollbar..?
        const scrollCell = document.createElement('td');
        scrollCell.style = 'padding: 0.25rem';
        breakRow.appendChild(scrollCell);
    }

    
    // FINISHED
    if (match.getState() === MatchState.finished) {
        // if (no breaks) return;
        if (!match.getBreaksA() || !match.getBreaksB()) return;
        if ((match.getBreaksA().length === 0) && (match.getBreaksB().length === 0)) return;

        breakRow.classList.add('match-finished');

        const cell1 = document.createElement('td');
        breakRow.appendChild(cell1);
        const cell2 = document.createElement('td');
        breakRow.appendChild(cell2);

        const breakAcell = document.createElement('td');
        breakAcell.style = "text-align: right;";
        breakAcell.innerHTML = `<div id="match-${match.getID()}-breaksA" style="display: inline-block;">${match.getBreaksA().join(', ')}</div>`
        breakRow.appendChild(breakAcell);

        const breaksCell = document.createElement('td');
        breaksCell.id = `match-${match.getID()}-breaks`;
        breaksCell.innerHTML = 'Breaks:';
        breaksCell.style = 'padding-top: 1rem; padding-bottom: 0.5rem;';
        breakRow.appendChild(breaksCell);
        
        const breakBcell = document.createElement('td');
        breakBcell.style = "text-align: left;";
        breakBcell.innerHTML = `<div id="match-${match.getID()}-breaksB" style="display: inline-block;">${match.getBreaksB().join(', ')}</div>`;
        breakRow.appendChild(breakBcell);

        const cell3 = document.createElement('td');
        breakRow.appendChild(cell3);

        const cell4 = document.createElement('td');
        breakRow.appendChild(cell4);

        // extra cell for scrollbar..?
        const scrollCell = document.createElement('td');
        scrollCell.style = 'padding: 0.25rem';
        breakRow.appendChild(scrollCell);
    }
}
var trackExpand = [];
function populateMatchListTable(matches) {
    trackExpand = [];
    matches.forEach((match) => {
        const myRow = document.getElementById(`match-${match.getID()}-info`);
        if (myRow && myRow.classList.contains('active')) {
            trackExpand.push(match.getID());
        }
    });

    const tableBody = document.querySelector('#list-table-match tbody');
    tableBody.innerHTML = ''; // Clear the table body before populating new data

    matches.forEach((match, index) => {
        // debug test for matches[0]:
        if (false) {
        //if (index === 0) {
            console.log('debug test: matches[' + index + '] is instanceof Match = ' + (match instanceof Match) + ' \n matches[' + index + '] =');
            console.log(match);
        }

        const myID = match.getID();

        // Main row
        const mainRow = document.createElement('tr');
        mainRow.id = `match-${myID}`;
        populateMatchListRow_main(match, mainRow);

        // Dummy row for alternating colors
        const dummyRow1 = document.createElement('tr');

        // Additional information row
        const infoRow = document.createElement('tr');
        infoRow.classList.add('match-list-info');
        if (trackExpand.includes(myID)) infoRow.classList.add('active');
        infoRow.id = `match-${myID}-info`;
        populateMatchListRow_info(match, infoRow);

        // Dummy row for alternating colors
        const dummyRow2 = document.createElement('tr');

        // Additional breaks row
        const breakRow = document.createElement('tr');
        breakRow.classList.add('match-list-info');
        if (trackExpand.includes(myID)) breakRow.classList.add('active');
        breakRow.id = `match-${myID}-break`;
        populateMatchListRow_break(match, breakRow);

        // Append all rows to the table body
        tableBody.appendChild(mainRow);
        tableBody.appendChild(dummyRow1);
        tableBody.appendChild(infoRow);
        tableBody.appendChild(dummyRow2);
        tableBody.appendChild(breakRow);
    });
}
function populateBreaksListTable(breaksList) {
    const table = document.getElementById('list-table-breaks').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    const entries = breaksList.getEntries();
    //console.log('test1: ', entries);
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        //console.log('test2: ', entry.getPlayer());
        const player = ratingList.getPlayerByName(entry.getName());
        //console.log('populateBreaksListTable: player[' + i + '] = ', player);
        const row = table.insertRow(-1);

        const positionCell = row.insertCell(0);
        const nameCell = row.insertCell(1);
        nameCell.classList.add('rating-list-name');
        const clubCell = row.insertCell(2);
        const highbreakCell = row.insertCell(3);
        const breaksCell = row.insertCell(4);
        breaksCell.classList.add('breaks-list-breaks');
        const breaksCellP = document.createElement('p');
        //breaksCellDiv.classList.add('breaks-list-breaks');
        const scrollCell = row.insertCell(5);
        scrollCell.style = 'padding: 0.25rem';

        positionCell.innerHTML = `<p class="position">${i + 1}</p>`;
        nameCell.innerHTML = player.getName();
        clubCell.innerHTML = `<img class="club-logo" src="images/${player.getClub()}_logo.png" title="${player.getClub()}" onerror="this.src = 'images/default_logo.png'" alt="">`;
        highbreakCell.innerHTML = player.getPbBreak();
        try {
            const yearHigh = entry.getHighbreak();
            const entryBreaks = entry.getBreaks();
            if (entryBreaks[0] >= yearHigh) breaksCellP.innerHTML += `<span style="font-weight: bold">${entryBreaks[0]}</span>`;
            else breaksCellP.innerHTML += entryBreaks[0];
            for (let i = 1; i < entryBreaks.length; i++) {
                breaksCellP.innerHTML += ', ';
                if (entryBreaks[i] >= yearHigh) breaksCellP.innerHTML += `<span style="font-weight: bold">${entryBreaks[i]}</span>`;
                else breaksCellP.innerHTML += entryBreaks[i];
            }
        } catch(error) {console.error(error)}
        
        //breaksCellP.innerHTML = entry.getBreaks().join(', ');
        breaksCell.appendChild(breaksCellP);
    }
}

// Database loading
function loadRatingList(name, loadSystem) {
    var myList = new RatingList(name);
    if (loadSystem === LoadSystem.db) {
        console.log('Initializing rating list from db');
        //console.log(ratingList);
        // initialize and load "onValue" from firebase
        const ratingListRef = ref(database, `${name}_RatingList`);
        onValue(ratingListRef, (snapshot) => {
            ratingList = RatingList.fromJSON(snapshot.val());
            console.log('debug: updated ratingList_db: list =');
            console.log(ratingList);

            autocomplete(document.getElementById("newmatch-playerA-input"), ratingList.getPlayers());
            autocomplete(document.getElementById("newmatch-playerB-input"), ratingList.getPlayers());
            autocomplete(document.getElementById("hcCalc-playerA-input"), ratingList.getPlayers());
            autocomplete(document.getElementById("hcCalc-playerB-input"), ratingList.getPlayers());
            autocomplete(document.getElementById("hcCalc-playerR-input"), ratingList.getPlayers());
            autocomplete(document.getElementById("estimate-playerR-input"), ratingList.getPlayers());

            ratingList.sort();
            redraw_rl();
        });

        return ratingList;

    } else if (loadSystem === LoadSystem.local) {
        return listFromJSON_local(`data/${name}_RatingList.json`, false);
        //return localStorage.getItem(name);
    } else if (loadSystem === LoadSystem.init) {
        console.log('Initializing rating list from example');

        myList.addNewPlayer("Ronnie O'Sullivan",'',2651,0.2);
        myList.addNewPlayer('Kurt Maflin','Oslo Snooker',2407,0.54);
        myList.addNewPlayer('Audun Risan Heimsjø','Trondheim Snooker',1551.66,1);
        myList.addNewPlayer('Nassim Sekat','Trondheim Snooker',1538.99,1);
        myList.addNewPlayer('Erik Dullerud','Trondheim Snooker',1488,1);
        myList.addNewPlayer('Magnus Martinsen Melien','Trondheim Snooker',1441.12,1);
        myList.addNewPlayer('Tore Hansen','Trondheim Snooker',1415,1);
        myList.addNewPlayer('Sondre Sundt','Trondheim Snooker',1162.32,1);
        myList.addNewPlayer('Eirik Hammarstøm','Trondheim Snooker',1040,0.53);
        myList.addNewPlayer('Robin Strand','Trondheim Snooker',1104.65,1);
        myList.addNewPlayer('Roald Pettersen','Trondheim Snooker',1035.34,1);
        myList.addNewPlayer('Odne Oksavik','Trondheim Snooker',1006,1);
        myList.addNewPlayer('Geir Ellefsen','Trondheim Snooker',926.867,1);
        myList.addNewPlayer('Ivar Havtor Hovden','Trondheim Snooker',893,1);
        myList.addNewPlayer('Bjørnar Jacobsen','Trondheim Snooker',869.185,1);

        autocomplete(document.getElementById("newmatch-playerA-input"), myList.getPlayers());
        autocomplete(document.getElementById("newmatch-playerB-input"), myList.getPlayers());
        autocomplete(document.getElementById("hcCalc-playerA-input"), myList.getPlayers());
        autocomplete(document.getElementById("hcCalc-playerB-input"), myList.getPlayers());
        autocomplete(document.getElementById("hcCalc-playerR-input"), myList.getPlayers());

        return myList;
    } else throw new Error('Error: loadRatingList(' + name + '); error loadSystem.');
}
// for some reason the function above works, but not the one below so I had to move it outside...
function loadMatchList(name, loadSystem) {
    const debugWrite = false;
    if (debugWrite) console.log('Initializing matches; nullMatches =');
    if (debugWrite) console.log(nullMatches);
    
    

    if (loadSystem === LoadSystem.db) {
        console.log('Initializing match list from db');
        if (debugWrite) console.log(nullMatches);

        const nullMatchesRef = ref(database, `${listName}_nullMatches`);
        const liveMatchesRef = ref(database, `${listName}_liveMatches`);
        const finishedMatchesRef = ref(database, `${listName}_finishedMatches`);

        onValue(nullMatchesRef, (snapshot) => {
            nullMatches = [];
            snapshot.val().forEach(matchData => {
                nullMatches.unshift(Match.fromJSON(matchData, ratingList));
            });
            const test = nullMatches;
            if (debugWrite) console.log('debug: loadMatchList_db: nullMatches_test =');
            if (debugWrite) console.log(test);

            //populateMatchListTable(nullMatches.concat(liveMatches, finishedMatches));
            redraw_ml();
        });
        onValue(liveMatchesRef, (snapshot) => {
            liveMatches = [];
            snapshot.val().forEach(matchData => {
                liveMatches.push(Match.fromJSON(matchData, ratingList));
            });
            if (debugWrite) console.log('debug: loadMatchList_db: liveMatches =');
            if (debugWrite) console.log(liveMatches);

            //populateMatchListTable(nullMatches.concat(liveMatches, finishedMatches));
            redraw_ml();
        });
        onValue(finishedMatchesRef, (snapshot) => {
            if (debugWrite) console.log('debug: loadMatchList_db: PRE finishedMatches =');
            if (debugWrite) console.log(finishedMatches);
            finishedMatches = [];
            snapshot.val().forEach(matchData => {
                finishedMatches.push(Match.fromJSON(matchData, ratingList));
            });
            if (true) console.log('debug: loadMatchList_db: finishedMatches =');
            if (true) console.log(finishedMatches);

            //populateMatchListTable(nullMatches.concat(liveMatches, finishedMatches));
            redraw_ml();
        });

        if (debugWrite) console.log('debug: loadMatchList_db: finishedMatches =');
        if (debugWrite) console.log(finishedMatches);
        
        //return [nullMatches, liveMatches, finishedMatches];

    } else if (loadSystem === LoadSystem.local) {
        return [matchesFromJSON_local(ratingList, `data/${name}_nullMatches.json`), 
        matchesFromJSON_local(ratingList, `data/${name}_liveMatches.json`), 
        matchesFromJSON_local(ratingList, `data/${name}_finishedMatches.json`)];
    } else if (loadSystem === LoadSystem.init) {
        console.log('Initializing match list from examples');
        var nullMatches = []; var liveMatches = []; var finishedMatches = [];
        
        // init finished matches
        finishedMatches.unshift(new Match(1, ratingList.getPlayerByName('Geir Ellefsen'), 
        ratingList.getPlayerByName('Roald Pettersen'), 7, 0, DistanceType.bestOf, HCsystem.match));
        finishedMatches[0].startMatch();
        finishedMatches[0].updateScore(3, 4);
        finishedMatches[0].finishMatch();

        finishedMatches.unshift(new Match(2, ratingList.getPlayerByName('Robin Strand'), 
        ratingList.getPlayerByName('Nassim Sekat'), 11, -10, DistanceType.justFrames, HCsystem.frame));
        finishedMatches[0].startMatch();
        finishedMatches[0].finishMatch(5, 6);

        // init live matches
        liveMatches.unshift(new Match(3, ratingList.getPlayerByName('Sondre Sundt'), 
            ratingList.getPlayerByName('Erik Dullerud'), 35, -45, DistanceType.bestOf, HCsystem.frame));
        liveMatches[0].startMatch();
        liveMatches[0].updateScore(5, 7);

        liveMatches.unshift(new Match(4, ratingList.getPlayerByName('Magnus Martinsen Melien'), 
            ratingList.getPlayerByName('Erik Dullerud'), 0, 0, DistanceType.justFrames, HCsystem.frame));
        liveMatches[0].startMatch();
        liveMatches[0].updateScore(1, 1);

        liveMatches.unshift(new Match(5, ratingList.getPlayerByName('Bjørnar Jacobsen'), 
            ratingList.getPlayerByName('Ivar Havtor Hovden'), 5, 10, DistanceType.bestOf, HCsystem.frame));
        liveMatches[0].startMatch();
        liveMatches[0].updateScore(1, 2);

        liveMatches.unshift(new Match(6, ratingList.getPlayerByName('Geir Ellefsen'), 
            ratingList.getPlayerByName('Roald Pettersen'), 9, 0, DistanceType.bestOf, HCsystem.frame));
        liveMatches[0].startMatch();
        liveMatches[0].updateScore(3, 3);

        // init null matches
        nullMatches.unshift(new Match(7, ratingList.getPlayerByName('Magnus Martinsen Melien'), 
            ratingList.getPlayerByName('Nassim Sekat'), 5, -15, DistanceType.bestOf, HCsystem.match));
        
        nullMatches.unshift(new Match(8, ratingList.getPlayerByName('Roald Pettersen'), 
            ratingList.getPlayerByName('Audun Risan Heimsjø'), 17, -45, DistanceType.bestOf, HCsystem.match));


        return [nullMatches, liveMatches, finishedMatches];
    } else {
        return null;
    }
}
function loadBreaksList(name, loadSystem) {
    if (loadSystem === LoadSystem.db) {
        console.log('Initializing breaks list from db');
        // initialize and load "onValue" from firebase
        const highBreaksRef = ref(database, `${listName}_BreaksList/data/${new Date().getFullYear()}`);
        onValue(highBreaksRef, (snapshot) => {
            breaksList = BreaksList.fromJSON(snapshot.val());
            console.log('debug: updated breaksList_db: list =');
            console.log(breaksList);

            //breaksList.sort(); //already inside redraw_bl()
            redraw_bl();
        });

        return breaksList;

    } else if (loadSystem === LoadSystem.local) {
        console.warn('Tried to initialize breaks list LOCAL. Returned null.');
        return null;
    } else if (loadSystem === LoadSystem.init) {
        console.warn('Tried to initialize breaks list INIT. Returned null.');
        return null;
    } else throw new Error('Error: loadBreaksList(' + name + '); error loadSystem.');
}
document.getElementById("breaks-year-title").textContent = "Breaks of " + year;


// main
try {
    /*setTimeout(function(){
        console.log('Refreshed (hopefully also cache)');
        
        
        //WARNING: WILL RESET ALL PB BREAKS IF UNCOMMENTED! 
        //resetPbBreaks(ratingList);

        location.reload(true); // true --> bypass cache
    }, 1000*60*60*1); // 1000*60*60*1 milliseconds = 1 hour*/
    refreshOnce();

    // db import matchcounter and clubs:
    var matchCounter = 0;

    /*//NOTE: i've moved this function INSIDE finishMatch_backend() now.
    //update archive BREAKSlist metadata possible year options
    get(child(dbRef, `${listName}_BreaksList/metadata`)).then((snapshot) => {
        if (snapshot.exists()) {
            var breaksYears = snapshot.val();
            if (!breaksYears.includes(year)) {
                breaksYears.push(year);
                const updates = {};
                updates[listName + '_BreaksList/metadata'] = breaksYears;
                update(ref(database), updates);
            }
        }
        else {
            console.log('No data available at: update archive breakslist metadata');
        }
    }).catch((error) => {
        console.error(error);
    });*/

    onValue(matchCounterRef, (snapshot) => {
        matchCounter = snapshot.val();
        console.log('debug: matchCounter = ' + matchCounter);
    });
    var clubs = [];
    onValue(clubsRef, (snapshot) => {
        const clubsData_db = snapshot.val();
        clubs = clubsData_db.map(item => item.name);
        autocomplete(document.getElementById("newplayer-club-input"), clubs);
    });

    ratingList = loadRatingList(listName, globalLoadSystem);
    /*//console.log('Test: ratingList_db =');
    //console.log(ratingList);
    //[nullMatches, liveMatches, finishedMatches] = loadMatchList(listName, globalLoadSystem);
    //loadMatchList(listName, globalLoadSystem);*/

    onValue(nullMatchesRef, (snapshot) => {
        nullMatches = [];
        if (snapshot.val()) {
            snapshot.val().forEach(matchData => {
                nullMatches.push(Match.fromJSON(matchData, ratingList));
            });
        }
        const test = nullMatches;
        if (debugWrite) console.log('debug: loadMatchList_db: nullMatches_test =');
        if (debugWrite) console.log(test);

        //populateMatchListTable(nullMatches.concat(liveMatches, finishedMatches));
        redraw_ml();
    });
    onValue(liveMatchesRef, (snapshot) => {
        liveMatches = [];
        if (snapshot.val()) {
            snapshot.val().forEach(matchData => {
                liveMatches.push(Match.fromJSON(matchData, ratingList));
            });
        }
        if (debugWrite) console.log('debug: loadMatchList_db: liveMatches =');
        if (debugWrite) console.log(liveMatches);

        //populateMatchListTable(nullMatches.concat(liveMatches, finishedMatches));
        redraw_ml();
    });
    onValue(finishedMatchesRef, (snapshot) => {
        if (debugWrite) console.log('debug: loadMatchList_db: PRE finishedMatches =');
        if (debugWrite) console.log(finishedMatches);
        finishedMatches = [];
        snapshot.val().forEach(matchData => {
            finishedMatches.push(Match.fromJSON(matchData, ratingList));
        });
        if (debugWrite) console.log('debug: loadMatchList_db: finishedMatches =');
        if (debugWrite) console.log(finishedMatches);

        //populateMatchListTable(nullMatches.concat(liveMatches, finishedMatches));
        redraw_ml();
    });

    breaksList = loadBreaksList(listName, globalLoadSystem);

    console.log('Initialization successful!')
}
catch(error) {
    console.error('An error initializing data occured: '+ error.message);
}



// Post init functions
function redraw_rl() {
    ratingList.sort();
    populateRatingListTable(ratingList);
}
function redraw_ml() {
    /*console.log('debug test: finishedMatches.length =');
    console.log(finishedMatches.length);*/
    if (nullMatches && liveMatches && finishedMatches) {
        
        const matches = nullMatches.concat(liveMatches, finishedMatches);
        //console.log('debug: redraw_ml(): matches =');
        //console.log(matches);
        populateMatchListTable(matches);
    } else {
        throw new Error('Error: some matches undefined - unable to display matchlist.')
    }
}
function redraw_bl() {
    breaksList.sort();
    populateBreaksListTable(breaksList);
}
function redraw() {redraw_rl(); redraw_ml(); redraw_bl();}
function getMatch(id, states='all') {
    if (states === 'live') {
        for (const match of liveMatches) {
            if (match.getID() === id) { return match; }
        }
        console.error(`Error: couldn't find match (${id}) within "liveMatches"`);
        return null;
    } else if (states === 'null') {
        for (const match of nullMatches) {
            if (match.getID() === id) { return match; }
        }
        console.error(`Error: couldn't find match (${id}) within "nullMatches"`);
        return null;
    } else if (states === 'finished') {
        for (const match of finishedMatches) {
            if (match.getID() === id) { return match; }
        }
        console.error(`Error: couldn't find match (${id}) within "finishedMatches"`);
        return null;
    }
    else { // i.e. search all
        for (const match of nullMatches.concat(liveMatches, finishedMatches)) {
            if (match.getID() === id) { return match; }
        }
        console.error(`Error: couldn't find match (${id})`);
        return null;
    }
}

/* // Tests: Player storage JSON tests:
const player1 = new Player('Magnus Bajs', 'TS', 1379);
console.log(player1);
const jsontest1 = JSON.stringify(player1, null, 2);
const jsontest2 = JSON.stringify(player1.toJSON(), null, 2);
const jsontest3 = player1.toJSON();
console.log('jsontest1 =');
console.log(jsontest1);
console.log('jsontest2 =');
console.log(jsontest2);
console.log('jsontest3 =');
console.log(jsontest3);


/* // Tests: for rating list storage
ratingList.addNewPlayer('Magnus', 'TS');
ratingList.addNewPlayer('Nassim', 'TS', 1580);
console.log(ratingList);
try {
    listToJSON_local(ratingList, `data/test_RatingList.json`);
    //console.log('list to json success!');
}
catch (error) {
    console.error(error);
}
try {
    //console.log('test here');
    var ratingListTest1 = listFromJSON_local('data/test_RatingList.json', false);
    //console.log('list FROM json success!');
    ratingListTest1.addNewPlayer('Sondre', 'TS', 680, 0.6);
    listToJSON_local(ratingListTest1, 'bajs');
    var ratingListTest2 = listFromJSON_local('bajs');
    console.log('ratingListTest2 =');
    console.log(ratingListTest2);
}
catch (error) {console.error(error);}
*/


redraw();

/*//test arxiv main
var arxivTest = [];

function testFunction() {
    var updates = {};
    var mytest = [];
    mytest = arxivTest.reverse();
    updates[listName + '_archive'] = mytest;
    console.log('extra test: ');
    console.log(mytest);
    //update(ref(database), updates);
}

try {
    onValue(archiveRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            //const childKey = childSnapshot.key;
            const childData = childSnapshot.val();
            
            arxivTest.push(Match.fromJSON(childData, ratingList));
        });

        console.log('debug: archive test:');
        console.log(arxivTest);
        
        //testFunction();

        //console.log('my test 2:');
        //console.log(arxivTest);
    });
}
catch(error) {console.error('test: ' + error);}
*/

/*// Refresh the page after a delay of 3 seconds
setTimeout(function(){
    location.reload(true); // true --> bypass cache
}, 3000); // 3000 milliseconds = 3 seconds
*/
//location.reload(true);