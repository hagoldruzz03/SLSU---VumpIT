// Student Portal JavaScript
// Handles authentication, measurement flow, and data visualization

let currentStudent = null;
let bmiChart = null;
let jumpChart = null;
let bmiChartModal = null;
let jumpChartModal = null;

// Measurement state management
let measurementState = {
    weight: null,
    height: null,
    standingReach: null,
    jumpReach: null,
    bmi: null,
    bmiRating: null,
    jumpHeight: null,
    jumpRating: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    // Check if DataStore is available
    if (typeof DataStore === 'undefined') {
        console.error('DataStore is not loaded');
        showError('System error: Data store not available. Please refresh the page.');
        return;
    }

    // Check if student is logged in
    const loggedInStudent = sessionStorage.getItem('loggedInStudent');
    if (loggedInStudent) {
        try {
            currentStudent = DataStore.getStudentById(loggedInStudent);
            if (currentStudent) {
                showMainContent();
            } else {
                showLoginModal();
            }
        } catch (error) {
            console.error('Error loading student:', error);
            showLoginModal();
        }
    } else {
        showLoginModal();
    }

    // Setup event listeners
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout buttons
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        document.getElementById('logoutModal').style.display = 'flex';
    });
    document.getElementById('confirmLogoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('cancelLogoutBtn')?.addEventListener('click', () => {
        document.getElementById('logoutModal').style.display = 'none';
    });
    document.getElementById('closeLogoutModalBtn')?.addEventListener('click', () => {
        document.getElementById('logoutModal').style.display = 'none';
    });

    // Notification buttons
    document.getElementById('successOkBtn')?.addEventListener('click', () => {
        document.getElementById('successModal').style.display = 'none';
    });
    document.getElementById('errorOkBtn')?.addEventListener('click', () => {
        document.getElementById('errorModal').style.display = 'none';
    });

    // View History buttons
    document.getElementById('viewBmiHistory')?.addEventListener('click', openBmiHistoryModal);
    document.getElementById('viewJumpHistory')?.addEventListener('click', openJumpHistoryModal);

    // Close History buttons
    document.getElementById('closeBmiHistoryBtn')?.addEventListener('click', closeBmiHistoryModal);
    document.getElementById('closeJumpHistoryBtn')?.addEventListener('click', closeJumpHistoryModal);

    // View Recommendations button
    document.getElementById('viewRecommendationsBtn')?.addEventListener('click', openRecommendationsModal);
    document.getElementById('closeRecommendationsBtn')?.addEventListener('click', closeRecommendationsModal);

    // START button - begins measurement flow
    document.getElementById('startButton')?.addEventListener('click', startMeasurementFlow);

    // Weight measurement flow
    document.getElementById('cancelWeightMeasurement')?.addEventListener('click', showCancelConfirmation);
    document.getElementById('startWeightMeasurement')?.addEventListener('click', startWeightMeasurement);
    document.getElementById('restartWeightMeasurement')?.addEventListener('click', restartWeightMeasurement);
    document.getElementById('continueFromWeight')?.addEventListener('click', continueFromWeight);

    // Wearable device
    document.getElementById('continueFromWearable')?.addEventListener('click', continueFromWearable);

    // Height measurement flow
    document.getElementById('startHeightMeasurement')?.addEventListener('click', startHeightMeasurement);
    document.getElementById('restartHeightMeasurement')?.addEventListener('click', restartHeightMeasurement);
    document.getElementById('continueFromHeight')?.addEventListener('click', continueFromHeight);

    // BMI result
    document.getElementById('proceedToJump')?.addEventListener('click', proceedToJumpMeasurement);
    document.getElementById('skipJump')?.addEventListener('click', skipJumpMeasurement);

    // Standing reach measurement
    document.getElementById('startStandingReachMeasurement')?.addEventListener('click', startStandingReachMeasurement);
    document.getElementById('restartStandingReachMeasurement')?.addEventListener('click', restartStandingReachMeasurement);
    document.getElementById('continueFromStandingReach')?.addEventListener('click', continueFromStandingReach);

    // Jump instruction video
    document.getElementById('playJumpVideo')?.addEventListener('click', playJumpVideo);
    document.getElementById('skipJumpVideo')?.addEventListener('click', skipJumpVideo);

    // Jump execution
    document.getElementById('startJumpButton')?.addEventListener('click', startJumpCountdown);
    document.getElementById('anotherJumpTrial')?.addEventListener('click', anotherJumpTrial);
    document.getElementById('finishJump')?.addEventListener('click', finishJumpMeasurement);

    // Cancel confirmation
    document.getElementById('cancelAbort')?.addEventListener('click', () => {
        document.getElementById('cancelConfirmationModal').style.display = 'none';
    });
    document.getElementById('confirmCancel')?.addEventListener('click', confirmCancelMeasurement);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            // Don't close measurement modals by clicking outside
            if (!e.target.classList.contains('measurement-modal')) {
                e.target.style.display = 'none';
            }
        }
    });
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    const studentId = document.getElementById('studentId').value.trim();

    let student = DataStore.getStudentById(studentId);
    
    if (!student) {
        const allUsers = DataStore.getAllUsers();
        student = allUsers.find(u => u.user_id === studentId);
    }

    if (!student) {
        showError('Invalid Student ID. Please check and try again.');
        return;
    }

    currentStudent = student;
    sessionStorage.setItem('loggedInStudent', studentId);
    document.getElementById('loginModal').style.display = 'none';
    showMainContent();
}

