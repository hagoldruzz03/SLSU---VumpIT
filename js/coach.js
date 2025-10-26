// Coach Portal JavaScript - ENHANCED WITH DYNAMIC RECOMMENDATIONS
// Authentication handled by unified login system (index.html)

let currentCoach = null;
let currentPage = 'home';
let currentClassId = null;
let currentStudentId = null;
let pageHistory = ['home'];
let bmiChart = null;
let jumpChart = null;
let pendingDeleteAction = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    setupEventListeners();
});

// Check if coach is logged in (from unified login system)
function checkLoginStatus() {
    const loggedInCoach = sessionStorage.getItem('loggedInCoach');
    
    if (!loggedInCoach) {
        // No session found, redirect to login
        window.location.href = 'index.html';
        return;
    }
    
    try {
        currentCoach = JSON.parse(loggedInCoach);
        
        // Verify it's actually a coach account
        if (!currentCoach || currentCoach.user_type !== 'coach') {
            sessionStorage.removeItem('loggedInCoach');
            window.location.href = 'index.html';
            return;
        }
        
        // Show dashboard
        showDashboard();
    } catch (error) {
        console.error('Error parsing coach session:', error);
        sessionStorage.removeItem('loggedInCoach');
        window.location.href = 'index.html';
    }
}

// Show dashboard
function showDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
    }
    
    loadCoachData();
    navigateToPage('home');
}

// Notification System
function showSuccessNotification(title, message) {
    const modal = document.getElementById('successModal');
    const titleEl = document.getElementById('successTitle');
    const messageEl = document.getElementById('successMessage');
    
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    if (modal) modal.classList.add('active');
}

function showErrorNotification(title, message) {
    const modal = document.getElementById('errorModal');
    const titleEl = document.getElementById('errorTitle');
    const messageEl = document.getElementById('errorMessage');
    
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    if (modal) modal.classList.add('active');
}

function showConfirmNotification(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    if (modal) modal.classList.add('active');
    
    pendingDeleteAction = onConfirm;
}

function hideNotification(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// Generate Training Recommendations Based on Jump Stats
function generateRecommendations(student) {
    const gender = student.gender;
    const jumpHeight = student.current_vertical_jump || student.current_jump_height || 0;
    
    // Get the most recent jump rating or calculate it
    let rating = student.current_jump_rating;
    
    // If no rating, calculate based on jump height and gender
    if (!rating) {
        if (gender === 'Male') {
            if (jumpHeight >= 73.7) rating = 'Excellent';
            else if (jumpHeight >= 63.5) rating = 'Good';
            else if (jumpHeight >= 53.3) rating = 'Average';
            else if (jumpHeight >= 40.6) rating = 'Below Average';
            else rating = 'Poor';
        } else { // Female
            if (jumpHeight >= 63.5) rating = 'Excellent';
            else if (jumpHeight >= 50.8) rating = 'Good';
            else if (jumpHeight >= 33.0) rating = 'Average';
            else if (jumpHeight >= 17.8) rating = 'Below Average';
            else rating = 'Poor';
        }
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
            recovery: 'Gentle stretching, walking, and adequate sleep (7–9 hours).',
            remarks: 'Start with strength-building and mobility routines before introducing explosive training.'
        }
    };
    
    return recommendations[rating] || recommendations['Average'];
}

