// ValueChainSunburstDemo.jsx
import React from "react";
import Plot from "react-plotly.js";

const Demo3 = () => {
  // Demo data (replace with API / Python output)
  const projectCustomerValue = [
    { project: "Project A", customer: "Alice Corp", value: 50000 },
    { project: "Project A", customer: "Beta Ltd", value: 30000 },
    { project: "Project B", customer: "Charlie Inc", value: 45000 },
    { project: "Project B", customer: "Delta Traders", value: 20000 },
    { project: "Project C", customer: "Echo Systems", value: 15000 },
    { project: "Project C", customer: "Foxtrot LLC", value: 10000 },
  ];

  // Prepare Plotly format
  const labels = [
    ...new Set(projectCustomerValue.map((d) => d.project)), // projects
    ...projectCustomerValue.map((d) => d.customer),         // customers
  ];

  const parents = [
    ...Array.from(new Set(projectCustomerValue.map((d) => d.project))).map(
      () => ""
    ), // top-level projects have no parent
    ...projectCustomerValue.map((d) => d.project), // customers belong to project
  ];

  const values = [
    ...Array.from(new Set(projectCustomerValue.map((d) => d.project))).map(
      (proj) =>
        projectCustomerValue
          .filter((d) => d.project === proj)
          .reduce((sum, d) => sum + d.value, 0)
    ), // sum per project
    ...projectCustomerValue.map((d) => d.value), // individual customer values
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-lg font-semibold mb-3">
        Who Funds Our Top Projects? A Customer Breakdown
      </h2>
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
    </div>
  );
};

export default Demo3;
