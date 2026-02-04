// Statistics Page

import {
    getWeeklyMetrics,
    getMonthlyMetrics,
    getEngagementSummary,
    getUsers,
    getWeeksList,
    exportData,
    formatDate,
    formatMonth
} from '../data.js';
import {
    createWeeklyMetricsChart,
    createMonthlyMetricsChart,
    createEngagementChart,
    createTonsPerDealChart
} from '../charts.js';

let charts = [];

export function renderStatisticsPage() {
    const weeklyMetrics = getWeeklyMetrics();
    const monthlyMetrics = getMonthlyMetrics();
    const users = getUsers();

    return `
        <div class="fade-in">
            <div class="card mb-4">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1 class="card-title" style="margin-bottom: 0.5rem;">Статистика и отчеты</h1>
                        <p class="card-subtitle">Сводная информация по всем показателям</p>
                    </div>
                    <button id="exportBtn" class="btn btn-secondary">
                        📥 Экспорт данных
                    </button>
                </div>
            </div>
            
            <div class="grid grid-3 mb-4">
                <div class="stat-card">
                    <div class="stat-label">Всего недель</div>
                    <div class="stat-value">${weeklyMetrics.length}</div>
                    <div class="text-muted" style="font-size: 0.85rem;">Записей</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Всего месяцев</div>
                    <div class="stat-value">${monthlyMetrics.length}</div>
                    <div class="text-muted" style="font-size: 0.85rem;">Записей</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Сотрудников</div>
                    <div class="stat-value">${users.length}</div>
                    <div class="text-muted" style="font-size: 0.85rem;">В системе</div>
                </div>
            </div>
            
            ${weeklyMetrics.length > 0 ? `
                <div class="card mb-4">
                    <h3 class="card-title">Еженедельные показатели</h3>
                    <div class="chart-container" style="height: 400px;">
                        <canvas id="statsWeeklyChart"></canvas>
                    </div>
                </div>
            ` : ''}
            
            ${monthlyMetrics.length > 0 ? `
                <div class="grid grid-2 mb-4">
                    <div class="card">
                        <h3 class="card-title">Финансовые показатели</h3>
                        <div class="chart-container">
                            <canvas id="statsMonthlyChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3 class="card-title">Эффективность сделок</h3>
                        <div class="chart-container">
                            <canvas id="statsTonsChart"></canvas>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="card mb-4">
                <h3 class="card-title">Динамика вовлеченности</h3>
                <div class="chart-container" style="height: 400px;">
                    <canvas id="statsEngagementChart"></canvas>
                </div>
            </div>
            
            ${weeklyMetrics.length > 0 ? `
                <div class="card mb-4">
                    <h3 class="card-title">Последние еженедельные показатели</h3>
                    <div class="table-container mt-3">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Неделя</th>
                                    <th>Сделки</th>
                                    <th>Покупатели</th>
                                    <th>Поставщики</th>
                                    <th>Лиды</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${weeklyMetrics.slice(-10).reverse().map(metric => `
                                    <tr>
                                        <td>${formatDate(metric.weekStartDate)}</td>
                                        <td>${metric.dealsInNegotiation || '—'}</td>
                                        <td>${metric.buyersCount || '—'}</td>
                                        <td>${metric.suppliersCount || '—'}</td>
                                        <td>${metric.leadsProcessed || '—'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
            
            ${monthlyMetrics.length > 0 ? `
                <div class="card">
                    <h3 class="card-title">Последние ежемесячные показатели</h3>
                    <div class="table-container mt-3">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Месяц</th>
                                    <th>Выручка</th>
                                    <th>Прибыль</th>
                                    <th>Тонны</th>
                                    <th>Сделки</th>
                                    <th>Тонн/сделку</th>
                                    <th>МП/сделку</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${monthlyMetrics.slice(-10).reverse().map(metric => `
                                    <tr>
                                        <td>${formatMonth(metric.monthDate)}</td>
                                        <td>${(metric.revenue || 0).toLocaleString('ru-RU')}</td>
                                        <td>${(metric.netProfit || 0).toLocaleString('ru-RU')}</td>
                                        <td>${metric.tonsCount || 0}</td>
                                        <td>${metric.dealsCount || 0}</td>
                                        <td><strong>${metric.tonsPerDeal || 0}</strong></td>
                                        <td><strong>${(metric.mpPerDeal || 0).toLocaleString('ru-RU')}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

export function initStatisticsPage() {
    // Clear previous charts
    charts.forEach(chart => chart.destroy());
    charts = [];

    const weeklyMetrics = getWeeklyMetrics();
    const monthlyMetrics = getMonthlyMetrics();
    const users = getUsers();

    // Create weekly chart
    if (weeklyMetrics.length > 0) {
        const weeklyChart = createWeeklyMetricsChart('statsWeeklyChart', weeklyMetrics);
        if (weeklyChart) charts.push(weeklyChart);
    }

    // Create monthly charts
    if (monthlyMetrics.length > 0) {
        const monthlyChart = createMonthlyMetricsChart('statsMonthlyChart', monthlyMetrics);
        const tonsChart = createTonsPerDealChart('statsTonsChart', monthlyMetrics);
        if (monthlyChart) charts.push(monthlyChart);
        if (tonsChart) charts.push(tonsChart);
    }

    // Create engagement chart
    const weeks = getWeeksList(12);
    const weeklyData = {};

    weeks.forEach(week => {
        weeklyData[week] = getEngagementSummary(week);
    });

    const engagementChart = createEngagementChart('statsEngagementChart', weeklyData, users);
    if (engagementChart) charts.push(engagementChart);

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = exportData();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `company-metrics-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
}
