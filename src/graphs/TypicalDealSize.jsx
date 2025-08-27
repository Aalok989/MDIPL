import React, { useState, useEffect } from "react";
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

// Register chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TypicalDealSize = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('DEAL_SIZE_DISTRIBUTION');
        
        // Transform the API data to match the chart format
        const transformedData = {
          labels: data.labels,
          datasets: [
            {
              label: "Number of Deals",
              data: data.datasets[0].data,
              backgroundColor: "rgba(239, 68, 68, 0.6)", // Tailwind red-500
              borderColor: "rgb(239, 68, 68)",
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        };
        
        setChartData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching deal size data:', err);
        setError('Failed to load deal size data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'What is a "Typical" Deal Size?',
        font: { size: 18 },
        align: 'start',
        color: '#1f2937',
        padding: { top: 6, bottom: 10 },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Number of Deals" } },
      x: { title: { display: true, text: "Deal Size Range" } },
    },
  };

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

  return <Bar data={chartData} options={options} />;
};

export default TypicalDealSize;