// Logout Handler
function handleLogout() {
    sessionStorage.removeItem('loggedInStudent');
    currentStudent = null;
    document.getElementById('logoutModal').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    window.location.href = 'index.html';
}

// Show Login Modal
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
}

// Show Main Content
function showMainContent() {
    if (!currentStudent) return;

    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';

    loadStudentProfile();
}

// Load Student Profile
function loadStudentProfile() {
    if (!currentStudent) return;

    let coachName = 'Not assigned';
    if (currentStudent.coach_id) {
        const coach = DataStore.getUserById(currentStudent.coach_id);
        coachName = coach ? coach.user_name : 'Not assigned';
    }

    let userRole = 'Student';
    if (currentStudent.user_type) {
        const typeStr = currentStudent.user_type.toLowerCase();
        if (typeStr === 'athlete') {
            userRole = 'Athlete';
        } else if (typeStr === 'student') {
            userRole = 'Student';
        } else {
            userRole = currentStudent.user_type.charAt(0).toUpperCase() + currentStudent.user_type.slice(1).toLowerCase();
        }
    }

    const displayName = currentStudent.student_name || currentStudent.user_name || 'Unknown';
    document.getElementById('profileName').textContent = displayName;
    document.getElementById('profileRole').textContent = userRole;
    document.getElementById('profileUserId').textContent = currentStudent.user_id || '--';
    document.getElementById('profileCoach').textContent = coachName;
    document.getElementById('profileSport').textContent = currentStudent.sport || 'Not assigned';
    document.getElementById('profileGender').textContent = currentStudent.gender || 'Not specified';
    document.getElementById('profileCollege').textContent = currentStudent.user_college || currentStudent.coach_college || 'Not assigned';
    document.getElementById('profileCourse').textContent = currentStudent.course || 'Not assigned';
    document.getElementById('profileYear').textContent = currentStudent.year ? `${currentStudent.year} Year` : 'Not specified';
    document.getElementById('profileSection').textContent = currentStudent.section || 'Not assigned';

    // Update BMI stats
    document.getElementById('statHeight').textContent = currentStudent.current_height ? `${currentStudent.current_height} cm` : '--';
    document.getElementById('statWeight').textContent = currentStudent.current_weight ? `${currentStudent.current_weight} kg` : '--';
    document.getElementById('statBMI').textContent = currentStudent.current_bmi ? currentStudent.current_bmi.toFixed(1) : '--';
    document.getElementById('statBMIRating').textContent = currentStudent.current_bmi_rating || '--';
    document.getElementById('bmiUpdateDate').textContent = currentStudent.updated_bmi_date || 'N/A';

    // Update Jump stats
    document.getElementById('statStandingReach').textContent = currentStudent.current_standing_reach ? `${currentStudent.current_standing_reach} cm` : '--';
    document.getElementById('statJumpReach').textContent = currentStudent.current_jump_reach ? `${currentStudent.current_jump_reach} cm` : '--';
    document.getElementById('statVerticalJump').textContent = currentStudent.current_jump_height ? `${currentStudent.current_jump_height} cm` : '--';
    document.getElementById('statJumpRating').textContent = currentStudent.current_jump_rating || '--';
    document.getElementById('jumpUpdateDate').textContent = currentStudent.updated_jump_date || 'N/A';
}

