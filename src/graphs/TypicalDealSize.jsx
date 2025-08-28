import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { apiRequest } from "../config/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TypicalDealSize = ({ inModal = false }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [binN, setBinN] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("DEAL_SIZE_DISTRIBUTION");

        // Clean up labels: remove duplicates like "1M-1M", "2M-2M" etc.
        const uniqueLabels = [];
        const uniqueData = [];
        data.labels.forEach((label, i) => {
          if (!uniqueLabels.includes(label)) {
            uniqueLabels.push(label);
            uniqueData.push(data.datasets[0].data[i]);
          } else {
            // if duplicate bin exists, sum the counts
            const idx = uniqueLabels.indexOf(label);
            uniqueData[idx] += data.datasets[0].data[i];
          }
        });

        const limit = binN === 'all' ? uniqueLabels.length : Math.min(uniqueLabels.length, Number(binN) || uniqueLabels.length);
        const transformedData = {
          labels: uniqueLabels.slice(0, limit),
          datasets: [
            {
              label: "Number of Deals",
              data: uniqueData.slice(0, limit),
              backgroundColor: uniqueData.slice(0, limit).map((_, index) => {
                // Create a gradient from light green to emerald green
                const ratio = index / (limit - 1);
                const r = Math.round(144 + (0 - 144) * ratio);     // 144 to 0 (light green to emerald)
                const g = Math.round(238 + (128 - 238) * ratio);   // 238 to 128
                const b = Math.round(144 + (0 - 144) * ratio);     // 144 to 0
                return `rgb(${r}, ${g}, ${b})`;
              }),
              borderColor: uniqueData.slice(0, limit).map((_, index) => {
                // Create a gradient from light green to emerald green
                const ratio = index / (limit - 1);
                const r = Math.round(144 + (0 - 144) * ratio);     // 144 to 0 (light green to emerald)
                const g = Math.round(238 + (128 - 238) * ratio);   // 238 to 128
                const b = Math.round(144 + (0 - 144) * ratio);     // 144 to 0
                return `rgb(${r}, ${g}, ${b})`;
              }),
              borderWidth: 1,
              borderRadius: 0, // flat bars for histogram look
              barPercentage: 1.0,
              categoryPercentage: 1.0,
            },
          ],
        };

        setChartData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching deal size data:", err);
        setError("Failed to load deal size data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [binN]);

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Same as SuppliersByTotalSpend
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'What is a "Typical" Deal Size?',
        font: { size: 18 },
        align: "start",
        color: "#1f2937",
        padding: { top: 6, bottom: 10 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Number of Deals" },
      },
      x: {
        title: { display: true, text: "Deal Size Range" },
      },
    },
  };

  // Ensure hooks order is stable across renders: define layout hooks before any early returns
  const chartHeight = useMemo(() => {
    return inModal ? 400 : 400; // Same height for both views like SuppliersByTotalSpend
  }, [inModal]);
  const chartRef = useRef(null);
  useEffect(() => {
    const c = chartRef.current?.chart || chartRef.current;
    if (c?.resize) c.resize();
  }, [chartHeight, chartData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading deal size data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${inModal ? 'h-full' : ''}`} style={inModal ? {} : { height: chartHeight }}>
      {/* Quick select filter - only in modal */}
      {inModal && (
        <div className="absolute top-1 right-12 z-20">
          <select
            value={binN}
            onChange={(e) => setBinN(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs bg-white shadow-sm"
            title="Quick select"
          >
            <option value="all">All</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
      )}
      
      <div className={`w-full ${inModal ? 'h-full' : ''}`} style={inModal ? {} : { height: chartHeight }}>
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TypicalDealSize;
