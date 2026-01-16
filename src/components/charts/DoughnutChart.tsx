import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  labels: string[];
  data: number[];
  colors?: string[];
  height?: number;
  centerText?: string;
}

const defaultColors = [
  '#22c55e', // green
  '#ef4444', // red
  '#f59e0b', // yellow
  '#3b82f6', // blue
  '#8b5cf6', // purple
];

export const DoughnutChart = ({
  labels,
  data,
  colors = defaultColors,
  height = 250,
  centerText,
}: DoughnutChartProps) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#9ca3af',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div style={{ height, position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
      {centerText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {centerText}
          </span>
        </div>
      )}
    </div>
  );
};
