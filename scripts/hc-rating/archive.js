
import RatingList from './rating-list.js';
import { Match, MatchState, DistanceType, HCsystem } from './match.js';
import { getDatabase, ref, onValue, child, push, update, get } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { database, matchCounterRef, clubsRef } from './database_init.js';
import { BreaksList } from './breakslist.js';
import { listName } from './variables.js';

var archiveMatches = []; var archiveBreaks = [];
var trackExpand = [];
var possibleYear = []; var possibleMonth = []; var possibleYearBreak = [];
//var listName = 'test';
const date = new Date(); var year = date.getFullYear(); var month = date.getMonth(); var yearBreak = year;
const dbRef = ref(getDatabase());
const archiveRef = ref(database, `${listName}_archive/data`);
var archiveOptionsMetaRef = ref(database, `${listName}_archive/metadata`);
var archiveBreaksMetaRef = ref(database, `${listName}_BreaksList/metadata`);


const months = ["Jan", 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const selectYear = document.getElementById("selectYear");
const selectMonth = document.getElementById("selectMonth");
const selectYearBreak = document.getElementById("selectYearBreak");

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
    /*if (match.getState() === MatchState.live) {
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
    }*/

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
    /*if (match.getState() === MatchState.live) {
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
    }*/
    
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
    } else {
        alert('Error: failed to display match ' + match.getID());
        console.error('Error: failed to display match ' + match.getID());
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
function populateBreaksListTable(breaksList) {
    const table = document.getElementById('list-table-breaks').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    const entries = breaksList.getEntries();
    //console.log('test1: entries =', entries);
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        //console.log('testtest: ', ratingList, 'entry name: ', entry.getName(), 'player: ', ratingList.getPlayerByName(entry.getName()));
        const player = ratingList.getPlayerByName(entry.getName());
        //console.log('populateBreaksListTable: player[' + i + '] = ' + player);
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
        var clubText = 'default';
        try {clubText = player.getClub();}
        catch(error) {
            console.error('error: coudnt find player (',  entry.getName(), ') in rating list...');
        }
        clubCell.innerHTML = `<img class="club-logo" src="images/${clubText}_logo.png" title="${clubText}" onerror="this.src = 'images/default_logo.png'" alt="">`;
        highbreakCell.innerHTML = player.getPbBreak();
        //breaksCellP.innerHTML = entry.getBreaks().join(', ');
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
        breaksCell.appendChild(breaksCellP);
    }
}

//redraw arXiv match list
function redraw_al() {
    archiveMatches = [];
    get(child(dbRef, `${listName}_archive/data/${year}/${month}`)).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                //const childKey = childSnapshot.key;
                const childData = childSnapshot.val();
                
                archiveMatches.push(Match.fromJSON(childData, ratingList));
            });
            console.log(`info: archiveMatches[${year}][${months[month]}], size =`, archiveMatches.length);
            if (archiveMatches) {
                // make functionality in future such that only 10 matches displayed, and create table footer to flip through pages
                //console.log("test: matches to print =", archiveMatches);
                populateArchiveMatchesTable(archiveMatches.reverse());
            }
            else {
                throw new Error('Error: some matches undefined - unable to display archived matches.')
            }
        }
        else {
            console.log(`No data available at: ${year}/${month}`);
            populateArchiveMatchesTable([]);
        }
    }).catch((error) => {
        console.error(error);
    });
}
//redraw arXiv breaks list
function redraw_abl() {
    archiveBreaks = null;
    get(child(dbRef, `${listName}_BreaksList/data/${yearBreak}`)).then((snapshot) => {
        if (snapshot.exists()) {
            archiveBreaks = BreaksList.fromJSON(snapshot.val());
            if (archiveBreaks) {
                populateBreaksListTable(archiveBreaks);
            }
            else {
                throw new Error('Error: unable to display archived breakslist.')
            }
        }
        else {
            console.log(`No data available at arXiv breakslist: ${yearBreak}`);
            populateBreaksListTable(null);
        }
    }).catch((error) => {
        console.error(error);
    });
}


