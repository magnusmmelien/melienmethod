// JavaScript Function to Handle Button Click
document.getElementById("button-info").addEventListener("click", function() {
    // Navigate to the "info.html" file
    window.location.href = "././info.html#section-HC";
});
document.getElementById("button-archive").addEventListener("click", function() {
    // Navigate to the "info.html" file
    window.location.href = "././archive.html";
});

function togglePlayerPopup() {
    document.getElementById("popup-player").classList.toggle("active");
    document.getElementById("newplayer-name-input").value = "";
    document.getElementById("newplayer-rating-input").value = "";
    document.getElementById("newplayer-club-input").value = "";
    document.getElementById("newplayer-highbreak-input").value = "";
    document.getElementById("error-message-newPlayer").classList.remove('show');
    
    toggleRobustness('low');

    if (document.getElementById("button-advanced").classList.contains("active")) {toggleAdvanced();}
}
function toggleMatchPopup() {
    document.getElementById("popup-match").classList.toggle("active");
    document.getElementById("newmatch-playerA-input").value = "";
    document.getElementById("newmatch-playerB-input").value = "";
    document.getElementById("match-distance-input").value = "";
    document.getElementById("newmatch-HC-input").value = "";
    document.getElementById("error-message-newMatch").classList.remove('show');

    toggleDistanceType('best-of');
    toggleURS('frames');
    if (document.getElementById("popup-match-HC-row").classList.contains("active")) {toggleHC();}
}
function toggleCalcPopup() {
    document.getElementById("popup-calc").classList.toggle("active");
    toggleCalcType('by-name');
    document.getElementById('error-message-hcCalc').classList.remove('show');
}
function toggleEstimatePopup() {
    document.getElementById("popup-estimate").classList.toggle("active");
    document.getElementById("popup-player").classList.toggle("active");

    document.getElementById('button-by-name-estimate').classList.add('active');
    document.getElementById('button-by-rating-estimate').classList.remove('active');
    document.getElementById('output-rating-block-estimate').classList.remove('block');

    document.getElementById("estimate-playerR-input").value = '';
    document.getElementById("estimate-ratingR-input").value = '';
    document.getElementById("estimate-hcEstimate-input").value = '';
    document.getElementById("output-rating-estimate").textContent = '';
    document.getElementById('error-message-estimate').classList.remove('show');
}
function toggleEditPopup() {
    document.getElementById("popup-edit").classList.toggle("active");
    document.getElementById("edit-scoreA-input").value = ""; // fill in what the actual match is...
    document.getElementById("edit-scoreB-input").value = "";
    document.getElementById("edit-distance-input").value = "";
    document.getElementById("edit-HC-input").value = "";

    toggleDistanceType('best-of', 'edit');
    toggleURS('frames', 'edit');
    if (document.getElementById("popup-edit-HC-row").classList.contains("active")) {toggleHC('edit');}
}
function toggleFinishPopup() {
    document.getElementById("popup-finish").classList.toggle("active");
}
function toggleNotFinishPopup() {    
    document.getElementById("popup-not-finish").classList.toggle("active");
}
function toggleDeletePopup() {
    document.getElementById("popup-delete").classList.toggle("active");
}

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
function toggleCheckmark(idString) {
    document.getElementById(idString).classList.toggle("active");

}
function toggleAdvanced() {
    document.getElementById("popup-player-rating-row").classList.toggle("active");
    document.getElementById("popup-player-highbreak-row").classList.toggle("active");
    document.getElementById("popup-player-robustness-row").classList.toggle("active");
    toggleCheckmark("button-advanced");
}
function toggleRobustness(robustString) {
    document.getElementById('choose-robustness-high').classList.remove('active');
    document.getElementById('choose-robustness-medium').classList.remove('active');
    document.getElementById('choose-robustness-low').classList.remove('active');

    document.getElementById('choose-robustness-high').classList.remove('robustness-high');
    document.getElementById('choose-robustness-high').classList.add('robustness-neutral');
    document.getElementById('choose-robustness-medium').classList.remove('robustness-medium');
    document.getElementById('choose-robustness-medium').classList.add('robustness-neutral');
    document.getElementById('choose-robustness-low').classList.remove('robustness-low');
    document.getElementById('choose-robustness-low').classList.add('robustness-neutral');

    document.getElementById(`choose-robustness-${robustString}`).classList.add('active');
    document.getElementById(`choose-robustness-${robustString}`).classList.remove('robustness-neutral');
    document.getElementById(`choose-robustness-${robustString}`).classList.add(`robustness-${robustString}`);
}
function toggleDistanceType(typeString, boolEdit = 'create') {
    if (boolEdit === 'edit') {
        document.getElementById('edit-button-best-of').classList.remove('active');
        document.getElementById('edit-button-free-frames').classList.remove('active');
        document.getElementById('popup-edit-distance-row').classList.remove('active');
    
        document.getElementById(`edit-button-${typeString}`).classList.add('active');
        if (typeString === 'best-of') {
            document.getElementById('popup-edit-distance-row').classList.add('active');
            document.getElementById('edit-button-match').classList.remove('button-hide');
        }
        else {
            document.getElementById('edit-button-match').classList.add('button-hide');
            toggleURS('frames', 'edit');
        }
    }
    else {
        document.getElementById('button-best-of').classList.remove('active');
        document.getElementById('button-free-frames').classList.remove('active');
        document.getElementById('popup-match-distance-row').classList.remove('active');

        document.getElementById(`button-${typeString}`).classList.add('active');
        if (typeString === 'best-of') {
            document.getElementById('popup-match-distance-row').classList.add('active');
            document.getElementById('button-match').classList.remove('button-hide');
        }
        else {
            document.getElementById('button-match').classList.add('button-hide');
            toggleURS('frames');
        }
    }
}
function toggleHC(boolEdit = 'create') {
    if (boolEdit === 'edit') {
        document.getElementById("popup-edit-HC-row").classList.toggle("active");
        toggleCheckmark("edit-button-HC");
        return;
    }

    document.getElementById("popup-match-HC-row").classList.toggle("active");
    toggleCheckmark("button-HC");
}
function toggleURS(systemString, boolEdit = 'create') {
    if (boolEdit === 'edit') {
        document.getElementById('edit-button-frames').classList.remove('active');
        document.getElementById('edit-button-match').classList.remove('active');
    
        document.getElementById(`edit-button-${systemString}`).classList.add('active');
        return;  
    }

    document.getElementById('button-frames').classList.remove('active');
    document.getElementById('button-match').classList.remove('active');

    document.getElementById(`button-${systemString}`).classList.add('active');
}
function toggleCalcType(typeString) {
    
    document.getElementById('output-rating').textContent = '';
    document.getElementById('output-HC').textContent = '';
    
    document.getElementById('error-message-hcCalc').classList.remove('show');

    document.getElementById('button-by-name').classList.remove('active');
    document.getElementById('button-by-rating').classList.remove('active');
    document.getElementById('output-HC-block').classList.remove('block');
    document.getElementById('output-rating-block').classList.remove('block');

    document.getElementById(`button-${typeString}`).classList.add('active');

    /*Empty all containers/input-output-fields etc.*/
    document.getElementById('hcCalc-playerA-input').value = '';
    document.getElementById('hcCalc-playerB-input').value = '';
    document.getElementById('hcCalc-ratingA-input').value = '';
    document.getElementById('hcCalc-ratingB-input').value = '';

    document.getElementById('hcCalc-playerR-input').value = '';
    document.getElementById('hcCalc-ratingR-input').value = '';
    document.getElementById('hcCalc-hcEstimate-input').value = '';

    if (typeString === "by-rating") {
        document.getElementById('popup-hcCalc-playerA-row').classList.remove('active');
        document.getElementById('popup-hcCalc-playerB-row').classList.remove('active');
        document.getElementById('popup-hcCalc-ratingA-row').classList.add('active');
        document.getElementById('popup-hcCalc-ratingB-row').classList.add('active');
        
        document.getElementById('popup-hcCalc-playerR-row').classList.remove('active');
        document.getElementById('popup-hcCalc-ratingR-row').classList.add('active');
    }
    else {
        document.getElementById('popup-hcCalc-playerA-row').classList.add('active');
        document.getElementById('popup-hcCalc-playerB-row').classList.add('active');
        document.getElementById('popup-hcCalc-ratingA-row').classList.remove('active');
        document.getElementById('popup-hcCalc-ratingB-row').classList.remove('active');
        
        document.getElementById('popup-hcCalc-playerR-row').classList.add('active');
        document.getElementById('popup-hcCalc-ratingR-row').classList.remove('active');
    }

}
function toggleCalcTypeEstimate(typeString) {
    
    document.getElementById('output-rating-estimate').textContent = '';
    
    document.getElementById('error-message-estimate').classList.remove('show');

    document.getElementById('button-by-name-estimate').classList.remove('active');
    document.getElementById('button-by-rating-estimate').classList.remove('active');
    document.getElementById('output-rating-block-estimate').classList.remove('block');

    document.getElementById(`button-${typeString}-estimate`).classList.add('active');

    /*Empty all containers/input-output-fields etc.*/
    document.getElementById('estimate-playerR-input').value = '';
    document.getElementById('estimate-ratingR-input').value = '';
    document.getElementById('estimate-hcEstimate-input').value = '';

    if (typeString === "by-rating") {        
        document.getElementById('popup-estimate-playerR-row').classList.remove('active');
        document.getElementById('popup-estimate-ratingR-row').classList.add('active');
    }
    else {        
        document.getElementById('popup-estimate-playerR-row').classList.add('active');
        document.getElementById('popup-estimate-ratingR-row').classList.remove('active');
    }

}
function hcCalcCheckHC() {
    const myElement = document.getElementById('output-HC');
    const block = document.getElementById('output-HC-block');
    document.getElementById('hcCalc-playerR-input').value = '';
    document.getElementById('hcCalc-ratingR-input').value = '';
    document.getElementById('hcCalc-hcEstimate-input').value = '';
    document.getElementById('output-rating').textContent = '';

    myElement.textContent = '-147';
    myElement.classList.remove('animation');
    document.getElementById('output-rating').classList.remove('animation');
    setTimeout(function() {myElement.classList.add('animation')}, 100);

    block.classList.remove('block');
    document.getElementById('output-rating-block').classList.remove('block');
    setTimeout(function() {block.classList.add('block')}, 100);
}
function hcCalcCheckRating() {
    const myElement = document.getElementById('output-rating');
    const block = document.getElementById('output-rating-block');
    document.getElementById('hcCalc-playerA-input').value = '';
    document.getElementById('hcCalc-playerB-input').value = '';
    document.getElementById('hcCalc-ratingA-input').value = '';
    document.getElementById('hcCalc-ratingB-input').textContent = '';
    document.getElementById('output-HC').textContent = '';

    myElement.textContent = '1150.0';
    myElement.classList.remove('animation');
    document.getElementById('output-HC').classList.remove('animation');
    setTimeout(function() {myElement.classList.add('animation')}, 100);

    block.classList.remove('block');
    document.getElementById('output-HC-block').classList.remove('block');
    setTimeout(function() {block.classList.add('block')}, 100);
}
document.getElementsByName('hcCalcInputs').forEach((element) => {
    element.addEventListener("change", (event) => {
        document.getElementById('output-rating').textContent = '';
        document.getElementById('output-HC').textContent = '';
    });
});
function addBreak(i, x) {
    // i: match id
    // x: playerA = "A", playerB = "B"

    const myInput = document.getElementById(`match-${i}-break${x}input`);

    if (myInput.classList.contains('show')) { // input field is showing
        // try to add break
        if (myInput.value >= 25 && myInput.value <= 155) {
            try {
                const myBreak = myInput.value;
                setTimeout(function() {
                    // crude: no db - just text
                    document.getElementById(`match-${i}-breaks${x}`).textContent += `, ${myBreak}`;
                }, 250);
            }
            catch(error) {
                alert(error);
                throw new Error(error);
            }
        }
        else if (myInput.value) alert('Error: invalid break.');
    }
    
    myInput.value = '';
    myInput.classList.toggle('show');
}

function createNewPlayer() {
    // check if valid input
    // if not valid input: display error message; return;
    // backend create new player...
    togglePlayerPopup();
}
function createNewMatch() {
    // check if valid input
    // if not valid input: display error message; return;
    // backend create new match...
    toggleMatchPopup();
}
function updateMatch(id = 0) {
    toggleEditPopup();
}
function startMatch_frontend(id = 0) {
    //startMatch_backend(id)
}
function finishMatch_frontend(id = 0) {
    //finish match id backend

    //close
    toggleFinishPopup();
}
function deleteMatch_frontend(id = 0) {
    //delete match id backend

    //close
    toggleDeletePopup();
}

