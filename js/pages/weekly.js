// Weekly Metrics Page

import { getCurrentUser, canInputWeeklyMetrics } from '../auth.js';
import {
    getCurrentWeekStart,
    formatDate,
    getWeeklyMetricByDate,
    saveWeeklyMetric
} from '../data.js';

export async function renderWeeklyPage() {
    const user = getCurrentUser();
    const canInput = canInputWeeklyMetrics();
    const weekStart = getCurrentWeekStart();

    // ✅ важно: это async из Firebase
    const existing = await getWeeklyMetricByDate(weekStart);

    return `
    <div class="fade-in">
      <div class="card mb-4">
        <h1 class="card-title">Еженедельные показатели</h1>
        <p class="card-subtitle">Неделя: ${formatDate(weekStart)}</p>
      </div>

      ${!canInput ? `
        <div class="alert alert-info mb-4">
          Ввод доступен только Павлу и Дарье.
        </div>
      ` : `
        <div class="card">
          <h3 class="card-title">Ввести данные</h3>

          <form id="weeklyForm">
            <div class="grid grid-2">
              <div class="form-group">
                <label class="form-label" for="leadsCount">Лиды</label>
                <input id="leadsCount" class="form-input" type="number" min="0" step="1"
                       value="${existing?.leadsCount ?? ''}" />
              </div>

              <div class="form-group">
                <label class="form-label" for="dealsCount">Сделки</label>
                <input id="dealsCount" class="form-input" type="number" min="0" step="1"
                       value="${existing?.dealsCount ?? ''}" />
              </div>

              <div class="form-group">
                <label class="form-label" for="mp">MP</label>
                <input id="mp" class="form-input" type="number" min="0" step="0.01"
                       value="${existing?.mp ?? ''}" />
              </div>

              <div class="form-group">
                <label class="form-label" for="tonsCount">Тонны</label>
                <input id="tonsCount" class="form-input" type="number" min="0" step="0.01"
                       value="${existing?.tonsCount ?? ''}" />
              </div>
            </div>

            <button type="submit" class="btn btn-primary mt-3">Сохранить</button>
          </form>
        </div>
      `}
    </div>
  `;
}

export async function initWeeklyPage() {
    const form = document.getElementById('weeklyForm');
    const user = getCurrentUser();
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const weekStartDate = getCurrentWeekStart();

            const metric = {
                weekStartDate,
                userId: user?.id ?? null,
                leadsCount: Number(document.getElementById('leadsCount').value || 0),
                dealsCount: Number(document.getElementById('dealsCount').value || 0),
                mp: Number(document.getElementById('mp').value || 0),
                tonsCount: Number(document.getElementById('tonsCount').value || 0)
            };

            // ✅ важно: await
            await saveWeeklyMetric(metric);

            alert('Еженедельные данные сохранены!');
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert('Ошибка сохранения. Открой Console (F12) и пришли ошибку.');
        }
    });
}
