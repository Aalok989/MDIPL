// ProjectPersonalities.jsx
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getApiUrl } from "../config/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SupplierDiversityForTopCustomers = () => {
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(getApiUrl("RISK_ANALYSIS"));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const data = payload?.data || payload;
        const lbls = data?.labels || [];
        const ds = (data?.datasets && data?.datasets[0]?.data) ? data.datasets[0].data : [];
        setLabels(lbls);
        setValues(ds);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center text-gray-500">Loading supplier diversity...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Unique Suppliers",
        data: values,
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ← This allows us to control height manually
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Supplier Diversity for Top Customers (Unique Suppliers)",
        font: { size: 16 },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        title: { display: false },
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...values) * 1.1, // ← Prevents bars from hitting the top
        title: {
          display: true,
          text: "Unique Suppliers",
        },
        ticks: {
          precision: 0, // whole numbers only
        },
      },
    },
  };

  return (
    <Bar data={data} options={options} />
  );
};

export default SupplierDiversityForTopCustomers;