// ========== MEASUREMENT FLOW ==========

// Reset measurement state
function resetMeasurementState() {
    measurementState = {
        weight: null,
        height: null,
        standingReach: null,
        jumpReach: null,
        bmi: null,
        bmiRating: null,
        jumpHeight: null,
        jumpRating: null
    };
}

// Start Measurement Flow
function startMeasurementFlow() {
    resetMeasurementState();
    closeAllModals();
    document.getElementById('weightMeasurementModal').style.display = 'flex';
}

// Cancel Measurement Confirmation
function showCancelConfirmation() {
    document.getElementById('cancelConfirmationModal').style.display = 'flex';
}

function confirmCancelMeasurement() {
    closeAllModals();
    resetMeasurementState();
}

// ========== WEIGHT MEASUREMENT ==========

function startWeightMeasurement() {
    closeAllModals();
    document.getElementById('measuringWeightModal').style.display = 'flex';
    document.getElementById('weightValue').textContent = '--';
    document.getElementById('continueFromWeight').style.display = 'none';
    
    // Simulate receiving data from hardware (replace with actual hardware integration)
    simulateWeightMeasurement();
}

function simulateWeightMeasurement() {
    // Simulate hardware delay
    setTimeout(() => {
        const weight = (Math.random() * 30 + 50).toFixed(1); // Random weight between 50-80 kg
        measurementState.weight = parseFloat(weight);
        document.getElementById('weightValue').textContent = weight;
        document.getElementById('continueFromWeight').style.display = 'block';
    }, 2000);
}

function restartWeightMeasurement() {
    startWeightMeasurement();
}

function continueFromWeight() {
    closeAllModals();
    document.getElementById('wearableDeviceModal').style.display = 'flex';
}

// ========== WEARABLE DEVICE ==========

function continueFromWearable() {
    closeAllModals();
    document.getElementById('heightInstructionModal').style.display = 'flex';
}

// ========== HEIGHT MEASUREMENT ==========

function startHeightMeasurement() {
    closeAllModals();
    document.getElementById('measuringHeightModal').style.display = 'flex';
    document.getElementById('heightValue').textContent = '--';
    document.getElementById('continueFromHeight').style.display = 'none';
    
    // Simulate receiving data from hardware
    simulateHeightMeasurement();
}

function simulateHeightMeasurement() {
    setTimeout(() => {
        const height = (Math.random() * 30 + 160).toFixed(0); // Random height between 160-190 cm
        measurementState.height = parseFloat(height);
        document.getElementById('heightValue').textContent = height;
        document.getElementById('continueFromHeight').style.display = 'block';
    }, 2000);
}

function restartHeightMeasurement() {
    startHeightMeasurement();
}

function continueFromHeight() {
    // Calculate BMI
    const heightInMeters = measurementState.height / 100;
    measurementState.bmi = measurementState.weight / (heightInMeters * heightInMeters);
    measurementState.bmiRating = getBMIRating(measurementState.bmi);
    
    // Show BMI result
    closeAllModals();
    displayBMIResult();
}

// ========== BMI RESULT ==========

function displayBMIResult() {
    document.getElementById('bmiResultHeight').textContent = measurementState.height.toFixed(0);
    document.getElementById('bmiResultWeight').textContent = measurementState.weight.toFixed(1);
    document.getElementById('bmiResultValue').textContent = measurementState.bmi.toFixed(1);
    document.getElementById('bmiResultRating').textContent = measurementState.bmiRating;
    
    document.getElementById('bmiResultModal').style.display = 'flex';
}

