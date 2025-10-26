// Admin Interface JavaScript - Automatic Login via Unified System
// Admin authentication now handled by index.html

// Global variables
let currentAdmin = null;
let currentEditUserId = null;
let selectedUsers = new Set();
let userToDelete = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    setupPasswordToggles();
    setupUserTypeListener();
});

// Setup user type change listener
function setupUserTypeListener() {
    const userTypeSelect = document.getElementById('userType');
    if (userTypeSelect) {
        userTypeSelect.addEventListener('change', handleUserTypeChange);
    }
}

// Handle user type change
function handleUserTypeChange() {
    const userType = document.getElementById('userType').value;
    const sportField = document.getElementById('sport');
    const sportFieldContainer = document.getElementById('sportField');
    
    if (userType === 'admin') {
        // Disable sport field for admin
        sportField.disabled = true;
        sportField.required = false;
        sportField.value = 'All Sports';
        sportFieldContainer.style.opacity = '0.5';
        sportFieldContainer.style.pointerEvents = 'none';
    } else if (userType === 'coach') {
        // Enable sport field for coach
        sportField.disabled = false;
        sportField.required = true;
        if (sportField.value === 'All Sports') {
            sportField.value = '';
        }
        sportFieldContainer.style.opacity = '1';
        sportFieldContainer.style.pointerEvents = 'auto';
    } else {
        // Enable sport field for athlete/student
        sportField.disabled = false;
        sportField.required = true;
        if (sportField.value === 'All Sports') {
            sportField.value = '';
        }
        sportFieldContainer.style.opacity = '1';
        sportFieldContainer.style.pointerEvents = 'auto';
    }
}

// Setup password toggles (REMOVED - No longer needed)
function setupPasswordToggles() {
    // Password toggle functionality removed
}

// Check login status - Verify admin session from unified login
function checkLoginStatus() {
    const loggedInAdmin = sessionStorage.getItem('loggedInAdmin');
    
    if (!loggedInAdmin) {
        // No admin session found, redirect to login page
        window.location.href = 'index.html';
        return;
    }
    
    try {
        currentAdmin = JSON.parse(loggedInAdmin);
        
        // Verify the user is actually an admin
        if (currentAdmin.user_type !== 'admin') {
            // Not an admin, clear session and redirect
            sessionStorage.removeItem('loggedInAdmin');
            window.location.href = 'index.html';
            return;
        }
        
        // Valid admin session, initialize dashboard
        showDashboard();
    } catch (error) {
        console.error('Error parsing admin session:', error);
        sessionStorage.removeItem('loggedInAdmin');
        window.location.href = 'index.html';
    }
}

// Show dashboard
function showDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
    }
    document.body.style.overflow = 'hidden';
    initializeAdmin();
}

// Handle logout
function handleLogout() {
    currentAdmin = null;
    sessionStorage.removeItem('loggedInAdmin');
    sessionStorage.clear();
    hideLogoutConfirmModal();
    window.location.href = 'index.html';
}

// Show/Hide logout confirmation modal
function showLogoutConfirmModal() {
    document.getElementById('logoutConfirmModal').classList.add('active');
}

function hideLogoutConfirmModal() {
    document.getElementById('logoutConfirmModal').classList.remove('active');
}

// Initialize admin interface
function initializeAdmin() {
    if (!currentAdmin) return;
    
    const adminName = currentAdmin.user_name || 'ADMIN';
    const welcomeTitle = document.getElementById('welcomeTitle');
    if (welcomeTitle) {
        welcomeTitle.textContent = `Welcome, ${adminName.toUpperCase()}`;
    }
    
    loadUsers();
    attachEventListeners();
}

