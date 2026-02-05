// js/app.js
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
    statistics: { render: renderStatisticsPage, init: initStatisticsPage },
};

async function renderPage(route) {
    const appEl = document.getElementById('app');
    const navbar = document.getElementById('navbar');
    const currentUserSpan = document.getElementById('currentUser');

    try {
        // Показать/скрыть меню
        if (isLoggedIn() && route !== 'login') {
            navbar.classList.remove('hidden');
            const user = getCurrentUser();
            currentUserSpan.textContent = user ? user.name : '';
        } else {
            navbar.classList.add('hidden');
            currentUserSpan.textContent = '';
        }

        const page = pages[route] || pages.login;

        // ВАЖНО: render() теперь может быть async → await
        const html = await page.render();
        appEl.innerHTML = html;

        // init() тоже может быть async → await
        if (page.init) await page.init();

        updateActiveNavLink();
    } catch (err) {
        console.error('Render error:', err);
        appEl.innerHTML = `
      <div class="card">
        <h2 class="card-title">Ошибка</h2>
        <p class="text-muted">Открой Console (F12) и пришли ошибку.</p>
        <pre style="white-space: pre-wrap;">${String(err?.stack || err)}</pre>
      </div>
    `;
    }
}

function init() {
    initializeData(); // теперь "пустышка" — ок
    initAuth();

    // logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
            navigate('login');
        });
    }

    // слушаем событие от router.js
    window.addEventListener('routechange', async (e) => {
        await renderPage(e.detail.route);
    });

    initRouter(); // сам вызовет navigate(initialRoute)
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