// Setup event listeners
function setupEventListeners() {
    // Logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', showLogoutModal);
    }
    
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', hideLogoutModal);
    }
    
    const closeLogoutModalBtn = document.getElementById('closeLogoutModalBtn');
    if (closeLogoutModalBtn) {
        closeLogoutModalBtn.addEventListener('click', hideLogoutModal);
    }
    
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', handleLogout);
    }
    
    // Notification modals
    const successOkBtn = document.getElementById('successOkBtn');
    if (successOkBtn) {
        successOkBtn.addEventListener('click', () => hideNotification('successModal'));
    }
    
    const errorOkBtn = document.getElementById('errorOkBtn');
    if (errorOkBtn) {
        errorOkBtn.addEventListener('click', () => hideNotification('errorModal'));
    }
    
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', () => {
            hideNotification('confirmModal');
            pendingDeleteAction = null;
        });
    }
    
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', () => {
            hideNotification('confirmModal');
            if (pendingDeleteAction) {
                pendingDeleteAction();
                pendingDeleteAction = null;
            }
        });
    }
    
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            goBack();
        });
    }
    
    // Profile edit button
    const profileEditBtn = document.getElementById('profileEditBtn');
    if (profileEditBtn) {
        profileEditBtn.addEventListener('click', function() {
            if (currentStudentId) {
                editStudent(currentStudentId);
            }
        });
    }
    
    // Page navigation - using stat cards
    document.querySelectorAll('.stat-card-clickable').forEach(card => {
        card.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });
    
    // Add athlete button
    const addAthleteBtn = document.getElementById('addAthleteBtn');
    if (addAthleteBtn) {
        addAthleteBtn.addEventListener('click', function() {
            openStudentModal(null, 'athlete');
        });
    }
    
    // Add class student button
    const addClassStudentBtn = document.getElementById('addClassStudentBtn');
    if (addClassStudentBtn) {
        addClassStudentBtn.addEventListener('click', function() {
            openStudentModal(null, 'class');
        });
    }
    
    // Class form
    const classForm = document.getElementById('classForm');
    if (classForm) {
        classForm.addEventListener('submit', handleClassSubmit);
    }
    
    // Student form
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', handleStudentSubmit);
    }
    
    // Search functionality
    const classSearch = document.getElementById('classSearch');
    if (classSearch) {
        classSearch.addEventListener('input', function() {
            filterClasses(this.value);
        });
    }
    
    const athleteSearch = document.getElementById('athleteSearch');
    if (athleteSearch) {
        athleteSearch.addEventListener('input', function() {
            filterAthletes(this.value);
        });
    }
    
    const studentSearch = document.getElementById('studentSearch');
    if (studentSearch) {
        studentSearch.addEventListener('input', function() {
            filterStudents(this.value);
        });
    }
    
    const classStudentSearch = document.getElementById('classStudentSearch');
    if (classStudentSearch) {
        classStudentSearch.addEventListener('input', function() {
            filterClassStudents(this.value);
        });
    }
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                closeModal(modalId);
            }
        });
    });
    
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-close');
            if (modalId) {
                closeModal(modalId);
            }
        });
    });
    
    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Show logout confirmation modal
function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Hide logout confirmation modal
function hideLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Handle logout
function handleLogout() {
    currentCoach = null;
    sessionStorage.removeItem('loggedInCoach');
    hideLogoutModal();
    window.location.href = 'index.html';
}

// Go back to previous page
function goBack() {
    if (pageHistory.length > 1) {
        pageHistory.pop();
        const previousPage = pageHistory[pageHistory.length - 1];
        navigateToPage(previousPage, false);
    } else {
        navigateToPage('home');
    }
}

// Navigate to page
function navigateToPage(pageName, addToHistory = true) {
    currentPage = pageName;
    
    if (addToHistory) {
        if (pageHistory[pageHistory.length - 1] !== pageName) {
            pageHistory.push(pageName);
        }
    }
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Show/hide back and logout buttons
    const backBtn = document.getElementById('backBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (pageName === 'home') {
        if (backBtn) backBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'flex';
    } else {
        if (backBtn) backBtn.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
    
    // Load data when navigating to specific pages
    if (pageName === 'classes') {
        loadClasses();
    } else if (pageName === 'athletes') {
        loadAthletes();
    } else if (pageName === 'all-students') {
        loadAllStudents();
    } else if (pageName === 'classDetails') {
        loadClassStudents();
    } else if (pageName === 'studentProfile') {
        loadStudentProfile();
    }
}

// Load coach data
function loadCoachData() {
    if (!currentCoach) return;
    
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
        welcomeTitle.textContent = `Welcome, COACH ${currentCoach.coach_name.toUpperCase()}!`;
    }
    
    const classes = DataStore.getClassesByCoach(currentCoach.coach_id);
    const allStudents = DataStore.getAllStudents();
    const coachStudents = allStudents.filter(student => student.coach_id === currentCoach.coach_id);
    const athletes = coachStudents.filter(s => s.user_type === 'athlete');
    
    // Update Assigned Sport from database
    const assignedSportEl = document.getElementById('assignedSport');
    if (assignedSportEl) {
        assignedSportEl.textContent = currentCoach.sport || 'N/A';
    }
    
    const classCountEl = document.getElementById('classCount');
    if (classCountEl) {
        classCountEl.textContent = classes.length;
    }
    
    const totalAthletesEl = document.getElementById('totalAthletes');
    if (totalAthletesEl) {
        totalAthletesEl.textContent = athletes.length;
    }
    
    const totalStudentsEl = document.getElementById('totalStudents');
    if (totalStudentsEl) {
        totalStudentsEl.textContent = coachStudents.length;
    }
}

