// Admin Interface JavaScript - Full Screen Modal Design
// Handles all admin functionalities with full-screen modals

// Global variables
let currentEditUserId = null;
let selectedUsers = new Set();
let userToDelete = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

// Initialize admin interface
function initializeAdmin() {
    const adminName = sessionStorage.getItem('vumpIT_admin_name') || 'ADMIN';
    const welcomeTitle = document.getElementById('welcomeTitle');
    if (welcomeTitle) {
        welcomeTitle.textContent = `Welcome ${adminName.toUpperCase()}`;
    }
    
    loadUsers();
    attachEventListeners();
}

// Attach event listeners
function attachEventListeners() {
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Real-time search
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Add user button
    document.getElementById('addBtn').addEventListener('click', openAddUserModal);
    
    // Delete button
    document.getElementById('deleteBtn').addEventListener('click', openDeleteModal);
    
    // User Modal close buttons
    document.getElementById('closeModal').addEventListener('click', closeUserModal);
    document.getElementById('cancelBtn').addEventListener('click', closeUserModal);
    
    // View Modal close button
    document.getElementById('closeViewModal').addEventListener('click', closeViewModal);
    
    // Delete Modal buttons
    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
    
    // Logout Modal buttons
    document.getElementById('closeLogoutModal').addEventListener('click', closeLogoutModal);
    document.getElementById('cancelLogoutBtn').addEventListener('click', closeLogoutModal);
    document.getElementById('confirmLogoutBtn').addEventListener('click', confirmLogout);
    
    // Form submission
    document.getElementById('userForm').addEventListener('submit', handleFormSubmit);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', openLogoutModal);
    
    // Close modals on outside click (only for small modals)
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDeleteModal();
        }
    });

    document.getElementById('logoutModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeLogoutModal();
        }
    });
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
                <td colspan="6" class="no-results">
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
    
    row.innerHTML = `
        <td>${user.user_id}</td>
        <td>${user.user_name}</td>
        <td>${userType}</td>
        <td>${user.sport}</td>
        <td>${college}</td>
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
    document.getElementById('userId').placeholder = 'Enter User ID';
    document.getElementById('userName').placeholder = 'Enter Full Name';
    document.querySelector('.btn-save').textContent = 'Add User';
    document.getElementById('userModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Edit user
function editUser(userId) {
    const user = DataStore.getUserById(userId);
    if (!user) {
        showNotification('User not found!', 'error');
        return;
    }
    
    currentEditUserId = userId;
    document.getElementById('modalTitle').textContent = 'EDIT USER';
    
    // Populate form
    document.getElementById('userId').value = user.user_id;
    document.getElementById('userId').disabled = true;
    document.getElementById('userName').value = user.user_name;
    document.getElementById('userType').value = user.user_type;
    document.getElementById('sport').value = user.sport;
    
    // Set college value
    const college = user.coach_college || user.user_college || '';
    const collegeSelect = document.getElementById('college');
    
    // Check if the college value exists in options
    let collegeExists = false;
    for (let option of collegeSelect.options) {
        if (option.value === college) {
            collegeExists = true;
            break;
        }
    }
    
    // If college doesn't exist in options, temporarily add it
    if (!collegeExists && college) {
        const newOption = document.createElement('option');
        newOption.value = college;
        newOption.textContent = college;
        collegeSelect.appendChild(newOption);
    }
    
    collegeSelect.value = college;
    document.getElementById('gender').value = user.gender;
    document.getElementById('password').value = user.password || '';
    
    document.querySelector('.btn-save').textContent = 'Save Changes';
    document.getElementById('userModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// View user with enhanced full-screen display
function viewUser(userId) {
    const user = DataStore.getUserById(userId);
    if (!user) {
        showNotification('User not found!', 'error');
        return;
    }
    
    const college = user.coach_college || user.user_college || 'N/A';
    const userType = capitalizeFirstLetter(user.user_type);
    
    const viewContent = document.getElementById('viewUserContent');
    viewContent.innerHTML = `
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
                    <div class="profile-item-value">${user.gender}</div>
                </div>
            </div>
        </div>
        
        <div class="profile-section">
            <h2 class="profile-section-title">Sports & College Information</h2>
            <div class="profile-grid">
                <div class="profile-item">
                    <div class="profile-item-label">Sport</div>
                    <div class="profile-item-value">${user.sport}</div>
                </div>
                <div class="profile-item">
                    <div class="profile-item-label">College</div>
                    <div class="profile-item-value">${college}</div>
                </div>
            </div>
        </div>
        
        ${user.user_type === 'coach' ? `
            <div class="profile-section">
                <h2 class="profile-section-title">Coach Information</h2>
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
    
    const userData = {
        user_id: document.getElementById('userId').value.trim(),
        user_name: document.getElementById('userName').value.trim(),
        user_type: document.getElementById('userType').value,
        sport: document.getElementById('sport').value.trim(),
        gender: document.getElementById('gender').value,
        password: document.getElementById('password').value
    };
    
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
            showNotification('✗ User ID already exists! Please use a different ID.', 'error');
            return;
        }
        
        // Add new user
        DataStore.addUser(userData);
        showNotification(`✓ User ${userData.user_name} added successfully!`, 'success');
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
        closeDeleteModal();
        loadUsers();
        userToDelete = null;
    } else {
        showNotification('✗ Failed to delete user.', 'error');
    }
}

// Open logout confirmation modal
function openLogoutModal() {
    document.getElementById('logoutModal').classList.add('active');
}

// Confirm logout
function confirmLogout() {
    // Clear session data
    sessionStorage.clear();
    localStorage.clear();
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Close modals
function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
    document.getElementById('userForm').reset();
    currentEditUserId = null;
    document.body.style.overflow = 'auto';
    
    // Remove any temporarily added college options
    const collegeSelect = document.getElementById('college');
    const standardColleges = [
        'College of Engineering',
        'College of Arts and Sciences',
        'College of Business',
        'College of Education'
    ];
    
    // Remove options that aren't in the standard list
    for (let i = collegeSelect.options.length - 1; i >= 0; i--) {
        const option = collegeSelect.options[i];
        if (option.value && !standardColleges.includes(option.value)) {
            collegeSelect.remove(i);
        }
    }
}

function closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    userToDelete = null;
}

function closeLogoutModal() {
    document.getElementById('logoutModal').classList.remove('active');
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

// Prevent body scroll when full-screen modal is open
document.addEventListener('keydown', function(e) {
    // Close modals on Escape key
    if (e.key === 'Escape') {
        if (document.getElementById('userModal').classList.contains('active')) {
            closeUserModal();
        }
        if (document.getElementById('viewModal').classList.contains('active')) {
            closeViewModal();
        }
        if (document.getElementById('deleteModal').classList.contains('active')) {
            closeDeleteModal();
        }
        if (document.getElementById('logoutModal').classList.contains('active')) {
            closeLogoutModal();
        }
    }
});

// Make functions globally accessible
window.editUser = editUser;
window.viewUser = viewUser;