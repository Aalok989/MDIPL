// CustomerValueMatrixDemo.jsx
import React from "react";
import Plot from "react-plotly.js";

const Demo = () => {
  // Demo dataset
  const customers = [
    { customer_name: "Alice Corp", transaction_count: 12, total_spend: 15000, spend_score: "4_VIP" },
    { customer_name: "Beta Ltd", transaction_count: 7, total_spend: 8000, spend_score: "3_High" },
    { customer_name: "Charlie Inc", transaction_count: 5, total_spend: 4000, spend_score: "2_Medium" },
    { customer_name: "Delta Traders", transaction_count: 2, total_spend: 1200, spend_score: "1_Low" },
    { customer_name: "Echo Systems", transaction_count: 9, total_spend: 9500, spend_score: "3_High" },
    { customer_name: "Foxtrot Co", transaction_count: 15, total_spend: 22000, spend_score: "4_VIP" },
    { customer_name: "Gamma Partners", transaction_count: 3, total_spend: 2500, spend_score: "2_Medium" },
  ];

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">
        The Customer Value Matrix (Demo Data)
      </h2>
      <Plot
        data={[
          {
            type: "scatter",
            mode: "markers",
            x: customers.map((c) => c.transaction_count),
            y: customers.map((c) => c.total_spend),
            text: customers.map((c) => c.customer_name), // hover label
            marker: {
              size: customers.map((c) => c.total_spend),
              sizemode: "area",
              sizeref:
                2.0 *
                Math.max(...customers.map((c) => c.total_spend)) /
                (100 ** 2), // normalize bubble size
              sizemin: 6,
              color: customers.map((c) => c.spend_score),
              colorscale: "Set1",
              line: { width: 1, color: "white" },
            },
          },
        ]}
        layout={{
          title: "The Customer Value Matrix",
          xaxis: { title: "Frequency (Number of Bills)" },
          yaxis: { title: "Monetary (Total Spend)" },
          margin: { l: 80, r: 40, t: 50, b: 60 },
          hovermode: "closest",
        }}
        style={{ width: "100%", height: "600px" }}
        config={{ responsive: true }}
      />
    </div>
  );
};

export default Demo;
