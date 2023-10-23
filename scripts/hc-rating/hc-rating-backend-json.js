import Player from './player.js';
import RatingList from './rating-list.js';
import { Match, MatchState, DistanceType, HCsystem } from './match.js';
import { listToJSON_local, listFromJSON_local, matchesToJSON_local, matchesFromJSON_local } from './jsonStream.js';
// import { toggleExpand, startMatch_frontend, finishMatch_frontend, deleteMatch_frontend, toggleDeletePopup } from './hc-rating-frontend.js';

function roundedToFixed(input, digits = 1) {
    var rounder = Math.pow(10, digits);
    return (Math.round(input * rounder) / rounder).toFixed(digits);
}

// Copied functions from 'hc-rating-frontend.js' because it can't be a module/use "export"...
function toggleExpand(i) {
    const expandButton = document.getElementById(`match-${i}-expand`);
    const infoRow = document.getElementById(`match-${i}-info`);
    expandButton.classList.toggle("active");
    infoRow.classList.toggle("active");

    // check if match is finished to see if edit-button should be displayed:
    const matchRow = document.getElementById(`match-${i}`);
    const editButton = document.getElementById(`match-${i}-edit`);
    
    if (matchRow.classList.contains("match-finished")) {
        editButton.style.display = "none";
    } else {
        editButton.style.display = "block";
    }
}
function toggleEditPopup_backend() {
    document.getElementById("popup-edit").classList.toggle("active");
    document.getElementById("edit-scoreA-input").value = ""; // fill in what the actual match is...
    document.getElementById("edit-scoreB-input").value = "";
    document.getElementById("edit-distance-input").value = "";
    document.getElementById("edit-HC-input").value = "";

    toggleDistanceType('best-of', 'edit');
    toggleURS('frames', 'edit');
    if (document.getElementById("popup-edit-HC-row").classList.contains("active")) {toggleHC('edit');}
}
function toggleFinishPopup_backend() {
    document.getElementById("popup-finish").classList.toggle("active");
}
function toggleDeletePopup_backend() {
    document.getElementById("popup-delete").classList.toggle("active");
}
function startMatch_backend(id) {
    //startMatch_backend(id =)
}
function finishMatch_backend() {
    //finish match backend

    //close confirm window
    toggleFinishPopup_backend();
}
document.getElementById('confirm-finish-button').onclick = function () { finishMatch_backend(); };
function deleteMatch_backend() {
    //delete match id backend

    //close confirm window
    toggleDeletePopup_backend();
}
document.getElementById('confirm-delete-button').onclick = function () { deleteMatch_backend(); };
function updateMatch_backend() {
    //update match stats

    //close edit window
    toggleEditPopup_backend();
}
document.getElementById('confirm-edit-button').onclick = function () { updateMatch_backend(); };



