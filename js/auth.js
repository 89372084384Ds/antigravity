// js/auth.js
// Authentication Module
// Храним ТОЛЬКО currentUser в localStorage (чтобы не логиниться заново после обновления)

import { getUserById } from './data.js';

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
    const user = getUserById(userId);
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

// Permissions
export function canInputWeeklyMetrics() {
    if (!currentUser) return false;
    return currentUser.name === 'Павел' || currentUser.name === 'Дарья';
}

export function canInputMonthlyMetrics() {
    if (!currentUser) return false;
    return currentUser.name === 'Венера';
}

export function canEvaluate() {
    if (!currentUser) return false;
    return currentUser.canEvaluate === true;
}

export function canSelfEvaluate() {
    if (!currentUser) return false;
    return currentUser.canSelfEvaluate === true;
}
