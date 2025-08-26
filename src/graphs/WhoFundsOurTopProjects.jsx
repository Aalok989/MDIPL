// WhoFundsOurTopProjects.jsx
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { getApiUrl } from "../config/api";

const WhoFundsOurTopProjects = () => {
  const [labels, setLabels] = useState([]);
  const [parents, setParents] = useState([]);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchValueChain = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(getApiUrl("VALUE_CHAIN"));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();

        // Expecting shape: { chartType: "sunburst", data: { Project: { Customer: amount, ... }, ... } }
        const dataObj = payload?.data || {};
        console.log(dataObj);

        const root = "All Projects";
        const nextLabels = [root];
        const nextParents = [""];
        const nextValues = [0];

        // First pass: add projects and compute project totals
        for (const [project, customers] of Object.entries(dataObj)) {
          const projectTotal = Object.values(customers || {}).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
          nextLabels.push(project);
          nextParents.push(root);
          nextValues.push(projectTotal);
          nextValues[0] += projectTotal; // accumulate root total
        }

        // Second pass: add customer nodes under each project
        for (const [project, customers] of Object.entries(dataObj)) {
          for (const [customer, amount] of Object.entries(customers || {})) {
            nextLabels.push(customer);
            nextParents.push(project);
            nextValues.push(typeof amount === 'number' ? amount : 0);
          }
        }

        setLabels(nextLabels);
        setParents(nextParents);
        setValues(nextValues);
      } catch (e) {
        console.error('Failed to fetch value chain:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchValueChain();
  }, []);

  return (
    <>
      <h2 className="text-lg font-semibold mb-3">Who Funds Our Top Projects? A Customer Breakdown</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading sunburst data...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <Plot
          data={[
            {
              type: "sunburst",
              labels,
              parents,
              values,
              branchvalues: "total",
              textinfo: "label+value",
              marker: { line: { width: 2 } },
            },
          ]}
          layout={{
            margin: { l: 10, r: 10, t: 40, b: 10 },
            height: 500,
          }}
          style={{ width: "100%", height: "500px" }}
          config={{ responsive: true }}
        />
      )}
    </>
  );
};

export default WhoFundsOurTopProjects;
