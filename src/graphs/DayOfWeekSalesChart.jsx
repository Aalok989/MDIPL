import React, { useEffect, useState, useMemo, useRef } from "react";
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
import ChartDataLabels from "chartjs-plugin-datalabels";
import useResizeKey from "../hooks/useResizeKey";
import useLabelAbbreviation from "../hooks/useLabelAbbreviation";
import { getApiUrl } from "../config/api";
import { useDateFilter } from "../contexts/DateFilterContext";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const DayOfWeekSalesChart = ({ inModal = false, modalDateRange = null }) => {
  const resizeKey = useResizeKey();
  const { formatAxisValue } = useLabelAbbreviation(12);
  const { dateRange } = useDateFilter();
  
  // Use modal date range if in modal, otherwise use global date range
  const currentDateRange = inModal && modalDateRange ? modalDateRange : dateRange;
  const [chartData, setChartData] = useState({ labels: [], values: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state for modal view
  const [nValue, setNValue] = useState(7); // Default to show all 7 days
  
  // Color array for different bars - same as SupplierDiversityForTopCustomers
  const barColors = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
    "#a6cee3", "#fb9a99", "#fdbf6f", "#cab2d6", "#ff9896",
    "#f0027f", "#386cb0", "#fdc086", "#beaed4", "#7fc97f"
  ];

  // Ensure hooks order is stable across renders: define layout hooks before any early returns
  const chartRef = useRef(null);
  const chartHeight = useMemo(() => {
    return inModal ? 400 : 400; // Same height for both views like SuppliersByTotalSpend
  }, [inModal]);
  
  useEffect(() => {
    const chart = chartRef.current?.chart || chartRef.current;
    if (chart?.resize) {
      chart.resize();
    }
  }, [chartHeight, chartData.labels.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

              const startDate = currentDateRange.startDate.toISOString().split('T')[0];
      const endDate = currentDateRange.endDate.toISOString().split('T')[0];
        
        const urlWithParams = `${getApiUrl("WEEKLY_SALES")}?start_date=${startDate}&end_date=${endDate}`;
        const response = await fetch(urlWithParams);
        if (!response.ok) {
          throw new Error("Failed to fetch API");
        }

        const data = await response.json();
        console.log(data); // Log the actual API response

        // ✅ CORRECTED: Parse the API response to match the expected format
        if (data && data.labels && data.datasets && data.datasets[0]) {
          setChartData({
            labels: data.labels,
            values: data.datasets[0].data,
          });
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (err) {
        setError(err.message);
        // Fallback dummy data if API fails, matching the new state structure
        setChartData({
          labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          values: [5000, 7200, 6100, 8300, 9200, 10500, 7500],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDateRange]);

  // Apply filter to data
  const filteredData = useMemo(() => {
    if (!inModal || nValue === 7) {
      return chartData;
    }
    
    // For day of week, we can show top N days by sales value
    const sortedData = chartData.labels.map((label, index) => ({
      label,
      value: chartData.values[index] || 0
    })).sort((a, b) => b.value - a.value);
    
    const topN = sortedData.slice(0, nValue);
    
    return {
      labels: topN.map(item => item.label),
      values: topN.map(item => item.value)
    };
  }, [chartData, nValue, inModal]);

  const data = {
    labels: filteredData.labels,
    datasets: [
      {
        label: "Total Sales",
        data: filteredData.values,
        backgroundColor: filteredData.labels.map((_, index) => barColors[index % barColors.length]),
        borderColor: filteredData.labels.map((_, index) => barColors[index % barColors.length]),
        borderWidth: 1,
        borderRadius: 6, // rounded bars
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Same as SuppliersByTotalSpend
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: inModal && nValue < 7 
          ? `Weekly Rhythm: Top ${nValue} Days by Sales`
          : "Weekly Rhythm: Total Sales by Day of the Week",
        font: { size: 18 },
        align: "start",
        color: "#1f2937",
        padding: { top: 6, bottom: 10 },
      },
      datalabels: {
        color: "#ffffff",
        anchor: "center",
        align: "center",
        clamp: true,
        clip: true,
        font: { weight: "bold", size: 10 },
        formatter: (value) => formatAxisValue(value),
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Day of the Week",
          font: { size: 12, weight: "bold" },
          color: "#374151",
        },
        ticks: {
          display: true,
          font: { size: 11 },
          color: "#6B7280",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Sales",
          font: { size: 12, weight: "bold" },
          color: "#374151",
        },
        ticks: {
          stepSize: 2000,
          callback: function(value) {
            return formatAxisValue(value);
          },
          maxTicksLimit: 6,
        },
      },
    },
  };

  if (loading) return <p>Loading chart...</p>;
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
              <option value={7}>All Days</option>
              <option value={5}>Top 5</option>
              <option value={3}>Top 3</option>
              <option value={2}>Top 2</option>
            </select>
          </div>
        )}
        
        <div className={`w-full ${inModal ? 'h-96' : 'h-full'}`} style={inModal ? {} : { height: chartHeight }}>
          <Bar 
            ref={chartRef}
            key={`${resizeKey}-${filteredData.labels.length}`} 
            data={data} 
            options={options} 
          />
        </div>
      </div>

      {/* Weekly Sales Analysis Content - Only in Modal View */}
      {inModal && (
        <div className="mt-6 px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Weekly Sales Pattern Analysis</h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-600">Slow Start – Monday has the lowest sales (5,000), meaning the week starts off quietly.</p>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-600">Midweek Dip – Wednesday also stays low (6,100), showing midweek slowdown.</p>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-600">Weekend Boost – Friday (9,200) and Saturday (10,500) are the strongest sales days, suggesting customers buy more before the weekend.</p>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-600">Sunday Drop – Sales fall to 7,500 on Sunday, showing people buy less at week's end.</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <p className="text-sm text-gray-600">Takeaway – Business peaks around Friday–Saturday, so campaigns and promotions should focus there.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayOfWeekSalesChart;