// Student Portal JavaScript with Raspberry Pi Integration
// Handles measurement flow with real-time sensor data
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

// Raspberry Pi Configuration
const RASPI_API_URL = 'http://192.168.254.103:5000/uwb';
let sensorDataInterval = null;
let latestSensorData = null;

// Measurement state management
let measurementState = {
    weight: null,
    height: null,
    standingReach: null,
    jumpReach: null,
    bmi: null,
    bmiRating: null,
    jumpHeight: null,
    jumpRating: null,
    measurementDate: null
};

// Jump measurement tracking
let jumpMeasurementActive = false;
let jumpPeakHeight = 0;

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

// ========== RASPBERRY PI SENSOR DATA FETCHING ==========

async function fetchSensorData() {
    try {
        const response = await fetch(RASPI_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        latestSensorData = data;
        return data;
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        // If sensor fetch fails, check device connection
        if (deviceConnected) {
            handleDeviceDisconnected();
        }
        return null;
    }
}

function startSensorDataPolling() {
    // Poll sensor data every 100ms for real-time updates
    if (!sensorDataInterval) {
        sensorDataInterval = setInterval(async () => {
            await fetchSensorData();
        }, 100);
    }
}

function stopSensorDataPolling() {
    if (sensorDataInterval) {
        clearInterval(sensorDataInterval);
        sensorDataInterval = null;
    }
}

// ========== SOUND FUNCTIONS ==========

// Play timer/measuring sound
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

// Play success ping sound
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

// ========== DEVICE CONNECTION MANAGEMENT ==========

function startDeviceMonitoring() {
    deviceCheckInterval = setInterval(async () => {
        await checkDeviceConnection();
    }, 5000);
}

function stopDeviceMonitoring() {
    if (deviceCheckInterval) {
        clearInterval(deviceCheckInterval);
        deviceCheckInterval = null;
    }
}

async function checkDeviceConnection() {
    const data = await fetchSensorData();
    const isConnected = data !== null;
    
    if (deviceConnected && !isConnected) {
        deviceConnected = false;
        handleDeviceDisconnected();
    } else if (!deviceConnected && isConnected) {
        deviceConnected = true;
    }
}

function handleDeviceDisconnected() {
    stopTimerSound();
    stopSensorDataPolling();
    showDeviceDisconnected();
}

function showDeviceConnected() {
    document.getElementById('deviceConnectionTitle').textContent = 'Device Ready';
    document.getElementById('deviceConnectionMessage').textContent = 'Raspberry Pi sensor system is connected and ready to use.';
    document.getElementById('deviceConnectionModal').style.display = 'flex';
    playSuccessSound();
}

function showDeviceDisconnected() {
    document.getElementById('deviceDisconnectedTitle').textContent = 'Device Disconnected!';
    document.getElementById('deviceDisconnectedMessage').textContent = 'The Raspberry Pi sensor has been disconnected. Please reconnect to continue.';
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

    // History buttons
    document.getElementById('viewBmiHistory')?.addEventListener('click', openBmiHistory);
    document.getElementById('closeBmiHistoryBtn')?.addEventListener('click', () => {
        document.getElementById('bmiHistoryModal').style.display = 'none';
    });
    document.getElementById('viewJumpHistory')?.addEventListener('click', openJumpHistory);
    document.getElementById('closeJumpHistoryBtn')?.addEventListener('click', () => {
        document.getElementById('jumpHistoryModal').style.display = 'none';
    });

    // Start measurement flow
    document.getElementById('startButton')?.addEventListener('click', startMeasurementFlow);

    // Weight measurement
    document.getElementById('cancelWeightMeasurement')?.addEventListener('click', showCancelConfirmation);
    document.getElementById('startWeightMeasurement')?.addEventListener('click', startWeightMeasurement);
    document.getElementById('restartWeightMeasurement')?.addEventListener('click', restartWeightMeasurement);
    document.getElementById('continueFromWeight')?.addEventListener('click', continueFromWeight);

    // Wearable device
    document.getElementById('continueFromWearable')?.addEventListener('click', continueFromWearable);

    // Height measurement
    document.getElementById('startHeightMeasurement')?.addEventListener('click', startHeightMeasurement);
    document.getElementById('restartHeightMeasurement')?.addEventListener('click', restartHeightMeasurement);
    document.getElementById('continueFromHeight')?.addEventListener('click', continueFromHeight);

    // BMI result
    document.getElementById('proceedToJump')?.addEventListener('click', proceedToJumpMeasurement);
    document.getElementById('skipJump')?.addEventListener('click', skipJumpMeasurement);

    // Standing reach
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
    document.getElementById('confirmCancel')?.addEventListener('click', cancelMeasurement);
}

function handleLogout() {
    stopDeviceMonitoring();
    stopSensorDataPolling();
    sessionStorage.removeItem('loggedInStudent');
    window.location.href = 'index.html';
}

function showMainContent() {
    loadStudentProfile();
}

function loadStudentProfile() {
    if (!currentStudent) return;

    // Update profile information
    document.getElementById('profileName').textContent = currentStudent.name;
    document.getElementById('profileUserId').textContent = currentStudent.user_id;
    document.getElementById('profileCoach').textContent = currentStudent.coach_name || '--';
    document.getElementById('profileSport').textContent = currentStudent.sport || '--';
    document.getElementById('profileGender').textContent = currentStudent.gender || '--';
    document.getElementById('profileCollege').textContent = currentStudent.college || '--';
    document.getElementById('profileCourse').textContent = currentStudent.course || '--';
    document.getElementById('profileYear').textContent = currentStudent.year || '--';
    document.getElementById('profileSection').textContent = currentStudent.section || '--';

    // Update BMI statistics
    if (currentStudent.current_height) {
        document.getElementById('statHeight').textContent = `${currentStudent.current_height} cm`;
    }
    if (currentStudent.current_weight) {
        document.getElementById('statWeight').textContent = `${currentStudent.current_weight} kg`;
    }
    if (currentStudent.current_bmi) {
        document.getElementById('statBMI').textContent = currentStudent.current_bmi.toFixed(1);
    }
    if (currentStudent.current_bmi_rating) {
        document.getElementById('statBMIRating').textContent = currentStudent.current_bmi_rating;
    }
    if (currentStudent.bmi_last_updated) {
        document.getElementById('bmiUpdateDate').textContent = formatDate(currentStudent.bmi_last_updated);
    }

    // Update Jump statistics
    if (currentStudent.current_standing_reach) {
        document.getElementById('statStandingReach').textContent = `${currentStudent.current_standing_reach} cm`;
    }
    if (currentStudent.current_jump_reach) {
        document.getElementById('statJumpReach').textContent = `${currentStudent.current_jump_reach} cm`;
    }
    if (currentStudent.current_vertical_jump) {
        document.getElementById('statVerticalJump').textContent = `${currentStudent.current_vertical_jump} cm`;
    }
    if (currentStudent.current_jump_rating) {
        document.getElementById('statJumpRating').textContent = currentStudent.current_jump_rating;
    }
    if (currentStudent.jump_last_updated) {
        document.getElementById('jumpUpdateDate').textContent = formatDate(currentStudent.jump_last_updated);
    }
}

// ========== MEASUREMENT FLOW ==========

function startMeasurementFlow() {
    measurementState.measurementDate = getCurrentDate();
    closeAllModals();
    document.getElementById('weightMeasurementModal').style.display = 'flex';
}

function showCancelConfirmation() {
    document.getElementById('cancelConfirmationModal').style.display = 'flex';
}

function cancelMeasurement() {
    closeAllModals();
    stopDeviceMonitoring();
    stopSensorDataPolling();
    loadStudentProfile();
}

// ========== WEIGHT MEASUREMENT WITH RASPI ==========

function startWeightMeasurement() {
    closeAllModals();
    document.getElementById('measuringWeightModal').style.display = 'flex';
    document.getElementById('weightMeasurementStatus').textContent = 'MEASURING WEIGHT...';
    document.getElementById('weightValue').textContent = '--';
    document.getElementById('continueFromWeight').style.display = 'none';
    document.getElementById('weightStatusIndicator').style.display = 'flex';
    
    timerSound = playTimerSound();
    startSensorDataPolling();
    measureWeightFromSensor();
}

async function measureWeightFromSensor() {
    let samples = [];
    const sampleCount = 30; // Collect 30 samples over 3 seconds
    
    const sampleInterval = setInterval(async () => {
        if (latestSensorData && latestSensorData.weight !== undefined) {
            const weight = latestSensorData.weight;
            samples.push(weight);
            
            // Display real-time weight
            document.getElementById('weightValue').textContent = weight.toFixed(1);
            
            if (samples.length >= sampleCount) {
                clearInterval(sampleInterval);
                
                // Calculate average weight
                const avgWeight = samples.reduce((a, b) => a + b, 0) / samples.length;
                measurementState.weight = parseFloat(avgWeight.toFixed(1));
                
                stopTimerSound();
                playSuccessSound();
                
                document.getElementById('weightValue').textContent = measurementState.weight.toFixed(1);
                document.getElementById('weightMeasurementStatus').textContent = 'WEIGHT MEASURED SUCCESSFULLY!';
                document.getElementById('weightStatusIndicator').style.display = 'none';
                document.getElementById('continueFromWeight').style.display = 'block';
            }
        }
    }, 100);
}

function restartWeightMeasurement() {
    startWeightMeasurement();
}

function continueFromWeight() {
    closeAllModals();
    document.getElementById('wearableDeviceModal').style.display = 'flex';
}

// ========== WEARABLE DEVICE ==========

async function continueFromWearable() {
    closeAllModals();
    
    document.getElementById('deviceConnectionTitle').textContent = 'Checking Device...';
    document.getElementById('deviceConnectionMessage').textContent = 'Please wait while we verify the sensor connection.';
    document.getElementById('deviceConnectionModal').style.display = 'flex';
    
    // Check if we can fetch sensor data
    const data = await fetchSensorData();
    
    setTimeout(() => {
        if (data !== null) {
            deviceConnected = true;
            showDeviceConnected();
            startDeviceMonitoring();
            
            setTimeout(() => {
                closeAllModals();
                document.getElementById('heightInstructionModal').style.display = 'flex';
            }, 1500);
        } else {
            deviceConnected = false;
            showDeviceDisconnected();
        }
    }, 2000);
}

// ========== HEIGHT MEASUREMENT WITH RASPI ==========

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
    measureHeightFromSensor();
}

async function measureHeightFromSensor() {
    let samples = [];
    const sampleCount = 30; // Collect 30 samples over 3 seconds
    
    const sampleInterval = setInterval(async () => {
        if (latestSensorData && latestSensorData.z !== undefined) {
            const heightMeters = latestSensorData.z;
            const heightCm = heightMeters * 100; // Convert meters to cm
            samples.push(heightCm);
            
            // Display real-time height
            document.getElementById('heightValue').textContent = heightCm.toFixed(0);
            
            if (samples.length >= sampleCount) {
                clearInterval(sampleInterval);
                
                // Calculate average height
                const avgHeight = samples.reduce((a, b) => a + b, 0) / samples.length;
                measurementState.height = parseFloat(avgHeight.toFixed(0));
                
                stopTimerSound();
                playSuccessSound();
                
                document.getElementById('heightValue').textContent = measurementState.height.toFixed(0);
                document.getElementById('heightMeasurementStatus').textContent = 'HEIGHT MEASURED SUCCESSFULLY!';
                document.getElementById('heightStatusIndicator').style.display = 'none';
                document.getElementById('continueFromHeight').style.display = 'block';
            }
        }
    }, 100);
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
    
    const bmiResultDate = document.getElementById('bmiResultDate');
    if (bmiResultDate) {
        bmiResultDate.textContent = formatDateLong(measurementState.measurementDate);
    }
    
    document.getElementById('bmiResultModal').style.display = 'flex';
}

function proceedToJumpMeasurement() {
    closeAllModals();
    document.getElementById('standingReachInstructionModal').style.display = 'flex';
}

function skipJumpMeasurement() {
    saveBMIData();
    stopDeviceMonitoring();
    stopSensorDataPolling();
    closeAllModals();
    loadStudentProfile();
    showSuccess('BMI measurement saved successfully!');
}

// ========== STANDING REACH MEASUREMENT WITH RASPI ==========

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
    measureStandingReachFromSensor();
}

async function measureStandingReachFromSensor() {
    let samples = [];
    const sampleCount = 30; // Collect 30 samples over 3 seconds
    
    const sampleInterval = setInterval(async () => {
        if (latestSensorData && latestSensorData.z !== undefined) {
            const reachMeters = latestSensorData.z;
            const reachCm = reachMeters * 100; // Convert meters to cm
            samples.push(reachCm);
            
            // Display real-time standing reach
            document.getElementById('standingReachValue').textContent = reachCm.toFixed(0);
            
            if (samples.length >= sampleCount) {
                clearInterval(sampleInterval);
                
                // Calculate average standing reach
                const avgReach = samples.reduce((a, b) => a + b, 0) / samples.length;
                measurementState.standingReach = parseFloat(avgReach.toFixed(0));
                
                stopTimerSound();
                playSuccessSound();
                
                document.getElementById('standingReachValue').textContent = measurementState.standingReach.toFixed(0);
                document.getElementById('standingReachMeasurementStatus').textContent = 'STANDING REACH MEASURED SUCCESSFULLY!';
                document.getElementById('standingReachStatusIndicator').style.display = 'none';
                document.getElementById('continueFromStandingReach').style.display = 'block';
            }
        }
    }, 100);
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

// ========== JUMP EXECUTION WITH RASPI ==========

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
            countdownDisplay.textContent = '';
            countdownDisplay.style.color = 'rgba(255, 107, 53, 0)';
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
        
        measureJumpFromSensor();
        
        setTimeout(() => {
            playSuccessSound();
            jumpMeasurementActive = false;
            closeAllModals();
            displayJumpResult();
        }, 3000);
    }, 5000);
}

async function measureJumpFromSensor() {
    jumpMeasurementActive = true;
    jumpPeakHeight = 0;
    
    // Monitor for 3 seconds to capture the peak jump height
    const jumpMonitorInterval = setInterval(() => {
        if (latestSensorData && latestSensorData.z !== undefined && jumpMeasurementActive) {
            const currentHeightMeters = latestSensorData.z;
            const currentHeightCm = currentHeightMeters * 100;
            
            // Track maximum height during jump
            if (currentHeightCm > jumpPeakHeight) {
                jumpPeakHeight = currentHeightCm;
            }
        }
    }, 50); // Check every 50ms for peak detection
    
    // After 3 seconds, stop monitoring and calculate jump height
    setTimeout(() => {
        clearInterval(jumpMonitorInterval);
        
        // Calculate vertical jump height
        measurementState.jumpReach = jumpPeakHeight;
        measurementState.jumpHeight = measurementState.jumpReach - measurementState.standingReach;
        measurementState.jumpRating = getJumpRating(measurementState.jumpHeight, currentStudent.gender);
    }, 3000);
}

// ========== JUMP RESULT ==========

function displayJumpResult() {
    document.getElementById('jumpResultStandingReach').textContent = measurementState.standingReach.toFixed(0);
    document.getElementById('jumpResultJumpReach').textContent = measurementState.jumpReach.toFixed(0);
    document.getElementById('jumpResultHeight').textContent = measurementState.jumpHeight.toFixed(0);
    document.getElementById('jumpResultRating').textContent = measurementState.jumpRating;
    
    const jumpResultDate = document.getElementById('jumpResultDate');
    if (jumpResultDate) {
        jumpResultDate.textContent = formatDateLong(measurementState.measurementDate);
    }
    
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
    stopSensorDataPolling();
    closeAllModals();
    loadStudentProfile();
    showSuccess('All measurements saved successfully!');
}

// ========== DATA SAVING ==========

