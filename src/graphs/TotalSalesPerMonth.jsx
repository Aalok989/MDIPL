import React, { useEffect, useState } from "react";
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

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Optional: If you have 'chartjs-plugin-datalabels' installed globally,
// we'll disable it for this chart. No need to import it here.
// If you don't use it, this config is safely ignored.

import { getApiUrl } from "../config/api";
import useResizeKey from "../hooks/useResizeKey";

const TotalSalesPerMonth = () => {
  const resizeKey = useResizeKey();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch(getApiUrl("TOTAL_SALES_PER_MONTH"));
        if (!response.ok) throw new Error("Failed to fetch sales data");
        const data = await response.json();

        // Format labels (YYYY-MM → "MMM YYYY")
        const labels = data.labels.map((dateStr) => {
          const [year, month] = dateStr.split("-");
          return new Date(year, month - 1).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
        });

        const chartDataset = {
          labels,
          datasets: data.datasets.map((ds) => ({
            ...ds,
            borderColor: "rgb(37, 99, 235)", // Tailwind blue-600
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: "rgb(37, 99, 235)",
            // Ensure no data labels show (if plugin is active)
            datalabels: {
              display: false,
            },
          })),
        };

        setChartData(chartDataset);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: {
        display: true,
        text: "Business Heartbeat: Total Sales per Month",
        font: { size: 18 },
        align: 'start',
        color: '#1f2937',
        padding: { top: 6, bottom: 10 },
      },
      tooltip: {
        enabled: true, // Enable hover tooltips
      },
      // Disable data labels globally for this chart
      datalabels: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: { beginAtZero: true },
      },
    },
    // Optional: Keep points visible but no labels
    interaction: {
      mode: "index",
      intersect: false,
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
  };

  if (loading) return <p className="text-gray-500">Loading sales data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return <Line data={chartData} options={options} />;
};

export default TotalSalesPerMonth;