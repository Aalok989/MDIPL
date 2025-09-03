import React, { useEffect, useState, useMemo, useRef } from "react";
import Plot from "react-plotly.js";
import { getApiUrl } from "../config/api";
import useResizeKey from "../hooks/useResizeKey";
import { useDateFilter } from "../contexts/DateFilterContext";

const ProjectEfficiency = ({ inModal = false }) => {
  const { dateRange } = useDateFilter();
  const resizeKey = useResizeKey(200);
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

  // Chart height for responsive layout
  const chartHeight = useMemo(() => {
    return inModal ? 400 : 400; // Same height for both views like other charts
  }, [inModal]);

  // Ensure hooks order is stable across renders: define layout hooks before any early returns
  const chartRef = useRef(null);
  useEffect(() => {
    const chart = chartRef.current?.chart || chartRef.current;
    if (chart?.resize) {
      chart.resize();
    }
  }, [chartHeight, projectData.length]);

  useEffect(() => {
    const fetchProjectEfficiency = async () => {
      try {
        setLoading(true);
        setError(null);

        const startDate = dateRange.startDate.toISOString().split('T')[0];
        const endDate = dateRange.endDate.toISOString().split('T')[0];
        
        const baseUrl = getApiUrl("PROJECT_EFFICIENCY");
        const url = `${baseUrl}?start_date=${startDate}&end_date=${endDate}`;
        let response = await fetch(url);

        // If the API doesn't support date filtering, try without date parameters
        if (!response.ok && response.status === 500) {
          console.log('ProjectEfficiency: API returned 500, trying without date parameters');
          const fallbackUrl = getApiUrl("PROJECT_EFFICIENCY");
          response = await fetch(fallbackUrl);
        }

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
  }, [dateRange]);

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
    <div className={`w-full flex flex-col ${inModal ? '' : 'h-full'}`}>
      {/* Chart Section */}
      <div className={`w-full ${inModal ? 'flex-shrink-0' : 'h-full'}`}>
        {/* Title */}
        <h3 className={`${inModal ? 'text-xl' : 'text-lg'} font-semibold text-gray-800 px-4 pt-4 pb-2`}>
          Project Efficiency: Revenue vs Duration
        </h3>
        <p className="text-xs text-gray-500 px-4 pb-3">Revenue per day across project duration</p>

        {/* Chart */}
        <div className={`flex-1 px-2 pb-2 min-h-0 ${inModal ? 'h-96' : ''}`}>
        <Plot
          key={`${resizeKey}-${projectData.length}`}
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
                size: projectData.map((d) => (d.revenue_per_day / maxR) * 100), // scaled
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
            height: inModal ? undefined : 400, // Fixed height for regular view, responsive for modal
            autosize: true,
          }}
          style={{ width: "100%", height: inModal ? "100%" : "400px" }}
          config={{ responsive: true, displayModeBar: false }}
          useResizeHandler
        />
        </div>
      </div>

      {/* Project Efficiency Analysis Content - Only in Modal View */}
      {inModal && (
        <div className="mt-6 px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Project Efficiency Analysis</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Key Insights</h5>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Majority of Observations Are Small to Medium Scale</p>
                    <p className="text-sm text-gray-600">Most data points fall in the range X = 0–200 and Y = 0–20M. This cluster indicates that the majority of activities/events are consistent but relatively low in scale.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Significant Outliers Identified</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm text-gray-600">• X ≈ 400, Y ≈ 55M → The largest outlier, representing an exceptionally high-value case.</p>
                      <p className="text-sm text-gray-600">• X ≈ 600, Y ≈ 40M → Another outlier, also well above the typical range.</p>
                      <p className="text-sm text-gray-600">These rare cases contribute disproportionately to total performance.</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Most Influential Contributor</p>
                    <p className="text-sm text-gray-600">A large yellow bubble at X ≈ 10, Y ≈ 10M stands out. Despite a low X-value, it has both the highest color scale (&gt;500) and the largest bubble size. This suggests a single record with outsized impact, potentially a key customer/product/transaction.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Color & Size Distribution</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm text-gray-600">• Purple bubbles (~100–150) dominate → many low-intensity contributors.</p>
                      <p className="text-sm text-gray-600">• Teal/green bubbles (~200–300) form the medium performers cluster.</p>
                      <p className="text-sm text-gray-600">• Only one strong yellow bubble (&gt;500) → represents the standout high performer.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">🔹 Recommendations</h5>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Focus on Outliers</p>
                    <p className="text-sm text-gray-600">Investigate the X=400, Y=55M and X=600, Y=40M cases. Understand what drove these extraordinary values (e.g., one-time deals, anomalies, or high-value customers). If repeatable, replicate the success factors; if anomalies, treat them carefully in forecasting.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Leverage the Standout Contributor</p>
                    <p className="text-sm text-gray-600">The yellow bubble (X≈10, Y≈10M) is a key driver. Recommendation: Strengthen engagement, retention, or scaling strategies around this contributor.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Grow the Medium Cluster</p>
                    <p className="text-sm text-gray-600">The X=50–150, Y=5M–15M cluster represents stable mid-performers. Action: Nurture this segment (e.g., targeted campaigns, loyalty programs, upselling) to gradually move them toward the high-performing group.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">De-risk Dependence on Few High Performers</p>
                    <p className="text-sm text-gray-600">Current distribution shows heavy reliance on a few outliers. Recommendation: Diversify performance by expanding the base of mid-range contributors, reducing business risk.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectEfficiency;