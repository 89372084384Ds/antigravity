// Dashboard Page

import { getCurrentUser } from '../auth.js';
import {
    getWeeklyMetrics,
    getMonthlyMetrics,
    getCurrentWeekStart,
    getTotalMissingRatings,
    formatDate,
    formatMonth
} from '../data.js';

export async function renderDashboardPage() {
    const user = getCurrentUser();
    const weeklyMetrics = await getWeeklyMetrics();
    const monthlyMetrics = await getMonthlyMetrics();
    const currentWeek = await getCurrentWeekStart();
    const missingRatings = await getTotalMissingRatings(currentWeek);

    const latestWeekly = weeklyMetrics.length > 0
        ? weeklyMetrics
            .slice()
            .sort((a, b) => String(a.weekStartDate || '').localeCompare(String(b.weekStartDate || '')))
            .at(-1)
        : null;

    const latestMonthly = monthlyMetrics.length > 0
        ? monthlyMetrics
            .slice()
            .sort((a, b) => String(a.monthDate || '').localeCompare(String(b.monthDate || '')))
            .at(-1)
        : null;


    return `
        <div class="fade-in">
            <div class="card mb-4">
                <h1 class="card-title">Добро пожаловать, ${user.name}!</h1>
                <p class="card-subtitle">Обзор показателей компании</p>
            </div>
            
            ${missingRatings > 0 ? `
                <div class="alert alert-warning mb-4">
                    <strong>⚠️ Внимание!</strong> Не хватает ${missingRatings} оценок вовлеченности за текущую неделю.
                    <a href="#engagement" style="color: inherit; text-decoration: underline; margin-left: 0.5rem;">Оценить сейчас</a>
                </div>
            ` : ''}
            
            <div class="grid grid-3 mb-4">
                ${user.name === 'Павел' || user.name === 'Дарья' ? `
                    <div class="stat-card">
                        <div class="stat-label">Еженедельные показатели</div>
                        <div class="stat-value">${latestWeekly ? '✓' : '—'}</div>
                        <div class="text-muted" style="font-size: 0.85rem;">
                            ${latestWeekly ? formatDate(latestWeekly.weekStartDate) : 'Нет данных'}
                        </div>
                        <a href="#weekly" class="btn btn-primary mt-2" style="width: 100%;">Ввести данные</a>
                    </div>
                ` : ''}
                
                ${user.name === 'Венера' ? `
                    <div class="stat-card">
                        <div class="stat-label">Ежемесячные показатели</div>
                        <div class="stat-value">${latestMonthly ? '✓' : '—'}</div>
                        <div class="text-muted" style="font-size: 0.85rem;">
                            ${latestMonthly ? formatMonth(latestMonthly.monthDate) : 'Нет данных'}
                        </div>
                        <a href="#monthly" class="btn btn-primary mt-2" style="width: 100%;">Ввести данные</a>
                    </div>
                ` : ''}
                
                ${user.canEvaluate ? `
                    <div class="stat-card">
                        <div class="stat-label">Оценка вовлеченности</div>
                        <div class="stat-value">${28 - missingRatings}/28</div>
                        <div class="text-muted" style="font-size: 0.85rem;">
                            Оценок за неделю
                        </div>
                        <a href="#engagement" class="btn btn-primary mt-2" style="width: 100%;">Оценить</a>
                    </div>
                ` : ''}
                
                <div class="stat-card">
                    <div class="stat-label">Всего недель</div>
                    <div class="stat-value">${weeklyMetrics.length}</div>
                    <div class="text-muted" style="font-size: 0.85rem;">
                        Записей в системе
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-label">Всего месяцев</div>
                    <div class="stat-value">${monthlyMetrics.length}</div>
                    <div class="text-muted" style="font-size: 0.85rem;">
                        Записей в системе
                    </div>
                </div>
            </div>
            
            <div class="grid grid-2">
                ${latestWeekly ? `
                    <div class="card">
                        <h3 class="card-title">Последние еженедельные показатели</h3>
                        <p class="card-subtitle mb-3">${formatDate(latestWeekly.weekStartDate)}</p>
                        
                        <div class="grid grid-2">
                            <div>
                                <div class="stat-label">Сделки в переговорах</div>
                                <div class="stat-value" style="font-size: 1.5rem;">${latestWeekly.dealsInNegotiation || 0}</div>
                            </div>
                            <div>
                                <div class="stat-label">Покупатели</div>
                                <div class="stat-value" style="font-size: 1.5rem;">${latestWeekly.buyersCount || 0}</div>
                            </div>
                            <div>
                                <div class="stat-label">Поставщики</div>
                                <div class="stat-value" style="font-size: 1.5rem;">${latestWeekly.suppliersCount || 0}</div>
                            </div>
                            <div>
                                <div class="stat-label">Обработанные лиды</div>
                                <div class="stat-value" style="font-size: 1.5rem;">${latestWeekly.leadsProcessed || 0}</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${latestMonthly ? `
                    <div class="card">
                        <h3 class="card-title">Последние ежемесячные показатели</h3>
                        <p class="card-subtitle mb-3">${formatMonth(latestMonthly.monthDate)}</p>
                        
                        <div class="grid grid-2">
                            <div>
                                <div class="stat-label">Выручка</div>
                                <div class="stat-value" style="font-size: 1.5rem;">${(latestMonthly.revenue || 0).toLocaleString('ru-RU')}</div>
                            </div>
                            <div>
                                <div class="stat-label">Чистая прибыль</div>
                                <div class="stat-value" style="font-size: 1.5rem;">${(latestMonthly.netProfit || 0).toLocaleString('ru-RU')}</div>
                            </div>
                            <div>
                                <div class="stat-label">Тонн/сделку</div>
                                <div class="stat-value" style="font-size: 1.5rem;">${latestMonthly.tonsPerDeal || 0}</div>
                            </div>
                            <div>
                                <div class="stat-label">МП/сделку</div>
                                <div class="stat-value" style="font-size: 1.5rem;">${(latestMonthly.mpPerDeal || 0).toLocaleString('ru-RU')}</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="card mt-4">
                <h3 class="card-title">Быстрые ссылки</h3>
                <div class="grid grid-4 mt-3">
                    <a href="#weekly" class="btn btn-secondary">📊 Еженедельные</a>
                    <a href="#monthly" class="btn btn-secondary">📈 Ежемесячные</a>
                    <a href="#engagement" class="btn btn-secondary">⭐ Вовлеченность</a>
                    <a href="#statistics" class="btn btn-secondary">📉 Статистика</a>
                </div>
            </div>
        </div>
    `;
}

export function initDashboardPage() {
    // No special initialization needed
}
