// Student Portal JavaScript
// Handles measurement flow and data visualization
// Authentication handled by unified login system (index.html)

let currentStudent = null;
let bmiChart = null;
let jumpChart = null;
let bmiChartModal = null;
let jumpChartModal = null;

// Audio context and sound management
let audioContext = null;
let timerSound = null;
let successSound = null;
let speechSynthesis = window.speechSynthesis;

// Device connection state
let deviceConnected = false;
let deviceCheckInterval = null;

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
    // Initialize audio context
    initializeAudio();
    
    // Check if DataStore is available
    if (typeof DataStore === 'undefined') {
        console.error('DataStore is not loaded');
        showError('System error: Data store not available. Please refresh the page.');
        return;
    }

    // Check if student is logged in via unified login system
    const loggedInStudent = sessionStorage.getItem('loggedInStudent');
    if (loggedInStudent) {
        try {
            currentStudent = DataStore.getStudentById(loggedInStudent);
            if (currentStudent) {
                showMainContent();
            } else {
                // Student not found, redirect to login
                redirectToLogin();
            }
        } catch (error) {
            console.error('Error loading student:', error);
            redirectToLogin();
        }
    } else {
        // No session, redirect to login
        redirectToLogin();
    }

    // Setup event listeners
    setupEventListeners();
});

// Redirect to unified login system
function redirectToLogin() {
    sessionStorage.removeItem('loggedInStudent');
    window.location.href = 'index.html';
}

// Initialize Audio Context
function initializeAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported:', e);
    }
}

// Play timer/measuring sound - INCREASED VOLUME
function playTimerSound() {
    if (!audioContext) return null;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Schedule next beep
    const timeoutId = setTimeout(() => {
        if (timerSound) {
            timerSound = playTimerSound();
        }
    }, 1000);
    
    return timeoutId;
}

// Stop timer sound
function stopTimerSound() {
    if (timerSound) {
        clearTimeout(timerSound);
        timerSound = null;
    }
}

// Play success ping sound - INCREASED VOLUME
function playSuccessSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1200;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Text-to-speech announcer
function speak(text) {
    if (!speechSynthesis) {
        console.warn('Speech synthesis not supported');
        return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';
    
    speechSynthesis.speak(utterance);
}

// Device Connection Management
function startDeviceMonitoring() {
    deviceCheckInterval = setInterval(() => {
        checkDeviceConnection();
    }, 5000);
}

function stopDeviceMonitoring() {
    if (deviceCheckInterval) {
        clearInterval(deviceCheckInterval);
        deviceCheckInterval = null;
    }
}

function checkDeviceConnection() {
    const isConnected = Math.random() > 0.05;
    
    if (deviceConnected && !isConnected) {
        deviceConnected = false;
        handleDeviceDisconnected();
    } else if (!deviceConnected && isConnected) {
        deviceConnected = true;
    }
}

function handleDeviceDisconnected() {
    stopTimerSound();
    showDeviceDisconnected();
}

function showDeviceConnected() {
    document.getElementById('deviceConnectionTitle').textContent = 'Device Ready';
    document.getElementById('deviceConnectionMessage').textContent = 'Wearable device is connected and ready to use.';
    document.getElementById('deviceConnectionModal').style.display = 'flex';
    playSuccessSound();
}

function showDeviceDisconnected() {
    document.getElementById('deviceDisconnectedTitle').textContent = 'Device Disconnected!';
    document.getElementById('deviceDisconnectedMessage').textContent = 'The wearable device has been disconnected. Please reconnect to continue.';
    document.getElementById('deviceDisconnectedModal').style.display = 'flex';
}

// Setup Event Listeners
function setupEventListeners() {
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
    document.getElementById('deviceConnectionOkBtn')?.addEventListener('click', () => {
        document.getElementById('deviceConnectionModal').style.display = 'none';
    });
    document.getElementById('deviceDisconnectedOkBtn')?.addEventListener('click', () => {
        document.getElementById('deviceDisconnectedModal').style.display = 'none';
    });

    // View History buttons
    document.getElementById('viewBmiHistory')?.addEventListener('click', openBmiHistoryModal);
    document.getElementById('viewJumpHistory')?.addEventListener('click', openJumpHistoryModal);

    // Close History buttons
    document.getElementById('closeBmiHistoryBtn')?.addEventListener('click', closeBmiHistoryModal);
    document.getElementById('closeJumpHistoryBtn')?.addEventListener('click', closeJumpHistoryModal);

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
            if (!e.target.classList.contains('measurement-modal')) {
                e.target.style.display = 'none';
            }
        }
    });
}

