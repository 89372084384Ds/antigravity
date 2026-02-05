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
