// Central Data Store for vumpIT Sports Management System
// This file manages all data for Admin, Coach, and Student interfaces

// User Database - stores all users (admins, coaches, students)
const users = [
    {
        user_id: "admin",
        user_name: "admin",
        user_type: "admin",
        sport: "All Sports",
        coach_college: "Administration",
        gender: "Male",
        password: "admin123"
    },
    {
        user_id: "coach",
        user_name: "coach",
        user_type: "coach",
        coach_id: "coach",
        coach_name: "coach",
        sport: "Basketball",
        coach_college: "College A",
        gender: "Male",
        password: "coach123"
    },
    {
        user_id: "12345",
        user_name: "John Doe",
        user_type: "coach",
        coach_id: "12345",
        coach_name: "John Doe",
        sport: "Basketball",
        coach_college: "College A",
        gender: "Male",
        password: "coach123"
    },
    {
        user_id: "67890",
        user_name: "Jane Smith",
        user_type: "admin",
        sport: "Tennis",
        coach_college: "College B",
        gender: "Female",
        password: "admin123"
    },
    {
        user_id: "11223",
        user_name: "Alice Johnson",
        user_type: "coach",
        coach_id: "11223",
        coach_name: "Alice Johnson",
        sport: "Soccer",
        coach_college: "College C",
        gender: "Female",
        password: "coach123"
    },
    {
        user_id: "44556",
        user_name: "Bob Brown",
        user_type: "admin",
        sport: "Swimming",
        coach_college: "College D",
        gender: "Male",
        password: "admin123"
    }
];

// Students Database
const students = [
    {
        user_id: "STU001",
        user_name: "Michael Chen",
        user_type: "student",
        gender: "Male",
        sport: "Basketball",
        user_college: "College A",
        course: "Computer Science",
        year: "2nd Year",
        section: "A",
        class_list: ["Basketball-101", "Basketball-Advanced"],
        coach_id: "12345",
        // BMI Statistics
        current_weight: 75,
        current_height: 180,
        current_bmi: 23.1,
        current_bmi_rating: "Normal",
        updated_bmi_date: "2025-10-15",
        // Height Statistics
        current_standing_reach: 230,
        current_jump_reach: 280,
        current_jump_height: 50,
        // Jump Statistics
        current_vertical_jump: 45,
        current_jump_rating: "Good",
        updated_jump_date: "2025-10-15",
        // Recommendations
        training_focus: "Strength and conditioning, vertical jump training",
        plyometric: "Box jumps, depth jumps, single-leg hops",
        recovery: "8 hours sleep, proper hydration, stretching routine",
        remarks: "Showing consistent improvement in vertical jump"
    },
    {
        user_id: "STU002",
        user_name: "Sarah Williams",
        user_type: "student",
        gender: "Female",
        sport: "Soccer",
        user_college: "College C",
        course: "Business Administration",
        year: "3rd Year",
        section: "B",
        class_list: ["Soccer-Fundamentals"],
        coach_id: "11223",
        current_weight: 58,
        current_height: 165,
        current_bmi: 21.3,
        current_bmi_rating: "Normal",
        updated_bmi_date: "2025-10-18",
        current_standing_reach: 210,
        current_jump_reach: 250,
        current_jump_height: 40,
        current_vertical_jump: 38,
        current_jump_rating: "Average",
        updated_jump_date: "2025-10-18",
        training_focus: "Agility and speed work",
        plyometric: "Lateral bounds, hurdle hops",
        recovery: "Active recovery sessions, foam rolling",
        remarks: "Focus on explosive power development"
    }
];

// Classes Database
const classes = [
    {
        class_id: "CLS001",
        class_name: "Basketball-101",
        coach_id: "12345",
        coach_name: "John Doe",
        user_college: "College A",
        course: "Computer Science",
        year: "2nd Year",
        section: "A",
        total_students: 15,
        total_all_students: 15
    },
    {
        class_id: "CLS002",
        class_name: "Basketball-Advanced",
        coach_id: "12345",
        coach_name: "John Doe",
        user_college: "College A",
        course: "Computer Science",
        year: "3rd Year",
        section: "A",
        total_students: 12,
        total_all_students: 12
    },
    {
        class_id: "CLS003",
        class_name: "Soccer-Fundamentals",
        coach_id: "11223",
        coach_name: "Alice Johnson",
        user_college: "College C",
        course: "Business Administration",
        year: "3rd Year",
        section: "B",
        total_students: 18,
        total_all_students: 18
    }
];

