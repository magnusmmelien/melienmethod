

document.addEventListener("DOMContentLoaded", function() {
    const button1 = document.getElementById("button1");
    const button2 = document.getElementById("button2");
    const button3 = document.getElementById("button3");
    const button4 = document.getElementById("button4");
    const button5 = document.getElementById("button5");
    const homeBackground = document.querySelector(".home-background");

    const buttons = document.getElementsByClassName('button');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("mouseenter", () => {
            homeBackground.classList.remove(`zoom-out`);        
            homeBackground.classList.add(`zoom-effect-${i}`);
        });
        buttons[i].addEventListener("mouseleave", () => {
            homeBackground.classList.remove(`zoom-effect-${i}`);
            homeBackground.classList.add(`zoom-out`);
        });
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

});
