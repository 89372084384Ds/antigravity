// Statistics Page

import { getUsers, getWeeklyMetrics, getMonthlyMetrics, exportData } from '../data.js';
import { createEngagementChart } from '../charts.js';

let statsChart = null;

export async function renderStatisticsPage() {
    // ✅ ждём данные из Firebase
    const weeklyMetrics = await getWeeklyMetrics();
    const monthlyMetrics = await getMonthlyMetrics();
    const users = getUsers();

    const totalWeeks = Array.isArray(weeklyMetrics) ? weeklyMetrics.length : 0;
    const totalMonths = Array.isArray(monthlyMetrics) ? monthlyMetrics.length : 0;

    return `
    <div class="fade-in">
      <div class="card mb-4" style="display:flex; justify-content:space-between; align-items:center; gap:1rem;">
        <div>
          <h1 class="card-title">Статистика и отчеты</h1>
          <p class="card-subtitle">Сводная информация по всем показателям</p>
        </div>
        <button id="exportBtn" class="btn btn-secondary">
          ⬇ Экспорт данных
        </button>
      </div>

      <div class="grid grid-3 mb-4">
        <div class="card">
          <div class="text-muted">ВСЕГО НЕДЕЛЬ</div>
          <div style="font-size:2.2rem; font-weight:700;">${totalWeeks}</div>
          <div class="text-muted">Записей</div>
        </div>

        <div class="card">
          <div class="text-muted">ВСЕГО МЕСЯЦЕВ</div>
          <div style="font-size:2.2rem; font-weight:700;">${totalMonths}</div>
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
    // Export button
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

    // Chart (если у тебя weeklyData для него уже есть — можно подключить позже)
    // Сейчас не строим, чтобы точно не падало
    const canvas = document.getElementById('statsEngagementChart');
    if (canvas) {
        // оставляем пустым (без ошибок)
        if (statsChart) statsChart.destroy();
        // если хочешь — я добавлю сюда сбор данных по неделям для графика
    }
}
