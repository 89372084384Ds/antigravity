// Weekly Metrics Page

import { getCurrentUser, canInputWeeklyMetrics } from '../auth.js';
import {
    getWeeklyMetrics,
    getWeeklyMetricByDate,
    saveWeeklyMetric,
    getCurrentWeekStart,
    getWeeksList,
    formatDate
} from '../data.js';
import { createWeeklyMetricsChart } from '../charts.js';

let currentChart = null;

export function renderWeeklyPage() {
    const user = getCurrentUser();
    const canInput = canInputWeeklyMetrics();
    const weeklyMetrics = getWeeklyMetrics();
    const currentWeek = getCurrentWeekStart();
    const currentMetric = getWeeklyMetricByDate(currentWeek);
    const weeks = getWeeksList();

    return `
        <div class="fade-in">
            <div class="card mb-4">
                <h1 class="card-title">Еженедельные показатели</h1>
                <p class="card-subtitle">Ввод и просмотр еженедельных метрик</p>
            </div>
            
            ${canInput ? `
                <div class="card mb-4">
                    <h3 class="card-title">Ввод показателей</h3>
                    <p class="card-subtitle mb-3">Неделя: ${formatDate(currentWeek)}</p>
                    
                    <form id="weeklyForm">
                        ${user.name === 'Павел' ? `
                            <div class="form-group">
                                <label class="form-label">Количество сделок в переговорах</label>
                                <input type="number" class="form-input" id="dealsInNegotiation" 
                                    value="${currentMetric?.dealsInNegotiation || ''}" min="0" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Количество покупателей</label>
                                <input type="number" class="form-input" id="buyersCount" 
                                    value="${currentMetric?.buyersCount || ''}" min="0" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Количество поставщиков</label>
                                <input type="number" class="form-input" id="suppliersCount" 
                                    value="${currentMetric?.suppliersCount || ''}" min="0" required>
                            </div>
                        ` : ''}
                        
                        ${user.name === 'Дарья' ? `
                            <div class="form-group">
                                <label class="form-label">Количество обработанных лидов</label>
                                <input type="number" class="form-input" id="leadsProcessed" 
                                    value="${currentMetric?.leadsProcessed || ''}" min="0" required>
                            </div>
                        ` : ''}
                        
                        <button type="submit" class="btn btn-primary">Сохранить</button>
                    </form>
                </div>
            ` : ''}
            
            <div class="card mb-4">
                <h3 class="card-title">История показателей</h3>
                
                ${weeklyMetrics.length > 0 ? `
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
                                ${weeklyMetrics.slice().reverse().map(metric => `
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
                ` : '<p class="text-muted mt-3">Нет данных для отображения</p>'}
            </div>
            
            ${weeklyMetrics.length > 0 ? `
                <div class="card">
                    <h3 class="card-title">График динамики</h3>
                    <div class="chart-container">
                        <canvas id="weeklyChart"></canvas>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

export function initWeeklyPage() {
    const form = document.getElementById('weeklyForm');
    const user = getCurrentUser();

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const currentWeek = getCurrentWeekStart();
            const existingMetric = getWeeklyMetricByDate(currentWeek) || {};

            const metric = {
                weekStartDate: currentWeek,
                ...existingMetric
            };

            if (user.name === 'Павел') {
                metric.dealsInNegotiation = parseInt(document.getElementById('dealsInNegotiation').value);
                metric.buyersCount = parseInt(document.getElementById('buyersCount').value);
                metric.suppliersCount = parseInt(document.getElementById('suppliersCount').value);
            }

            if (user.name === 'Дарья') {
                metric.leadsProcessed = parseInt(document.getElementById('leadsProcessed').value);
            }

            saveWeeklyMetric(metric);

            // Show success message and reload
            alert('Данные успешно сохранены!');
            window.location.reload();
        });
    }

    // Create chart
    const weeklyMetrics = getWeeklyMetrics();
    if (weeklyMetrics.length > 0) {
        if (currentChart) {
            currentChart.destroy();
        }
        currentChart = createWeeklyMetricsChart('weeklyChart', weeklyMetrics);
    }
}
