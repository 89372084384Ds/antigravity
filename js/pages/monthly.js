// Monthly Metrics Page

import { getCurrentUser, canInputMonthlyMetrics } from '../auth.js';
import {
    getMonthlyMetrics,
    getMonthlyMetricByDate,
    saveMonthlyMetric,
    getCurrentMonth,
    getMonthsList,
    formatMonth
} from '../data.js';
import { createMonthlyMetricsChart, createTonsPerDealChart } from '../charts.js';

let currentChart = null;
let tonsChart = null;

export function renderMonthlyPage() {
    const user = getCurrentUser();
    const canInput = canInputMonthlyMetrics();
    const monthlyMetrics = getMonthlyMetrics();
    const currentMonth = getCurrentMonth();
    const currentMetric = getMonthlyMetricByDate(currentMonth);

    return `
        <div class="fade-in">
            <div class="card mb-4">
                <h1 class="card-title">Ежемесячные показатели</h1>
                <p class="card-subtitle">Ввод и просмотр ежемесячных метрик</p>
            </div>
            
            ${!canInput ? `
                <div class="alert alert-info mb-4">
                    Только финансовый директор (Венера) может вводить ежемесячные показатели.
                </div>
            ` : ''}
            
            ${canInput ? `
                <div class="card mb-4">
                    <h3 class="card-title">Ввод показателей</h3>
                    <p class="card-subtitle mb-3">Месяц: ${formatMonth(currentMonth)}</p>
                    
                    <form id="monthlyForm">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label">Выручка</label>
                                <input type="number" class="form-input" id="revenue" 
                                    value="${currentMetric?.revenue || ''}" min="0" step="0.01" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Чистая прибыль</label>
                                <input type="number" class="form-input" id="netProfit" 
                                    value="${currentMetric?.netProfit || ''}" min="0" step="0.01" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">СК</label>
                                <input type="number" class="form-input" id="sk" 
                                    value="${currentMetric?.sk || ''}" min="0" step="0.01" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">МП</label>
                                <input type="number" class="form-input" id="mp" 
                                    value="${currentMetric?.mp || ''}" min="0" step="0.01" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Количество тонн</label>
                                <input type="number" class="form-input" id="tonsCount" 
                                    value="${currentMetric?.tonsCount || ''}" min="0" step="0.01" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Количество сделок</label>
                                <input type="number" class="form-input" id="dealsCount" 
                                    value="${currentMetric?.dealsCount || ''}" min="0" required>
                            </div>
                        </div>
                        
                        ${currentMetric?.tonsPerDeal || currentMetric?.mpPerDeal ? `
                            <div class="alert alert-info mt-3">
                                <strong>Авто-расчеты:</strong><br>
                                Тонн/сделку: ${currentMetric.tonsPerDeal || 0}<br>
                                МП/сделку: ${currentMetric.mpPerDeal || 0}
                            </div>
                        ` : ''}
                        
                        <button type="submit" class="btn btn-primary mt-3">Сохранить</button>
                    </form>
                </div>
            ` : ''}
            
            <div class="card mb-4">
                <h3 class="card-title">История показателей</h3>
                
                ${monthlyMetrics.length > 0 ? `
                    <div class="table-container mt-3">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Месяц</th>
                                    <th>Выручка</th>
                                    <th>Прибыль</th>
                                    <th>СК</th>
                                    <th>МП</th>
                                    <th>Тонны</th>
                                    <th>Сделки</th>
                                    <th>Тонн/сделку</th>
                                    <th>МП/сделку</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${monthlyMetrics.slice().reverse().map(metric => `
                                    <tr>
                                        <td>${formatMonth(metric.monthDate)}</td>
                                        <td>${(metric.revenue || 0).toLocaleString('ru-RU')}</td>
                                        <td>${(metric.netProfit || 0).toLocaleString('ru-RU')}</td>
                                        <td>${(metric.sk || 0).toLocaleString('ru-RU')}</td>
                                        <td>${(metric.mp || 0).toLocaleString('ru-RU')}</td>
                                        <td>${metric.tonsCount || 0}</td>
                                        <td>${metric.dealsCount || 0}</td>
                                        <td><strong>${metric.tonsPerDeal || 0}</strong></td>
                                        <td><strong>${(metric.mpPerDeal || 0).toLocaleString('ru-RU')}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="text-muted mt-3">Нет данных для отображения</p>'}
            </div>
            
            ${monthlyMetrics.length > 0 ? `
                <div class="grid grid-2 mb-4">
                    <div class="card">
                        <h3 class="card-title">Выручка и прибыль</h3>
                        <div class="chart-container">
                            <canvas id="monthlyChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3 class="card-title">Эффективность сделок</h3>
                        <div class="chart-container">
                            <canvas id="tonsChart"></canvas>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

export function initMonthlyPage() {
    const form = document.getElementById('monthlyForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const currentMonth = getCurrentMonth();

            const metric = {
                monthDate: currentMonth,
                revenue: parseFloat(document.getElementById('revenue').value),
                netProfit: parseFloat(document.getElementById('netProfit').value),
                sk: parseFloat(document.getElementById('sk').value),
                mp: parseFloat(document.getElementById('mp').value),
                tonsCount: parseFloat(document.getElementById('tonsCount').value),
                dealsCount: parseInt(document.getElementById('dealsCount').value)
            };

            saveMonthlyMetric(metric);

            alert('Данные успешно сохранены!');
            window.location.reload();
        });
    }

    // Create charts
    const monthlyMetrics = getMonthlyMetrics();
    if (monthlyMetrics.length > 0) {
        if (currentChart) currentChart.destroy();
        if (tonsChart) tonsChart.destroy();

        currentChart = createMonthlyMetricsChart('monthlyChart', monthlyMetrics);
        tonsChart = createTonsPerDealChart('tonsChart', monthlyMetrics);
    }
}
