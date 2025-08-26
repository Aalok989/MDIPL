// ConcentrationRisk.jsx
import React from "react";
import Plot from "react-plotly.js";

const SupplyChainConcentrationRisk = () => {
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
    <>
      <h2 className="text-lg font-semibold mb-3">
        Concentration Risk: Supplier Diversity for Top Customers
      </h2>
      <Plot
        data={[
          {
            type: "bar",
            orientation: "h",
            y: supplierDiversity.map((d) => d.customer),
            x: supplierDiversity.map((d) => d.uniqueSuppliers),
            marker: {
              color: "rgba(59,130,246,0.7)", // Tailwind blue-500 with opacity
              line: { color: "rgba(59,130,246,1)", width: 1 },
            },
          },
        ]}
        layout={{
          margin: { l: 120, r: 30, t: 40, b: 40 },
          height: 450,
          xaxis: { title: "Number of Unique Suppliers" },
          yaxis: { title: "Customer", categoryorder: "total ascending" },
        }}
        style={{ width: "100%", height: "450px" }}
        config={{ responsive: true }}
      />
    </>
  );
};

export default SupplyChainConcentrationRisk;