// Attach event listeners
function attachEventListeners() {
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        // Real-time search
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Add user button
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', openAddUserModal);
    }
    
    // Delete button
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', openDeleteModal);
    }
    
    // User Modal close buttons
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeUserModal);
    }
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('userForm').reset();
            handleUserTypeChange();
        });
    }
    
    // View Modal close button
    const closeViewModal = document.getElementById('closeViewModal');
    if (closeViewModal) {
        closeViewModal.addEventListener('click', closeViewModalFunc);
    }
    
    // Delete Modal buttons
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    if (closeDeleteModal) {
        closeDeleteModal.addEventListener('click', closeDeleteModalFunc);
    }
    
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteModalFunc);
    }
    
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
    
    // Form submission
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', showLogoutConfirmModal);
    }
    
    // Logout confirmation modal buttons
    const closeLogoutConfirmBtn = document.getElementById('closeLogoutConfirmBtn');
    if (closeLogoutConfirmBtn) {
        closeLogoutConfirmBtn.addEventListener('click', hideLogoutConfirmModal);
    }
    
    const cancelLogoutConfirmBtn = document.getElementById('cancelLogoutConfirmBtn');
    if (cancelLogoutConfirmBtn) {
        cancelLogoutConfirmBtn.addEventListener('click', hideLogoutConfirmModal);
    }
    
    const confirmLogoutConfirmBtn = document.getElementById('confirmLogoutConfirmBtn');
    if (confirmLogoutConfirmBtn) {
        confirmLogoutConfirmBtn.addEventListener('click', handleLogout);
    }
    
    // Close modals on outside click
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeDeleteModalFunc();
            }
        });
    }
    
    const logoutConfirmModal = document.getElementById('logoutConfirmModal');
    if (logoutConfirmModal) {
        logoutConfirmModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideLogoutConfirmModal();
            }
        });
    }
}

// Load and display users
function loadUsers(searchQuery = '') {
    const tableBody = document.getElementById('userTableBody');
    let users;
    
    if (searchQuery) {
        users = DataStore.searchUsers(searchQuery);
    } else {
        users = DataStore.getAllUsers();
    }
    
    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-results">
                    ${searchQuery ? 'No users found matching your search.' : 'No users available.'}
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = createUserRow(user);
        tableBody.appendChild(row);
    });
}

// Create user table row
function createUserRow(user) {
    const row = document.createElement('tr');
    row.dataset.userId = user.user_id;
    
    const college = user.coach_college || user.user_college || 'N/A';
    const userType = capitalizeFirstLetter(user.user_type);
    const sport = user.sport || 'N/A';
    
    row.innerHTML = `
        <td>${user.user_id}</td>
        <td>${user.user_name}</td>
        <td>${userType}</td>
        <td>${sport}</td>
        <td>${college}</td>
        <td>${user.gender}</td>
        <td>
            <div class="action-cell">
                <button class="view-btn" onclick="viewUser('${user.user_id}')">View</button>
                <button class="edit-btn" onclick="editUser('${user.user_id}')">Edit</button>
            </div>
        </td>
    `;
    
    return row;
}

// Handle search
function handleSearch() {
    const searchQuery = document.getElementById('searchInput').value.trim();
    loadUsers(searchQuery);
}