// Load classes
function loadClasses() {
    if (!currentCoach) return;
    
    const classes = DataStore.getClassesByCoach(currentCoach.coach_id);
    const container = document.getElementById('classesGrid');
    
    if (!container) return;
    
    const addClassCard = `
        <div class="add-class-card" onclick="openClassModal()">
            <h3>Add a New Class <span style="font-size: 40px;">+</span></h3>
            <p>Click here to add a new class</p>
            <button class="btn-add-class">Add Class</button>
        </div>
    `;
    
    if (classes.length === 0) {
        container.innerHTML = addClassCard;
        return;
    }
    
    const classCards = classes.map(cls => {
        const studentsInClass = DataStore.getAllStudents().filter(s => 
            s.user_college === cls.user_college &&
            s.course === cls.course &&
            s.year === cls.year &&
            s.section === cls.section
        );
        
        return `
            <div class="class-card">
                <div class="class-card-header-green">
                    <h3 class="class-card-title">${cls.class_name}</h3>
                    <div class="class-card-actions">
                        <button onclick="deleteClass('${cls.class_id}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                        <button onclick="editClass('${cls.class_id}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="class-card-body">
                    <div class="class-card-info">
                        <p><strong>College:</strong> ${cls.user_college}</p>
                        <p><strong>Course:</strong> ${cls.course}</p>
                        <p><strong>Year Level:</strong> ${cls.year}</p>
                        <p><strong>Section:</strong> ${cls.section}</p>
                        <p><strong>Students:</strong> ${studentsInClass.length}</p>
                    </div>
                </div>
                <div class="class-card-footer">
                    <button class="btn-open" onclick="openClassDetails('${cls.class_id}')">Open</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = addClassCard + classCards;
}

// Filter classes
function filterClasses(query) {
    if (!currentCoach) return;
    
    const classes = DataStore.getClassesByCoach(currentCoach.coach_id);
    const filtered = classes.filter(cls => 
        cls.class_name.toLowerCase().includes(query.toLowerCase()) ||
        cls.user_college.toLowerCase().includes(query.toLowerCase()) ||
        cls.course.toLowerCase().includes(query.toLowerCase()) ||
        cls.year.toLowerCase().includes(query.toLowerCase()) ||
        cls.section.toLowerCase().includes(query.toLowerCase())
    );
    
    const container = document.getElementById('classesGrid');
    if (!container) return;
    
    const addClassCard = `
        <div class="add-class-card" onclick="openClassModal()">
            <h3>Add a New Class <span style="font-size: 40px;">+</span></h3>
            <p>Click here to add a new class</p>
            <button class="btn-add-class">Add Class</button>
        </div>
    `;
    
    const classCards = filtered.map(cls => {
        const studentsInClass = DataStore.getAllStudents().filter(s => 
            s.user_college === cls.user_college &&
            s.course === cls.course &&
            s.year === cls.year &&
            s.section === cls.section
        );
        
        return `
            <div class="class-card">
                <div class="class-card-header-green">
                    <h3 class="class-card-title">${cls.class_name}</h3>
                    <div class="class-card-actions">
                        <button onclick="deleteClass('${cls.class_id}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                        <button onclick="editClass('${cls.class_id}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="class-card-body">
                    <div class="class-card-info">
                        <p><strong>College:</strong> ${cls.user_college}</p>
                        <p><strong>Course:</strong> ${cls.course}</p>
                        <p><strong>Year Level:</strong> ${cls.year}</p>
                        <p><strong>Section:</strong> ${cls.section}</p>
                        <p><strong>Students:</strong> ${studentsInClass.length}</p>
                    </div>
                </div>
                <div class="class-card-footer">
                    <button class="btn-open" onclick="openClassDetails('${cls.class_id}')">Open</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = addClassCard + classCards;
}

// Open class details
function openClassDetails(classId) {
    if (!classId) return;
    
    currentClassId = classId;
    const cls = DataStore.getClassById(classId);
    
    if (!cls) return;
    
    const titleEl = document.getElementById('classDetailsTitle');
    if (titleEl) {
        titleEl.textContent = cls.class_name;
    }
    
    const subtitleEl = document.getElementById('classDetailsSubtitle');
    if (subtitleEl) {
        subtitleEl.textContent = `${cls.user_college} - ${cls.course} ${cls.year}-${cls.section}`;
    }
    
    navigateToPage('classDetails');
}

// Load class students
function loadClassStudents() {
    if (!currentClassId) return;
    
    const cls = DataStore.getClassById(currentClassId);
    if (!cls) return;
    
    const students = DataStore.getAllStudents().filter(s => 
        s.user_college === cls.user_college &&
        s.course === cls.course &&
        s.year === cls.year &&
        s.section === cls.section
    );
    
    displayStudentsInTable(students, 'classStudentsTableBody');
}

// Filter class students
function filterClassStudents(query) {
    if (!currentClassId) return;
    
    const cls = DataStore.getClassById(currentClassId);
    if (!cls) return;
    
    const students = DataStore.getAllStudents().filter(s => 
        s.user_college === cls.user_college &&
        s.course === cls.course &&
        s.year === cls.year &&
        s.section === cls.section
    );
    
    const filtered = students.filter(s =>
        s.user_id.toLowerCase().includes(query.toLowerCase()) ||
        s.student_name.toLowerCase().includes(query.toLowerCase()) ||
        s.user_type.toLowerCase().includes(query.toLowerCase()) ||
        s.gender.toLowerCase().includes(query.toLowerCase())
    );
    
    displayStudentsInTable(filtered, 'classStudentsTableBody');
}

// Load athletes
function loadAthletes() {
    if (!currentCoach) return;
    
    const students = DataStore.getAllStudents();
    const athletes = students.filter(s => 
        s.user_type === 'athlete' && 
        s.coach_id === currentCoach.coach_id
    );
    
    displayStudentsInTable(athletes, 'athletesTableBody');
}

// Filter athletes
function filterAthletes(query) {
    if (!currentCoach) return;
    
    const students = DataStore.getAllStudents();
    const athletes = students.filter(s => 
        s.user_type === 'athlete' && 
        s.coach_id === currentCoach.coach_id
    );
    
    const filtered = athletes.filter(s =>
        s.user_id.toLowerCase().includes(query.toLowerCase()) ||
        s.student_name.toLowerCase().includes(query.toLowerCase()) ||
        s.user_type.toLowerCase().includes(query.toLowerCase()) ||
        s.gender.toLowerCase().includes(query.toLowerCase())
    );
    
    displayStudentsInTable(filtered, 'athletesTableBody');
}

// Load all students
function loadAllStudents() {
    if (!currentCoach) return;
    
    const allStudents = DataStore.getAllStudents();
    const coachStudents = allStudents.filter(student => student.coach_id === currentCoach.coach_id);
    
    displayStudentsInTable(coachStudents, 'studentsTableBody');
}

// Filter all students
function filterStudents(query) {
    if (!currentCoach) return;
    
    const allStudents = DataStore.getAllStudents();
    const coachStudents = allStudents.filter(student => student.coach_id === currentCoach.coach_id);
    
    const filtered = coachStudents.filter(s =>
        s.user_id.toLowerCase().includes(query.toLowerCase()) ||
        s.student_name.toLowerCase().includes(query.toLowerCase()) ||
        s.user_type.toLowerCase().includes(query.toLowerCase()) ||
        s.gender.toLowerCase().includes(query.toLowerCase())
    );
    
    displayStudentsInTable(filtered, 'studentsTableBody');
}

// Display students in table
function displayStudentsInTable(students, tableBodyId) {
    const tbody = document.getElementById(tableBodyId);
    
    if (!tbody) return;
    
    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">
                    No students found
                </td>
            </tr>
        `;
        return;
    }
    
    const tableHTML = students.map(student => `
        <tr>
            <td>${student.user_id}</td>
            <td>${student.student_name}</td>
            <td>${student.user_type}</td>
            <td>${student.gender}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-view" onclick="viewStudent('${student.user_id}')">View</button>
                    <button class="btn btn-edit" onclick="editStudent('${student.user_id}')">Edit</button>
                    <button class="btn btn-delete" onclick="deleteStudent('${student.user_id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = tableHTML;
}

// View student - Navigate to profile page
function viewStudent(studentId) {
    currentStudentId = studentId;
    navigateToPage('studentProfile');
}

// Load student profile WITH CHARTS AND DYNAMIC RECOMMENDATIONS
function loadStudentProfile() {
    if (!currentStudentId) return;
    
    const student = DataStore.getStudentById(currentStudentId);
    if (!student) return;
    
    // Generate dynamic recommendations based on current jump stats
    const recommendations = generateRecommendations(student);
    
    // Update student object with generated recommendations
    student.training_focus = recommendations.training_focus;
    student.plyometric = recommendations.plyometric;
    student.recovery = recommendations.recovery;
    student.remarks = recommendations.remarks;
    
    // Update header
    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.textContent = student.student_name;
    }
    
    const profileId = document.getElementById('profileId');
    if (profileId) {
        profileId.textContent = `ID: ${student.user_id}`;
    }
    
    const profileTypeBadge = document.getElementById('profileTypeBadge');
    if (profileTypeBadge) {
        profileTypeBadge.textContent = student.user_type.charAt(0).toUpperCase() + student.user_type.slice(1);
    }
    
    const profileGenderBadge = document.getElementById('profileGenderBadge');
    if (profileGenderBadge) {
        profileGenderBadge.textContent = student.gender;
    }
    
    // Basic Information
    const basicInfoContent = document.getElementById('basicInfoContent');
    if (basicInfoContent) {
        basicInfoContent.innerHTML = `
            <div class="profile-info-grid">
                <div class="profile-info-item">
                    <span class="profile-info-label">User ID</span>
                    <span class="profile-info-value">${student.user_id}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">Full Name</span>
                    <span class="profile-info-value">${student.student_name}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">Gender</span>
                    <span class="profile-info-value">${student.gender}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">User Type</span>
                    <span class="profile-info-value">${student.user_type.charAt(0).toUpperCase() + student.user_type.slice(1)}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">Sport</span>
                    <span class="profile-info-value">${student.sport || 'N/A'}</span>
                </div>
            </div>
        `;
    }
    
    // Academic Information
    const academicInfoContent = document.getElementById('academicInfoContent');
    if (academicInfoContent) {
        academicInfoContent.innerHTML = `
            <div class="profile-info-grid">
                <div class="profile-info-item">
                    <span class="profile-info-label">College</span>
                    <span class="profile-info-value">${student.user_college || 'N/A'}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">Course</span>
                    <span class="profile-info-value">${student.course || 'N/A'}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">Year Level</span>
                    <span class="profile-info-value">${student.year || 'N/A'}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">Section</span>
                    <span class="profile-info-value">${student.section || 'N/A'}</span>
                </div>
            </div>
        `;
    }
    
    // Create BMI Chart
    createBMIChart(student);
    
    // Create Jump Chart
    createJumpChart(student);
    
    // Training Recommendations - Now dynamically generated
    const recommendationsContent = document.getElementById('recommendationsContent');
    if (recommendationsContent) {
        const jumpHeight = student.current_vertical_jump || student.current_jump_height || 0;
        const jumpRating = student.current_jump_rating || 'N/A';
        
        recommendationsContent.innerHTML = `
            <div class="profile-recommendations">
                <div class="profile-recommendation-item" style="background: linear-gradient(135deg, rgba(0, 217, 142, 0.1) 0%, rgba(0, 180, 119, 0.05) 100%); border-left: 4px solid #00d98e;">
                    <span class="profile-recommendation-title">Current Performance Level</span>
                    <p class="profile-recommendation-text" style="font-size: 16px; font-weight: 600; color: #00d98e;">
                        ${jumpRating} (Jump Height: ${jumpHeight} cm)
                    </p>
                </div>
                <div class="profile-recommendation-item">
                    <span class="profile-recommendation-title">🎯 Training Focus</span>
                    <p class="profile-recommendation-text">${student.training_focus}</p>
                </div>
                <div class="profile-recommendation-item">
                    <span class="profile-recommendation-title">💪 Plyometric Exercises</span>
                    <p class="profile-recommendation-text">${student.plyometric}</p>
                </div>
                <div class="profile-recommendation-item">
                    <span class="profile-recommendation-title">🔄 Recovery Methods</span>
                    <p class="profile-recommendation-text">${student.recovery}</p>
                </div>
                <div class="profile-recommendation-item">
                    <span class="profile-recommendation-title">📝 Additional Remarks</span>
                    <p class="profile-recommendation-text">${student.remarks}</p>
                </div>
            </div>
        `;
    }
}

// Create BMI Chart
function createBMIChart(student) {
    const canvas = document.getElementById('bmiChart');
    if (!canvas) return;
    
    // Destroy existing chart
    if (bmiChart) {
        bmiChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    // Get BMI history or create default
    const bmiHistory = student.bmi_history || [];
    
    if (bmiHistory.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('No BMI history available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const labels = bmiHistory.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const data = bmiHistory.map(entry => entry.bmi);
    
    bmiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'BMI',
                data: data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const dataPoint = bmiHistory[index];
                    showChartDataModal('BMI Statistics', dataPoint, 'bmi');
                }
            }
        }
    });
}