function updateOptionsYear() {
    selectYear.innerHTML = '';
    possibleYear.forEach(x => {
        const option = document.createElement("option");
        option.textContent = x;
        selectYear.appendChild(option);
    });
}
function updateOptionsMonth() {
    selectMonth.innerHTML = '';
    possibleMonth.forEach(x => {
        const option = document.createElement("option");
        option.value = x;
        option.textContent = months[x];
        selectMonth.appendChild(option);
    });
    selectMonth.options[selectMonth.options.length - 1].selected = true;
}
function updateOptionsYearBreak() {
    selectYearBreak.innerHTML = '';
    possibleYearBreak.forEach(x => {
        const option = document.createElement("option");
        option.textContent = x;
        selectYearBreak.appendChild(option);
    });
}

function changeYear() {
    year = parseInt(selectYear.value);
    get(child(dbRef, `${listName}_archive/metadata/${year}`)).then((snapshot) => {
        if (snapshot.exists()) {
            possibleMonth = snapshot.val();
            month = possibleMonth[possibleMonth.length - 1];
            console.log('changeYear: possibleMonth =', possibleMonth);
            updateOptionsMonth();
            redraw_al();
        }
        else console.log('No data available');
    }).catch((error) => {
        console.error(error);
    });
}
function changeMonth() {
    month = parseInt(selectMonth.value);
    redraw_al();
}function changeYearBreak() {
    yearBreak = parseInt(selectYearBreak.value);
    redraw_abl();
}
selectYear.addEventListener("change", changeYear);
selectMonth.addEventListener("change", changeMonth);
selectYearBreak.addEventListener("change", changeYearBreak);


// Main: 
try {
    const ratingListRef = ref(database, `${listName}_RatingList`);
    onValue(ratingListRef, (snapshot) => {
        ratingList = RatingList.fromJSON(snapshot.val());
    });

    onValue(archiveOptionsMetaRef, (snapshot) => {
        possibleYear = [];
        snapshot.forEach(archiveMeta => {
            possibleYear.push(Number(archiveMeta.key));
        });
        possibleYear.reverse();
        console.log("test: possibleYear =", possibleYear);
        updateOptionsYear();
        changeYear();
        //redraw_al();
    });
    onValue(archiveBreaksMetaRef, (snapshot) => {
        possibleYearBreak = [];
        snapshot.forEach(archiveMeta => {
            possibleYearBreak.push(archiveMeta.val());
        });
        possibleYearBreak.reverse();
        console.log("test: possibleYearBreak =", possibleYearBreak);
        updateOptionsYearBreak();
        redraw_abl();
    });

    // update db metadata for archive (possible year/month):
    if (true) {
        const realDate = new Date();
        const realMonth = realDate.getMonth(); const realYear = realDate.getFullYear();
        //update archive BREAKSlist metadata possible year options
        get(child(dbRef, `${listName}_BreaksList/metadata`)).then((snapshot) => {
            if (snapshot.exists()) {
                var breaksYears = snapshot.val();
                if (breaksYears.at(-1) != realYear) {
                    const updates = {};
                    breaksYears.push(realYear);
                    updates[listName + '_BreaksList/metadata'] = breaksYears;
                    update(ref(database), updates);
                }
            }
            else {
                console.log('No data available at: update archive BREAKSlist metadata');
            }
        }).catch((error) => {
            console.error(error);
        });
        //update archive MATCHlist metadata possible year options
        get(child(dbRef, `${listName}_archive/metadata`)).then((snapshot) => {
            if (snapshot.exists()) {
                const updates = {};
                var archiveMeta = snapshot.val();
                //console.log('test1: archiveMeta =', archiveMeta);
                // if the key of the last element in the db for "_archive/metadata" != current year, then add current year with array of just january in
                if (!(realYear in archiveMeta)) { 
                    //console.log('test2');
                    updates[`${listName}_archive/metadata/${realYear}`] = [0]; 
                }
                else { // else means that we are in the current year, now check if the last element in current year is current month, if not then add current month
                    var currentYearMonthMeta = archiveMeta[realYear];
                    //console.log('test3: realMonth = ' + realMonth + '; currentYearMonthMeta = ', currentYearMonthMeta);
                    if (currentYearMonthMeta.at(-1) != realMonth) { 
                        currentYearMonthMeta.push(realMonth);
                        //console.log('test4' +'; currentYearMonthMeta = ', currentYearMonthMeta);
                        updates[`${listName}_archive/metadata/${realYear}`] = currentYearMonthMeta; 
                    }
                }
                update(ref(database), updates);
            }
            else {
                console.log('No data available at: update archive MATCHlist metadata');
            }
        }).catch((error) => {
            console.error(error);
        });
        
    }
    
}
catch(error) {console.error('test: ' + error);}