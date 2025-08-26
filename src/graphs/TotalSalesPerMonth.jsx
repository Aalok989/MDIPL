import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TotalSalesPerMonth = () => {
  // 🔹 Hardcoded monthly sales data
  const salesData = [
    { bill_date: "2023-01-01", bill_total: 5000 },
    { bill_date: "2023-02-01", bill_total: 7200 },
    { bill_date: "2023-03-01", bill_total: 6100 },
    { bill_date: "2023-04-01", bill_total: 8300 },
    { bill_date: "2023-05-01", bill_total: 9200 },
    { bill_date: "2023-06-01", bill_total: 10500 },
    { bill_date: "2023-07-01", bill_total: 9800 },
    { bill_date: "2023-08-01", bill_total: 11200 },
  ];

  const labels = salesData.map((item) =>
    new Date(item.bill_date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Total Sales",
        data: salesData.map((item) => item.bill_total),
        borderColor: "rgb(37, 99, 235)", // Tailwind blue-600
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: "rgb(37, 99, 235)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: {
        display: true,
        text: "📈 Business Heartbeat: Total Sales per Month",
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        ticks: { beginAtZero: true },
      },
    },
  };

  return (
      <Line data={data} options={options} />
  );
};

export default TotalSalesPerMonth;
