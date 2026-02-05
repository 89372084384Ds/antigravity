// Main Application Entry Point

import { initializeData } from './data.js';
import { initAuth, getCurrentUser, logout, isLoggedIn } from './auth.js';
import { initRouter, navigate, updateActiveNavLink } from './router.js';
import { renderLoginPage, initLoginPage } from './pages/login.js';
import { renderDashboardPage, initDashboardPage } from './pages/dashboard.js';
import { renderWeeklyPage, initWeeklyPage } from './pages/weekly.js';
import { renderMonthlyPage, initMonthlyPage } from './pages/monthly.js';
import { renderEngagementPage, initEngagementPage } from './pages/engagement.js';
import { renderStatisticsPage, initStatisticsPage } from './pages/statistics.js';

// Page registry
const pages = {
    login: { render: renderLoginPage, init: initLoginPage },
    dashboard: { render: renderDashboardPage, init: initDashboardPage },
    weekly: { render: renderWeeklyPage, init: initWeeklyPage },
    monthly: { render: renderMonthlyPage, init: initMonthlyPage },
    engagement: { render: renderEngagementPage, init: initEngagementPage },
    statistics: { render: renderStatisticsPage, init: initStatisticsPage }
};

// Render current page
async function renderPage(route) {

    const app = document.getElementById('app');
    const navbar = document.getElementById('navbar');
    const currentUserSpan = document.getElementById('currentUser');

    // Show/hide navbar based on login status
    if (isLoggedIn() && route !== 'login') {
        navbar.classList.remove('hidden');
        const user = getCurrentUser();
        currentUserSpan.textContent = user.name;
    } else {
        navbar.classList.add('hidden');
    }

    // Render page
    const page = pages[route] || pages.login;
    app.innerHTML = await page.render();
    await page.init();


    // Update active nav link
    updateActiveNavLink();
}

// Initialize app
function init() {
    // Initialize data and auth
    initializeData();
    initAuth();

    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        logout();
        navigate('login');
    });

    // Listen for route changes
    window.addEventListener('routechange', async (e) => {
        await renderPage(e.detail.route);
    });


    // Initialize router
    initRouter();
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
