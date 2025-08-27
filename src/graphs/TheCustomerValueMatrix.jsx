// CustomerValueMatrix.jsx
import React, { useEffect, useState } from "react";
import { Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  LinearScale,
  PointElement,
} from "chart.js";
import { getApiUrl } from "../config/api";
import useResizeKey from '../hooks/useResizeKey';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export default function CustomerValueMatrix() {
  const resizeKey = useResizeKey();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(getApiUrl("CUSTOMER_VALUE_MATRIX"));
        const data = await response.json();

        const colors = {
          "1_Low": "rgba(239, 68, 68, 0.6)",     // red
          "2_Medium": "rgba(245, 158, 11, 0.6)", // amber
          "3_High": "rgba(34, 197, 94, 0.6)",    // green
          "4_VIP": "rgba(59, 130, 246, 0.6)",    // blue
        };

        const datasets = data.datasets.map((ds) => ({
          label: ds.label,
          data: ds.data.map((p) => ({
            x: p.x,
            y: p.y,
            r: Math.max(p.r / 5000, 3) // minimum radius 3px
          })),
          backgroundColor: colors[ds.label] || "rgba(107,114,128,0.6)",
        }));

        setChartData({ datasets });
      } catch (error) {
        console.error("Error fetching CVM data:", error);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        enabled: true, // keep tooltip on hover
        callbacks: {
          // Optional: clean up tooltip text if needed
          label: function (context) {
            return `x: ${context.raw.x}, y: ${context.raw.y.toLocaleString()}`;
          },
        },
      },
      datalabels: {
        display: false, // 🚫 completely hide data labels
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Customer Frequency" },
      },
      y: {
        title: { display: true, text: "Revenue (₹)" },
        ticks: {
          callback: (value) => "₹" + value.toLocaleString(),
        },
      },
    },
  };

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Customer Value Matrix
      </h2>
      {chartData ? (
        <Bubble data={chartData} options={options} />
      ) : (
        <p className="text-gray-500">Loading data...</p>
      )}
    </>
  );
}
