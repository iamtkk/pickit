'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Poll } from '@/app/types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface ResultsChartProps {
  poll: Poll;
  voteCounts: number[];
  type: 'bar' | 'pie';
}

export default function ResultsChart({ poll, voteCounts, type }: ResultsChartProps) {
  const colors = [
    'rgba(139, 92, 246, 0.9)',   // Purple
    'rgba(59, 130, 246, 0.9)',   // Blue
    'rgba(16, 185, 129, 0.9)',   // Emerald
    'rgba(245, 101, 101, 0.9)',  // Red
    'rgba(251, 146, 60, 0.9)',   // Orange
    'rgba(168, 85, 247, 0.9)',   // Violet
    'rgba(14, 165, 233, 0.9)',   // Sky
    'rgba(34, 197, 94, 0.9)',    // Green
    'rgba(239, 68, 68, 0.9)',    // Red
    'rgba(245, 158, 11, 0.9)',   // Amber
  ];

  const borderColors = [
    'rgba(139, 92, 246, 1)',
    'rgba(59, 130, 246, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(245, 101, 101, 1)',
    'rgba(251, 146, 60, 1)',
    'rgba(168, 85, 247, 1)',
    'rgba(14, 165, 233, 1)',
    'rgba(34, 197, 94, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(245, 158, 11, 1)',
  ];

  const data = {
    labels: poll.options,
    datasets: [
      {
        data: voteCounts,
        backgroundColor: colors.slice(0, poll.options.length),
        borderColor: borderColors.slice(0, poll.options.length),
        borderWidth: 2,
        hoverBackgroundColor: colors.slice(0, poll.options.length).map(color => color.replace('0.9', '1')),
        hoverBorderWidth: 3,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 12,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : '0';
            return `${context.parsed.y}표 (${percentage}%)`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            weight: '500' as const,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          precision: 0,
          color: '#6B7280',
          font: {
            weight: '500' as const,
          },
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 14,
            weight: '500' as const,
          },
          color: '#374151',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 12,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0';
            return `${context.parsed}표 (${percentage}%)`;
          }
        }
      },
    },
  };

  if (type === 'bar') {
    return (
      <div className="h-80 w-full bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-card">
        <Bar data={data} options={barOptions} />
      </div>
    );
  } else {
    return (
      <div className="h-96 w-full bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-card">
        <Pie data={data} options={pieOptions} />
      </div>
    );
  }
}