// Logout Handler
function handleLogout() {
    sessionStorage.removeItem('loggedInStudent');
    currentStudent = null;
    stopDeviceMonitoring();
    document.getElementById('logoutModal').style.display = 'none';
    window.location.href = 'index.html';
}

// Show Main Content
function showMainContent() {
    if (!currentStudent) return;

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
    document.getElementById('statVerticalJump').textContent = currentStudent.current_vertical_jump ? `${currentStudent.current_vertical_jump} cm` : '--';
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
    stopTimerSound();
    document.getElementById('cancelConfirmationModal').style.display = 'flex';
}

function confirmCancelMeasurement() {
    stopTimerSound();
    stopDeviceMonitoring();
    closeAllModals();
    resetMeasurementState();
}

// ========== WEIGHT MEASUREMENT ==========

function startWeightMeasurement() {
    closeAllModals();
    document.getElementById('measuringWeightModal').style.display = 'flex';
    document.getElementById('weightMeasurementStatus').textContent = 'MEASURING WEIGHT...';
    document.getElementById('weightValue').textContent = '--';
    document.getElementById('continueFromWeight').style.display = 'none';
    document.getElementById('weightStatusIndicator').style.display = 'flex';
    
    timerSound = playTimerSound();
    simulateWeightMeasurement();
}

function simulateWeightMeasurement() {
    setTimeout(() => {
        const weight = (Math.random() * 30 + 50).toFixed(1);
        measurementState.weight = parseFloat(weight);
        
        stopTimerSound();
        playSuccessSound();
        
        document.getElementById('weightValue').textContent = weight;
        document.getElementById('weightMeasurementStatus').textContent = 'WEIGHT MEASURED SUCCESSFULLY!';
        document.getElementById('weightStatusIndicator').style.display = 'none';
        document.getElementById('continueFromWeight').style.display = 'block';
    }, 3000);
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
    
    document.getElementById('deviceConnectionTitle').textContent = 'Checking Device...';
    document.getElementById('deviceConnectionMessage').textContent = 'Please wait while we verify the wearable device connection.';
    document.getElementById('deviceConnectionModal').style.display = 'flex';
    
    setTimeout(() => {
        deviceConnected = true;
        showDeviceConnected();
        startDeviceMonitoring();
        
        setTimeout(() => {
            closeAllModals();
            document.getElementById('heightInstructionModal').style.display = 'flex';
        }, 1500);
    }, 2000);
}

// ========== HEIGHT MEASUREMENT ==========

function startHeightMeasurement() {
    if (!deviceConnected) {
        showDeviceDisconnected();
        return;
    }
    
    closeAllModals();
    document.getElementById('measuringHeightModal').style.display = 'flex';
    document.getElementById('heightMeasurementStatus').textContent = 'MEASURING HEIGHT...';
    document.getElementById('heightValue').textContent = '--';
    document.getElementById('continueFromHeight').style.display = 'none';
    document.getElementById('heightStatusIndicator').style.display = 'flex';
    
    timerSound = playTimerSound();
    simulateHeightMeasurement();
}

function simulateHeightMeasurement() {
    setTimeout(() => {
        const height = (Math.random() * 30 + 160).toFixed(0);
        measurementState.height = parseFloat(height);
        
        stopTimerSound();
        playSuccessSound();
        
        document.getElementById('heightValue').textContent = height;
        document.getElementById('heightMeasurementStatus').textContent = 'HEIGHT MEASURED SUCCESSFULLY!';
        document.getElementById('heightStatusIndicator').style.display = 'none';
        document.getElementById('continueFromHeight').style.display = 'block';
    }, 3000);
}

function restartHeightMeasurement() {
    startHeightMeasurement();
}

