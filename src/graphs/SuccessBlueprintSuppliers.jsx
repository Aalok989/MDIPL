import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { apiRequest } from "../config/api";
import useResizeKey from "../hooks/useResizeKey";
import useLabelAbbreviation from "../hooks/useLabelAbbreviation";

export default function SuccessBlueprintSuppliers() {
  const resizeKey = useResizeKey(200);
  const { abbreviateLabel } = useLabelAbbreviation(12);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('SUCCESS_BLUEPRINT');
        const vendorData = response.vendor_chart;
        if (vendorData && vendorData.data) {
          const originalLabels = vendorData.data.labels;
          const abbreviatedLabels = originalLabels.map(abbreviateLabel);
          const trace = {
            type: "treemap",
            labels: abbreviatedLabels,
            parents: Array(abbreviatedLabels.length).fill("Suppliers"),
            values: vendorData.data.datasets[0].data,
            textinfo: "label+value",
            hovertemplate: `%{customdata}<br>Contributions: %{value}<extra></extra>`,
            customdata: originalLabels, // Pass full names for hover
          };
          setChartData(trace);
          setError(null);
        } else {
          throw new Error('Invalid vendor data format received from API');
        }
      } catch (err) {
        console.error('Error fetching success blueprint vendor data:', err);
        setError('Failed to load success blueprint vendor data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const layout = {
    // Title is rendered via a DOM header for consistent top-left alignment across charts
    margin: { t: 10, l: 20, r: 20, b: 20 },
    height: 320,
    autosize: true,
    uniformtext: { minsize: 8, mode: "show" },
  };

  const config = { responsive: true, displayModeBar: false };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-md flex items-center justify-center h-80">
        <div className="text-lg text-gray-600">Loading success blueprint vendor data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-md flex items-center justify-center h-80">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-md flex items-center justify-center h-80">
        <div className="text-lg text-gray-600">No vendor data available</div>
      </div>
    );
  }

  return (
    <div style={{ height: 320 }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">
          Success Blueprint — Top Supplier Contributors
        </h2>
      </div>
      <Plot
        key={resizeKey}
        data={[chartData]}
        layout={layout}
        config={config}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
        className="w-full h-full"
      />
    </div>
  );
}
