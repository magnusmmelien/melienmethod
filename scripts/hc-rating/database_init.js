
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";
import { getDatabase, ref, onValue, child, push, update, get } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDBbSS8uNMLGotx6-erB_TE2dwg-XQizao",
    authDomain: "the-melien-method.firebaseapp.com",
    databaseURL: "https://the-melien-method-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "the-melien-method",
    storageBucket: "the-melien-method.appspot.com",
    messagingSenderId: "204216277334",
    appId: "1:204216277334:web:c7d4cfb8ed0272dd841ef7",
    measurementId: "G-91BRENDDS2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const database = getDatabase(app);
export const matchCounterRef = ref(database, 'matchCounter');
export const clubsRef = ref(database, 'clubs');


/*
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

*/