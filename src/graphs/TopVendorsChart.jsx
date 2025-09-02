import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import { useDateFilter } from '../contexts/DateFilterContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function TopVendorsChart({ inModal = false }) {
  const { dateRange } = useDateFilter();
  const { abbreviateLabel } = useLabelAbbreviation(10);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state for modal view
  const [nValue, setNValue] = useState(5); // Default to show top 5
  
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

  // Modern fetch function with better error handling
  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = dateRange.startDate.toISOString().split('T')[0];
      const endDate = dateRange.endDate.toISOString().split('T')[0];
      
      const url = `/api/plot_top5_vendors_dashboard?start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(url);
      
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
  }, [dateRange]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Apply filter to data
  const filteredData = useMemo(() => {
    if (!chartData || !inModal || nValue === 5) {
      return chartData;
    }
    
    // For vendors, show top N vendors
    const labels = chartData.labels.slice(0, nValue);
    const datasets = chartData.datasets.map(dataset => ({
      ...dataset,
      data: dataset.data.slice(0, nValue)
    }));
    
    return {
      labels,
      datasets
    };
  }, [chartData, nValue, inModal]);

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
    labels: (filteredData || chartData).labels || [],
    datasets: [
      {
        label: (filteredData || chartData).datasets[0]?.label || "Spend (₹ Crores)",
        data: (filteredData || chartData).datasets[0]?.data || [],
        backgroundColor: (filteredData || chartData).datasets[0]?.backgroundColor || [
          "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"
        ],
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Same as other charts
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
        text: inModal && nValue !== 5 
          ? `Top ${nValue} Vendors by Spend`
          : "Top 5 Vendors by Spend",
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
    <div className="relative w-full" style={{ height: chartHeight }}>
      {/* Quick select filter - only in modal */}
      {inModal && (
        <div className="absolute top-1 right-12 z-20">
          <select
            value={nValue}
            onChange={(e) => setNValue(parseInt(e.target.value, 10))}
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white shadow-sm"
          >
            <option value={5}>Top 5</option>
            <option value={3}>Top 3</option>
            <option value={2}>Top 2</option>
            <option value={1}>Top 1</option>
          </select>
        </div>
      )}
      
      <Bar 
        ref={chartRef}
        key={`top-vendors-${filteredData?.labels?.length || 0}`}
        data={data} 
        options={options} 
      />
    </div>
  );
};
