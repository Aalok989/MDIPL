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
import useLabelAbbreviation from '../hooks/useLabelAbbreviation';
import { useDateFilter } from "../contexts/DateFilterContext";

const TotalSalesPerMonth = ({ inModal = false, modalDateRange = null }) => {
  const { dateRange } = useDateFilter();
  const { formatAxisValue } = useLabelAbbreviation(12);
  
  // Use modal date range if in modal, otherwise use global date range
  const currentDateRange = inModal && modalDateRange ? modalDateRange : dateRange;
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
              const startDate = currentDateRange.startDate.toISOString().split('T')[0];
      const endDate = currentDateRange.endDate.toISOString().split('T')[0];
        
        const baseUrl = getApiUrl("TOTAL_SALES_PER_MONTH");
        const url = `${baseUrl}?start_date=${startDate}&end_date=${endDate}`;
        const response = await fetch(url);
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
  }, [currentDateRange]);

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
        beginAtZero: true,
        title: { display: true, text: "Sales" },
        ticks: {
          callback: function(value) {
            return formatAxisValue(value);
          },
          maxTicksLimit: 6,
        },
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
    <div className={`w-full flex flex-col ${inModal ? '' : 'h-full'}`} style={inModal ? {} : { height: chartHeight }}>
      {/* Chart Section */}
      <div className={`relative w-full ${inModal ? 'flex-shrink-0' : 'h-full'}`} style={inModal ? {} : { height: chartHeight }}>
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
        
        <div className={`w-full ${inModal ? 'h-96' : 'h-full'}`} style={inModal ? {} : { height: chartHeight }}>
          <Line 
            ref={chartRef}
            key={`${resizeKey}-${filteredData?.labels?.length || 0}`} 
            data={filteredData || chartData} 
            options={options} 
          />
        </div>
      </div>

      {/* Sales Analysis Content - Only in Modal View */}
      {inModal && (
        <div className="mt-6 px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Sales Analysis & Insights</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-base font-semibold text-gray-700 mb-2">Overall Trend</h5>
                <p className="text-sm text-gray-600">The chart shows how our monthly sales have changed from 2000 to 2025. It looks like the heartbeat of our business.</p>
              </div>

              <div>
                <h5 className="text-base font-semibold text-gray-700 mb-2">Growth Phase</h5>
                <p className="text-sm text-gray-600">From 2022 onwards, sales started rising sharply, showing business growth and higher demand.</p>
              </div>

              <div>
                <h5 className="text-base font-semibold text-gray-700 mb-2">Peak Performance</h5>
                <p className="text-sm text-gray-600">In mid-2024, sales hit the highest point, crossing nearly 60 million. This was our strongest phase with major wins.</p>
              </div>

              <div>
                <h5 className="text-base font-semibold text-gray-700 mb-2">Volatility</h5>
                <p className="text-sm text-gray-600">Sales don't go up smoothly; they rise and fall sharply. This means demand is seasonal or depends heavily on a few big projects.</p>
              </div>

              <div>
                <h5 className="text-base font-semibold text-gray-700 mb-2">Recent Decline</h5>
                <p className="text-sm text-gray-600">In 2025, sales dropped steeply from above 40M to around 20M. This signals a risk that needs quick attention.</p>
              </div>

              <div>
                <h5 className="text-base font-semibold text-gray-700 mb-2">Why It Matters</h5>
                <div className="space-y-1 ml-4">
                  <p className="text-sm text-gray-600">• Helps us forecast demand.</p>
                  <p className="text-sm text-gray-600">• Shows risks early.</p>
                  <p className="text-sm text-gray-600">• Guides us to plan marketing and sales campaigns better.</p>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                <h5 className="text-base font-semibold text-gray-800 mb-2">Key Takeaway</h5>
                <p className="text-sm text-gray-600">Our sales story shows strong growth with high ups and downs. The recent fall warns us to act fast and stabilize business.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalSalesPerMonth;