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

// Register chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TypicalDealSize = () => {
  // 🔹 Hardcoded "bill_total" sample data (like deals)
  const billTotals = [500, 1200, 800, 1500, 2200, 3000, 3200, 4500, 4700, 4900, 5200, 6000, 6500, 7200, 8000, 9500, 10000];

  // Create histogram bins (1000 increments)
  const binSize = 1000;
  const maxVal = Math.max(...billTotals);
  const numBins = Math.ceil(maxVal / binSize);

  const bins = Array(numBins).fill(0);
  billTotals.forEach((val) => {
    const idx = Math.floor(val / binSize);
    bins[idx] += 1;
  });

  const labels = bins.map((_, i) => `${i * binSize} - ${(i + 1) * binSize}`);

  const data = {
    labels,
    datasets: [
      {
        label: "Number of Deals",
        data: bins,
        backgroundColor: "rgba(239, 68, 68, 0.6)", // Tailwind red-500
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '📊 What is a "Typical" Deal Size?',
        font: { size: 18 },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Number of Deals" } },
      x: { title: { display: true, text: "Bill Total Range" } },
    },
  };

  return (
    <Bar data={data} options={options} />
  );
};

export default TypicalDealSize;
