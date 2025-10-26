// Unified Login System for vumpIT
// Routes users to appropriate interface based on user type (Coach & Student only)

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if DataStore is available
    if (typeof DataStore === 'undefined') {
        console.error('DataStore is not loaded');
        showVerificationModal('error', 'System error: Data store not available. Please refresh the page.');
        return;
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Check if user is already logged in
    checkExistingSession();
    
    // Setup About Us icon
    setupAboutUsIcon();
    
    // Setup Video Tutorial icon
    setupVideoTutorialIcon();
    
    // Setup Admin Access button
    setupAdminAccessButton();
    
    // Setup video background
    setupVideoBackground();
    
    // Auto-focus on User ID input
    setTimeout(() => {
        const userIdInput = document.getElementById('userId');
        if (userIdInput) {
            userIdInput.focus();
        }
    }, 300);
});

// Setup Video Tutorial Icon
function setupVideoTutorialIcon() {
    const videoTutorialIconBtn = document.getElementById('videoTutorialIconBtn');
    const videoTutorialModal = document.getElementById('videoTutorialModal');
    const tutorialCloseBtn = document.getElementById('tutorialCloseBtn');
    const tutorialVideo = document.getElementById('tutorialVideo');
    
    // Open Video Tutorial modal with icon button
    if (videoTutorialIconBtn) {
        videoTutorialIconBtn.addEventListener('click', () => {
            if (videoTutorialModal) {
                videoTutorialModal.classList.add('active');
                // Play the tutorial video when modal opens
                if (tutorialVideo) {
                    tutorialVideo.currentTime = 0;
                    tutorialVideo.play().catch(error => {
                        console.log('Video play failed:', error);
                    });
                }
            }
        });
    }
    
    // Close Video Tutorial modal with BACK button
    if (tutorialCloseBtn) {
        tutorialCloseBtn.addEventListener('click', () => {
            if (videoTutorialModal) {
                videoTutorialModal.classList.remove('active');
                // Pause the tutorial video when modal closes
                if (tutorialVideo) {
                    tutorialVideo.pause();
                }
            }
        });
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoTutorialModal && videoTutorialModal.classList.contains('active')) {
            videoTutorialModal.classList.remove('active');
            // Pause the tutorial video when modal closes
            if (tutorialVideo) {
                tutorialVideo.pause();
            }
        }
    });
}

// Setup About Us Icon
function setupAboutUsIcon() {
    const aboutUsIconBtn = document.getElementById('aboutUsIconBtn');
    const aboutUsModal = document.getElementById('aboutUsModal');
    const aboutCloseBtn = document.getElementById('aboutCloseBtn');
    
    // Open About Us modal with icon button
    if (aboutUsIconBtn) {
        aboutUsIconBtn.addEventListener('click', () => {
            if (aboutUsModal) {
                aboutUsModal.classList.add('active');
            }
        });
    }
    
    // Close About Us modal with BACK button
    if (aboutCloseBtn) {
        aboutCloseBtn.addEventListener('click', () => {
            if (aboutUsModal) {
                aboutUsModal.classList.remove('active');
            }
        });
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aboutUsModal && aboutUsModal.classList.contains('active')) {
            aboutUsModal.classList.remove('active');
        }
    });
}

// Setup Admin Access Button
function setupAdminAccessButton() {
    const adminAccessBtn = document.getElementById('adminAccessBtn');
    
    if (adminAccessBtn) {
        adminAccessBtn.addEventListener('click', () => {
            // Redirect directly to admin.html
            window.location.href = 'admin.html';
        });
    }
}

// Setup Video Background
function setupVideoBackground() {
    const video = document.querySelector('.background-video');
    
    if (video) {
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
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Auto-login on User ID input
    const userId = document.getElementById('userId');
    
    if (userId) {
        // Debounce timer
        let typingTimer;
        const typingDelay = 800; // Wait 800ms after user stops typing
        
        userId.addEventListener('input', () => {
            clearTimeout(typingTimer);
            hideVerificationModal();
            
            const value = userId.value.trim();
            
            // Show checking status if input has value
            if (value.length > 0) {
                showVerificationModal('checking', 'Checking...');
                
                // Start timer for auto-login check
                typingTimer = setTimeout(() => {
                    handleAutoLogin(value);
                }, typingDelay);
            } else {
                hideVerificationModal();
            }
        });
        
        // Also check on blur (when user clicks away)
        userId.addEventListener('blur', () => {
            const value = userId.value.trim();
            if (value.length > 0) {
                clearTimeout(typingTimer);
                handleAutoLogin(value);
            }
        });
        
        // Handle Enter key press
        userId.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = userId.value.trim();
                if (value.length > 0) {
                    clearTimeout(typingTimer);
                    handleAutoLogin(value);
                }
            }
        });
    }
}