// Open add user modal
function openAddUserModal() {
    currentEditUserId = null;
    document.getElementById('modalTitle').textContent = 'ADD NEW USER';
    document.getElementById('userForm').reset();
    document.getElementById('userId').disabled = false;
    
    // Reset field states
    const sportField = document.getElementById('sport');
    const sportFieldContainer = document.getElementById('sportField');
    
    sportField.disabled = false;
    sportField.required = true;
    sportFieldContainer.style.opacity = '1';
    sportFieldContainer.style.pointerEvents = 'auto';
    
    document.getElementById('userModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Edit user
function editUser(userId) {
    const user = DataStore.getUserById(userId);
    if (!user) {
        showNotification('✗ User not found!', 'error');
        return;
    }
    
    currentEditUserId = userId;
    document.getElementById('modalTitle').textContent = 'EDIT USER';
    
    // Fill form with user data (no password field)
    document.getElementById('userId').value = user.user_id;
    document.getElementById('userId').disabled = true;
    document.getElementById('userName').value = user.user_name;
    document.getElementById('userType').value = user.user_type;
    document.getElementById('sport').value = user.sport || '';
    document.getElementById('gender').value = user.gender;
    
    // Handle college field
    const college = user.coach_college || user.user_college;
    const collegeSelect = document.getElementById('college');
    
    // Check if college exists in dropdown
    let collegeExists = false;
    for (let option of collegeSelect.options) {
        if (option.value === college) {
            collegeExists = true;
            break;
        }
    }
    
    // If college doesn't exist in dropdown, add it temporarily
    if (!collegeExists && college) {
        const newOption = document.createElement('option');
        newOption.value = college;
        newOption.textContent = college;
        collegeSelect.appendChild(newOption);
    }
    
    collegeSelect.value = college;
    
    // Handle field states based on user type
    handleUserTypeChange();
    
    document.getElementById('userModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// View user
function viewUser(userId) {
    const user = DataStore.getUserById(userId);
    if (!user) {
        showNotification('✗ User not found!', 'error');
        return;
    }
    
    const college = user.coach_college || user.user_college || 'N/A';
    const userType = capitalizeFirstLetter(user.user_type);
    const sport = user.sport || 'N/A';
    
    document.getElementById('viewUserContent').innerHTML = `
        <div class="profile-section">
            <h2 class="profile-section-title">Personal Information</h2>
            <div class="profile-grid">
                <div class="profile-item">
                    <div class="profile-item-label">User ID</div>
                    <div class="profile-item-value">${user.user_id}</div>
                </div>
                <div class="profile-item">
                    <div class="profile-item-label">Full Name</div>
                    <div class="profile-item-value">${user.user_name}</div>
                </div>
                <div class="profile-item">
                    <div class="profile-item-label">User Type</div>
                    <div class="profile-item-value">${userType}</div>
                </div>
                <div class="profile-item">
                    <div class="profile-item-label">Gender</div>
                    <div class="profile-item-value">${capitalizeFirstLetter(user.gender)}</div>
                </div>
            </div>
        </div>

        <div class="profile-section" style="margin-top: 30px;">
            <h2 class="profile-section-title">Academic & Sports Information</h2>
            <div class="profile-grid">
                <div class="profile-item">
                    <div class="profile-item-label">Sport</div>
                    <div class="profile-item-value">${sport}</div>
                </div>
                <div class="profile-item">
                    <div class="profile-item-label">College</div>
                    <div class="profile-item-value">${college}</div>
                </div>
            </div>
        </div>

        ${user.user_type === 'coach' ? `
            <div class="profile-section" style="margin-top: 30px;">
                <h2 class="profile-section-title">Coach Details</h2>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">Coach ID</div>
                        <div class="profile-item-value">${user.coach_id || user.user_id}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">Coach Name</div>
                        <div class="profile-item-value">${user.coach_name || user.user_name}</div>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
    
    document.getElementById('viewModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const userType = document.getElementById('userType').value;
    const userData = {
        user_id: document.getElementById('userId').value.trim(),
        user_name: document.getElementById('userName').value.trim(),
        user_type: userType,
        gender: document.getElementById('gender').value
    };
    
    // Handle sport field based on user type
    if (userType === 'admin') {
        userData.sport = 'All Sports';
    } else {
        userData.sport = document.getElementById('sport').value.trim();
    }
    
    // No password field - password will be handled by data.js defaults
    
    // Set college field based on user type
    const college = document.getElementById('college').value.trim();
    if (userData.user_type === 'coach' || userData.user_type === 'admin') {
        userData.coach_college = college;
    } else {
        userData.user_college = college;
    }
    
    // Add coach-specific fields
    if (userData.user_type === 'coach') {
        userData.coach_id = userData.user_id;
        userData.coach_name = userData.user_name;
    }
    
    if (currentEditUserId) {
        // Update existing user
        const success = DataStore.updateUser(currentEditUserId, userData);
        if (success) {
            showNotification(`✓ User ${userData.user_name} updated successfully!`, 'success');
            closeUserModal();
            loadUsers();
        } else {
            showNotification('✗ Failed to update user.', 'error');
        }
    } else {
        // Check if user ID already exists
        const existingUser = DataStore.getUserById(userData.user_id);
        if (existingUser) {
            showNotification('User ID already exists! Please use a different ID.', 'error');
            return;
        }
        
        // Add new user
        DataStore.addUser(userData);
        showNotification(`User ${userData.user_name} added successfully!`, 'success');
        closeUserModal();
        loadUsers();
    }
}

// Open delete confirmation modal
function openDeleteModal() {
    const selectedRow = document.querySelector('.user-table tbody tr.selected');
    
    if (!selectedRow) {
        showNotification('⚠ Please select a user to delete by clicking on a row.', 'error');
        return;
    }
    
    const userId = selectedRow.dataset.userId;
    const user = DataStore.getUserById(userId);
    
    if (!user) {
        showNotification('✗ User not found!', 'error');
        return;
    }
    
    userToDelete = userId;
    document.getElementById('deleteMessage').innerHTML = `
        Are you sure you want to delete <strong style="color: #ff6b35;">${user.user_name}</strong>?<br>
        <span style="color: #6b7280; font-size: 15px;">(User ID: ${user.user_id})</span>
    `;
    
    document.getElementById('deleteModal').classList.add('active');
}

// Confirm delete
function confirmDelete() {
    if (!userToDelete) return;
    
    const user = DataStore.getUserById(userToDelete);
    const success = DataStore.deleteUser(userToDelete);
    
    if (success) {
        showNotification(`✓ User ${user.user_name} deleted successfully!`, 'success');
        closeDeleteModalFunc();
        loadUsers();
        userToDelete = null;
    } else {
        showNotification('✗ Failed to delete user.', 'error');
    }
}

// Close modals
function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
    document.getElementById('userForm').reset();
    currentEditUserId = null;
    document.body.style.overflow = 'hidden';
    
    // Reset field states
    const sportField = document.getElementById('sport');
    const sportFieldContainer = document.getElementById('sportField');
    
    sportField.disabled = false;
    sportField.required = true;
    sportFieldContainer.style.opacity = '1';
    sportFieldContainer.style.pointerEvents = 'auto';
    
    // Remove any temporarily added college options
    const collegeSelect = document.getElementById('college');
    const standardColleges = [
        'College of Administration, Business, Hospitality and Accountancy',
        'College of Agriculture',
        'College of Allied Medicine',
        'College of Arts and Sciences',
        'College of Engineering',
        'College of Industrial Technology',
        'College of Teacher Education'
    ];
    
    // Remove options that aren't in the standard list
    for (let i = collegeSelect.options.length - 1; i >= 0; i--) {
        const option = collegeSelect.options[i];
        if (option.value && !standardColleges.includes(option.value)) {
            collegeSelect.remove(i);
        }
    }
}

function closeViewModalFunc() {
    document.getElementById('viewModal').classList.remove('active');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModalFunc() {
    document.getElementById('deleteModal').classList.remove('active');
    userToDelete = null;
}

// Show notification with icon
function showNotification(message, type = 'success') {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    const icon = type === 'success' 
        ? '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        : '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    
    notification.innerHTML = icon + '<span>' + message + '</span>';
    notification.className = `notification ${type} active`;
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3500);
}

// Utility function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Add row selection functionality
document.addEventListener('click', function(e) {
    const row = e.target.closest('.user-table tbody tr');
    if (row && !e.target.closest('button')) {
        document.querySelectorAll('.user-table tbody tr').forEach(r => {
            r.classList.remove('selected');
        });
        row.classList.add('selected');
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Close modals on Escape key
    if (e.key === 'Escape') {
        if (document.getElementById('userModal').classList.contains('active')) {
            closeUserModal();
        }
        if (document.getElementById('viewModal').classList.contains('active')) {
            closeViewModalFunc();
        }
        if (document.getElementById('deleteModal').classList.contains('active')) {
            closeDeleteModalFunc();
        }
        if (document.getElementById('logoutConfirmModal').classList.contains('active')) {
            hideLogoutConfirmModal();
        }
    }
});

// Make functions globally accessible
window.editUser = editUser;
window.viewUser = viewUser;
