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
        coach_college: "College of Engineering",
        gender: "Male",
        password: "coach123"
    },
    {
        user_id: "12345",
        user_name: "John Doe",
        user_type: "coach",
        coach_id: "12345",
        coach_name: "John Doe",
        sport: "Football",
        coach_college: "College of Engineering",
        gender: "Male",
        password: "coach123"
    },
    {
        user_id: "67890",
        user_name: "Jane Smith",
        user_type: "admin",
        sport: "Tennis",
        coach_college: "College of Arts and Sciences",
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
        coach_college: "College of Teacher Education",
        gender: "Female",
        password: "coach123"
    },
    {
        user_id: "44556",
        user_name: "Bob Brown",
        user_type: "admin",
        sport: "Swimming",
        coach_college: "College of Business",
        gender: "Male",
        password: "admin123"
    }
];

// Students Database - ENHANCED WITH ALL FIELDS AND HISTORICAL DATA
const students = [
    {
        user_id: "STU001",
        student_name: "Michael Chen",
        user_type: "student",
        gender: "Male",
        sport: "Basketball",
        user_college: "College of Engineering",
        course: "Computer Science",
        year: "II",
        section: "A",
        class_list: ["Basketball-101", "Basketball-Advanced"],
        coach_id: "coach",
        
        // BMI Statistics - Current
        current_weight: 75,
        current_height: 180,
        current_bmi: 23.1,
        current_bmi_rating: "Normal",
        updated_bmi_date: "2025-10-23",
        
        // BMI History
        bmi_history: [
            { date: "2025-10-19", weight: 76, height: 180, bmi: 23.5, rating: "Normal" },
            { date: "2025-10-20", weight: 75.5, height: 180, bmi: 23.3, rating: "Normal" },
            { date: "2025-10-21", weight: 75.8, height: 180, bmi: 23.4, rating: "Normal" },
            { date: "2025-10-22", weight: 75.2, height: 180, bmi: 23.2, rating: "Normal" },
            { date: "2025-10-23", weight: 75, height: 180, bmi: 23.1, rating: "Normal" }
        ],
        
        // Jump Height Statistics - Current
        current_standing_reach: 230,
        current_jump_reach: 280,
        current_jump_height: 50,
        current_vertical_jump: 45,
        current_jump_rating: "Good",
        updated_jump_date: "2025-10-23",
        
        // Jump History
        jump_history: [
            { date: "2025-10-19", standing_reach: 230, jump_reach: 275, jump_height: 45, vertical_jump: 42, rating: "Average" },
            { date: "2025-10-20", standing_reach: 230, jump_reach: 277, jump_height: 47, vertical_jump: 43, rating: "Good" },
            { date: "2025-10-21", standing_reach: 230, jump_reach: 278, jump_height: 48, vertical_jump: 44, rating: "Good" },
            { date: "2025-10-22", standing_reach: 230, jump_reach: 279, jump_height: 49, vertical_jump: 44, rating: "Good" },
            { date: "2025-10-23", standing_reach: 230, jump_reach: 280, jump_height: 50, vertical_jump: 45, rating: "Good" }
        ],
        
        // Training Recommendations
        training_focus: "Strength and conditioning, vertical jump training",
        plyometric: "Box jumps, depth jumps, single-leg hops",
        recovery: "8 hours sleep, proper hydration, stretching routine",
        remarks: "Showing consistent improvement in vertical jump"
    },
    {
        user_id: "STU002",
        student_name: "Sarah Williams",
        user_type: "student",
        gender: "Female",
        sport: "Basketball",
        user_college: "College of Engineering",
        course: "Computer Science",
        year: "II",
        section: "A",
        class_list: ["Basketball-101"],
        coach_id: "coach",
        
        current_weight: 58,
        current_height: 165,
        current_bmi: 21.3,
        current_bmi_rating: "Normal",
        updated_bmi_date: "2025-10-23",
        
        bmi_history: [
            { date: "2025-10-19", weight: 58.5, height: 165, bmi: 21.5, rating: "Normal" },
            { date: "2025-10-20", weight: 58.3, height: 165, bmi: 21.4, rating: "Normal" },
            { date: "2025-10-21", weight: 58.2, height: 165, bmi: 21.4, rating: "Normal" },
            { date: "2025-10-22", weight: 58.1, height: 165, bmi: 21.3, rating: "Normal" },
            { date: "2025-10-23", weight: 58, height: 165, bmi: 21.3, rating: "Normal" }
        ],
        
        current_standing_reach: 210,
        current_jump_reach: 250,
        current_jump_height: 40,
        current_vertical_jump: 38,
        current_jump_rating: "Average",
        updated_jump_date: "2025-10-23",
        
        jump_history: [
            { date: "2025-10-19", standing_reach: 210, jump_reach: 246, jump_height: 36, vertical_jump: 34, rating: "Below Average" },
            { date: "2025-10-20", standing_reach: 210, jump_reach: 247, jump_height: 37, vertical_jump: 35, rating: "Below Average" },
            { date: "2025-10-21", standing_reach: 210, jump_reach: 248, jump_height: 38, vertical_jump: 36, rating: "Average" },
            { date: "2025-10-22", standing_reach: 210, jump_reach: 249, jump_height: 39, vertical_jump: 37, rating: "Average" },
            { date: "2025-10-23", standing_reach: 210, jump_reach: 250, jump_height: 40, vertical_jump: 38, rating: "Average" }
        ],
        
        training_focus: "Agility and speed work",
        plyometric: "Lateral bounds, hurdle hops",
        recovery: "Active recovery sessions, foam rolling",
        remarks: "Focus on explosive power development"
    },
    {
        user_id: "STU003",
        student_name: "David Martinez",
        user_type: "athlete",
        gender: "Male",
        sport: "Basketball",
        user_college: "College of Engineering",
        course: "Electrical Engineering",
        year: "III",
        section: "B",
        coach_id: "coach",
        
        current_weight: 82,
        current_height: 188,
        current_bmi: 23.2,
        current_bmi_rating: "Normal",
        updated_bmi_date: "2025-10-23",
        
        bmi_history: [
            { date: "2025-10-19", weight: 82.5, height: 188, bmi: 23.3, rating: "Normal" },
            { date: "2025-10-20", weight: 82.3, height: 188, bmi: 23.3, rating: "Normal" },
            { date: "2025-10-21", weight: 82.4, height: 188, bmi: 23.3, rating: "Normal" },
            { date: "2025-10-22", weight: 82.1, height: 188, bmi: 23.2, rating: "Normal" },
            { date: "2025-10-23", weight: 82, height: 188, bmi: 23.2, rating: "Normal" }
        ],
        
        current_standing_reach: 245,
        current_jump_reach: 305,
        current_jump_height: 60,
        current_vertical_jump: 55,
        current_jump_rating: "Excellent",
        updated_jump_date: "2025-10-23",
        
        jump_history: [
            { date: "2025-10-19", standing_reach: 245, jump_reach: 301, jump_height: 56, vertical_jump: 51, rating: "Excellent" },
            { date: "2025-10-20", standing_reach: 245, jump_reach: 302, jump_height: 57, vertical_jump: 52, rating: "Excellent" },
            { date: "2025-10-21", standing_reach: 245, jump_reach: 303, jump_height: 58, vertical_jump: 53, rating: "Excellent" },
            { date: "2025-10-22", standing_reach: 245, jump_reach: 304, jump_height: 59, vertical_jump: 54, rating: "Excellent" },
            { date: "2025-10-23", standing_reach: 245, jump_reach: 305, jump_height: 60, vertical_jump: 55, rating: "Excellent" }
        ],
        
        training_focus: "Maintain current performance, focus on endurance",
        plyometric: "Advanced plyometric circuits, reactive jumps",
        recovery: "Ice baths, massage therapy, adequate rest",
        remarks: "Elite athlete showing exceptional performance"
    },
    {
        user_id: "STU004",
        student_name: "Emily Johnson",
        user_type: "athlete",
        gender: "Female",
        sport: "Basketball",
        user_college: "College of Engineering",
        course: "Computer Science",
        year: "II",
        section: "A",
        coach_id: "coach",
        
        current_weight: 62,
        current_height: 170,
        current_bmi: 21.5,
        current_bmi_rating: "Normal",
        updated_bmi_date: "2025-10-23",
        
        bmi_history: [
            { date: "2025-10-19", weight: 62.5, height: 170, bmi: 21.6, rating: "Normal" },
            { date: "2025-10-20", weight: 62.4, height: 170, bmi: 21.6, rating: "Normal" },
            { date: "2025-10-21", weight: 62.2, height: 170, bmi: 21.5, rating: "Normal" },
            { date: "2025-10-22", weight: 62.1, height: 170, bmi: 21.5, rating: "Normal" },
            { date: "2025-10-23", weight: 62, height: 170, bmi: 21.5, rating: "Normal" }
        ],
        
        current_standing_reach: 215,
        current_jump_reach: 260,
        current_jump_height: 45,
        current_vertical_jump: 42,
        current_jump_rating: "Good",
        updated_jump_date: "2025-10-23",
        
        jump_history: [
            { date: "2025-10-19", standing_reach: 215, jump_reach: 256, jump_height: 41, vertical_jump: 38, rating: "Average" },
            { date: "2025-10-20", standing_reach: 215, jump_reach: 257, jump_height: 42, vertical_jump: 39, rating: "Average" },
            { date: "2025-10-21", standing_reach: 215, jump_reach: 258, jump_height: 43, vertical_jump: 40, rating: "Good" },
            { date: "2025-10-22", standing_reach: 215, jump_reach: 259, jump_height: 44, vertical_jump: 41, rating: "Good" },
            { date: "2025-10-23", standing_reach: 215, jump_reach: 260, jump_height: 45, vertical_jump: 42, rating: "Good" }
        ],
        
        training_focus: "Core strength and stability work",
        plyometric: "Squat jumps, tuck jumps, bounding exercises",
        recovery: "Yoga sessions, proper nutrition, sleep tracking",
        remarks: "Strong fundamentals, consistent training attendance"
    },
    {
        user_id: "STU005",
        student_name: "James Rodriguez",
        user_type: "student",
        gender: "Male",
        sport: "Basketball",
        user_college: "College of Engineering",
        course: "Computer Science",
        year: "II",
        section: "A",
        coach_id: "coach",
        
        current_weight: 78,
        current_height: 182,
        current_bmi: 23.5,
        current_bmi_rating: "Normal",
        updated_bmi_date: "2025-10-23",
        
        bmi_history: [
            { date: "2025-10-19", weight: 79, height: 182, bmi: 23.8, rating: "Normal" },
            { date: "2025-10-20", weight: 78.7, height: 182, bmi: 23.7, rating: "Normal" },
            { date: "2025-10-21", weight: 78.5, height: 182, bmi: 23.7, rating: "Normal" },
            { date: "2025-10-22", weight: 78.2, height: 182, bmi: 23.6, rating: "Normal" },
            { date: "2025-10-23", weight: 78, height: 182, bmi: 23.5, rating: "Normal" }
        ],
        
        current_standing_reach: 235,
        current_jump_reach: 275,
        current_jump_height: 40,
        current_vertical_jump: 38,
        current_jump_rating: "Average",
        updated_jump_date: "2025-10-23",
        
        jump_history: [
            { date: "2025-10-19", standing_reach: 235, jump_reach: 271, jump_height: 36, vertical_jump: 34, rating: "Below Average" },
            { date: "2025-10-20", standing_reach: 235, jump_reach: 272, jump_height: 37, vertical_jump: 35, rating: "Below Average" },
            { date: "2025-10-21", standing_reach: 235, jump_reach: 273, jump_height: 38, vertical_jump: 36, rating: "Average" },
            { date: "2025-10-22", standing_reach: 235, jump_reach: 274, jump_height: 39, vertical_jump: 37, rating: "Average" },
            { date: "2025-10-23", standing_reach: 235, jump_reach: 275, jump_height: 40, vertical_jump: 38, rating: "Average" }
        ],
        
        training_focus: "Lower body strength development",
        plyometric: "Box jumps, jump squats, lunge jumps",
        recovery: "Stretching routine, proper warm-up/cool-down",
        remarks: "Needs to focus on explosive power training"
    },
    {
        user_id: "STU006",
        student_name: "Sophia Lee",
        user_type: "student",
        gender: "Female",
        sport: "Basketball",
        user_college: "College of Engineering",
        course: "Mechanical Engineering",
        year: "I",
        section: "C",
        coach_id: "coach",
        
        current_weight: 55,
        current_height: 163,
        current_bmi: 20.7,
        current_bmi_rating: "Normal",
        updated_bmi_date: "2025-10-23",
        
        bmi_history: [
            { date: "2025-10-19", weight: 55.5, height: 163, bmi: 20.9, rating: "Normal" },
            { date: "2025-10-20", weight: 55.3, height: 163, bmi: 20.8, rating: "Normal" },
            { date: "2025-10-21", weight: 55.2, height: 163, bmi: 20.8, rating: "Normal" },
            { date: "2025-10-22", weight: 55.1, height: 163, bmi: 20.7, rating: "Normal" },
            { date: "2025-10-23", weight: 55, height: 163, bmi: 20.7, rating: "Normal" }
        ],
        
        current_standing_reach: 205,
        current_jump_reach: 240,
        current_jump_height: 35,
        current_vertical_jump: 32,
        current_jump_rating: "Below Average",
        updated_jump_date: "2025-10-23",
        
        jump_history: [
            { date: "2025-10-19", standing_reach: 205, jump_reach: 236, jump_height: 31, vertical_jump: 28, rating: "Poor" },
            { date: "2025-10-20", standing_reach: 205, jump_reach: 237, jump_height: 32, vertical_jump: 29, rating: "Poor" },
            { date: "2025-10-21", standing_reach: 205, jump_reach: 238, jump_height: 33, vertical_jump: 30, rating: "Below Average" },
            { date: "2025-10-22", standing_reach: 205, jump_reach: 239, jump_height: 34, vertical_jump: 31, rating: "Below Average" },
            { date: "2025-10-23", standing_reach: 205, jump_reach: 240, jump_height: 35, vertical_jump: 32, rating: "Below Average" }
        ],
        
        training_focus: "Build foundational strength, technique development",
        plyometric: "Basic jumps, ankle hops, skip jumps",
        recovery: "Focus on proper form, gradual progression",
        remarks: "New to training program, showing good potential"
    },
    {
        user_id: "STU007",
        student_name: "Daniel Kim",
        user_type: "athlete",
        gender: "Male",
        sport: "Basketball",
        user_college: "College of Engineering",
        course: "Civil Engineering",
        year: "IV",
        section: "A",
        coach_id: "coach",
        
        current_weight: 85,
        current_height: 190,
        current_bmi: 23.5,
        current_bmi_rating: "Normal",
        updated_bmi_date: "2025-10-23",
        
        bmi_history: [
            { date: "2025-10-19", weight: 85.5, height: 190, bmi: 23.7, rating: "Normal" },
            { date: "2025-10-20", weight: 85.3, height: 190, bmi: 23.6, rating: "Normal" },
            { date: "2025-10-21", weight: 85.2, height: 190, bmi: 23.6, rating: "Normal" },
            { date: "2025-10-22", weight: 85.1, height: 190, bmi: 23.6, rating: "Normal" },
            { date: "2025-10-23", weight: 85, height: 190, bmi: 23.5, rating: "Normal" }
        ],
        
        current_standing_reach: 250,
        current_jump_reach: 310,
        current_jump_height: 60,
        current_vertical_jump: 58,
        current_jump_rating: "Excellent",
        updated_jump_date: "2025-10-23",
        
        jump_history: [
            { date: "2025-10-19", standing_reach: 250, jump_reach: 306, jump_height: 56, vertical_jump: 54, rating: "Excellent" },
            { date: "2025-10-20", standing_reach: 250, jump_reach: 307, jump_height: 57, vertical_jump: 55, rating: "Excellent" },
            { date: "2025-10-21", standing_reach: 250, jump_reach: 308, jump_height: 58, vertical_jump: 56, rating: "Excellent" },
            { date: "2025-10-22", standing_reach: 250, jump_reach: 309, jump_height: 59, vertical_jump: 57, rating: "Excellent" },
            { date: "2025-10-23", standing_reach: 250, jump_reach: 310, jump_height: 60, vertical_jump: 58, rating: "Excellent" }
        ],
        
        training_focus: "Maintain peak performance, injury prevention",
        plyometric: "Advanced reactive training, contrast training",
        recovery: "Regular physiotherapy, active recovery, nutrition optimization",
        remarks: "Senior athlete, team leader, excellent work ethic"
    },
    {
        user_id: "STU008",
        student_name: "Isabella Garcia",
        user_type: "student",
        gender: "Female",
        sport: "Basketball",
        user_college: "College of Engineering",
        course: "Computer Science",
        year: "II",
        section: "A",
        coach_id: "coach",
        
        current_weight: 60,
        current_height: 168,
        current_bmi: 21.3,
        current_bmi_rating: "Normal",
        updated_bmi_date: "2025-10-23",
        
        bmi_history: [
            { date: "2025-10-19", weight: 60.5, height: 168, bmi: 21.4, rating: "Normal" },
            { date: "2025-10-20", weight: 60.3, height: 168, bmi: 21.4, rating: "Normal" },
            { date: "2025-10-21", weight: 60.2, height: 168, bmi: 21.3, rating: "Normal" },
            { date: "2025-10-22", weight: 60.1, height: 168, bmi: 21.3, rating: "Normal" },
            { date: "2025-10-23", weight: 60, height: 168, bmi: 21.3, rating: "Normal" }
        ],
        
        current_standing_reach: 212,
        current_jump_reach: 252,
        current_jump_height: 40,
        current_vertical_jump: 38,
        current_jump_rating: "Average",
        updated_jump_date: "2025-10-23",
        
        jump_history: [
            { date: "2025-10-19", standing_reach: 212, jump_reach: 248, jump_height: 36, vertical_jump: 34, rating: "Below Average" },
            { date: "2025-10-20", standing_reach: 212, jump_reach: 249, jump_height: 37, vertical_jump: 35, rating: "Below Average" },
            { date: "2025-10-21", standing_reach: 212, jump_reach: 250, jump_height: 38, vertical_jump: 36, rating: "Average" },
            { date: "2025-10-22", standing_reach: 212, jump_reach: 251, jump_height: 39, vertical_jump: 37, rating: "Average" },
            { date: "2025-10-23", standing_reach: 212, jump_reach: 252, jump_height: 40, vertical_jump: 38, rating: "Average" }
        ],
        
        training_focus: "Speed and agility training, coordination work",
        plyometric: "Lateral jumps, multi-directional bounds",
        recovery: "Dynamic stretching, mobility work",
        remarks: "Good technique, needs more consistency in training"
    }
];

