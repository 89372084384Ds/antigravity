// Engagement Ratings Page

import { getCurrentUser, canEvaluate, canSelfEvaluate } from '../auth.js';
import {
  getUsers,
  getCurrentWeekStart,
  getRatingsByWeek,
  saveRating,
  getEngagementSummary,
  getTotalMissingRatings,
  formatDate,
  getWeeksList
} from '../data.js';

import { createEngagementChart } from '../charts.js';

let currentChart = null;

export async function renderEngagementPage() {
  const user = getCurrentUser();
  const canRate = canEvaluate();
  const users = getUsers();
  const currentWeek = getCurrentWeekStart();

  // ✅ ВАЖНО: теперь это async
  const ratings = await getRatingsByWeek(currentWeek);
  const summary = await getEngagementSummary(currentWeek);
  const missingRatings = await getTotalMissingRatings(currentWeek);

  return `
    <div class="fade-in">
      <div class="card mb-4">
        <h1 class="card-title">Оценка вовлеченности</h1>
        <p class="card-subtitle">Еженедельная оценка вовлеченности сотрудников (шкала 0–100%)</p>
      </div>

      ${!canRate ? `
        <div class="alert alert-info mb-4">
          Только оценивающие (Дарья, Венера, Андрей, Павел) могут выставлять оценки.
        </div>
      ` : ''}

      ${canRate ? `
        <div class="card mb-4">
          <h3 class="card-title">Оценить коллег</h3>
          <p class="card-subtitle mb-3">Неделя: ${formatDate(currentWeek)}</p>

          <form id="engagementForm">
            <div class="grid grid-2">
              ${users.map(evaluatedUser => {
    // запрет самооценки, если нельзя
    if (evaluatedUser.id === user.id && !canSelfEvaluate()) return '';

    const existing = ratings.find(r =>
      Number(r.evaluatorId) === user.id && Number(r.evaluatedId) === evaluatedUser.id
    );

    const isSelf = evaluatedUser.id === user.id;

    return `
                  <div class="form-group">
                    <label class="form-label" for="eng_${evaluatedUser.id}">
                      ${evaluatedUser.name} ${isSelf ? '(самооценка)' : ''}
                    </label>

                    <input
                      id="eng_${evaluatedUser.id}"
                      type="number"
                      class="form-input"
                      data-evaluated-id="${evaluatedUser.id}"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="0–100 %"
                      value="${existing ? existing.rating : ''}"
                      required
                    />
                  </div>
                `;
  }).join('')}
            </div>

            <button type="submit" class="btn btn-primary mt-3">Сохранить оценки</button>
          </form>
        </div>
      ` : ''}

      <div class="card mb-4">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 class="card-title" style="margin:0;">Средние оценки за неделю</h3>
          <div class="badge ${missingRatings === 0 ? 'badge-success' : 'badge-warning'}">
            ${28 - missingRatings} / 28 оценок
          </div>
        </div>

        <p class="card-subtitle mb-3">${formatDate(currentWeek)}</p>

        ${summary.length > 0 ? `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Сотрудник</th>
                  <th>Средняя оценка</th>
                  <th>Получено оценок</th>
                  <th>Не хватает</th>
                </tr>
              </thead>
              <tbody>
                ${summary.map(s => `
                  <tr>
                    <td><strong>${s.userName}</strong></td>
                    <td>
                      <span style="font-size:1.2rem; font-weight:600;">
                        ${s.averageRating > 0 ? s.averageRating.toFixed(2) : '—'}
                      </span>
                    </td>
                    <td>${s.ratingsReceived} / ${s.expectedRatings}</td>
                    <td>
                      ${s.ratingsMissing > 0
      ? `<span class="badge badge-warning">${s.ratingsMissing}</span>`
      : `<span class="badge badge-success">✓</span>`
    }
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p class="text-muted mt-3">Нет данных для отображения</p>'}
      </div>

      <div class="card">
        <h3 class="card-title">Динамика вовлеченности</h3>
        <div class="chart-container">
          <canvas id="engagementChart"></canvas>
        </div>
      </div>
    </div>
  `;
}

export async function initEngagementPage() {
  const form = document.getElementById('engagementForm');
  const user = getCurrentUser();

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const currentWeek = getCurrentWeekStart();
      const inputs = form.querySelectorAll('input[data-evaluated-id]');

      // ✅ for..of чтобы await работал
      for (const input of inputs) {
        const evaluatedId = parseInt(input.dataset.evaluatedId, 10);
        const rating = Math.max(0, Math.min(100, Number(input.value)));

        if (!Number.isNaN(rating)) {
          await saveRating({
            weekStartDate: currentWeek,
            evaluatorId: user.id,
            evaluatedId,
            rating
          });
        }
      }

      alert('Оценки успешно сохранены!');
      window.location.reload();
    });
  }

  // ✅ История для графика: ЖДЁМ summary по каждой неделе
  const weeks = getWeeksList(8);
  const users = getUsers();

  const summaries = await Promise.all(
    weeks.map(w => getEngagementSummary(w))
  );

  const weeklyData = {};
  weeks.forEach((w, idx) => weeklyData[w] = summaries[idx]);

  if (currentChart) currentChart.destroy();
  currentChart = createEngagementChart('engagementChart', weeklyData, users);
}
