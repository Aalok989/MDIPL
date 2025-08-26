import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register modules including LogarithmicScale
ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, Title, Tooltip, Legend);

const DealSizeDistribution = () => {
  // 🔹 Hardcoded bill_total values
  const billTotals = [
    50, 120, 300, 500, 800, 1500, 2200, 4000, 7500, 12000, 25000, 50000, 100000
  ];

  // Histogram bins on log scale are trickier → just plot values directly
  const labels = billTotals.map((v) => v.toString());
  const dataCounts = Array(billTotals.length).fill(1); // frequency = 1 each

  const data = {
    labels,
    datasets: [
      {
        label: "Deals",
        data: dataCounts,
        backgroundColor: "rgba(34,197,94,0.6)", // Tailwind green-500
        borderColor: "rgb(34,197,94)",
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
        text: "📈 Deal Size Distribution (Log Scale)",
        font: { size: 18 },
      },
    },
    scales: {
      x: {
        type: "logarithmic",
        title: { display: true, text: "Bill Total (Log Scale)" },
        ticks: {
          callback: (value) => {
            return Number(value).toLocaleString(); // pretty labels
          },
        },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Number of Deals" },
      },
    },
  };

  return (
    <Bar data={data} options={options} />
  );
};

export default DealSizeDistribution;
