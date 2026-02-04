// Data Management Module
// Handles all data operations using LocalStorage

// Initialize users
export const USERS = [
    { id: 1, name: 'Мика', role: 'sales', canEvaluate: false, canSelfEvaluate: false },
    { id: 2, name: 'Павел', role: 'sales', canEvaluate: true, canSelfEvaluate: true },
    { id: 3, name: 'Аймен', role: 'sales', canEvaluate: false, canSelfEvaluate: false },
    { id: 4, name: 'Дарья', role: 'GTM', canEvaluate: true, canSelfEvaluate: true },
    { id: 5, name: 'Андрей', role: 'director', canEvaluate: true, canSelfEvaluate: true },
    { id: 6, name: 'Венера', role: 'finance_director', canEvaluate: true, canSelfEvaluate: true }
];

// Initialize data if not exists
export function initializeData() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(USERS));
    }
    if (!localStorage.getItem('weeklyMetrics')) {
        localStorage.setItem('weeklyMetrics', JSON.stringify([]));
    }
    if (!localStorage.getItem('monthlyMetrics')) {
        localStorage.setItem('monthlyMetrics', JSON.stringify([]));
    }
    if (!localStorage.getItem('engagementRatings')) {
        localStorage.setItem('engagementRatings', JSON.stringify([]));
    }
}

// Get all users
export function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Get user by ID
export function getUserById(id) {
    const users = getUsers();
    return users.find(u => u.id === id);
}

// ===== Weekly Metrics =====
export function getWeeklyMetrics() {
    return JSON.parse(localStorage.getItem('weeklyMetrics') || '[]');
}

export function getWeeklyMetricByDate(weekStartDate) {
    const metrics = getWeeklyMetrics();
    return metrics.find(m => m.weekStartDate === weekStartDate);
}

export function saveWeeklyMetric(metric) {
    const metrics = getWeeklyMetrics();
    const existingIndex = metrics.findIndex(m => m.weekStartDate === metric.weekStartDate);
    
    if (existingIndex >= 0) {
        metrics[existingIndex] = { ...metrics[existingIndex], ...metric };
    } else {
        metric.id = Date.now();
        metrics.push(metric);
    }
    
    localStorage.setItem('weeklyMetrics', JSON.stringify(metrics));
    return metric;
}

// ===== Monthly Metrics =====
export function getMonthlyMetrics() {
    return JSON.parse(localStorage.getItem('monthlyMetrics') || '[]');
}

export function getMonthlyMetricByDate(monthDate) {
    const metrics = getMonthlyMetrics();
    return metrics.find(m => m.monthDate === monthDate);
}

export function saveMonthlyMetric(metric) {
    const metrics = getMonthlyMetrics();
    const existingIndex = metrics.findIndex(m => m.monthDate === metric.monthDate);
    
    // Auto-calculate fields
    if (metric.tonsCount && metric.dealsCount && metric.dealsCount > 0) {
        metric.tonsPerDeal = parseFloat((metric.tonsCount / metric.dealsCount).toFixed(2));
    }
    if (metric.mp && metric.dealsCount && metric.dealsCount > 0) {
        metric.mpPerDeal = parseFloat((metric.mp / metric.dealsCount).toFixed(2));
    }
    
    if (existingIndex >= 0) {
        metrics[existingIndex] = { ...metrics[existingIndex], ...metric };
    } else {
        metric.id = Date.now();
        metrics.push(metric);
    }
    
    localStorage.setItem('monthlyMetrics', JSON.stringify(metrics));
    return metric;
}

// ===== Engagement Ratings =====
export function getEngagementRatings() {
    return JSON.parse(localStorage.getItem('engagementRatings') || '[]');
}

export function getRatingsByWeek(weekStartDate) {
    const ratings = getEngagementRatings();
    return ratings.filter(r => r.weekStartDate === weekStartDate);
}

export function getRating(weekStartDate, evaluatorId, evaluatedId) {
    const ratings = getEngagementRatings();
    return ratings.find(r => 
        r.weekStartDate === weekStartDate && 
        r.evaluatorId === evaluatorId && 
        r.evaluatedId === evaluatedId
    );
}

export function saveRating(rating) {
    const ratings = getEngagementRatings();
    const existingIndex = ratings.findIndex(r => 
        r.weekStartDate === rating.weekStartDate && 
        r.evaluatorId === rating.evaluatorId && 
        r.evaluatedId === rating.evaluatedId
    );
    
    if (existingIndex >= 0) {
        ratings[existingIndex] = rating;
    } else {
        rating.id = Date.now() + Math.random();
        ratings.push(rating);
    }
    
    localStorage.setItem('engagementRatings', JSON.stringify(ratings));
    return rating;
}

// Get engagement summary for a week
export function getEngagementSummary(weekStartDate) {
    const ratings = getRatingsByWeek(weekStartDate);
    const users = getUsers();
    const summary = [];
    
    users.forEach(user => {
        const userRatings = ratings.filter(r => r.evaluatedId === user.id);
        const ratingsReceived = userRatings.length;
        
        // Expected ratings: 4 from evaluators + 1 self (if can self-evaluate)
        const expectedRatings = user.canSelfEvaluate ? 5 : 4;
        const ratingsMissing = expectedRatings - ratingsReceived;
        
        const averageRating = ratingsReceived > 0
            ? userRatings.reduce((sum, r) => sum + r.rating, 0) / ratingsReceived
            : 0;
        
        summary.push({
            userId: user.id,
            userName: user.name,
            averageRating: parseFloat(averageRating.toFixed(2)),
            ratingsReceived,
            ratingsMissing: Math.max(0, ratingsMissing),
            expectedRatings
        });
    });
    
    return summary;
}

// Get total missing ratings for a week
export function getTotalMissingRatings(weekStartDate) {
    const summary = getEngagementSummary(weekStartDate);
    return summary.reduce((sum, s) => sum + s.ratingsMissing, 0);
}

// ===== Utility Functions =====

// Get start of current week (Monday)
export function getCurrentWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
}

// Get current month
export function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Format date for display
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Format month for display
export function formatMonth(monthString) {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long' 
    });
}

// Get list of weeks for dropdown
export function getWeeksList(count = 12) {
    const weeks = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7));
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(weekStart.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        weeks.push(monday.toISOString().split('T')[0]);
    }
    
    return weeks;
}

// Get list of months for dropdown
export function getMonthsList(count = 12) {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`);
    }
    
    return months;
}

// Export all data as JSON
export function exportData() {
    return {
        users: getUsers(),
        weeklyMetrics: getWeeklyMetrics(),
        monthlyMetrics: getMonthlyMetrics(),
        engagementRatings: getEngagementRatings(),
        exportDate: new Date().toISOString()
    };
}

// Clear all data (for testing)
export function clearAllData() {
    localStorage.removeItem('weeklyMetrics');
    localStorage.removeItem('monthlyMetrics');
    localStorage.removeItem('engagementRatings');
    initializeData();
}
