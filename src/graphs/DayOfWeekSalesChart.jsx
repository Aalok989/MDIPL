import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import useResizeKey from "../hooks/useResizeKey";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const DayOfWeekSalesChart = () => {
  const resizeKey = useResizeKey();
  // 🔹 Hardcoded sales data by day of week
  const dayOfWeekSales = {
    Monday: 5000,
    Tuesday: 7200,
    Wednesday: 6100,
    Thursday: 8300,
    Friday: 9200,
    Saturday: 10500,
    Sunday: 7500,
  };

  const labels = Object.keys(dayOfWeekSales);
  const values = Object.values(dayOfWeekSales);

  const data = {
    labels,
    datasets: [
      {
        label: "Total Sales",
        data: values,
        backgroundColor: "#FF714B",
        borderColor: "#FF714B",
        borderWidth: 1,
        borderRadius: 6, // rounded bars
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Weekly Rhythm: Total Sales by Day of the Week",
        font: { size: 18 },
        align: 'start',
        color: '#1f2937',
        padding: { top: 6, bottom: 10 },
      },
      datalabels: {
        color: '#ffffff',
        anchor: 'center',
        align: 'center',
        clamp: true,
        clip: true,
        font: { weight: 'bold', size: 10 },
        formatter: (value) => Number(value).toLocaleString(),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 2000,
        },
      },
    },
  };

  return (
    <Bar data={data} options={options} />
  );
};

export default DayOfWeekSalesChart;