function proceedToJumpMeasurement() {
    closeAllModals();
    document.getElementById('standingReachInstructionModal').style.display = 'flex';
}

function skipJumpMeasurement() {
    // Save BMI data only
    saveBMIData();
    closeAllModals();
    loadStudentProfile();
    showSuccess('BMI measurement saved successfully!');
}

// ========== STANDING REACH MEASUREMENT ==========

function startStandingReachMeasurement() {
    closeAllModals();
    document.getElementById('measuringStandingReachModal').style.display = 'flex';
    document.getElementById('standingReachValue').textContent = '--';
    document.getElementById('continueFromStandingReach').style.display = 'none';
    
    // Simulate receiving data from hardware
    simulateStandingReachMeasurement();
}

function simulateStandingReachMeasurement() {
    setTimeout(() => {
        const standingReach = (Math.random() * 50 + 200).toFixed(0); // Random 200-250 cm
        measurementState.standingReach = parseFloat(standingReach);
        document.getElementById('standingReachValue').textContent = standingReach;
        document.getElementById('continueFromStandingReach').style.display = 'block';
    }, 2000);
}

function restartStandingReachMeasurement() {
    startStandingReachMeasurement();
}

function continueFromStandingReach() {
    closeAllModals();
    document.getElementById('jumpInstructionModal').style.display = 'flex';
}

// ========== JUMP INSTRUCTION VIDEO ==========

function playJumpVideo() {
    const video = document.getElementById('jumpInstructionVideo');
    if (video) {
        video.play();
    }
}

function skipJumpVideo() {
    closeAllModals();
    document.getElementById('getReadyJumpModal').style.display = 'flex';
}

// ========== JUMP EXECUTION ==========

function startJumpCountdown() {
    closeAllModals();
    
    // Show READY for 2 seconds
    document.getElementById('jumpReadyCountdownModal').style.display = 'flex';
    
    setTimeout(() => {
        // Show JUMP! for 2 seconds
        closeAllModals();
        document.getElementById('jumpNowModal').style.display = 'flex';
        
        // Simulate jump measurement
        simulateJumpMeasurement();
        
        setTimeout(() => {
            closeAllModals();
            displayJumpResult();
        }, 2000);
    }, 2000);
}

function simulateJumpMeasurement() {
    // Simulate jump reach (standing reach + jump height)
    const jumpHeight = (Math.random() * 40 + 30).toFixed(0); // Random 30-70 cm
    measurementState.jumpReach = measurementState.standingReach + parseFloat(jumpHeight);
    measurementState.jumpHeight = parseFloat(jumpHeight);
    measurementState.jumpRating = getJumpRating(measurementState.jumpHeight, currentStudent.gender);
}

// ========== JUMP RESULT ==========

function displayJumpResult() {
    document.getElementById('jumpResultStandingReach').textContent = measurementState.standingReach.toFixed(0);
    document.getElementById('jumpResultJumpReach').textContent = measurementState.jumpReach.toFixed(0);
    document.getElementById('jumpResultHeight').textContent = measurementState.jumpHeight.toFixed(0);
    document.getElementById('jumpResultRating').textContent = measurementState.jumpRating;
    
    document.getElementById('jumpResultModal').style.display = 'flex';
}

function anotherJumpTrial() {
    closeAllModals();
    document.getElementById('getReadyJumpModal').style.display = 'flex';
}

function finishJumpMeasurement() {
    // Save all measurement data
    saveBMIData();
    saveJumpData();
    closeAllModals();
    loadStudentProfile();
    showSuccess('All measurements saved successfully!');
}

// ========== DATA SAVING ==========

