import React, { useEffect, useState, useCallback } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useDateFilter } from "../contexts/DateFilterContext";

// Register components
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

const SpendBySeasonChart = ({ inModal = false }) => {
  const { dateRange } = useDateFilter();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart height for responsive layout
  const chartHeight = inModal ? 400 : 400;

  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = dateRange.startDate.toISOString().split('T')[0];
      const endDate = dateRange.endDate.toISOString().split('T')[0];
      
      const urlWithParams = `/api/plot-spend-by-indian-seasons?start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(urlWithParams);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.error("Error fetching spend by season", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const formatCurrency = useCallback((value) => {
    if (typeof value !== 'number') return '₹0';
    
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    } else {
      return `₹${value.toLocaleString('en-IN')}`;
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 text-sm font-medium">Error</p>
          <p className="text-xs text-gray-500">{error}</p>
          <button
            onClick={fetchChartData}
            className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data
  if (!chartData?.datasets?.[0]?.data?.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">No data available.</p>
      </div>
    );
  }

  const totalSpend = chartData.summary?.total_spend || 0;
  const avgPerSeason = totalSpend / chartData.labels.length;

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Spend by Season",
        data: chartData.datasets[0].data,
        backgroundColor: chartData.datasets[0].backgroundColor || [
          "#FFA500", "#1F77B4", "#2CA02C", "#9467BD"
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = chartData.percentages?.[label] || 0;
            return `${label}: ${formatCurrency(value)} (${percentage.toFixed(1)}%)`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        borderRadius: 4,
        backgroundColor: (ctx) => {
          const bg = ctx.dataset.backgroundColor;
          if (Array.isArray(bg)) return 'rgba(0,0,0,0.35)';
          return 'rgba(0,0,0,0.35)';
        },
        padding: 4,
        font: {
          weight: 'bold',
          size: 10,
        },
        formatter: (value, ctx) => {
          const data = ctx.dataset?.data || [];
          const total = data.reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
          if (!total) return '';
          const pct = (value / total) * 100;
          return `${pct.toFixed(1)}%`;
        },
      }
    },
    layout: { padding: 10 }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Title & Subtitle */}
      <h3 className={`${inModal ? 'text-xl' : 'text-lg'} font-semibold text-gray-800 mb-3 px-4`}>Spend by Season</h3>

      {/* Chart & Summary */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 px-4">
        {/* Left: Pie Chart */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="w-full h-full max-w-xs max-h-xs">
            <Pie data={data} options={options} />
          </div>
        </div>

        {/* Right: Metrics */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-50 p-2 rounded">
              <p className={`${inModal ? 'text-sm' : 'text-xs'} text-gray-500`}>Total Spend</p>
              <p className={`${inModal ? 'text-base' : 'text-sm'} font-semibold text-green-700`}>{formatCurrency(totalSpend)}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className={`${inModal ? 'text-sm' : 'text-xs'} text-gray-500`}>Avg per Season</p>
              <p className={`${inModal ? 'text-base' : 'text-sm'} font-semibold text-blue-700`}>{formatCurrency(avgPerSeason)}</p>
            </div>
          </div>

          {/* Season Breakdown */}
          <div className="flex-1">
            <h4 className={`${inModal ? 'text-base' : 'text-xs'} font-semibold text-gray-700 mb-2`}>Season Breakdown</h4>
            <div className={`space-y-2 ${inModal ? 'text-sm' : 'text-xs'} ${inModal ? 'max-h-48 overflow-y-auto' : ''}`}>
              {chartData.labels.map((label, i) => {
                const value = chartData.datasets[0].data[i];
                const percentage = chartData.percentages?.[label] || 0;
                return (
                  <div key={label} className={`flex justify-between py-2 px-3 bg-gray-50 rounded ${inModal ? 'text-sm' : 'text-xs'}`}>
                    <span className="font-medium text-gray-800 truncate">{label}</span>
                    <span className="text-gray-600 ml-2 flex-shrink-0">
                      {formatCurrency(value)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 px-4 pb-4">
        <div className="flex flex-wrap gap-3">
          {chartData.labels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: data.datasets[0].backgroundColor[i] }}
              ></span>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpendBySeasonChart;