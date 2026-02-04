// Charts Module
// Create charts using Chart.js

// Default chart options
const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#cbd5e1',
                font: {
                    family: 'Inter, sans-serif'
                }
            }
        }
    },
    scales: {
        y: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
        },
        x: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
        }
    }
};

// Create weekly metrics chart
export function createWeeklyMetricsChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Sort by date
    const sortedData = [...data].sort((a, b) =>
        new Date(a.weekStartDate) - new Date(b.weekStartDate)
    );

    const labels = sortedData.map(d => {
        const date = new Date(d.weekStartDate);
        return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    });

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Сделки в переговорах',
                    data: sortedData.map(d => d.dealsInNegotiation || 0),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Покупатели',
                    data: sortedData.map(d => d.buyersCount || 0),
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Поставщики',
                    data: sortedData.map(d => d.suppliersCount || 0),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Обработанные лиды',
                    data: sortedData.map(d => d.leadsProcessed || 0),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: defaultOptions
    });
}

// Create monthly metrics chart
export function createMonthlyMetricsChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const sortedData = [...data].sort((a, b) =>
        new Date(a.monthDate) - new Date(b.monthDate)
    );

    const labels = sortedData.map(d => {
        const [year, month] = d.monthDate.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
    });

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Выручка',
                    data: sortedData.map(d => d.revenue || 0),
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    yAxisID: 'y'
                },
                {
                    label: 'Чистая прибыль',
                    data: sortedData.map(d => d.netProfit || 0),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            ...defaultOptions,
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// Create engagement ratings chart
export function createEngagementChart(canvasId, weeklyData, users) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Sort weeks chronologically
    const sortedWeeks = Object.keys(weeklyData).sort((a, b) =>
        new Date(a) - new Date(b)
    );

    const labels = sortedWeeks.map(week => {
        const date = new Date(week);
        return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    });

    const colors = [
        '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'
    ];

    const datasets = users.map((user, index) => ({
        label: user.name,
        data: sortedWeeks.map(week => {
            const summary = weeklyData[week];
            const userSummary = summary.find(s => s.userId === user.id);
            return userSummary ? userSummary.averageRating : null;
        }),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '33',
        tension: 0.4
    }));

    return new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            ...defaultOptions,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#94a3b8',
                        stepSize: 1
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// Create tons per deal chart
export function createTonsPerDealChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const sortedData = [...data].sort((a, b) =>
        new Date(a.monthDate) - new Date(b.monthDate)
    );

    const labels = sortedData.map(d => {
        const [year, month] = d.monthDate.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
    });

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Тонн/сделку',
                    data: sortedData.map(d => d.tonsPerDeal || 0),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'МП/сделку',
                    data: sortedData.map(d => d.mpPerDeal || 0),
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...defaultOptions,
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Тонн/сделку',
                        color: '#94a3b8'
                    },
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'МП/сделку',
                        color: '#94a3b8'
                    },
                    ticks: { color: '#94a3b8' },
                    grid: { display: false }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}
