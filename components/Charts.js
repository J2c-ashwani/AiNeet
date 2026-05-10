'use client';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Radar, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Global Premium Dark Mode Defaults
ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.font.family = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
ChartJS.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';

export function ScoreTrendChart({ data }) {
    // data: [{ date: '2023-10-01', score: 450 }, ...]
    const chartData = {
        labels: data.map(d => new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Test Scores',
                data: data.map(d => d.score),
                borderColor: '#818cf8',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                borderWidth: 3,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#111827',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { 
                display: false, // Hidden because page already has titles
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => `Score: ${context.parsed.y} / 720`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 11 } }
            },
            y: { 
                beginAtZero: true, 
                max: 720,
                grid: { color: 'rgba(255, 255, 255, 0.05)', borderDash: [5, 5] },
                ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 120 }
            },
        },
    };

    return (
        <div style={{ height: '300px', width: '100%' }}>
            <Line options={options} data={chartData} />
        </div>
    );
}

export function SubjectRadarChart({ data }) {
    // data: { Physics: 60, Chemistry: 75, Biology: 85 }
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: 'Accuracy (%)',
                data: Object.values(data),
                backgroundColor: 'rgba(167, 139, 250, 0.25)',
                borderColor: '#a78bfa',
                pointBackgroundColor: '#c4b5fd',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#a78bfa',
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    label: (context) => `Accuracy: ${context.parsed.r}%`
                }
            }
        },
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: { 
                    color: '#e2e8f0', 
                    font: { size: 12, weight: '600' } 
                },
                ticks: { 
                    display: false, // Hides the ugly overlapping numbers
                    stepSize: 20
                },
                suggestedMin: 0,
                suggestedMax: 100,
            },
        },
    };

    return (
        <div style={{ height: '300px', width: '100%' }}>
            <Radar data={chartData} options={options} />
        </div>
    );
}

export function ActivityHeatmap({ data }) {
    // Simplified bar chart for daily activity
    // data: { 'Mon': 20, 'Tue': 45, ... }
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: 'Questions Solved',
                data: Object.values(data),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Weekly Activity' },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return <Bar options={options} data={chartData} />;
}
