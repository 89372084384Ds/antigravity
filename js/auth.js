// Authentication Module
// Simple authentication using localStorage

let currentUser = null;

// Initialize auth
export function initAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
}

// Login user
export function login(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    return false;
}

// Logout user
export function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Check if user is logged in
export function isLoggedIn() {
    return currentUser !== null;
}

// Check if current user can input weekly metrics (Pavel or Darya)
export function canInputWeeklyMetrics() {
    if (!currentUser) return false;
    return currentUser.name === 'Павел' || currentUser.name === 'Дарья';
}

// Check if current user can input monthly metrics (Venera only)
export function canInputMonthlyMetrics() {
    if (!currentUser) return false;
    return currentUser.name === 'Венера';
}

// Check if current user can evaluate engagement
export function canEvaluate() {
    if (!currentUser) return false;
    return currentUser.canEvaluate === true;
}

// Check if current user can self-evaluate
export function canSelfEvaluate() {
    if (!currentUser) return false;
    return currentUser.canSelfEvaluate === true;
}
