import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import useResizeKey from "../hooks/useResizeKey";
import { useDateFilter } from "../contexts/DateFilterContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProjectsCompletedByMonths = ({ inModal = false, modalDateRange = null }) => {
  const resizeKey = useResizeKey();
  const { dateRange } = useDateFilter();
  
  // Use modal date range if in modal, otherwise use global date range
  const currentDateRange = inModal && modalDateRange ? modalDateRange : dateRange;
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

  // Modern fetch function with better error handling
  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = currentDateRange.startDate.toISOString().split('T')[0];
      const endDate = currentDateRange.endDate.toISOString().split('T')[0];
      
      console.log('ProjectsCompletedByMonths - Date range:', {
        start_date: startDate,
        end_date: endDate
      });
      
      const urlWithParams = `/api/plot_projects_per_month_area?start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(urlWithParams);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('ProjectsCompletedByMonths - API Response:', data);
      setChartData(data);
    } catch (err) {
      console.error("Error fetching projects per month data:", err);
      setError(err.message || "Failed to fetch chart data");
    } finally {
      setLoading(false);
    }
  }, [currentDateRange]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Apply filter to data
  const filteredData = useMemo(() => {
    if (!chartData) {
      return chartData;
    }
    
    // Filter data by date range
    const filteredLabels = [];
    const filteredDataValues = [];
    
    chartData.labels.forEach((label, index) => {
      // Parse the label (assuming format like "2024-01" or "Jan 2024")
      let date;
      if (label.includes('-')) {
        // Format: "2024-01"
        const [year, month] = label.split('-');
        date = new Date(parseInt(year), parseInt(month) - 1, 1);
      } else {
        // Format: "Jan 2024"
        date = new Date(label);
      }
      
      // Check if date is within the selected range
      if (date >= dateRange.startDate && date <= dateRange.endDate) {
        filteredLabels.push(label);
        filteredDataValues.push(chartData.datasets[0].data[index]);
      }
    });
    
    const filteredChartData = {
      labels: filteredLabels,
      datasets: chartData.datasets.map(dataset => ({
        ...dataset,
        data: filteredDataValues
      }))
    };
    
    // Apply modal filter if needed
    if (inModal && nValue < 12) {
      const labels = filteredChartData.labels.slice(-nValue);
      const datasets = filteredChartData.datasets.map(dataset => ({
        ...dataset,
        data: dataset.data.slice(-nValue)
      }));
      
      return {
        labels,
        datasets
      };
    }
    
    console.log('ProjectsCompletedByMonths - Filtered data:', {
      originalLabels: chartData.labels.length,
      filteredLabels: filteredLabels.length,
      dateRange: {
        start: dateRange.startDate.toISOString().split('T')[0],
        end: dateRange.endDate.toISOString().split('T')[0]
      }
    });
    
    return filteredChartData;
  }, [chartData, nValue, inModal, dateRange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Same as other charts
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#333",
        },
      },
      title: {
        display: true,
        text: inModal && nValue < 12 
          ? `Projects Completed - Last ${nValue} Months`
          : "Projects Completed per Month (Area)",
        font: {
          size: 18,
          weight: "bold",
        },
        align: "start",
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#666",
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        ticks: {
          color: "#666",
        },
        beginAtZero: true,
      },
    },
  };

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
          <p className="text-xs text-gray-500">{error}</p>
          <button 
            onClick={fetchChartData}
            className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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

      {/* Key Insights Content - Only in Modal View */}
      {inModal && (
        <div className="mt-6 px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Key Insights from the Chart</h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-600">Sixfold Growth: From 5 projects in 2000 → 30+ in 2025.</p>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-600">Seasonal Spikes: Mid-year peaks align with monsoon/summer demand cycles.</p>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-600">Vendor Dependency: Top 10 suppliers provide 50% of material — a risk if not diversified.</p>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-600">Regional Hotspots: Areas like Dholera and Faridabad show untapped opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsCompletedByMonths;