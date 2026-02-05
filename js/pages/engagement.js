// js/pages/engagement.js
// Engagement Ratings Page (Firebase)

import { getCurrentUser, canEvaluate, canSelfEvaluate } from '../auth.js';
import {
  getUsers,
  getCurrentWeekStart,
  getRating,
  saveRating,
  getEngagementSummary,
  getTotalMissingRatings,
  formatDate,
  getWeeksList,
} from '../data.js';

import { createEngagementChart } from '../charts.js';

let currentChart = null;

export async function renderEngagementPage() {
  const user = getCurrentUser();
  const canRate = canEvaluate();
  const users = getUsers();

  const currentWeek = getCurrentWeekStart();
  const summary = await getEngagementSummary(currentWeek);
  const missingRatings = await getTotalMissingRatings(currentWeek);

  // Поля ввода (берем существующие оценки по одной)
  const inputsHtml = (await Promise.all(
    users.map(async (evaluatedUser) => {
      if (!user) return '';

      // запрет на самооценку, если нельзя
      if (evaluatedUser.id === user.id && !canSelfEvaluate()) return '';

      const existingRating = await getRating(currentWeek, user.id, evaluatedUser.id);
      const isSelf = evaluatedUser.id === user.id;

      return `
        <div class="form-group">
          <label class="form-label">
            ${evaluatedUser.name} ${isSelf ? '(самооценка)' : ''}
          </label>
          <input
            type="number"
            class="form-input"
            data-evaluated-id="${evaluatedUser.id}"
            min="0"
            max="100"
            step="1"
            placeholder="0–100 %"
            value="${existingRating ? existingRating.rating : ''}"
            required
          />
        </div>
      `;
    })
  )).join('');

  // Таблица summary
  const summaryHtml =
    summary && summary.length > 0
      ? `
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
              ${summary
        .map((s) => {
          const color =
            s.averageRating >= 80 ? '#10b981' : s.averageRating >= 60 ? '#f59e0b' : '#ef4444';

          return `
                    <tr>
                      <td><strong>${s.userName}</strong></td>
                      <td>
                        <span style="font-size: 1.2rem; font-weight: 600; color: ${color}">
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
                  `;
        })
        .join('')}
            </tbody>
          </table>
        </div>
      `
      : `<p class="text-muted mt-3">Нет данных для отображения</p>`;

  return `
    <div class="fade-in">
      <div class="card mb-4">
        <h1 class="card-title">Оценка вовлеченности</h1>
        <p class="card-subtitle">Еженедельная оценка вовлеченности сотрудников (шкала 0–100%)</p>
      </div>

      ${!canRate
      ? `
        <div class="alert alert-info mb-4">
          Только оценивающие (Дарья, Венера, Андрей, Павел) могут выставлять оценки.
        </div>
      `
      : ''
    }

      ${canRate
      ? `
        <div class="card mb-4">
          <h3 class="card-title">Оценить коллег</h3>
          <p class="card-subtitle mb-3">Неделя: ${formatDate(currentWeek)}</p>

          <form id="engagementForm">
            <div class="grid grid-2">
              ${inputsHtml}
            </div>

            <button type="submit" class="btn btn-primary mt-3">Сохранить оценки</button>
          </form>
        </div>
      `
      : ''
    }

      <div class="card mb-4">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 class="card-title" style="margin:0;">Средние оценки за неделю</h3>
          <div class="badge ${missingRatings === 0 ? 'badge-success' : 'badge-warning'}">
            ${28 - missingRatings} / 28 оценок
          </div>
        </div>

        <p class="card-subtitle mb-3">${formatDate(currentWeek)}</p>
        ${summaryHtml}
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

  if (form && user) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const currentWeek = getCurrentWeekStart();
      const inputs = form.querySelectorAll('input[data-evaluated-id]');

      // ВАЖНО: for...of чтобы работал await
      for (const input of inputs) {
        const evaluatedId = parseInt(input.dataset.evaluatedId, 10);
        const rating = Math.max(0, Math.min(100, Number(input.value)));

        if (!Number.isNaN(rating)) {
          await saveRating({
            weekStartDate: currentWeek,
            evaluatorId: user.id,
            evaluatedId,
            rating,
          });
        }
      }

      alert('Оценки успешно сохранены!');
      window.location.reload();
    });
  }

  // Рисуем график (последние 8 недель)
  const weeks = getWeeksList(8);
  const users = getUsers();

  const weeklyPairs = await Promise.all(
    weeks.map(async (week) => {
      const s = await getEngagementSummary(week);
      return [week, s];
    })
  );

  const weeklyData = {};
  weeklyPairs.forEach(([week, s]) => {
    weeklyData[week] = s;
  });

  if (currentChart) currentChart.destroy();
  currentChart = createEngagementChart('engagementChart', weeklyData, users);
}
