document.addEventListener("DOMContentLoaded", function() {
    const button1 = document.getElementById("button1");
    const button2 = document.getElementById("button2");
    const button3 = document.getElementById("button3");
    const homeBackground = document.querySelector(".home-background");
    
    button1.addEventListener("mouseenter", () => {
      homeBackground.classList.add("zoom-effect-1");
    });
  
    button1.addEventListener("mouseleave", () => {
      homeBackground.classList.remove("zoom-effect-1");
    });
  
    button2.addEventListener("mouseenter", () => {
      homeBackground.classList.add("zoom-effect-2");
    });
  
    button2.addEventListener("mouseleave", () => {
      homeBackground.classList.remove("zoom-effect-2");
    });
  
    button3.addEventListener("mouseenter", () => {
      homeBackground.classList.add("zoom-effect-3");
    });
  
    button3.addEventListener("mouseleave", () => {
      homeBackground.classList.remove("zoom-effect-3");
    });
  });
  