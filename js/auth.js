// Authentication Module
// Логин сохраняем в localStorage (это НЕ данные метрик, это только "кто вошёл")

import { getUsers, getUserById } from './data.js';

let currentUser = null;

// Initialize auth
export function initAuth() {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
        const id = Number(savedUserId);
        const user = getUserById(id);
        if (user) currentUser = user;
    }
}

// Login user
export function login(userId) {
    const user = getUserById(Number(userId));
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUserId', String(user.id));
        return true;
    }
    return false;
}

// Logout user
export function logout() {
    currentUser = null;
    localStorage.removeItem('currentUserId');
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Check if user is logged in
export function isLoggedIn() {
    return currentUser !== null;
}

// Weekly metrics can input (Павел или Дарья)
export function canInputWeeklyMetrics() {
    if (!currentUser) return false;
    return currentUser.name === 'Павел' || currentUser.name === 'Дарья';
}

// Monthly metrics (Венера)
export function canInputMonthlyMetrics() {
    if (!currentUser) return false;
    return currentUser.name === 'Венера';
}

// Engagement evaluate
export function canEvaluate() {
    if (!currentUser) return false;
    return currentUser.canEvaluate === true;
}

// Self evaluate
export function canSelfEvaluate() {
    if (!currentUser) return false;
    return currentUser.canSelfEvaluate === true;
}