function populateRatingListTable(ratingList) {
    const table = document.getElementById('list-table-rating').getElementsByTagName('tbody')[0];
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

        positionCell.innerHTML = `<p class="position">${i + 1}</p>`;
        nameCell.innerHTML = player.getName();
        clubCell.innerHTML = `<img class="club-logo" src="images/${player.getClub()}_logo.png" onerror="this.src = 'images/default_logo.png'" alt="">`;
        ratingCell.innerHTML = roundedToFixed(player.getRating());
        robustnessCell.innerHTML = `<p class="robustness robustness-${player.getRobustLevel().toLowerCase()}">${player.getRobustLevel()}</p>`;
    }
}
function populateMatchListRow_main(match, mainRow) {

    // NULL / GENERAL
    
        //position
        const positionCell = document.createElement('td');
        const positionParagraph = document.createElement('p');
        positionParagraph.classList.add('position');
        positionParagraph.id = `match-${match.getID()}-number`;
        positionParagraph.textContent = match.getID();
        positionCell.appendChild(positionParagraph);
        mainRow.appendChild(positionCell);

        //logo a
        const logoAcell = document.createElement('td');
        logoAcell.style = "padding: 0;";
        const logoAimg = document.createElement('img');
        logoAimg.classList.add('club-logo');
        logoAimg.classList.add('club-logo-match');
        logoAimg.id = `match-${match.getID()}-clubA`;
        logoAimg.src = `images/${match.getPlayerA().getClub()}_logo.png`;
        logoAimg.onerror = "this.src = 'images/default_logo.png'";
        logoAcell.appendChild(logoAimg);
        mainRow.appendChild(logoAcell);

        //playerA
        const playerAcell = document.createElement('td');
        playerAcell.style = "text-align: right;";
        playerAcell.id = `match-${match.getID()}-playerA`;
        playerAcell.textContent = match.getPlayerA().getName();
        if (match.getHC() > 0) { playerAcell.textContent += ` (${Math.abs(match.getHC())})`; }
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
        scoreA.id = `match-${match.getID()}-scoreA`;
        scoreA.textContent = match.getScoreA();
        if (match.getState() === MatchState.null) { scoreA.textContent = '-'; }
        else { scoreA.classList.add('score'); }
        scoreDivA.appendChild(scoreA);
        
        const matchDistance = document.createElement('span');
        matchDistance.id = `match-${match.getID()}-distance`;
        matchDistance.textContent = `( ${match.getDistance()} )`;
        if (match.getDistanceType() === DistanceType.justFrames) { matchDistance.textContent = '( - )'; }
        matchInfo.appendChild(matchDistance);
        const toggleExpandButton = document.createElement('button');
        toggleExpandButton.classList.add('expand');
        toggleExpandButton.id = `match-${match.getID()}-expand`;
        toggleExpandButton.onclick = function() { toggleExpand(match.getID()); };
        matchInfo.appendChild(toggleExpandButton);

        const scoreB = document.createElement('div');
        scoreB.id = `match-${match.getID()}-scoreB`;
        scoreB.textContent = match.getScoreB();
        if (match.getState() === MatchState.null) { scoreB.textContent = '-'; }
        else { scoreB.classList.add('score'); }
        scoreDivB.appendChild(scoreB);

        scoreCell.appendChild(scoreDivA);
        scoreCell.appendChild(matchInfo);
        scoreCell.appendChild(scoreDivB);
        mainRow.appendChild(scoreCell);

        //playerB
        const playerBcell = document.createElement('td');
        playerBcell.style = "text-align: left;";
        playerBcell.id = `match-${match.getID()}-playerB`;
        playerBcell.textContent = match.getPlayerB().getName();
        if (match.getHC() < 0) { playerBcell.textContent += ` (${Math.abs(match.getHC())})`; }
        mainRow.appendChild(playerBcell);

        //logo b
        const logoBcell = document.createElement('td');
        logoAcell.style = "padding: 0;";
        const logoBimg = document.createElement('img');
        logoBimg.classList.add('club-logo');
        logoBimg.classList.add('club-logo-match');
        logoBimg.id = `match-${match.getID()}-clubB`;
        logoBimg.src = `images/${match.getPlayerB().getClub()}_logo.png`;
        logoBimg.onerror = "this.src = 'images/default_logo.png'";
        logoBcell.appendChild(logoBimg);
        mainRow.appendChild(logoBcell);

        //buttons
        const buttonsCell = document.createElement('td');
        const startButton = document.createElement('button');
        startButton.classList.add('match-button');
        startButton.id = `match-${match.getID()}-start`;
        startButton.textContent = 'Start';
        startButton.onclick = function() { 
            startMatch_backend(match.getID()); 
        };
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('match-button');
        deleteButton.classList.add('delete');
        deleteButton.id = `match-${match.getID()}-delete`;
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() { 
            document.getElementById('confirm-delete-button').name = match.getID(); 
            // this is so that when you click confirm you can know which match to DELETE by the current "name" of the button...
            toggleDeletePopup_backend(); 
        };
        if (match.getState() !== MatchState.finished) {
            buttonsCell.appendChild(startButton);
            buttonsCell.appendChild(deleteButton);
        }
        mainRow.appendChild(buttonsCell);
    

    // LIVE
    if (match.getState() === MatchState.live) {
        mainRow.className = "";
        mainRow.classList.add('match-live');

        //add the score buttons
        const plusButtonA = document.createElement('button');
        const minusButtonA = document.createElement('button');
        const plusButtonB = document.createElement('button');
        const minusButtonB = document.createElement('button');

        plusButtonA.id = `match-${match.getID()}-score-button-plus-left`;
        minusButtonA.id = `match-${match.getID()}-score-button-minus-left`;
        plusButtonB.id = `match-${match.getID()}-score-button-plus-right`;
        minusButtonB.id = `match-${match.getID()}-score-button-minus-right`;

        plusButtonA.classList.add('score-button');
        plusButtonA.classList.add('score-button-plus-left');
        minusButtonA.classList.add('score-button');
        minusButtonA.classList.add('score-button-minus-left');
        plusButtonB.classList.add('score-button');
        plusButtonB.classList.add('score-button-plus-right');
        minusButtonB.classList.add('score-button');
        minusButtonB.classList.add('score-button-minus-right');

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
        finishButton.id = `match-${match.getID()}-finish`;
        finishButton.textContent = 'Finish';
        finishButton.onclick = function () { 
            document.getElementById('confirm-finish-button').name = match.getID(); 
            // this is so that when you click confirm you can know which match to FINISH by the current "name" of the button...
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

        //remove the score buttons
        scoreDivA.removeChild(document.getElementById(`match-${match.getID()}-score-button-plus-left`));
        scoreDivA.removeChild(document.getElementById(`match-${match.getID()}-score-button-minus-left`));
        scoreDivB.removeChild(document.getElementById(`match-${match.getID()}-score-button-plus-right`));
        scoreDivB.removeChild(document.getElementById(`match-${match.getID()}-score-button-minus-right`));
        
        //remove the state buttons
        buttonsCell.removeChild(document.getElementById(`match-${match.getID()}-start`)); //hopefully redundant
        buttonsCell.removeChild(document.getElementById(`match-${match.getID()}-finish`));
        buttonsCell.removeChild(document.getElementById(`match-${match.getID()}-delete`));

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
                ${roundedToFixed(match.getDeltaA(), 1)}</span>${roundedToFixed(match.getCurrentRatingA(), 1)}`; 
            ratingBcell.innerHTML = `${roundedToFixed(match.getCurrentRatingA(), 1)}
                <span class="rating-win">&plus; ${roundedToFixed(match.getDeltaA(), 1)}</span>`; 
        } else if (match.getDeltaA() > 0) {
            ratingAcell.innerHTML = `<span class="rating-win">&plus; 
                ${roundedToFixed(match.getDeltaA(), 1)}</span>${roundedToFixed(match.getCurrentRatingA(), 1)}`; 
            ratingBcell.innerHTML = `${roundedToFixed(match.getCurrentRatingA(), 1)}
                <span class="rating-loss">&minus; ${roundedToFixed(match.getDeltaA(), 1)}</span>`;
        }

        //remove the state buttons
        editButtonCell.removeChild(document.getElementById(`match-${match.getID()}-edit`));

        //update visuals???
    }
}
function populateMatchListTable(matches) {
    const tableBody = document.querySelector('#list-table-match tbody');
    tableBody.innerHTML = ''; // Clear the table body before populating new data

    matches.forEach((match, index) => {
        // Main row
        const mainRow = document.createElement('tr');
        mainRow.id = `match-${match.getID()}`;
        populateMatchListRow_main(match, mainRow);

        // Dummy row for alternating colors
        const dummyRow = document.createElement('tr');

        // Additional information row
        const infoRow = document.createElement('tr');
        infoRow.classList.add('match-list-info');
        infoRow.id = `match-${match.getID()}-info`;
        populateMatchListRow_info(match, infoRow);

        // Append all rows to the table body
        tableBody.appendChild(mainRow);
        tableBody.appendChild(dummyRow);
        tableBody.appendChild(infoRow);
    });
}

class LoadSystem {
    static db = 'Firebase_database';
    static local = 'local storage';
    static init = 'initialize';
}
function loadRatingList(name, loadSystem) {
    if (loadSystem === LoadSystem.db) {
        return listFromJSON_db(name);
    } else if (loadSystem === LoadSystem.local) {
        return listFromJSON_local(`data/${name}_RatingList.json`, false);
        //return localStorage.getItem(name);
    } else if (loadSystem === LoadSystem.init) {
        var myList = new RatingList(name);
        myList.addNewPlayer('Audun Risan Heimsjø','Trondheim Snooker',1551.66,1);
        myList.addNewPlayer('Nassim Sekat','Trondheim Snooker',1538.99,1);
        myList.addNewPlayer('Erik Dullerud','Trondheim Snooker',1488,1);
        myList.addNewPlayer('Magnus Martinsen Melien','Trondheim Snooker',1441.12,1);
        myList.addNewPlayer('Tore Hansen','Trondheim Snooker',1415,1);
        myList.addNewPlayer('Sondre Sundt','Trondheim Snooker',1162.32,1);
        myList.addNewPlayer('Eirik Hammarstøm','Trondheim Snooker',1150,0);
        myList.addNewPlayer('Robin Strand','Trondheim Snooker',1104.65,1);
        myList.addNewPlayer('Roald Pettersen','Trondheim Snooker',1035.34,1);
        myList.addNewPlayer('Odne Oksavik','Trondheim Snooker',1006,1);
        myList.addNewPlayer('Geir Ellefsen','Trondheim Snooker',926.867,1);
        myList.addNewPlayer('Ivar Havtor Hovden','Trondheim Snooker',893,1);
        myList.addNewPlayer('Bjørnar Jacobsen','Trondheim Snooker',869.185,1);
        return myList;
    } else {
        return null;
    }
}
function loadMatchList(name, ratingList, loadSystem) {
    if (loadSystem === LoadSystem.db) {
        return [matchesFromJSON_db(ratingList, `data/${name}_nullMatches.json`), 
            matchesFromJSON_db(ratingList, `data/${name}_liveMatches.json`), 
            matchesFromJSON_db(ratingList, `data/${name}_finishedMatches.json`)];
    } else if (loadSystem === LoadSystem.local) {
        return [matchesFromJSON_local(ratingList, `data/${name}_nullMatches.json`), 
        matchesFromJSON_local(ratingList, `data/${name}_liveMatches.json`), 
        matchesFromJSON_local(ratingList, `data/${name}_finishedMatches.json`)];
    } else if (loadSystem === LoadSystem.init) {
        console.log('Debug: Initializing match list to example matches.');
        var nullMatches = []; var liveMatches = []; var finishedMatches = [];
        
        // init null matches
        nullMatches.unshift(new Match(1, ratingList.getPlayerByName('Magnus Martinsen Melien'), 
            ratingList.getPlayerByName('Nassim Sekat'), 5, 15, DistanceType.bestOf, HCsystem.match));
        
        nullMatches.unshift(new Match(2, ratingList.getPlayerByName('Roald Pettersen'), 
            ratingList.getPlayerByName('Audun Risan Heimsjø'), 17, 45, DistanceType.bestOf, HCsystem.match));

        // init live matches
        liveMatches.unshift(new Match(3, ratingList.getPlayerByName('Sondre Sundt'), 
            ratingList.getPlayerByName('Erik Dullerud'), 35, 45, DistanceType.bestOf, HCsystem.frame));
        liveMatches[0].startMatch();
        liveMatches[0].updateScore(5, 7);

        liveMatches.unshift(new Match(4, ratingList.getPlayerByName('Magnus Martinsen Melien'), 
            ratingList.getPlayerByName('Erik Dullerud'), 0, 0, DistanceType.justFrames, HCsystem.frame));
        liveMatches[0].startMatch();
        liveMatches[0].updateScore(1, 1);

        liveMatches.unshift(new Match(5, ratingList.getPlayerByName('Bjørnar Jacobsen'), 
            ratingList.getPlayerByName('Ivar Havtor Hovden'), 5, -10, DistanceType.bestOf, HCsystem.frame));
        liveMatches[0].startMatch();
        liveMatches[0].updateScore(1, 2);

        liveMatches.unshift(new Match(6, ratingList.getPlayerByName('Geir Ellefsen'), 
            ratingList.getPlayerByName('Roald Pettersen'), 7, 0, DistanceType.bestOf, HCsystem.match));
        liveMatches[0].startMatch();
        liveMatches[0].updateScore(3, 3);

        // init finished matches
        finishedMatches.unshift(new Match(7, ratingList.getPlayerByName('Geir Ellefsen'), 
            ratingList.getPlayerByName('Roald Pettersen'), 7, 0, DistanceType.bestOf, HCsystem.match));
        finishedMatches[0].startMatch();
        finishedMatches[0].updateScore(3, 2);
        finishedMatches[0].finishMatch(3, 4);

        finishedMatches.unshift(new Match(8, ratingList.getPlayerByName('Robin Strand'), 
            ratingList.getPlayerByName('Nassim Sekat'), 11, 40, DistanceType.bestOf, HCsystem.match));
        finishedMatches[0].startMatch();
        finishedMatches[0].finishMatch(6, 4);

        
        return [nullMatches, liveMatches, finishedMatches];
    } else {
        return null;
    }
}


// Initialize: (import from files)
const listName = 'test';
const writeToFileCont = true;

// export to files when finished (and possibly continuously during on interaction)
function saveAllJSON_local(ratingList, nullMatches, liveMatches, finishedMatches) {
    try {
        listToJSON_local(ratingList, `data/${listName}_RatingList.json`);
        matchesToJSON_local(nullMatches,  `data/${listName}_nullMatches.json`);
        matchesToJSON_local(liveMatches,  `data/${listName}_liveMatches.json`);
        matchesToJSON_local(finishedMatches,  `data/${listName}_finishedMatches.json`);
    }
    catch(error) {
        console.error('An error occured while saving files (JSON_local): ' + error.message);
    }
}
// Make it so the list automatically update continuously when using Firebase db


// Initialization:
var ratingList = new RatingList(listName);
var nullMatches = []; var liveMatches = []; var finishedMatches = [];
ratingList = loadRatingList(listName, LoadSystem.init);
[nullMatches, liveMatches, finishedMatches] = loadMatchList('bajs', ratingList, LoadSystem.init);

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
*/

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

// Tests: for matches storage



/* // The real retrieving:
try {
    ratingList =      listFromJSON_local(`data/${listName}_RatingList.json`);
    nullMatches =     matchesFromJSON_local(ratingList, `data/${listName}_nullMatches.json`);
    liveMatches =     matchesFromJSON_local(ratingList, `data/${listName}_liveMatches.json`);
    finishedMatches = matchesFromJSON_local(ratingList, `data/${listName}_finishedMatches.json`);
    
    console.log('Read files successfully');
}
catch (error) {
    console.error('An error reading from files occurred: ', error.message);
}
*/

populateRatingListTable(ratingList);
populateMatchListTable(nullMatches.concat(liveMatches, finishedMatches));