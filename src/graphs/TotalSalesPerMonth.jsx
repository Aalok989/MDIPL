import React, { useEffect, useState, useMemo, useRef } from "react";
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

const TotalSalesPerMonth = ({ inModal = false }) => {
  const resizeKey = useResizeKey();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state for modal view
  const [nValue, setNValue] = useState(12); // Default to show all 12 months
  
  // Ensure hooks order is stable across renders: define layout hooks before any early returns
  const chartRef = useRef(null);
  const chartHeight = useMemo(() => {
    return inModal ? 400 : 400; // Same height for both views like other charts
  }, [inModal]);
  
  useEffect(() => {
    const chart = chartRef.current?.chart || chartRef.current;
    if (chart?.resize) {
      chart.resize();
    }
  }, [chartHeight, chartData]);

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

  // Apply filter to data
  const filteredData = useMemo(() => {
    if (!chartData || !inModal || nValue === 12) {
      return chartData;
    }
    
    // For time series, show last N months
    const labels = chartData.labels.slice(-nValue);
    const datasets = chartData.datasets.map(dataset => ({
      ...dataset,
      data: dataset.data.slice(-nValue)
    }));
    
    return {
      labels,
      datasets
    };
  }, [chartData, nValue, inModal]);

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Same as other charts
    plugins: {
      legend: { display: true, position: "top" },
      title: {
        display: true,
        text: inModal && nValue < 12 
          ? `Business Heartbeat: Last ${nValue} Months Sales`
          : "Business Heartbeat: Total Sales per Month",
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

  return (
    <div className="relative w-full" style={{ height: chartHeight }}>
      {/* Quick select filter - only in modal */}
      {inModal && (
        <div className="absolute top-1 right-12 z-20">
          <select
            value={nValue}
            onChange={(e) => setNValue(parseInt(e.target.value, 10))}
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white shadow-sm"
          >
            <option value={12}>All Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={3}>Last 3 Months</option>
            <option value={2}>Last 2 Months</option>
          </select>
        </div>
      )}
      
      <Line 
        ref={chartRef}
        key={`${resizeKey}-${filteredData?.labels?.length || 0}`} 
        data={filteredData || chartData} 
        options={options} 
      />
    </div>
  );
};

export default TotalSalesPerMonth;