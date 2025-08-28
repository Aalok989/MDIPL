import React, { useEffect, useMemo, useRef, useState } from "react";
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

export default function ProjectsByTotalRevenue({ inModal = false, n }) {
  const { abbreviateLabel, formatAxisValue } = useLabelAbbreviation(12);
  const [projects, setProjects] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nValue, setNValue] = useState(typeof n === 'number' ? n : 15);

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

  const fetchProjects = async (n = 15) => {
    try {
      setLoading(true);
      setError(null);
      const baseUrl = getApiUrl('PROJECT_PROFITABILITY');
      const url = `${baseUrl}?n=${n}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! ${response.status}`);
      }
      const data = await response.json();
      if (data && data.labels && data.datasets && Array.isArray(data.labels)) {
        const requested = typeof n === 'number' && n > 0 ? n : 15;
        // Keep requested count by normalizing empty labels instead of filtering them out
        const rawLabels = data.labels.slice(0, requested);
        const normalizedLabels = rawLabels.map((l) => (l && String(l).trim() !== '' ? l : 'Unknown'));
        const rawData = (data.datasets?.[0]?.data || []).slice(0, normalizedLabels.length);
        // Coerce non-numeric to 0 to maintain count consistency
        const normalizedData = rawData.map((v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0));
        setProjects(normalizedLabels);
        setRevenues(normalizedData);
      } else {
        throw new Error('Unexpected data structure');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message);
      const requested = n === 'all' ? fallbackProjects.length : (typeof n === 'number' && n > 0 ? n : 15);
      setProjects(fallbackProjects.slice(0, requested));
      setRevenues(fallbackRevenues.slice(0, requested));
    } finally {
      setLoading(false);
    }
  };

  // Sync with parent-provided n
  useEffect(() => {
    if (n === 'all') {
      // fetch with a high cap to approximate "all"
      setNValue(100);
    } else if (typeof n === 'number' && n > 0) {
      setNValue(n);
    }
  }, [n]);

  useEffect(() => {
    fetchProjects(nValue);
  }, [nValue]);

  const data = {
    labels: projects.map((p) => p || 'Unknown'),
    datasets: [
      {
        label: 'Total Revenue',
        data: revenues.map((r) => r || 0),
        backgroundColor: revenues.map((_, index) => {
          // Create a gradient from golden to yellow to gray
          const ratio = index / (projects.length - 1);
          if (ratio <= 0.5) {
            // First half: golden to yellow
            const goldenRatio = ratio * 2; // 0 to 1
            const r = Math.round(218 + (255 - 218) * goldenRatio);    // 218 to 255 (golden to yellow)
            const g = Math.round(165 + (255 - 165) * goldenRatio);    // 165 to 255
            const b = Math.round(32 + (0 - 32) * goldenRatio);       // 32 to 0
            return `rgb(${r}, ${g}, ${b})`;
          } else {
            // Second half: yellow to gray
            const grayRatio = (ratio - 0.5) * 2; // 0 to 1
            const r = Math.round(255 + (128 - 255) * grayRatio);      // 255 to 128 (yellow to gray)
            const g = Math.round(255 + (128 - 255) * grayRatio);      // 255 to 128
            const b = Math.round(0 + (128 - 0) * grayRatio);         // 0 to 128
            return `rgb(${r}, ${g}, ${b})`;
          }
        }),
        borderColor: revenues.map((_, index) => {
          // Create a gradient from golden to yellow to gray
          const ratio = index / (projects.length - 1);
          if (ratio <= 0.5) {
            // First half: golden to yellow
            const goldenRatio = ratio * 2; // 0 to 1
            const r = Math.round(218 + (255 - 218) * goldenRatio);    // 218 to 255 (golden to yellow)
            const g = Math.round(165 + (255 - 165) * goldenRatio);    // 165 to 255
            const b = Math.round(32 + (0 - 32) * goldenRatio);       // 32 to 0
            return `rgb(${r}, ${g}, ${b})`;
          } else {
            // Second half: yellow to gray
            const grayRatio = (ratio - 0.5) * 2; // 0 to 1
            const r = Math.round(255 + (128 - 255) * grayRatio);      // 255 to 128 (yellow to gray)
            const g = Math.round(255 + (128 - 255) * grayRatio);      // 255 to 128
            const b = Math.round(0 + (128 - 0) * grayRatio);         // 0 to 128
            return `rgb(${r}, ${g}, ${b})`;
          }
        }),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y", // 🔹 Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: error ? `Sample Data: Top ${nValue} Projects by Total Revenue` : `Cash Cows: Top ${nValue} Projects by Total Revenue`,
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

  // Dynamic chart height and resize handling
  const desiredRowHeight = 26;
  const chartHeight = useMemo(() => Math.min(1200, Math.max(300, projects.length * desiredRowHeight)), [projects.length]);
  const chartRef = useRef(null);
  useEffect(() => {
    const chart = chartRef.current?.chart || chartRef.current;
    if (chart?.resize) chart.resize();
  }, [chartHeight, projects.length, revenues.length]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl mx-auto">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading top {nValue} projects...</p>
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
    <div className={inModal ? 'flex flex-col h-full' : ''}>
      {/* Chart */}
      <div className={inModal ? 'w-full flex-1' : 'w-full'}>
        <div style={{ position: 'relative', width: '100%', height: inModal ? '100%' : chartHeight, minHeight: 0, overflow: 'hidden' }}>
          {inModal && (
            <div className="absolute top-1 right-12 z-20">
              <select
                value={nValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setNValue(val === 'all' ? 100 : parseInt(val, 10));
                }}
                className="px-2 py-1 border border-gray-300 rounded text-xs bg-white shadow-sm"
                title="Quick select"
              >
                <option value="all">All</option>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
                <option value={20}>Top 20</option>
                <option value={25}>Top 25</option>
                <option value={30}>Top 30</option>
                <option value={50}>Top 50</option>
              </select>
            </div>
          )}
          <Bar ref={chartRef} key={projects.length} data={data} options={options} />
        </div>
      </div>
    </div>
  );
};