// Create Jump Chart
function createJumpChart(student) {
    const canvas = document.getElementById('jumpChart');
    if (!canvas) return;
    
    // Destroy existing chart
    if (jumpChart) {
        jumpChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    // Get Jump history or create default
    const jumpHistory = student.jump_history || [];
    
    if (jumpHistory.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('No jump history available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const labels = jumpHistory.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const data = jumpHistory.map(entry => entry.vertical_jump);
    
    jumpChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Vertical Jump (cm)',
                data: data,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const dataPoint = jumpHistory[index];
                    showChartDataModal('Jump Height Statistics', dataPoint, 'jump');
                }
            }
        }
    });
}

// Show chart data modal
function showChartDataModal(title, dataPoint, type) {
    const modal = document.getElementById('chartDataModal');
    const titleEl = document.getElementById('chartDataTitle');
    const contentEl = document.getElementById('chartDataContent');
    
    if (!modal || !titleEl || !contentEl) return;
    
    titleEl.textContent = title;
    
    let content = '';
    
    if (type === 'bmi') {
        content = `
            <div class="chart-data-item">
                <span class="chart-data-label">Date</span>
                <span class="chart-data-value">${new Date(dataPoint.date).toLocaleDateString()}</span>
            </div>
            <div class="chart-data-item">
                <span class="chart-data-label">Weight</span>
                <span class="chart-data-value">${dataPoint.weight} kg</span>
            </div>
            <div class="chart-data-item">
                <span class="chart-data-label">Height</span>
                <span class="chart-data-value">${dataPoint.height} cm</span>
            </div>
            <div class="chart-data-item">
                <span class="chart-data-label">BMI</span>
                <span class="chart-data-value">${dataPoint.bmi}</span>
            </div>
            <div class="chart-data-item">
                <span class="chart-data-label">Rating</span>
                <span class="chart-data-value">${dataPoint.rating}</span>
            </div>
        `;
    } else if (type === 'jump') {
        content = `
            <div class="chart-data-item">
                <span class="chart-data-label">Date</span>
                <span class="chart-data-value">${new Date(dataPoint.date).toLocaleDateString()}</span>
            </div>
            <div class="chart-data-item">
                <span class="chart-data-label">Standing Reach</span>
                <span class="chart-data-value">${dataPoint.standing_reach} cm</span>
            </div>
            <div class="chart-data-item">
                <span class="chart-data-label">Jump Reach</span>
                <span class="chart-data-value">${dataPoint.jump_reach} cm</span>
            </div>
            <div class="chart-data-item">
                <span class="chart-data-label">Jump Height</span>
                <span class="chart-data-value">${dataPoint.jump_height} cm</span>
            </div>
            <div class="chart-data-item">
                <span class="chart-data-label">Vertical Jump</span>
                <span class="chart-data-value">${dataPoint.vertical_jump} cm</span>
            </div>
            <div class="chart-data-item">
                <span class="chart-data-label">Rating</span>
                <span class="chart-data-value">${dataPoint.rating}</span>
            </div>
        `;
    }
    
    contentEl.innerHTML = content;
    modal.classList.add('active');
}

