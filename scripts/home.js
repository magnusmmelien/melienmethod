import { getDatabase, ref, onValue, child, push, update, get } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { database, matchCounterRef, clubsRef } from './hc-rating/database_init.js';

const dbRef = ref(getDatabase());

// Function to get the computed width of an element by ID
function getComputedWidth(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const computedStyle = window.getComputedStyle(element);
        return computedStyle.width;
    } else {
        return null;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const homeBackground = document.querySelector(".home-background");
    const buttons = document.getElementsByClassName('button');
    const li_list = document.querySelectorAll('#home-menu li');
    const motdBox = document.getElementById("bannerMessage");
    
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("mouseenter", () => {
            homeBackground.classList.remove(`zoom-out`);        
            homeBackground.classList.add(`zoom-effect-${i}`);
        });
        buttons[i].addEventListener("mouseleave", () => {
            homeBackground.classList.remove(`zoom-effect-${i}`);
            homeBackground.classList.add(`zoom-out`);
        });
        li_list[i].style = `top: calc(4rem + 8vh + ${i+1}*2*(0.5rem + 0.8*(0.5vw + 2vh)));`;
    }
    /*
    button1.addEventListener("mouseenter", () => {
        homeBackground.classList.remove("zoom-out-1");
        homeBackground.classList.remove("zoom-out-2");
        homeBackground.classList.remove("zoom-out-3");
        homeBackground.classList.remove("zoom-out-4");
        homeBackground.classList.remove("zoom-out-5");
        
        homeBackground.classList.add("zoom-effect-1");
    });
    button1.addEventListener("mouseleave", () => {
        homeBackground.classList.remove("zoom-effect-1");
        homeBackground.classList.add("zoom-out-1");
    });
  
    button2.addEventListener("mouseenter", () => {
      homeBackground.classList.remove("zoom-out-1");
      homeBackground.classList.remove("zoom-out-2");
      homeBackground.classList.remove("zoom-out-3");
      homeBackground.classList.remove("zoom-out-4");
      homeBackground.classList.remove("zoom-out-5");
      
      
      homeBackground.classList.add("zoom-effect-2");
    });
    button2.addEventListener("mouseleave", () => {
      homeBackground.classList.remove("zoom-effect-2");
      homeBackground.classList.add("zoom-out-2");
    });
  
    button3.addEventListener("mouseenter", () => {
      homeBackground.classList.remove("zoom-out-1");
      homeBackground.classList.remove("zoom-out-2");
      homeBackground.classList.remove("zoom-out-3");
      homeBackground.classList.remove("zoom-out-4");
      homeBackground.classList.remove("zoom-out-5");
      
      
      homeBackground.classList.add("zoom-effect-3");
    });
    button3.addEventListener("mouseleave", () => {
      homeBackground.classList.remove("zoom-effect-3");
      homeBackground.classList.add("zoom-out-3");
    });

    button4.addEventListener("mouseenter", () => {
      homeBackground.classList.remove("zoom-out-1");
      homeBackground.classList.remove("zoom-out-2");
      homeBackground.classList.remove("zoom-out-3");
      homeBackground.classList.remove("zoom-out-4");
      homeBackground.classList.remove("zoom-out-5");
      
      
      homeBackground.classList.add("zoom-effect-4");
    });
    button4.addEventListener("mouseleave", () => {
      homeBackground.classList.remove("zoom-effect-4");
      homeBackground.classList.add("zoom-out-4");
    });

    button5.addEventListener("mouseenter", () => {
      homeBackground.classList.remove("zoom-out-1");
      homeBackground.classList.remove("zoom-out-2");
      homeBackground.classList.remove("zoom-out-3");
      homeBackground.classList.remove("zoom-out-4");
      homeBackground.classList.remove("zoom-out-5");
      
      
      homeBackground.classList.add("zoom-effect-5");
    });
    button5.addEventListener("mouseleave", () => {
      homeBackground.classList.remove("zoom-effect-5");
      homeBackground.classList.add("zoom-out-5");
    });
    */
    
    // message of the day
    var messageOfTheDay = 'No message available.';
    get(child(dbRef, 'motd')).then((snapshot) => {
        if (snapshot.exists()) {
            messageOfTheDay = snapshot.val();
            motdBox.textContent = 'Message of the Day: ' + messageOfTheDay;
            const motdWidth = getComputedWidth('bannerMessage');
            console.log('Width 2:', motdWidth);
            motdBox.animate([
                    // key frames
                    { transform: 'translateX(105vw)' },
                    { transform: `translateX(-${motdWidth})` }
                ]
                , {
                    // sync options
                    duration: 25000,
                    iterations: Infinity
                }
            );
        }
        else console.log('No data available for message of the day');
    }).catch((error) => {
       console.error(error);
    });
    document.getElementById("bannerMessage").textContent = 'Message of the Day: ' + messageOfTheDay;

    // test
    var element = document.getElementById('bannerMessage');
    var width = getComputedWidth('bannerMessage');
    console.log('Width:', width);

});
