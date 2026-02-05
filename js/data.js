// js/data.js
import { db } from "./firebase.js";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== USERS (оставляем в коде, НЕ в базе) =====
export const USERS = [
    { id: 1, name: "Мика", role: "sales", canEvaluate: false, canSelfEvaluate: false },
    { id: 2, name: "Павел", role: "sales", canEvaluate: true, canSelfEvaluate: true },
    { id: 3, name: "Аймен", role: "sales", canEvaluate: false, canSelfEvaluate: false },
    { id: 4, name: "Дарья", role: "GTM", canEvaluate: true, canSelfEvaluate: true },
    { id: 5, name: "Андрей", role: "director", canEvaluate: true, canSelfEvaluate: true },
    { id: 6, name: "Венера", role: "finance_director", canEvaluate: true, canSelfEvaluate: true }
];

const ENGAGEMENT_COLLECTION = "engagementRatings";

// ===== Базовые функции пользователей =====
export function getUsers() {
    return USERS;
}

export function getUserById(id) {
    return USERS.find(u => u.id === id);
}

// ===== Engagement Ratings (ТОЛЬКО FIREBASE) =====

// Генерим ID документа, чтобы 1 оценка не дублировалась
function ratingDocId(weekStartDate, evaluatorId, evaluatedId) {
    return `${weekStartDate}_${evaluatorId}_${evaluatedId}`;
}

// Получить все оценки за неделю (из Firebase)
export async function getRatingsByWeek(weekStartDate) {
    const q = query(
        collection(db, ENGAGEMENT_COLLECTION),
        where("weekStartDate", "==", weekStartDate)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Получить одну оценку (из Firebase)
export async function getRating(weekStartDate, evaluatorId, evaluatedId) {
    const id = ratingDocId(weekStartDate, evaluatorId, evaluatedId);
    const ref = doc(db, ENGAGEMENT_COLLECTION, id);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Сохранить/обновить оценку (в Firebase)
export async function saveRating(rating) {
    const id = ratingDocId(rating.weekStartDate, rating.evaluatorId, rating.evaluatedId);
    const ref = doc(db, ENGAGEMENT_COLLECTION, id);

    await setDoc(ref, {
        weekStartDate: rating.weekStartDate,
        evaluatorId: rating.evaluatorId,
        evaluatedId: rating.evaluatedId,
        rating: Number(rating.rating),
        updatedAt: serverTimestamp()
    }, { merge: true });

    return { ...rating, id };
}

// Посчитать summary за неделю (берем все оценки из Firebase и считаем средние)
export async function getEngagementSummary(weekStartDate) {
    const ratings = await getRatingsByWeek(weekStartDate);
    const users = getUsers();
    const summary = [];

    users.forEach(user => {
        const userRatings = ratings.filter(r => Number(r.evaluatedId) === user.id);
        const ratingsReceived = userRatings.length;

        // ожидаем 4 оценки + 1 самооценка (если разрешена)
        const expectedRatings = user.canSelfEvaluate ? 5 : 4;
        const ratingsMissing = expectedRatings - ratingsReceived;

        const averageRating = ratingsReceived > 0
            ? userRatings.reduce((sum, r) => sum + Number(r.rating || 0), 0) / ratingsReceived
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

export async function getTotalMissingRatings(weekStartDate) {
    const summary = await getEngagementSummary(weekStartDate);
    return summary.reduce((sum, s) => sum + s.ratingsMissing, 0);
}

// ===== Utility Functions (оставляем как есть) =====

export function getCurrentWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split("T")[0];
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

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
        weeks.push(monday.toISOString().split("T")[0]);
    }
    return weeks;
}
// =======================
// Monthly helpers (нужно для dashboard/monthly)
// =======================
export function formatMonth(monthString) {
    const [year, month] = monthString.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("ru-RU", { year: "numeric", month: "long" });
}

// =======================
// Weekly Metrics (Firebase)
// =======================
const WEEKLY_COLLECTION = "weeklyMetrics";

export async function getWeeklyMetrics() {
    const snap = await getDocs(collection(db, WEEKLY_COLLECTION));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getWeeklyMetricByDate(weekStartDate) {
    const ref = doc(db, WEEKLY_COLLECTION, String(weekStartDate));
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveWeeklyMetric(metric) {
    // Документ = неделя (чтобы не плодить дубли)
    const id = String(metric.weekStartDate);
    const ref = doc(db, WEEKLY_COLLECTION, id);

    await setDoc(ref, { ...metric, updatedAt: serverTimestamp() }, { merge: true });
    return { ...metric, id };
}

// =======================
// Monthly Metrics (Firebase)
// =======================
const MONTHLY_COLLECTION = "monthlyMetrics";

export async function getMonthlyMetrics() {
    const snap = await getDocs(collection(db, MONTHLY_COLLECTION));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getMonthlyMetricByDate(monthDate) {
    const ref = doc(db, MONTHLY_COLLECTION, String(monthDate));
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveMonthlyMetric(metric) {
    // авто-поля, как было у тебя раньше
    if (metric.tonsCount && metric.dealsCount && Number(metric.dealsCount) > 0) {
        metric.tonsPerDeal = Number((metric.tonsCount / metric.dealsCount).toFixed(2));
    }
    if (metric.mp && metric.dealsCount && Number(metric.dealsCount) > 0) {
        metric.mpPerDeal = Number((metric.mp / metric.dealsCount).toFixed(2));
    }

    const id = String(metric.monthDate);
    const ref = doc(db, MONTHLY_COLLECTION, id);

    await setDoc(ref, { ...metric, updatedAt: serverTimestamp() }, { merge: true });
    return { ...metric, id };
}

// =======================
// Export data (для statistics.js)
// =======================
export async function exportData() {
    // users у тебя, скорее всего, const USERS = [...]
    // если users хранятся иначе — скажи, но сейчас вернём хотя бы текущие
    let users = [];
    try {
        // если у тебя есть getUsers() — отлично
        users = typeof getUsers === "function" ? getUsers() : (typeof USERS !== "undefined" ? USERS : []);
    } catch (e) {
        users = (typeof USERS !== "undefined" ? USERS : []);
    }

    const weeklyMetrics = await getWeeklyMetrics();
    const monthlyMetrics = await getMonthlyMetrics();

    // engagementRatings — у тебя уже есть функция getEngagementRatings()?
    // если нет — просто выгрузим коллекцию напрямую:
    let engagementRatings = [];
    try {
        if (typeof getEngagementRatings === "function") {
            engagementRatings = await getEngagementRatings();
        } else {
            const snap = await getDocs(collection(db, "engagementRatings"));
            engagementRatings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
    } catch (e) {
        engagementRatings = [];
    }

    return {
        users,
        weeklyMetrics,
        monthlyMetrics,
        engagementRatings,
        exportDate: new Date().toISOString()
    };
}
// ===== ещё утилиты (их обычно импортируют dashboard/monthly/statistics) =====
export function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthsList(count = 12) {
    const months = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`);
    }
    return months;
}

// Раньше было для localStorage. Сейчас просто "пустышка", чтобы импорты не падали.
export function initializeData() {
    // Firebase-версия: ничего не делаем
}

// Полная очистка базы — опасно. Делаем безопасную "пустышку", чтобы сайт не падал.
export async function clearAllData() {
    console.warn("clearAllData отключена (Firebase).");
}

// Иногда статистика/страницы ожидают эту функцию
export async function getEngagementRatings() {
    const snap = await getDocs(collection(db, ENGAGEMENT_COLLECTION));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