function saveBMIData() {
    const newEntry = {
        date: getCurrentDate(),
        height: measurementState.height,
        weight: measurementState.weight,
        bmi: measurementState.bmi,
        rating: measurementState.bmiRating
    };

    if (!currentStudent.bmi_history) {
        currentStudent.bmi_history = [];
    }

    currentStudent.bmi_history.push(newEntry);
    currentStudent.current_height = measurementState.height;
    currentStudent.current_weight = measurementState.weight;
    currentStudent.current_bmi = measurementState.bmi;
    currentStudent.current_bmi_rating = measurementState.bmiRating;
    currentStudent.updated_bmi_date = getCurrentDate();

    DataStore.updateStudent(currentStudent.user_id, currentStudent);
}

function saveJumpData() {
    const newEntry = {
        date: getCurrentDate(),
        standing_reach: measurementState.standingReach,
        jump_reach: measurementState.jumpReach,
        jump_height: measurementState.jumpHeight,
        vertical_jump: measurementState.jumpHeight,
        rating: measurementState.jumpRating
    };

    if (!currentStudent.jump_history) {
        currentStudent.jump_history = [];
    }

    currentStudent.jump_history.push(newEntry);
    currentStudent.current_standing_reach = measurementState.standingReach;
    currentStudent.current_jump_reach = measurementState.jumpReach;
    currentStudent.current_jump_height = measurementState.jumpHeight;
    currentStudent.current_vertical_jump = measurementState.jumpHeight;
    currentStudent.current_jump_rating = measurementState.jumpRating;
    currentStudent.updated_jump_date = getCurrentDate();

    DataStore.updateStudent(currentStudent.user_id, currentStudent);
}

// ========== HISTORY MODALS ==========

function openBmiHistoryModal() {
    document.getElementById('bmiHistoryModal').style.display = 'flex';
    updateBMIHistoryTableModal();
    createBMIChartModal();
}

function closeBmiHistoryModal() {
    document.getElementById('bmiHistoryModal').style.display = 'none';
    if (bmiChartModal) {
        bmiChartModal.destroy();
        bmiChartModal = null;
    }
}

function openJumpHistoryModal() {
    document.getElementById('jumpHistoryModal').style.display = 'flex';
    updateJumpHistoryTableModal();
    createJumpChartModal();
}

function closeJumpHistoryModal() {
    document.getElementById('jumpHistoryModal').style.display = 'none';
    if (jumpChartModal) {
        jumpChartModal.destroy();
        jumpChartModal = null;
    }
}

function updateBMIHistoryTableModal() {
    const tableBody = document.getElementById('bmiHistoryTableModal');
    const history = currentStudent.bmi_history || [];

    if (history.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="no-data">No history available</td></tr>';
        return;
    }

    tableBody.innerHTML = history.map(entry => `
        <tr>
            <td>${formatDate(entry.date)}</td>
            <td>${entry.height} cm</td>
            <td>${entry.weight} kg</td>
            <td>${entry.bmi.toFixed(1)}</td>
            <td><span class="rating-badge rating-${entry.rating.toLowerCase().replace(' ', '-')}">${entry.rating}</span></td>
        </tr>
    `).join('');
}

function updateJumpHistoryTableModal() {
    const tableBody = document.getElementById('jumpHistoryTableModal');
    const history = currentStudent.jump_history || [];

    if (history.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="no-data">No history available</td></tr>';
        return;
    }

    tableBody.innerHTML = history.map(entry => `
        <tr>
            <td>${formatDate(entry.date)}</td>
            <td>${entry.standing_reach} cm</td>
            <td>${entry.jump_reach} cm</td>
            <td>${entry.vertical_jump} cm</td>
            <td><span class="rating-badge rating-${entry.rating.toLowerCase().replace(' ', '-')}">${entry.rating}</span></td>
        </tr>
    `).join('');
}

function createBMIChartModal() {
    if (bmiChartModal) {
        bmiChartModal.destroy();
    }

    const ctx = document.getElementById('bmiChartModal');
    if (!ctx) return;

    const history = currentStudent.bmi_history || [];
    if (history.length === 0) {
        ctx.parentElement.innerHTML = '<p style="text-align: center; color: #64748b; padding: 40px;">No data to display</p>';
        return;
    }

    const labels = history.map(entry => formatDate(entry.date));
    const data = history.map(entry => entry.bmi);

    bmiChartModal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'BMI',
                data: data,
                borderColor: '#1ec97c',
                backgroundColor: 'rgba(30, 201, 124, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'BMI Trend Over Time',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'BMI'
                    }
                }
            }
        }
    });
}