// Classes Database
const classes = [
    {
        class_id: "CLS001",
        class_name: "Basketball Fundamentals",
        coach_id: "coach",
        coach_name: "coach",
        user_college: "College of Engineering",
        course: "Computer Science",
        year: "II",
        section: "A",
        total_students: 5,
        total_all_students: 5
    },
    {
        class_id: "CLS002",
        class_name: "Advanced Basketball",
        coach_id: "coach",
        coach_name: "coach",
        user_college: "College of Engineering",
        course: "Electrical Engineering",
        year: "III",
        section: "B",
        total_students: 1,
        total_all_students: 1
    },
    {
        class_id: "CLS003",
        class_name: "Basketball Techniques",
        coach_id: "coach",
        coach_name: "coach",
        user_college: "College of Engineering",
        course: "Mechanical Engineering",
        year: "I",
        section: "C",
        total_students: 1,
        total_all_students: 1
    }
];

// Coach Statistics
const coachStats = [
    {
        coach_id: "coach",
        sport: "Basketball",
        total_class: 3,
        total_students: 8,
        total_athletes: 3,
        total_all_students: 8
    },
    {
        coach_id: "12345",
        sport: "Basketball",
        total_class: 0,
        total_students: 0,
        total_athletes: 0,
        total_all_students: 0
    },
    {
        coach_id: "11223",
        sport: "Soccer",
        total_class: 0,
        total_students: 0,
        total_athletes: 0,
        total_all_students: 0
    }
];

// Helper function to generate unique IDs
function generateId(prefix, array, idField) {
    let maxNum = 0;
    array.forEach(item => {
        const id = item[idField];
        if (id && id.startsWith(prefix)) {
            const num = parseInt(id.substring(prefix.length));
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
    });
    return prefix + String(maxNum + 1).padStart(3, '0');
}

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
        // Initialize history arrays if not present
        if (!studentData.bmi_history) {
            studentData.bmi_history = [];
        }
        if (!studentData.jump_history) {
            studentData.jump_history = [];
        }
        
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
        const classId = generateId('CLS', classes, 'class_id');
        const newClass = {
            class_id: classId,
            ...classData,
            total_students: 0,
            total_all_students: 0
        };
        classes.push(newClass);
        this.saveToLocalStorage();
        return newClass;
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