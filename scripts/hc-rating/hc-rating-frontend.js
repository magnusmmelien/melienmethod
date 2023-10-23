// JavaScript Function to Handle Button Click
document.getElementById("button-info").addEventListener("click", function() {
    // Navigate to the "info.html" file
    window.location.href = "././info.html#section-HC";
});

function togglePlayerPopup() {
    document.getElementById("popup-player").classList.toggle("active");
    document.getElementById("newplayer-name-input").value = "";
    document.getElementById("newplayer-rating-input").value = "";
    document.getElementById("newplayer-club-input").value = "";
    
    toggleRobustness('low');

    if (document.getElementById("button-advanced").classList.contains("active")) {toggleAdvanced();}
}
function toggleMatchPopup() {
    document.getElementById("popup-match").classList.toggle("active");
    document.getElementById("newmatch-playerA-input").value = "";
    document.getElementById("newmatch-playerB-input").value = "";
    document.getElementById("match-distance-input").value = "";
    document.getElementById("newmatch-HC-input").value = "";

    toggleDistanceType('best-of');
    toggleURS('frames');
    if (document.getElementById("popup-match-HC-row").classList.contains("active")) {toggleHC();}
}
function toggleCalcPopup() {
    document.getElementById("popup-calc").classList.toggle("active");
    toggleCalcType('by-name');
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

    document.getElementById('button-by-name').classList.remove('active');
    document.getElementById('button-by-rating').classList.remove('active');

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
function hcCalcCheckHC() {
    const myElement = document.getElementById('output-HC');
    document.getElementById('hcCalc-playerR-input').value = '';
    document.getElementById('hcCalc-ratingR-input').value = '';
    document.getElementById('hcCalc-hcEstimate-input').value = '';
    document.getElementById('output-rating').textContent = '';

    myElement.textContent = '-147';

    myElement.classList.add('flash');
    setTimeout(function() {myElement.classList.remove('flash')}, 250);
}
function hcCalcCheckRating() {
    const myElement = document.getElementById('output-rating');
    document.getElementById('hcCalc-playerA-input').value = '';
    document.getElementById('hcCalc-playerB-input').value = '';
    document.getElementById('hcCalc-ratingA-input').value = '';
    document.getElementById('hcCalc-ratingB-input').textContent = '';
    document.getElementById('output-HC').textContent = '';

    myElement.textContent = '1150.0';

    myElement.classList.add('flash');
    setTimeout(function() {myElement.classList.remove('flash')}, 250);
}
document.getElementsByName('hcCalcInputs').forEach((element) => {
    element.addEventListener("change", (event) => {
        document.getElementById('output-rating').textContent = '';
        document.getElementById('output-HC').textContent = '';
    });
});

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

/*Autocomplete input test*/
var clubs = ["Trondheim Snooker", "Oslo Snooker", "Stord Snookerklubb", "Os Biljard og Snookerklubb"];
var players = ['Magnus Martinsen Melien', 'Nassim Sekat', 'Sondre Sundt', 'Geir Ellefsen', 'Audun Risan Heimsjø',
'Erik Dullerud', 'Roald Pettersen', 'Bjørnar Jacobsen', 'Ivar Havtor Hovden', 'Robin Strand', 'Julian Lerstad'];

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
  }

autocomplete(document.getElementById("newplayer-club-input"), clubs);
autocomplete(document.getElementById("newmatch-playerA-input"), players);
autocomplete(document.getElementById("newmatch-playerB-input"), players);
autocomplete(document.getElementById("hcCalc-playerA-input"), players);
autocomplete(document.getElementById("hcCalc-playerB-input"), players);
autocomplete(document.getElementById("hcCalc-playerR-input"), players);