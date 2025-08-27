import React, { useEffect, useState, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getApiUrl } from '../config/api';
import useLabelAbbreviation from '../hooks/useLabelAbbreviation';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function TopVendorsChart() {
  const { abbreviateLabel } = useLabelAbbreviation(10);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modern fetch function with better error handling
  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/plot_top5_vendors_dashboard");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.error("Error fetching top vendors data:", err);
      setError(err.message || "Failed to fetch chart data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Loading state component
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  // Error state component
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-1">Failed to load chart data</p>
          <p className="text-xs text-gray-500 mb-2">{error}</p>
          <button 
            onClick={fetchChartData}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state component
  if (!chartData?.datasets?.[0]?.data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-1">No chart data available</p>
          <button 
            onClick={fetchChartData}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data with validation
  const data = {
    labels: chartData.labels || [],
    datasets: [
      {
        label: chartData.datasets[0]?.label || "Spend (₹ Crores)",
        data: chartData.datasets[0]?.data || [],
        backgroundColor: chartData.datasets[0]?.backgroundColor || [
          "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"
        ],
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Top 5 Vendors by Spend",
        font: {
          size: 16,
          weight: "bold",
        },
        align: "start",
        color: '#1f2937',
        padding: { top: 6, bottom: 10 },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ₹${value.toFixed(2)} Cr`;
          }
        }
      },
      datalabels: {
        color: '#ffffff',
        anchor: 'center',
        align: 'center',
        clamp: true,
        clip: true,
        font: {
          weight: 'bold',
          size: 10,
        },
        formatter: (value) => `₹${Number(value).toFixed(2)} Cr`,
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 0,
          minRotation: 0,
          callback: function(value, index) {
            const original = data.labels?.[index] ?? String(value);
            return abbreviateLabel(original);
          }
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
          font: {
            size: 11,
          },
          callback: function(value) {
            return `₹${value} Cr`;
          }
        },
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
  };

  return (
    <div className="w-full h-full relative">
      <Bar data={data} options={options} />
    </div>
  );
};