// Handle Auto Login
function handleAutoLogin(userId) {
    // Validate input
    if (!userId) {
        hideVerificationModal();
        return;
    }
    
    // Get user from DataStore
    let user = DataStore.getUserById(userId);
    
    // If not found in users, check students
    if (!user) {
        user = DataStore.getStudentById(userId);
    }
    
    // If still not found, check all users again
    if (!user) {
        const allUsers = DataStore.getAllUsers();
        user = allUsers.find(u => u.user_id === userId);
    }
    
    // User not found
    if (!user) {
        showVerificationModal('error', 'User ID not found');
        return;
    }
    
    // Determine user type
    let userType = user.user_type ? user.user_type.toLowerCase() : '';
    
    // Handle authentication based on user type (Coach & Student only)
    if (userType === 'coach') {
        // Coach login successful
        showVerificationModal('success', 'Login successful! Redirecting...');
        sessionStorage.setItem('loggedInCoach', JSON.stringify(user));
        setTimeout(() => {
            showLoadingAndRedirect('coach', userId);
        }, 1000);
        
    } else if (userType === 'student' || userType === 'athlete') {
        // Student/Athlete login successful
        showVerificationModal('success', 'Login successful! Redirecting...');
        sessionStorage.setItem('loggedInStudent', userId);
        setTimeout(() => {
            showLoadingAndRedirect('student', userId);
        }, 1000);
        
    } else if (userType === 'admin') {
        // Block admin login
        showVerificationModal('error', 'Admin access restricted');
        
    } else {
        showVerificationModal('error', 'Invalid user type');
    }
}

// Show Verification Modal
function showVerificationModal(status, message) {
    const modal = document.getElementById('verificationModal');
    const text = modal.querySelector('.verification-text');
    const icon = modal.querySelector('.verification-icon');
    
    if (modal && text && icon) {
        // Remove previous status classes
        modal.classList.remove('checking', 'success', 'error');
        
        // Add new status class
        modal.classList.add('active', status);
        
        // Update text
        text.textContent = message;
        
        // Update icon based on status
        if (status === 'success') {
            icon.innerHTML = `
                <svg class="verification-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
        } else if (status === 'error') {
            icon.innerHTML = `
                <svg class="verification-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `;
        } else {
            icon.innerHTML = `
                <svg class="verification-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                </svg>
            `;
        }
        
        // Auto-hide error messages after 4 seconds
        if (status === 'error') {
            setTimeout(() => {
                hideVerificationModal();
            }, 4000);
        }
    }
}

// Hide Verification Modal
function hideVerificationModal() {
    const modal = document.getElementById('verificationModal');
    
    if (modal) {
        modal.classList.remove('active', 'checking', 'success', 'error');
    }
}

// Check if user has an existing session
function checkExistingSession() {
    // Check for existing sessions (excluding admin)
    const loggedInCoach = sessionStorage.getItem('loggedInCoach');
    const loggedInStudent = sessionStorage.getItem('loggedInStudent');
    
    if (loggedInCoach) {
        const coach = JSON.parse(loggedInCoach);
        redirectToInterface('coach', coach.coach_id);
        return;
    }
    
    if (loggedInStudent) {
        const studentId = loggedInStudent;
        redirectToInterface('student', studentId);
        return;
    }
}

// Show loading spinner and redirect
function showLoadingAndRedirect(interfaceType, userId) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const rfidCard = document.getElementById('rfidCard');
    
    if (loadingSpinner) {
        loadingSpinner.classList.add('active');
    }
    
    if (rfidCard) {
        rfidCard.style.opacity = '0.5';
        rfidCard.style.pointerEvents = 'none';
    }
    
    // Hide verification modal
    hideVerificationModal();
    
    // Simulate loading delay for better UX
    setTimeout(() => {
        redirectToInterface(interfaceType, userId);
    }, 1500);
}

// Redirect to appropriate interface
function redirectToInterface(interfaceType, userId) {
    switch(interfaceType) {
        case 'coach':
            window.location.href = 'coach.html';
            break;
        case 'student':
            window.location.href = 'student.html';
            break;
        default:
            showVerificationModal('error', 'Unable to determine user interface');
            resetLoadingState();
    }
}

// Reset loading state
function resetLoadingState() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const rfidCard = document.getElementById('rfidCard');
    
    if (loadingSpinner) {
        loadingSpinner.classList.remove('active');
    }
    
    if (rfidCard) {
        rfidCard.style.opacity = '1';
        rfidCard.style.pointerEvents = 'auto';
    }
}

// Utility function to get user type display name
function getUserTypeDisplayName(userType) {
    const types = {
        'coach': 'Coach',
        'student': 'Student',
        'athlete': 'Athlete'
    };
    
    return types[userType.toLowerCase()] || userType;
}

// Log function for debugging (can be removed in production)
function logLogin(userId, userType) {
    console.log(`[Login] User: ${userId} | Type: ${userType} | Time: ${new Date().toISOString()}`);
}

// Prevent back button after logout
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        window.location.reload();
    }
});

// Handle browser back button
window.addEventListener('popstate', function() {
    // Clear all sessions when back button is pressed
    sessionStorage.clear();
});

// Export functions for testing (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleAutoLogin,
        redirectToInterface,
        showVerificationModal,
        hideVerificationModal
    };
}