function continueFromHeight() {
    const heightInMeters = measurementState.height / 100;
    measurementState.bmi = measurementState.weight / (heightInMeters * heightInMeters);
    measurementState.bmiRating = getBMIRating(measurementState.bmi);
    
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
    saveBMIData();
    stopDeviceMonitoring();
    closeAllModals();
    loadStudentProfile();
    showSuccess('BMI measurement saved successfully!');
}

// ========== STANDING REACH MEASUREMENT ==========

function startStandingReachMeasurement() {
    if (!deviceConnected) {
        showDeviceDisconnected();
        return;
    }
    
    closeAllModals();
    document.getElementById('measuringStandingReachModal').style.display = 'flex';
    document.getElementById('standingReachMeasurementStatus').textContent = 'MEASURING STANDING REACH HEIGHT...';
    document.getElementById('standingReachValue').textContent = '--';
    document.getElementById('continueFromStandingReach').style.display = 'none';
    document.getElementById('standingReachStatusIndicator').style.display = 'flex';
    
    timerSound = playTimerSound();
    simulateStandingReachMeasurement();
}

function simulateStandingReachMeasurement() {
    setTimeout(() => {
        const standingReach = (Math.random() * 50 + 200).toFixed(0);
        measurementState.standingReach = parseFloat(standingReach);
        
        stopTimerSound();
        playSuccessSound();
        
        document.getElementById('standingReachValue').textContent = standingReach;
        document.getElementById('standingReachMeasurementStatus').textContent = 'STANDING REACH MEASURED SUCCESSFULLY!';
        document.getElementById('standingReachStatusIndicator').style.display = 'none';
        document.getElementById('continueFromStandingReach').style.display = 'block';
    }, 3000);
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
    const video = document.getElementById('jumpInstructionVideo');
    if (video) {
        video.pause();
        video.currentTime = 0;
    }
    closeAllModals();
    document.getElementById('getReadyJumpModal').style.display = 'flex';
}

// ========== JUMP EXECUTION ==========

