import React, { useEffect, useState } from "react";
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getApiUrl } from "../config/api";
import useLabelAbbreviation from '../hooks/useLabelAbbreviation';

// Register required Chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function ProjectsByTotalRevenue() {
  const { abbreviateLabel, formatAxisValue } = useLabelAbbreviation(12);
  const [projects, setProjects] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback sample data in case API fails
  const fallbackProjects = [
    "Project Alpha", "Project Beta", "Project Gamma", "Project Delta", "Project Epsilon",
    "Project Zeta", "Project Eta", "Project Theta", "Project Iota", "Project Kappa",
    "Project Lambda", "Project Mu", "Project Nu", "Project Xi", "Project Omicron"
  ];
  
  const fallbackRevenues = [
    120000, 110000, 95000, 87000, 82000, 79000, 76000, 74000, 72000, 70000,
    68000, 65000, 62000, 60000, 58000
  ];

  // 🔹 Fetch live projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(getApiUrl('PROJECT_PROFITABILITY'));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if data is already in Chart.js format
        if (data && data.labels && data.datasets && Array.isArray(data.labels)) {
          console.log('Data is already in Chart.js format with', data.labels.length, 'labels');
          // Filter out empty labels and set the data
          const validLabels = data.labels.filter(label => label && label.trim() !== '');
          const validData = data.datasets[0].data.slice(0, validLabels.length);
          
          setProjects(validLabels);
          setRevenues(validData);
        } else if (Array.isArray(data)) {
          console.log('Data is an array with', data.length, 'items');
          // Handle array format if needed
          setProjects([]);
          setRevenues([]);
        } else if (data && typeof data === 'object') {
          // If data is an object, check if it has a results property (common in Django REST)
          if (Array.isArray(data.results)) {
            console.log('Data has results array with', data.results.length, 'items');
            // Process results array if needed
            setProjects([]);
            setRevenues([]);
          } else if (Array.isArray(data.data)) {
            console.log('Data has data array with', data.data.length, 'items');
            // Process data array if needed
            setProjects([]);
            setRevenues([]);
          } else {
            console.warn('Unexpected data structure:', data);
            console.log('Available keys:', Object.keys(data));
            setProjects([]);
            setRevenues([]);
          }
        } else {
          console.warn('Data is not in expected format:', data);
          console.log('Data type:', typeof data);
          setProjects([]);
          setRevenues([]);
        }
        
        setError(null);
      } catch (error) {
        console.error("Error fetching projects data:", error);
        setError(error.message);
        // Use fallback data instead of empty arrays
        setProjects(fallbackProjects);
        setRevenues(fallbackRevenues);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const data = {
    labels: projects.map(p => p || 'Unknown Project'),
    datasets: [
      {
        label: "Total Revenue",
        data: revenues.map(r => r || 0),
        backgroundColor: "#991B1B",
        borderColor: "#991B1B",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y", // 🔹 Horizontal bar chart
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: error ? "Sample Data: Top Projects by Total Revenue" : "Cash Cows: Top 15 Projects by Total Revenue",
        font: { size: 18 },
        align: 'start',
        color: '#1f2937',
        padding: { top: 6, bottom: 10 },
      },
      datalabels: {
        color: '#ffffff',
        anchor: 'center',
        align: 'center',
        clamp: true,
        clip: true,
        font: { weight: 'bold', size: 10 },
        formatter: (value) => Number(value).toLocaleString(),
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: "Total Revenue" },
        ticks: {
          callback: (value) => formatAxisValue(value),
          maxTicksLimit: 6,
        },
      },
      y: {
        title: { display: true, text: "Project Name" },
        ticks: {
          autoSkip: false,
          font: { size: 10 },
          callback: function(value, index) {
            const original = data.labels?.[index] ?? String(value);
            return abbreviateLabel(original);
          }
        }
      },
    },
  };

  // Show error state
  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl mx-auto">
        <div className="text-center text-red-500">
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-sm">{error}</p>
          <p className="text-xs text-gray-500 mt-2">Showing sample data instead</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl mx-auto">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading projects data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!Array.isArray(projects) || projects.length === 0 || !Array.isArray(revenues) || revenues.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl mx-auto">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p>No project data found. Please check your API connection.</p>
        </div>
      </div>
    );
  }

  return (
    <Bar data={data} options={options} />
  );
};
