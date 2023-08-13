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
