window.addEventListener('load', displayCharts);

let activePage = '/';

function rounder(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
} 
let totalUniqueVisitors;

async function displayCharts() {
    displayActionsChart();

    await displayVistorsChart();
    displaySectionsChart();
}

async function displayVistorsChart() {
    const resp = await fetch('/analytics/visitors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({page: activePage, days: historySize}),
    });
    const data = await resp.json();

    const uniqueVisitors = data.map(day => day.unique);
    totalUniqueVisitors = uniqueVisitors.reduce((acc, elem) => acc + elem, 0);
    const totalVisitors = data.map(day => day.total);


    const config = {
        type: 'line',
        data: {
            labels: lastNDays(historySize),
            datasets: [{
                label: 'Unique',
                backgroundColor: chartColors.red,
                borderColor: chartColors.red,
                data: uniqueVisitors,
                fill: false,
            }, {
                label: 'Total',
                fill: false,
                backgroundColor: chartColors.blue,
                borderColor: chartColors.blue,
                data: totalVisitors,
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: `Visitors at ${activePage} in the last ${historySize} days`,
                fontSize: '24',
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Day'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Visitors'
                    }
                }]
            }
        }
    };

    const ctx = document.getElementById('visits').getContext('2d');
    window.visitorsChart = new Chart(ctx, config);
}

async function displaySectionsChart() {
    const resp = await fetch('/analytics/reading', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({page: activePage, days: historySize}),
    });
    const data = await resp.json();
    const total = rounder(Object.keys(data).reduce((total, current) => total + data[current], 0) / totalUniqueVisitors);

    const config = {
        type: 'pie',
        data: {
            datasets: [{
                data: Object.keys(data).map(key => rounder(data[key] / totalUniqueVisitors)),
                backgroundColor: [
                    chartColors.red,
                    chartColors.orange,
                    chartColors.yellow,
                    chartColors.green,
                    chartColors.blue,
                    chartColors.purple,
                    chartColors.grey,
                ],
            }],
            labels: Object.keys(data),
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: `Minutes spent on each section, total average: ${total}min`,
                fontSize: '24',
            }
        }
    }

    const ctx = document.getElementById('sections').getContext('2d');
    window.sectionsChart = new Chart(ctx, config);
}

async function displayActionsChart() {
    const resp = await fetch('/analytics/actions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({page: activePage, days: historySize, type: 'click'}),
    });
    const data = await resp.json();
    const total = Object.keys(data).reduce((total, current) => total + data[current], 0);

    const config = {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Clicks',
                backgroundColor:  chartColors.red,
                borderColor: chartColors.red,
                borderWidth: 1,
                data: Object.keys(data).map(key => data[key]),
            }],
        },
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Click counters per element, total: ${total}`,
                fontSize: '24',
            }
        }
    };

    const ctx = document.getElementById('actions').getContext('2d');
    window.actionsChart = new Chart(ctx, config);
}

function lastNDays (days) {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
        const current = new Date();
        current.setDate(current.getDate() - i);
        result.push(`${dayNames[current.getDay()]}, ${current.getDate()}`)
    }

    return result;
}

const historySize = 7;
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};