// Open class modal
function openClassModal(classId = null) {
    const modal = document.getElementById('classModal');
    const form = document.getElementById('classForm');
    const title = document.getElementById('classModalTitle');
    
    if (!modal || !form || !title) return;
    
    form.reset();
    const editClassIdEl = document.getElementById('editClassId');
    if (editClassIdEl) {
        editClassIdEl.value = '';
    }
    
    if (classId) {
        const cls = DataStore.getClassById(classId);
        if (cls) {
            title.textContent = 'EDIT CLASS';
            if (editClassIdEl) editClassIdEl.value = cls.class_id;
            
            const classNameEl = document.getElementById('className');
            if (classNameEl) classNameEl.value = cls.class_name;
            
            const classCollegeEl = document.getElementById('classCollege');
            if (classCollegeEl) classCollegeEl.value = cls.user_college;
            
            const classCourseEl = document.getElementById('classCourse');
            if (classCourseEl) classCourseEl.value = cls.course;
            
            const classYearEl = document.getElementById('classYear');
            if (classYearEl) classYearEl.value = cls.year;
            
            const classSectionEl = document.getElementById('classSection');
            if (classSectionEl) classSectionEl.value = cls.section;
        }
    } else {
        title.textContent = 'ADD NEW CLASS';
    }
    
    modal.classList.add('active');
}

