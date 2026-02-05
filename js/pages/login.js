// Login Page

import { login } from '../auth.js';
import { navigate } from '../router.js';
import { getUsers } from '../data.js';

export function renderLoginPage() {
    const users = getUsers();

    return `
        <div class="login-container">
            <div class="card login-card fade-in">
                <h1 class="login-title">Вход в систему</h1>
                <p class="text-center text-muted mb-4">Выберите ваше имя для входа</p>
                
                <div class="user-grid">
                    ${users.map(user => `
                        <button class="user-btn" data-user-id="${user.id}">
                            ${user.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

export function initLoginPage() {
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".user-btn");
        if (!btn) return;

        const userId = Number(btn.getAttribute("data-user-id"));
        if (!userId) return;

        const ok = login(userId);
        if (ok) {
            navigate("dashboard");
        }
    });
}