function startJumpCountdown() {
    if (!deviceConnected) {
        showDeviceDisconnected();
        return;
    }
    
    closeAllModals();
    
    speak("Get ready");
    
    document.getElementById('jumpReadyCountdownModal').style.display = 'flex';
    
    let countdownValue = 5;
    const countdownDisplay = document.createElement('div');
    countdownDisplay.style.cssText = 'font-size: 120px; font-weight: 900; color: #fff; text-align: center; margin-top: 30px; text-shadow: 0 4px 20px rgba(0,0,0,0.3);';
    countdownDisplay.textContent = countdownValue;
    document.querySelector('#jumpReadyCountdownModal .measurement-body').appendChild(countdownDisplay);
    
    const countdownInterval = setInterval(() => {
        countdownValue--;
        if (countdownValue === 0) {
            countdownDisplay.textContent = 'JUMP!';
            countdownDisplay.style.color = '#ff6b35';
        } else {
            countdownDisplay.textContent = countdownValue;
        }
        if (countdownValue <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
    
    setTimeout(() => {
        timerSound = playTimerSound();
    }, 1000);
    
    setTimeout(() => {
        stopTimerSound();
        countdownDisplay.remove();
        speak("Jump!");
        
        closeAllModals();
        document.getElementById('jumpNowModal').style.display = 'flex';
        document.getElementById('jumpStatusIndicator').style.display = 'flex';
        
        simulateJumpMeasurement();
        
        setTimeout(() => {
            playSuccessSound();
            closeAllModals();
            displayJumpResult();
        }, 3000);
    }, 5000);
}

function simulateJumpMeasurement() {
    const jumpHeight = (Math.random() * 40 + 30).toFixed(0);
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
    saveBMIData();
    saveJumpData();
    stopDeviceMonitoring();
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
    displayRecommendations();
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

    const reversedHistory = [...history].reverse();

    tableBody.innerHTML = reversedHistory.map(entry => `
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

    const reversedHistory = [...history].reverse();

    tableBody.innerHTML = reversedHistory.map(entry => `
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

function generateRecommendations(student) {
    const gender = student.gender;
    const jumpHeight = student.current_vertical_jump || student.current_jump_height || 0;
    
    let rating = student.current_jump_rating;
    
    if (!rating) {
        rating = getJumpRating(jumpHeight, gender);
    }
    
    const recommendations = {
        'Excellent': {
            training_focus: 'Maintain current explosive strength and refine jump mechanics for efficiency.',
            plyometric: 'Depth jumps, bounding, single-leg hops, and contrast training.',
            recovery: 'Cold immersion, active recovery sessions, and proper sleep optimization.',
            remarks: 'Continue monitoring fatigue levels and include mobility drills to prevent overtraining.'
        },
        'Good': {
            training_focus: 'Enhance maximum power output and reactive strength.',
            plyometric: 'Box jumps, tuck jumps, squat jumps, and medicine ball throws.',
            recovery: 'Dynamic stretching, foam rolling, and light jogging post-training.',
            remarks: 'Gradually increase jump intensity and track weekly improvements.'
        },
        'Average': {
            training_focus: 'Build foundational leg strength and coordination.',
            plyometric: 'Jump squats, skipping, lateral bounds, and step jumps.',
            recovery: 'Proper nutrition, 48-hour recovery between plyometric sessions, and moderate stretching.',
            remarks: 'Combine strength training (e.g., squats, lunges) with plyometric drills for better results.'
        },
        'Below Average': {
            training_focus: 'Improve lower-body strength and stability.',
            plyometric: 'Low box jumps, ankle hops, wall sits, and assisted jump training.',
            recovery: 'Massage, low-impact cycling, and hydration emphasis.',
            remarks: 'Focus on form before intensity; integrate progressive overload gradually.'
        },
        'Poor': {
            training_focus: 'Develop basic strength and neuromuscular coordination.',
            plyometric: 'Step-ups, mini-squat jumps, seated leg extensions, and resistance band work.',
            recovery: 'Gentle stretching, walking, and adequate sleep (7-9 hours).',
            remarks: 'Start with strength-building and mobility routines before introducing explosive training.'
        }
    };
    
    return recommendations[rating] || recommendations['Average'];
}

function displayRecommendations() {
    if (!currentStudent || !currentStudent.current_vertical_jump) {
        const content = document.getElementById('recommendationsContent');
        if (content) {
            content.innerHTML = '<p style="text-align: center; color: #64748b; padding: 20px;">No jump data available. Please complete a jump measurement first.</p>';
        }
        return;
    }

    const jumpHeight = currentStudent.current_vertical_jump || currentStudent.current_jump_height || 0;
    const rating = currentStudent.current_jump_rating || 'N/A';
    
    const recommendations = generateRecommendations(currentStudent);
    
    const content = document.getElementById('recommendationsContent');
    if (content) {
        content.innerHTML = `
            <div class="recommendation-item-inline recommendation-performance-level">
                <div class="recommendation-item-header">
                    <span class="recommendation-item-title">CURRENT PERFORMANCE LEVEL</span>
                </div>
                <p class="recommendation-item-content">${rating} (Jump Height: ${jumpHeight} cm)</p>
            </div>
            
            <div class="recommendation-item-inline">
                <div class="recommendation-item-header">
                    <svg class="recommendation-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    <h4 class="recommendation-item-title">TRAINING FOCUS</h4>
                </div>
                <p class="recommendation-item-content">${recommendations.training_focus}</p>
            </div>
            
            <div class="recommendation-item-inline">
                <div class="recommendation-item-header">
                    <svg class="recommendation-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <h4 class="recommendation-item-title">PLYOMETRIC EXERCISES</h4>
                </div>
                <p class="recommendation-item-content">${recommendations.plyometric}</p>
            </div>
            
            <div class="recommendation-item-inline">
                <div class="recommendation-item-header">
                    <svg class="recommendation-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <h4 class="recommendation-item-title">RECOVERY METHODS</h4>
                </div>
                <p class="recommendation-item-content">${recommendations.recovery}</p>
            </div>
            
            <div class="recommendation-note-inline">
                <p><strong>Additional Remarks:</strong> ${recommendations.remarks}</p>
            </div>
        `;
    }
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
        if (verticalJump >= 73.7) return 'Excellent';
        if (verticalJump >= 63.5) return 'Good';
        if (verticalJump >= 53.3) return 'Average';
        if (verticalJump >= 40.6) return 'Below Average';
        return 'Poor';
    } else {
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