function saveBMIData() {
    const newEntry = {
        date: measurementState.measurementDate,
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
    currentStudent.bmi_last_updated = measurementState.measurementDate;

    DataStore.updateStudent(currentStudent);
}

function saveJumpData() {
    const newEntry = {
        date: measurementState.measurementDate,
        standing_reach: measurementState.standingReach,
        jump_reach: measurementState.jumpReach,
        vertical_jump: measurementState.jumpHeight,
        rating: measurementState.jumpRating
    };

    if (!currentStudent.jump_history) {
        currentStudent.jump_history = [];
    }

    currentStudent.jump_history.push(newEntry);
    currentStudent.current_standing_reach = measurementState.standingReach;
    currentStudent.current_jump_reach = measurementState.jumpReach;
    currentStudent.current_vertical_jump = measurementState.jumpHeight;
    currentStudent.current_jump_height = measurementState.jumpHeight;
    currentStudent.current_jump_rating = measurementState.jumpRating;
    currentStudent.jump_last_updated = measurementState.measurementDate;

    DataStore.updateStudent(currentStudent);
}

// ========== HISTORY MODALS ==========

function openBmiHistory() {
    document.getElementById('bmiHistoryModal').style.display = 'flex';
    displayBMIHistory();
}

function openJumpHistory() {
    document.getElementById('jumpHistoryModal').style.display = 'flex';
    displayJumpHistory();
    displayRecommendations();
}

function displayBMIHistory() {
    const tbody = document.getElementById('bmiHistoryTableModal');
    
    if (!currentStudent.bmi_history || currentStudent.bmi_history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No history available</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    currentStudent.bmi_history.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(entry.date)}</td>
            <td>${entry.height.toFixed(0)} cm</td>
            <td>${entry.weight.toFixed(1)} kg</td>
            <td>${entry.bmi.toFixed(1)}</td>
            <td><span class="rating-badge">${entry.rating}</span></td>
        `;
        tbody.appendChild(row);
    });

    renderBMIChart();
}

function displayJumpHistory() {
    const tbody = document.getElementById('jumpHistoryTableModal');
    
    if (!currentStudent.jump_history || currentStudent.jump_history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No history available</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    currentStudent.jump_history.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(entry.date)}</td>
            <td>${entry.standing_reach.toFixed(0)} cm</td>
            <td>${entry.jump_reach.toFixed(0)} cm</td>
            <td>${entry.vertical_jump.toFixed(0)} cm</td>
            <td><span class="rating-badge">${entry.rating}</span></td>
        `;
        tbody.appendChild(row);
    });

    renderJumpChart();
}

function renderBMIChart() {
    const canvas = document.getElementById('bmiChartModal');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    if (bmiChartModal) {
        bmiChartModal.destroy();
    }

    if (!currentStudent.bmi_history || currentStudent.bmi_history.length === 0) {
        return;
    }

    const labels = currentStudent.bmi_history.map(entry => formatDate(entry.date));
    const bmiData = currentStudent.bmi_history.map(entry => entry.bmi);
    const weightData = currentStudent.bmi_history.map(entry => entry.weight);

    bmiChartModal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'BMI',
                    data: bmiData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Weight (kg)',
                    data: weightData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'BMI and Weight Trend Over Time',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'BMI'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Weight (kg)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

function renderJumpChart() {
    const canvas = document.getElementById('jumpChartModal');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    if (jumpChartModal) {
        jumpChartModal.destroy();
    }

    if (!currentStudent.jump_history || currentStudent.jump_history.length === 0) {
        return;
    }

    const labels = currentStudent.jump_history.map(entry => formatDate(entry.date));
    const verticalJumpData = currentStudent.jump_history.map(entry => entry.vertical_jump);
    const standingReachData = currentStudent.jump_history.map(entry => entry.standing_reach);
    const jumpReachData = currentStudent.jump_history.map(entry => entry.jump_reach);

    jumpChartModal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Vertical Jump (cm)',
                    data: verticalJumpData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Standing Reach (cm)',
                    data: standingReachData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Jump Reach (cm)',
                    data: jumpReachData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
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

function formatDateLong(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
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