function createJumpChartModal() {
    if (jumpChartModal) {
        jumpChartModal.destroy();
    }

    const ctx = document.getElementById('jumpChartModal');
    if (!ctx) return;

    const history = currentStudent.jump_history || [];
    if (history.length === 0) {
        ctx.parentElement.innerHTML = '<p style="text-align: center; color: #64748b; padding: 40px;">No data to display</p>';
        return;
    }

    const labels = history.map(entry => formatDate(entry.date));
    const verticalJumpData = history.map(entry => entry.vertical_jump);

    jumpChartModal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Vertical Jump',
                    data: verticalJumpData,
                    borderColor: '#1ec97c',
                    backgroundColor: 'rgba(30, 201, 124, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Vertical Jump Trend Over Time',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Height (cm)'
                    }
                }
            }
        }
    });
}

// ========== TRAINING RECOMMENDATIONS ==========

function openRecommendationsModal() {
    if (!currentStudent || !currentStudent.current_jump_height || !currentStudent.gender) {
        showError('No jump data available. Please complete a jump measurement first.');
        return;
    }

    const jumpHeight = currentStudent.current_jump_height;
    const gender = currentStudent.gender.toLowerCase();
    const rating = currentStudent.current_jump_rating;

    const recommendations = getTrainingRecommendations(jumpHeight, gender, rating);
    displayRecommendations(recommendations);
    
    document.getElementById('recommendationsModal').style.display = 'flex';
}

function closeRecommendationsModal() {
    document.getElementById('recommendationsModal').style.display = 'none';
}

function getTrainingRecommendations(jumpHeight, gender, rating) {
    const isMale = gender === 'male';
    
    // Determine category based on jump height and gender
    let category = '';
    let trainingFocus = '';
    let plyometricExercises = [];
    let recoveryMethods = [];
    let additionalRemarks = '';
    
    if (rating === 'Excellent') {
        category = 'Excellent';
        trainingFocus = 'Maintain current explosive strength and refine jump mechanics for efficiency.';
        plyometricExercises = [
            'Depth jumps',
            'Bounding',
            'Single-leg hops',
            'Contrast training'
        ];
        recoveryMethods = [
            'Cold immersion',
            'Active recovery sessions',
            'Proper sleep optimization'
        ];
        additionalRemarks = 'Continue monitoring fatigue levels and include mobility drills to prevent overtraining.';
    } else if (rating === 'Good') {
        category = 'Good';
        trainingFocus = 'Enhance maximum power output and reactive strength.';
        plyometricExercises = [
            'Box jumps',
            'Tuck jumps',
            'Squat jumps',
            'Medicine ball throws'
        ];
        recoveryMethods = [
            'Dynamic stretching',
            'Foam rolling',
            'Light jogging post-training'
        ];
        additionalRemarks = 'Gradually increase jump intensity and track weekly improvements.';
    } else if (rating === 'Average') {
        category = 'Average';
        trainingFocus = 'Build foundational leg strength and coordination.';
        plyometricExercises = [
            'Jump squats',
            'Skipping',
            'Lateral bounds',
            'Step jumps'
        ];
        recoveryMethods = [
            'Proper nutrition',
            '48-hour recovery between plyometric sessions',
            'Moderate stretching'
        ];
        additionalRemarks = 'Combine strength training (e.g., squats, lunges) with plyometric drills for better results.';
    } else if (rating === 'Below Average') {
        category = 'Below Average';
        trainingFocus = 'Improve lower-body strength and stability.';
        plyometricExercises = [
            'Low box jumps',
            'Ankle hops',
            'Wall sits',
            'Assisted jump training'
        ];
        recoveryMethods = [
            'Massage',
            'Low-impact cycling',
            'Hydration emphasis'
        ];
        additionalRemarks = 'Focus on form before intensity; integrate progressive overload gradually.';
    } else {
        category = 'Poor';
        trainingFocus = 'Develop basic strength and neuromuscular coordination.';
        plyometricExercises = [
            'Step-ups',
            'Mini-squat jumps',
            'Seated leg extensions',
            'Resistance band work'
        ];
        recoveryMethods = [
            'Gentle stretching',
            'Walking',
            'Adequate sleep (7–9 hours)'
        ];
        additionalRemarks = 'Start with strength-building and mobility routines before introducing explosive training.';
    }

    return {
        category,
        jumpHeight,
        gender: isMale ? 'Male' : 'Female',
        rating,
        trainingFocus,
        plyometricExercises,
        recoveryMethods,
        additionalRemarks
    };
}

