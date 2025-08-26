// SuccessBlueprintTreemapsDemo.jsx
import React from "react";
import Plot from "react-plotly.js";

const Demo2 = () => {
  // Demo data
  const topCustomers = [
    { name: "Alice Corp", count: 25 },
    { name: "Beta Ltd", count: 18 },
    { name: "Charlie Inc", count: 12 },
    { name: "Delta Traders", count: 10 },
    { name: "Echo Systems", count: 8 },
  ];

  const topSuppliers = [
    { name: "SupplyHub", count: 22 },
    { name: "FastParts", count: 17 },
    { name: "Global Metals", count: 13 },
    { name: "QuickBuild", count: 9 },
    { name: "MegaSteel", count: 7 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Top Customers Treemap */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h2 className="text-lg font-semibold mb-3">
          Success Blueprint: Top Customer Contributors
        </h2>
        <Plot
          data={[
            {
              type: "treemap",
              labels: ["Customers", ...topCustomers.map((c) => c.name)],
              parents: ["", ...Array(topCustomers.length).fill("Customers")],
              values: [0, ...topCustomers.map((c) => c.count)],
              textinfo: "label+value",
              marker: { colorscale: "Blues" },
            },
          ]}
          layout={{
            margin: { l: 10, r: 10, t: 30, b: 10 },
          }}
          style={{ width: "100%", height: "400px" }}
          config={{ responsive: true }}
        />
      </div>

      {/* Top Suppliers Treemap */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h2 className="text-lg font-semibold mb-3">
          Success Blueprint: Top Supplier Contributors
        </h2>
        <Plot
          data={[
            {
              type: "treemap",
              labels: ["Suppliers", ...topSuppliers.map((s) => s.name)],
              parents: ["", ...Array(topSuppliers.length).fill("Suppliers")],
              values: [0, ...topSuppliers.map((s) => s.count)],
              textinfo: "label+value",
              marker: { colorscale: "Greens" },
            },
          ]}
          layout={{
            margin: { l: 10, r: 10, t: 30, b: 10 },
          }}
          style={{ width: "100%", height: "400px" }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
};

export default Demo2;
