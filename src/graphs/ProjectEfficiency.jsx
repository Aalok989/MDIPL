import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { getApiUrl } from "../config/api";

const ProjectEfficiency = () => {
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback sample data
  const fallbackData = [
    { project_name: "Project Alpha", duration_days: 30, total_revenue: 120000, revenue_per_day: 4000 },
    { project_name: "Project Beta", duration_days: 45, total_revenue: 150000, revenue_per_day: 3333 },
    { project_name: "Project Gamma", duration_days: 20, total_revenue: 90000, revenue_per_day: 4500 },
    { project_name: "Project Delta", duration_days: 60, total_revenue: 200000, revenue_per_day: 3333 },
    { project_name: "Project Epsilon", duration_days: 15, total_revenue: 75000, revenue_per_day: 5000 },
  ];

  useEffect(() => {
    const fetchProjectEfficiency = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(getApiUrl("PROJECT_EFFICIENCY"));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.slice(0, 100));
          throw new Error('Expected JSON, received HTML or text');
        }

        const data = await response.json();

        if (data && data.datasets && Array.isArray(data.datasets) && data.datasets[0]?.data) {
          const transformedData = data.datasets[0].data.map((item) => ({
            project_name: item.project || "Unknown Project",
            duration_days: item.x || 0,
            total_revenue: item.y || 0,
            revenue_per_day: item.r || 0,
          }));
          setProjectData(transformedData);
        } else {
          console.warn("Unexpected data structure:", data);
          setProjectData([]);
        }
      } catch (err) {
        console.error("Error fetching project efficiency data:", err);
        setError(err.message);
        setProjectData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectEfficiency();
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
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <p className="text-red-600 text-sm font-medium">Error Loading Data</p>
          <p className="text-xs text-gray-500 mt-1">Showing sample data</p>
        </div>
      </div>
    );
  }

  // No data
  if (!projectData.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  // Normalize bubble sizes
  const maxR = Math.max(...projectData.map((d) => d.revenue_per_day || 0), 1);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800 px-4 pt-4 pb-2">
        Project Efficiency: Revenue vs Duration
      </h3>
      <p className="text-xs text-gray-500 px-4 pb-3">Revenue per day across project duration</p>

      {/* Chart */}
      <div className="flex-1 px-2 pb-2">
        <Plot
          data={[
            {
              x: projectData.map((d) => d.duration_days),
              y: projectData.map((d) => d.total_revenue),
              text: projectData.map(
                (d) =>
                  `${d.project_name}<br>` +
                  `Duration: ${d.duration_days} days<br>` +
                  `Total Revenue: ₹${d.total_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}<br>` +
                  `Revenue/Day: ₹${d.revenue_per_day.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              ),
              mode: "markers",
              marker: {
                size: projectData.map((d) => (d.revenue_per_day / maxR) * 30), // scaled
                color: projectData.map((d) => d.revenue_per_day),
                colorscale: "Viridis",
                showscale: true,
                sizemode: "area",
              },
              hoverinfo: "text",
            },
          ]}
          layout={{
            title: {
              text: "Project Efficiency",
              font: { size: 14, weight: "bold" },
              x: 0.5,
              xanchor: "center",
            },
            xaxis: { 
              title: "Duration (Days)", 
              zeroline: false,
              tickfont: { size: 10 }
            },
            yaxis: { 
              title: "Total Revenue (₹)", 
              zeroline: false,
              tickfont: { size: 10 },
              tickformat: "~s"
            },
            margin: { l: 50, r: 30, t: 30, b: 50 },
            autosize: true,
          }}
          style={{ width: "100%", height: "100%" }}
          config={{ responsive: true, displayModeBar: false }}
        />
      </div>
    </div>
  );
};

export default ProjectEfficiency;