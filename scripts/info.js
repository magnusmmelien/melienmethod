const menuItems = document.querySelectorAll('.menu-item');
const imageDisplay = document.getElementById('image-display');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const option = item.getAttribute('data-option');
        const imagePath = `images/${option}.jpg`; // Adjust the path based on your image folder structure

        imageDisplay.src = imagePath;
        imageDisplay.style.display = 'block';

        // Remove active class from all menu items
        menuItems.forEach(item => item.classList.remove('active'));
        item.classList.add('active');
    });
});

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

function resizeEq(longIDstr, shortIDstr) {
    const longEqP = document.getElementById(longIDstr);
    const shortEqP = document.getElementById(shortIDstr);
    try {
        //longEqWidthString = window.getComputedStyle(longEqP).width;
        //longEqWidth = Number(longEqWidthString.split('p')[0]);
        if (window.innerWidth < 480) {
        //if (longEqWidth < 340) {
            //console.warn('Screen too narrow: long equation break line.'); 
            shortEqP.style.display = 'block';
            longEqP.style.display = 'none';
        }
        else {
            //console.log('Screen normal: long equation on one line.'); 
            longEqP.style.display = 'block';
            shortEqP.style.display = 'none';
        }
    } catch(error) {
        console.error('Error: failed to check if long equation needs line break: ' + error.message);
    }
}
window.addEventListener('resize', () => {
    resizeEq('long-eq-K', 'short-eq-K');
    resizeEq('long-eq-x', 'short-eq-x');
}, true);