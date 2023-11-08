// Demo tests:
var bigOne = document.getElementById("bigOne");
var smallOne = document.getElementById("pTest");

const textRef = ref(database, 'test');
const osloRef = ref(database, 'clubs/1/name');
onValue(textRef, (snapshot) => {
    const data = snapshot.val();
    //update
    bigOne.innerText = data;
});
onValue(osloRef, (snapshot) => {
    const data = snapshot.val();
    //update
    smallOne.innerText = data;
});

function writeTest() {
    const myInput = document.getElementById('myInputID');
    console.log("test: " + myInput.value);
    const updates = {};
    updates['test'] = myInput.value;
    update(ref(database), updates);
}

document.getElementById('myButton').addEventListener("click", function() { writeTest(); } );

console.log('Match test: ');
const exMatchRef = ref(database, 'Norway_finishedMatches/1');
const dbRef = ref(getDatabase());
get(child(dbRef, 'Norway_finishedMatches/1')).then((snapshot) => {
    if (snapshot.exists()) console.log(snapshot.val());
    else console.log('No data available');
}).catch((error) => {
    console.error(error);
});

