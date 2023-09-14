// JavaScript Function to Handle Button Click
document.getElementById("button-info").addEventListener("click", function() {
    // Navigate to the "info.html" file
    window.location.href = "././info.html#section-HC";
});

function togglePlayerPopup() {
    document.getElementById("popup-player").classList.toggle("active");
}
function toggleMatchPopup() {
    document.getElementById("popup-match").classList.toggle("active");
}
function toggleCalcPopup() {
    document.getElementById("popup-calc").classList.toggle("active");
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
