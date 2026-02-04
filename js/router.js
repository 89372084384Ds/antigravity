// Router Module
// Client-side routing

import { isLoggedIn } from './auth.js';

let currentRoute = '';

// Navigate to a route
export function navigate(route) {
    if (!isLoggedIn() && route !== 'login') {
        route = 'login';
    }

    currentRoute = route;
    window.location.hash = route;

    // Dispatch route change event
    window.dispatchEvent(new CustomEvent('routechange', { detail: { route } }));
}

// Get current route
export function getCurrentRoute() {
    return currentRoute || window.location.hash.slice(1) || 'login';
}

// Initialize router
export function initRouter() {
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const route = window.location.hash.slice(1) || 'login';
        navigate(route);
    });

    // Handle initial route
    const initialRoute = window.location.hash.slice(1) || 'login';
    navigate(initialRoute);
}

// Update active nav link
export function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentRoute = getCurrentRoute();

    navLinks.forEach(link => {
        const href = link.getAttribute('href').slice(1);
        if (href === currentRoute) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
