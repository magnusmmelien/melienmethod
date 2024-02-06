
import RatingList from './hc-rating/rating-list.js';
import { Match, MatchState, DistanceType, HCsystem } from './hc-rating/match.js';
import { getDatabase, ref, onValue, child, push, update, get } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { database, matchCounterRef, clubsRef } from './hc-rating/database_init.js';

var archiveMatches = [];
var trackExpand = [];
var listName = 'Norway';
const archiveRef = ref(database, `${listName}_archive`);

var ratingList = new RatingList(listName);


function roundedToFixed(input, digits = 1) {
    var rounder = Math.pow(10, digits);
    return (Math.round(input * rounder) / rounder).toFixed(digits);
}
function toggleExpand(i) {
    const expandButton = document.getElementById(`match-${i}-expand`);
    const infoRow = document.getElementById(`match-${i}-info`);
    const breakRow = document.getElementById(`match-${i}-break`);
    expandButton.classList.toggle("active");
    infoRow.classList.toggle("active");
    breakRow.classList.toggle("active");
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
        breakRow.classList.add('match-live');
        
        const cell1 = document.createElement('td');
        breakRow.appendChild(cell1);
        const cell2 = document.createElement('td');
        breakRow.appendChild(cell2);

        const breakAcell = document.createElement('td');
        breakAcell.style = "text-align: right;";
        breakAcell.innerHTML = `<div id="match-${match.getID()}-breaksA" style="display: inline-block;">${match.getBreaksA().join(', ')}</div>`;
        breakAcell.innerHTML += `&emsp;<input id="match-${match.getID()}-breakAinput" type="number" placeholder="25+" class="input-break" min="25" max="155">`;
        //breakAcell.innerHTML += `<button id="match-${match.getID()}-breakAbutton" onclick="addBreak_backend(${match.getID()}, 'A')" class="score-button addBreak">&plus;</button>`;
        const breakAbutton = document.createElement('button');
        breakAbutton.id = `match-${match.getID()}-breakAbutton`;
        breakAbutton.classList.add('score-button', 'addBreak');
        breakAbutton.innerHTML = '&plus;';
        breakAbutton.addEventListener("click", function() {
            addBreak_backend(match.getID(), 'A');
        });
        breakAcell.appendChild(breakAbutton);
        breakRow.appendChild(breakAcell);

        const breaksCell = document.createElement('td');
        breaksCell.id = `match-${match.getID()}-breaks`;
        breaksCell.innerHTML = 'Breaks:';
        breaksCell.style = 'padding-top: 1rem; padding-bottom: 0.5rem;';
        breakRow.appendChild(breaksCell);
        
        const breakBcell = document.createElement('td');
        breakBcell.style = "text-align: left;";
        breakBcell.innerHTML = `<input id="match-${match.getID()}-breakBinput" type="number" placeholder="25+" class="input-break" min="25" max="155">`;
        //breakBcell.innerHTML += `<button id="match-${match.getID()}-breakBbutton" onclick="addBreak_backend(${match.getID()}, 'B')" class="score-button addBreak">&plus;</button>`;
        const breakBbutton = document.createElement('button');
        breakBbutton.id = `match-${match.getID()}-breakBbutton`;
        breakBbutton.classList.add('score-button', 'addBreak');
        breakBbutton.innerHTML = '&plus;';
        breakBbutton.addEventListener("click", function() {
            addBreak_backend(match.getID(), 'B');
        });
        breakBcell.appendChild(breakBbutton);
        const breaksBdiv = document.createElement('div');
        breaksBdiv.id = `match-${match.getID()}-breaksB`;
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
        if (!match.getBreaksA() || !match.getBreaksB()) {return;}
        if ((match.getBreaksA().length === 0) && (match.getBreaksB().length === 0)) {return;}

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

function populateArchiveMatchesTable(matches) {
    trackExpand = [];
    matches.forEach((match) => {
        const myRow = document.getElementById(`match-${match.getID()}-info`);
        if (myRow && myRow.classList.contains('active')) {
            trackExpand.push(match.getID());
        }
    });

    const tableBody = document.querySelector('#list-table-archive tbody');
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

function redraw_al() {
    if (archiveMatches) {
        // make functionality in future such that only 10 matches displayed, and create table footer to flip through pages
        populateArchiveMatchesTable(archiveMatches.reverse());
    }
    else {
        throw new Error('Error: some matches undefined - unable to display archived matches.')
    }
}

// Main: 
try {
    const ratingListRef = ref(database, `${listName}_RatingList`);
    onValue(ratingListRef, (snapshot) => {
        ratingList = RatingList.fromJSON(snapshot.val());
    });

    onValue(archiveRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            //const childKey = childSnapshot.key;
            const childData = childSnapshot.val();
            
            archiveMatches.push(Match.fromJSON(childData, ratingList));
        });

        redraw_al();

        console.log('debug: archive test:');
        console.log(archiveMatches);
    });

    redraw_al();
}
catch(error) {console.error('test: ' + error);}