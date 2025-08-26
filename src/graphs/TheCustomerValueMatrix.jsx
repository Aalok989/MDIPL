import React from "react";
import { Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend);

const TheCustomerValueMatrix = () => {
  // 🔹 Hardcoded dataset (like your pandas output)
  const customers = [
    { name: "Alice Corp", transaction_count: 12, total_spend: 15000, spend_score: "4_VIP" },
    { name: "Beta Ltd", transaction_count: 7, total_spend: 8000, spend_score: "3_High" },
    { name: "Gamma Inc", transaction_count: 20, total_spend: 5000, spend_score: "2_Medium" },
    { name: "Delta Co", transaction_count: 3, total_spend: 2000, spend_score: "1_Low" },
    { name: "Epsilon Group", transaction_count: 15, total_spend: 12000, spend_score: "3_High" },
  ];

  // 🔹 Color map (like Plotly categories)
  const colorMap = {
    "1_Low": "rgba(239,68,68,0.7)",     // red
    "2_Medium": "rgba(59,130,246,0.7)", // blue
    "3_High": "rgba(34,197,94,0.7)",    // green
    "4_VIP": "rgba(234,179,8,0.8)",     // yellow
  };

  // 🔹 Transform for Chart.js
  const data = {
    datasets: customers.map((c) => ({
      label: c.name,
      data: [
        {
          x: c.transaction_count,
          y: c.total_spend,
          r: Math.sqrt(c.total_spend) / 15, // bubble size scaling
        },
      ],
      backgroundColor: colorMap[c.spend_score] || "rgba(107,114,128,0.7)",
      borderColor: "#333",
      borderWidth: 1,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }, // we'll add a custom legend below
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const customer = customers[ctx.datasetIndex];
            return [
              `Customer: ${customer.name}`,
              `Bills: ${customer.transaction_count}`,
              `Spend: ₹${customer.total_spend}`,
              `Segment: ${customer.spend_score}`,
            ];
          },
        },
      },
      title: {
        display: true,
        text: "The Customer Value Matrix",
        font: { size: 18 },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Frequency (Number of Bills)" },
        beginAtZero: true,
      },
      y: {
        title: { display: true, text: "Monetary (Total Spend)" },
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      <Bubble data={data} options={options} />
      {/* 🔹 Custom Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        {Object.entries(colorMap).map(([segment, color]) => (
          <div key={segment} className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            ></span>
            {segment.replace("_", " ")}
          </div>
        ))}
      </div>
    </>
  );
};

export default TheCustomerValueMatrix;