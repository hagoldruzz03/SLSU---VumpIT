// Burger Menu Toggle
const burgerBtn = document.getElementById('burgerBtn');
const burgerMenu = document.getElementById('burgerMenu');

burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('active');
    burgerMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!burgerBtn.contains(e.target) && !burgerMenu.contains(e.target)) {
        burgerBtn.classList.remove('active');
        burgerMenu.classList.remove('active');
    }
});

// Prevent menu from closing when clicking inside it
burgerMenu.addEventListener('click', (e) => {
    e.stopPropagation();
});

// RFID Card Animation
const rfidIcon = document.querySelector('.rfid-icon img');

// Add ripple effect animation to RFID icon
setInterval(() => {
    rfidIcon.style.animation = 'none';
    setTimeout(() => {
        rfidIcon.style.animation = 'pulse 2s ease-in-out infinite';
    }, 10);
}, 3000);

// Add hover effect to RFID card
const rfidCard = document.querySelector('.rfid-card');

rfidCard.addEventListener('mouseenter', () => {
    rfidCard.style.transform = 'scale(1.05)';
    rfidCard.style.transition = 'transform 0.3s ease';
});

rfidCard.addEventListener('mouseleave', () => {
    rfidCard.style.transform = 'scale(1)';
});

// Video background optimization
const video = document.querySelector('.background-video');

// Ensure video plays on mobile devices
video.addEventListener('loadedmetadata', () => {
    video.play().catch(error => {
        console.log('Video autoplay failed:', error);
    });
});

// Replay video if it ends (backup for loop attribute)
video.addEventListener('ended', () => {
    video.currentTime = 0;
    video.play();
});

// Accessibility: Keyboard navigation for burger menu
burgerBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        burgerBtn.click();
    }
});

// Add focus management for menu items
const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach((item, index) => {
    item.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextItem = menuItems[index + 1] || menuItems[0];
            nextItem.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevItem = menuItems[index - 1] || menuItems[menuItems.length - 1];
            prevItem.focus();
        } else if (e.key === 'Escape') {
            burgerBtn.classList.remove('active');
            burgerMenu.classList.remove('active');
            burgerBtn.focus();
        }
    });
});
