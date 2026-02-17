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

export function ScoreTrendChart({ data }) {
    // data: [{ date: '2023-10-01', score: 450 }, ...]
    const chartData = {
        labels: data.map(d => new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Test Scores',
                data: data.map(d => d.score),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Score Progression' },
        },
        scales: {
            y: { beginAtZero: true, max: 720 },
        },
    };

    return <Line options={options} data={chartData} />;
}

export function SubjectRadarChart({ data }) {
    // data: { Physics: 60, Chemistry: 75, Biology: 85 }
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: 'Subject Mastery (%)',
                data: Object.values(data),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            r: {
                angleLines: { display: false },
                suggestedMin: 0,
                suggestedMax: 100,
            },
        },
    };

    return <Radar data={chartData} options={options} />;
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