// Edit class
function editClass(classId) {
    openClassModal(classId);
}

// Delete class
function deleteClass(classId) {
    showConfirmNotification(
        'Delete Class',
        'Are you sure you want to delete this class? This action cannot be undone.',
        () => {
            DataStore.deleteClass(classId);
            loadClasses();
            loadCoachData();
            showSuccessNotification('Success!', 'Class deleted successfully.');
        }
    );
}

// Handle class form submit
function handleClassSubmit(e) {
    e.preventDefault();
    
    if (!currentCoach) return;
    
    const classIdEl = document.getElementById('editClassId');
    const classId = classIdEl ? classIdEl.value : '';
    
    const classNameEl = document.getElementById('className');
    const classCollegeEl = document.getElementById('classCollege');
    const classCourseEl = document.getElementById('classCourse');
    const classYearEl = document.getElementById('classYear');
    const classSectionEl = document.getElementById('classSection');
    
    if (!classNameEl || !classCollegeEl || !classCourseEl || !classYearEl || !classSectionEl) {
        showErrorNotification('Error!', 'Form fields are missing!');
        return;
    }
    
    const classData = {
        class_name: classNameEl.value.trim(),
        user_college: classCollegeEl.value,
        course: classCourseEl.value.trim(),
        year: classYearEl.value,
        section: classSectionEl.value.trim(),
        coach_id: currentCoach.coach_id,
        coach_name: currentCoach.coach_name
    };
    
    if (classId) {
        DataStore.updateClass(classId, classData);
        showSuccessNotification('Success!', 'Class updated successfully.');
    } else {
        DataStore.addClass(classData);
        showSuccessNotification('Success!', 'Class added successfully.');
    }
    
    closeModal('classModal');
    loadClasses();
    loadCoachData();
}