// Coach Statistics
const coachStats = [
    {
        coach_id: "12345",
        sport: "Basketball",
        total_class: 2,
        total_students: 27,
        total_athletes: 20,
        total_all_students: 27
    },
    {
        coach_id: "11223",
        sport: "Soccer",
        total_class: 1,
        total_students: 18,
        total_athletes: 15,
        total_all_students: 18
    }
];

// Data manipulation functions
const DataStore = {
    // User Management
    getAllUsers() {
        return [...users];
    },
    
    getUserById(userId) {
        return users.find(user => user.user_id === userId);
    },
    
    addUser(userData) {
        users.push(userData);
        this.saveToLocalStorage();
    },
    
    updateUser(userId, updatedData) {
        const index = users.findIndex(user => user.user_id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedData };
            this.saveToLocalStorage();
            return true;
        }
        return false;
    },
    
    deleteUser(userId) {
        const index = users.findIndex(user => user.user_id === userId);
        if (index !== -1) {
            users.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    },
    
    // Student Management
    getAllStudents() {
        return [...students];
    },
    
    getStudentById(userId) {
        return students.find(student => student.user_id === userId);
    },
    
    getStudentsByCoach(coachId) {
        return students.filter(student => student.coach_id === coachId);
    },
    
    addStudent(studentData) {
        students.push(studentData);
        this.saveToLocalStorage();
    },
    
    updateStudent(userId, updatedData) {
        const index = students.findIndex(student => student.user_id === userId);
        if (index !== -1) {
            students[index] = { ...students[index], ...updatedData };
            this.saveToLocalStorage();
            return true;
        }
        return false;
    },
    
    deleteStudent(userId) {
        const index = students.findIndex(student => student.user_id === userId);
        if (index !== -1) {
            students.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    },
    
    // Class Management
    getAllClasses() {
        return [...classes];
    },
    
    getClassById(classId) {
        return classes.find(cls => cls.class_id === classId);
    },
    
    getClassesByCoach(coachId) {
        return classes.filter(cls => cls.coach_id === coachId);
    },
    
    addClass(classData) {
        classes.push(classData);
        this.saveToLocalStorage();
    },
    
    updateClass(classId, updatedData) {
        const index = classes.findIndex(cls => cls.class_id === classId);
        if (index !== -1) {
            classes[index] = { ...classes[index], ...updatedData };
            this.saveToLocalStorage();
            return true;
        }
        return false;
    },
    
    deleteClass(classId) {
        const index = classes.findIndex(cls => cls.class_id === classId);
        if (index !== -1) {
            classes.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    },
    
    // Coach Statistics
    getCoachStats(coachId) {
        return coachStats.find(stat => stat.coach_id === coachId);
    },
    
    // Search and Filter
    searchUsers(query) {
        const lowercaseQuery = query.toLowerCase();
        return users.filter(user => 
            user.user_id.toLowerCase().includes(lowercaseQuery) ||
            user.user_name.toLowerCase().includes(lowercaseQuery) ||
            user.sport.toLowerCase().includes(lowercaseQuery) ||
            user.user_type.toLowerCase().includes(lowercaseQuery) ||
            (user.coach_college && user.coach_college.toLowerCase().includes(lowercaseQuery))
        );
    },
    
    filterUsersByType(userType) {
        return users.filter(user => user.user_type === userType);
    },
    
    // Local Storage Management
    saveToLocalStorage() {
        localStorage.setItem('vumpIT_users', JSON.stringify(users));
        localStorage.setItem('vumpIT_students', JSON.stringify(students));
        localStorage.setItem('vumpIT_classes', JSON.stringify(classes));
        localStorage.setItem('vumpIT_coachStats', JSON.stringify(coachStats));
    },
    
    loadFromLocalStorage() {
        const storedUsers = localStorage.getItem('vumpIT_users');
        const storedStudents = localStorage.getItem('vumpIT_students');
        const storedClasses = localStorage.getItem('vumpIT_classes');
        const storedCoachStats = localStorage.getItem('vumpIT_coachStats');
        
        if (storedUsers) {
            users.length = 0;
            users.push(...JSON.parse(storedUsers));
        }
        if (storedStudents) {
            students.length = 0;
            students.push(...JSON.parse(storedStudents));
        }
        if (storedClasses) {
            classes.length = 0;
            classes.push(...JSON.parse(storedClasses));
        }
        if (storedCoachStats) {
            coachStats.length = 0;
            coachStats.push(...JSON.parse(storedCoachStats));
        }
    },
    
    // Initialize data
    init() {
        this.loadFromLocalStorage();
    }
};

// Initialize the data store when the script loads
if (typeof window !== 'undefined') {
    DataStore.init();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataStore;
}