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
import { getApiUrl } from "../config/api";

// Register required Chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProjectsByTotalRevenue = () => {
  const [projects, setProjects] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback sample data
  const fallbackProjects = [
    "Project Alpha", "Project Beta", "Project Gamma", "Project Delta", "Project Epsilon",
    "Project Zeta", "Project Eta", "Project Theta", "Project Iota", "Project Kappa",
    "Project Lambda", "Project Mu", "Project Nu", "Project Xi", "Project Omicron"
  ];
  
  const fallbackRevenues = [
    120000, 110000, 95000, 87000, 82000, 79000, 76000, 74000, 72000, 70000,
    68000, 65000, 62000, 60000, 58000
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = getApiUrl('PROJECT_PROFITABILITY');
        const response = await fetch(url);

        // Check if response is OK
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        // Check content type before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Received non-JSON response:', text.substring(0, 200));
          throw new Error('Expected JSON, but received HTML or plain text. Check the API URL or authentication.');
        }

        const data = await response.json();

        // Validate and extract data
        if (data && Array.isArray(data.labels) && Array.isArray(data.datasets) && data.datasets[0]?.data) {
          const validLabels = data.labels.filter(label => label && typeof label === 'string');
          const validData = data.datasets[0].data.slice(0, validLabels.length);
          setProjects(validLabels);
          setRevenues(validData);
        } else {
          throw new Error('Invalid data structure in API response');
        }
      } catch (err) {
        console.error("Error fetching projects data:", err);
        setError(err.message);
        // Use fallback data
        setProjects(fallbackProjects);
        setRevenues(fallbackRevenues);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Prepare chart data
  const data = {
    labels: projects,
    datasets: [
      {
        label: "Total Revenue",
        data: revenues,
        backgroundColor: "rgba(59,130,246,0.7)", // Tailwind blue-500
        borderColor: "rgb(59,130,246)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: error 
          ? "💰 Sample Data: Top 15 Projects by Total Revenue" 
          : "💰 Cash Cows: Top 15 Projects by Total Revenue",
        font: { size: 18 },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: "Total Revenue" },
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
      y: {
        title: { display: true, text: "Project Name" },
      },
    },
  };

  // Error state
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

  // Loading state
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

  // No data
  if (!projects.length || !revenues.length) {
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

export default ProjectsByTotalRevenue;