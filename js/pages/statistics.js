// Statistics Page

import { getUsers, getWeeksList, getEngagementSummary, exportData } from '../data.js';
import { createEngagementChart } from '../charts.js';

let statsChart = null;

export async function renderStatisticsPage() {
    const users = getUsers();

    return `
    <div class="fade-in">
      <div class="card mb-4" style="display:flex; justify-content:space-between; align-items:center; gap:1rem;">
        <div>
          <h1 class="card-title">Статистика и отчеты</h1>
          <p class="card-subtitle">Сводная информация по всем показателям</p>
        </div>
        <button id="exportBtn" class="btn btn-secondary">⬇ Экспорт данных</button>
      </div>

      <div class="grid grid-3 mb-4">
        <div class="card">
          <div class="text-muted">ВСЕГО НЕДЕЛЬ</div>
          <div id="totalWeeks" style="font-size:2.2rem; font-weight:700;">—</div>
          <div class="text-muted">Записей</div>
        </div>

        <div class="card">
          <div class="text-muted">ВСЕГО МЕСЯЦЕВ</div>
          <div id="totalMonths" style="font-size:2.2rem; font-weight:700;">—</div>
          <div class="text-muted">Записей</div>
        </div>

        <div class="card">
          <div class="text-muted">СОТРУДНИКОВ</div>
          <div style="font-size:2.2rem; font-weight:700;">${users.length}</div>
          <div class="text-muted">В системе</div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Динамика вовлеченности</h3>
        <div class="chart-container">
          <canvas id="statsEngagementChart"></canvas>
        </div>
      </div>
    </div>
  `;
}

export async function initStatisticsPage() {
    // Export
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            const data = await exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `metrics_export_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        });
    }

    // ✅ Данные графика вовлечённости (8 недель)
    const weeks = getWeeksList(8);
    const users = getUsers();

    // ✅ важное: получаем summary по каждой неделе и ждём
    const entries = await Promise.all(
        weeks.map(async (week) => {
            const summary = await getEngagementSummary(week);
            return [week, summary];
        })
    );

    const weeklyData = Object.fromEntries(entries);

    // Показать счётчики
    const totalWeeksEl = document.getElementById('totalWeeks');
    const totalMonthsEl = document.getElementById('totalMonths');
    if (totalWeeksEl) totalWeeksEl.textContent = String(weeks.length);
    if (totalMonthsEl) totalMonthsEl.textContent = '—'; // если нужно — добавим из monthlyMetrics

    // Chart
    if (statsChart) statsChart.destroy();
    statsChart = createEngagementChart('statsEngagementChart', weeklyData, users);
}
