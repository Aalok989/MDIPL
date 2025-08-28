// ConcentrationRisk.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import Plot from "react-plotly.js";

const SupplyChainConcentrationRisk = ({ inModal = false }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [chartHeight, chartData]);

  // Demo data (replace with API / Python output)
  const supplierDiversity = [
    { customer: "Alice Corp", uniqueSuppliers: 2 },
    { customer: "Beta Ltd", uniqueSuppliers: 4 },
    { customer: "Charlie Inc", uniqueSuppliers: 1 },
    { customer: "Delta Traders", uniqueSuppliers: 3 },
    { customer: "Echo Systems", uniqueSuppliers: 5 },
    { customer: "Foxtrot LLC", uniqueSuppliers: 2 },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-3">Supply Chain Concentration Risk</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading risk data...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="flex-1 min-h-0">
          <Plot
            data={[
              {
                type: "scatter",
                mode: "markers",
                x: chartData.x,
                y: chartData.y,
                text: chartData.text,
                marker: {
                  size: chartData.size,
                  color: chartData.color,
                  colorscale: "Viridis",
                  showscale: true,
                  colorbar: { title: "Risk Level" }
                },
                hovertemplate: "%{text}<br>Risk: %{y}<br>Concentration: %{x}<extra></extra>"
              }
            ]}
            layout={{
              title: "Supply Chain Risk vs Concentration",
              xaxis: { title: "Concentration (%)" },
              yaxis: { title: "Risk Score" },
              height: undefined, // Let Plotly handle height responsively
              autosize: true,
            }}
            style={{ width: "100%", height: "100%" }}
            config={{ responsive: true }}
            useResizeHandler={true}
          />
        </div>
      )}
    </div>
  );
};

export default SupplyChainConcentrationRisk;