// Open student modal
function openStudentModal(studentId = null, context = 'athlete') {
    const modal = document.getElementById('studentModal');
    const form = document.getElementById('studentForm');
    const title = document.getElementById('studentModalTitle');
    
    if (!modal || !form || !title) return;
    
    form.reset();
    const editStudentIdEl = document.getElementById('editStudentId');
    if (editStudentIdEl) {
        editStudentIdEl.value = '';
    }
    
    if (studentId) {
        const student = DataStore.getStudentById(studentId);
        if (student) {
            title.textContent = 'EDIT STUDENT';
            if (editStudentIdEl) editStudentIdEl.value = student.user_id;
            
            // Basic Information
            setValue('studentUserId', student.user_id);
            setValue('studentName', student.student_name);
            setValue('studentGender', student.gender);
            setValue('studentUserType', student.user_type);
            setValue('studentSport', student.sport);
            
            // Academic Information
            setValue('studentCollege', student.user_college);
            setValue('studentCourse', student.course);
            setValue('studentYear', student.year);
            setValue('studentSection', student.section);
            
            // BMI Statistics
            setValue('studentWeight', student.current_weight);
            setValue('studentHeight', student.current_height);
            setValue('studentBMI', student.current_bmi);
            setValue('studentBMIRating', student.current_bmi_rating);
            setValue('studentBMIDate', student.updated_bmi_date);
            
            // Jump Height Statistics
            setValue('studentStandingReach', student.current_standing_reach);
            setValue('studentJumpReach', student.current_jump_reach);
            setValue('studentJumpHeight', student.current_jump_height);
            setValue('studentVerticalJump', student.current_vertical_jump);
            setValue('studentJumpRating', student.current_jump_rating);
            setValue('studentJumpDate', student.updated_jump_date);
            
            // Training Recommendations - Auto-generate based on current stats
            const recommendations = generateRecommendations(student);
            setValue('studentTrainingFocus', recommendations.training_focus);
            setValue('studentPlyometric', recommendations.plyometric);
            setValue('studentRecovery', recommendations.recovery);
            setValue('studentRemarks', recommendations.remarks);
        }
    } else {
        if (context === 'athlete') {
            title.textContent = 'ADD NEW ATHLETE';
            setValue('studentUserType', 'athlete');
        } else if (context === 'class' && currentClassId) {
            title.textContent = 'ADD NEW STUDENT';
            setValue('studentUserType', 'student');
            
            const cls = DataStore.getClassById(currentClassId);
            if (cls) {
                setValue('studentCollege', cls.user_college);
                setValue('studentCourse', cls.course);
                setValue('studentYear', cls.year);
                setValue('studentSection', cls.section);
            }
        } else {
            title.textContent = 'ADD NEW STUDENT';
        }
    }
    
    modal.classList.add('active');
}

// Helper function to set form values
function setValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element && value !== undefined && value !== null) {
        element.value = value;
    }
}

// Edit student
function editStudent(studentId) {
    openStudentModal(studentId);
}

// Delete student
function deleteStudent(studentId) {
    showConfirmNotification(
        'Delete Student',
        'Are you sure you want to delete this student? This action cannot be undone.',
        () => {
            DataStore.deleteStudent(studentId);
            loadAthletes();
            loadAllStudents();
            if (currentClassId) {
                loadClassStudents();
            }
            loadCoachData();
            showSuccessNotification('Success!', 'Student deleted successfully.');
        }
    );
}

// Handle student form submit
function handleStudentSubmit(e) {
    e.preventDefault();
    
    if (!currentCoach) return;
    
    const editIdEl = document.getElementById('editStudentId');
    const editId = editIdEl ? editIdEl.value : '';
    
    const userId = document.getElementById('studentUserId').value.trim();
    
    const studentData = {
        user_id: userId,
        student_name: document.getElementById('studentName').value.trim(),
        gender: document.getElementById('studentGender').value,
        user_type: document.getElementById('studentUserType').value,
        sport: document.getElementById('studentSport').value.trim(),
        coach_id: currentCoach.coach_id,
        
        // Academic Information
        user_college: document.getElementById('studentCollege').value,
        course: document.getElementById('studentCourse').value.trim(),
        year: document.getElementById('studentYear').value,
        section: document.getElementById('studentSection').value.trim()
    };
    
    if (editId) {
        // Get existing student to preserve history AND BMI/Jump statistics
        const existingStudent = DataStore.getStudentById(editId);
        if (existingStudent) {
            // Preserve history arrays
            studentData.bmi_history = existingStudent.bmi_history || [];
            studentData.jump_history = existingStudent.jump_history || [];
            
            // Preserve BMI statistics (these can only be updated by student)
            studentData.current_weight = existingStudent.current_weight;
            studentData.current_height = existingStudent.current_height;
            studentData.current_bmi = existingStudent.current_bmi;
            studentData.current_bmi_rating = existingStudent.current_bmi_rating;
            studentData.updated_bmi_date = existingStudent.updated_bmi_date;
            
            // Preserve Jump statistics (these can only be updated by student)
            studentData.current_standing_reach = existingStudent.current_standing_reach;
            studentData.current_jump_reach = existingStudent.current_jump_reach;
            studentData.current_jump_height = existingStudent.current_jump_height;
            studentData.current_vertical_jump = existingStudent.current_vertical_jump;
            studentData.current_jump_rating = existingStudent.current_jump_rating;
            studentData.updated_jump_date = existingStudent.updated_jump_date;
            
            // Preserve Training Recommendations (auto-generated, not editable by coach)
            studentData.training_focus = existingStudent.training_focus || '';
            studentData.plyometric = existingStudent.plyometric || '';
            studentData.recovery = existingStudent.recovery || '';
            studentData.remarks = existingStudent.remarks || '';
        }
        
        DataStore.updateStudent(editId, studentData);
        showSuccessNotification('Success!', 'Student updated successfully.');
    } else {
        // Check if user already exists
        const existingUser = DataStore.getUserById(userId);
        if (existingUser) {
            showErrorNotification('Error!', 'User ID already exists!');
            return;
        }
        
        // Initialize empty history arrays and null statistics for new students
        studentData.bmi_history = [];
        studentData.jump_history = [];
        
        // Initialize BMI statistics as null (to be filled by student later)
        studentData.current_weight = null;
        studentData.current_height = null;
        studentData.current_bmi = null;
        studentData.current_bmi_rating = '';
        studentData.updated_bmi_date = '';
        
        // Initialize Jump statistics as null (to be filled by student later)
        studentData.current_standing_reach = null;
        studentData.current_jump_reach = null;
        studentData.current_jump_height = null;
        studentData.current_vertical_jump = null;
        studentData.current_jump_rating = '';
        studentData.updated_jump_date = '';
        
        // Initialize Training Recommendations as empty (will be auto-generated from student data)
        studentData.training_focus = '';
        studentData.plyometric = '';
        studentData.recovery = '';
        studentData.remarks = '';
        
        DataStore.addStudent(studentData);
        showSuccessNotification('Success!', 'Student added successfully.');
    }
    
    closeModal('studentModal');
    loadAthletes();
    loadAllStudents();
    if (currentClassId) {
        loadClassStudents();
    }
    loadCoachData();
    
    // If we're on the profile page and editing the current student, reload profile
    if (editId && currentStudentId === editId && currentPage === 'studentProfile') {
        loadStudentProfile();
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}