function displayRecommendations(rec) {
    const content = document.getElementById('recommendationsContent');
    
    const categoryColors = {
        'Excellent': '#28a745',
        'Good': '#17a2b8',
        'Average': '#ffc107',
        'Below Average': '#fd7e14',
        'Poor': '#dc3545'
    };

    const categoryColor = categoryColors[rec.category] || '#1ec97c';

    content.innerHTML = `
        <div class="recommendation-header" style="background: linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%);">
            <h3>Your Performance Level: ${rec.rating}</h3>
            <div class="recommendation-stats">
                <div class="recommendation-stat">
                    <div class="recommendation-stat-label">Jump Height</div>
                    <div class="recommendation-stat-value">${rec.jumpHeight} cm</div>
                </div>
                <div class="recommendation-stat">
                    <div class="recommendation-stat-label">Gender</div>
                    <div class="recommendation-stat-value">${rec.gender}</div>
                </div>
            </div>
        </div>

        <div class="recommendation-section">
            <h4>
                <svg class="recommendation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                Training Focus
            </h4>
            <p>${rec.trainingFocus}</p>
        </div>

        <div class="recommendation-section">
            <h4>
                <svg class="recommendation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Plyometric Exercises
            </h4>
            <ul>
                ${rec.plyometricExercises.map(ex => `<li>${ex}</li>`).join('')}
            </ul>
        </div>

        <div class="recommendation-section">
            <h4>
                <svg class="recommendation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Recovery Methods
            </h4>
            <ul>
                ${rec.recoveryMethods.map(method => `<li>${method}</li>`).join('')}
            </ul>
        </div>

        <div class="recommendation-note">
            <p><strong>Additional Remarks:</strong> ${rec.additionalRemarks}</p>
        </div>
    `;
}

// ========== UTILITY FUNCTIONS ==========

function getBMIRating(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function getJumpRating(verticalJump, gender) {
    const isMale = gender && gender.toLowerCase() === 'male';
    
    if (isMale) {
        // Male standards (in cm)
        if (verticalJump >= 73.7) return 'Excellent';
        if (verticalJump >= 63.5) return 'Good';
        if (verticalJump >= 53.3) return 'Average';
        if (verticalJump >= 40.6) return 'Below Average';
        return 'Poor';
    } else {
        // Female standards (in cm)
        if (verticalJump >= 63.5) return 'Excellent';
        if (verticalJump >= 50.8) return 'Good';
        if (verticalJump >= 33.0) return 'Average';
        if (verticalJump >= 17.8) return 'Below Average';
        return 'Poor';
    }
}

function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

function showSuccess(message) {
    const successMsg = document.getElementById('successMessage');
    const successModal = document.getElementById('successModal');
    if (successMsg && successModal) {
        successMsg.textContent = message;
        successModal.style.display = 'flex';
    }
}

function showError(message) {
    const loginError = document.getElementById('loginError');
    if (loginError && document.getElementById('loginModal').style.display === 'flex') {
        loginError.textContent = message;
        setTimeout(() => {
            loginError.textContent = '';
        }, 5000);
        return;
    }
    
    const errorMsg = document.getElementById('errorMessage');
    const errorModal = document.getElementById('errorModal');
    if (errorMsg && errorModal) {
        errorMsg.textContent = message;
        errorModal.style.display = 'flex';
        return;
    }
    
    console.error('Error:', message);
    alert(message);
}