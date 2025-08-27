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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import useLabelAbbreviation from '../hooks/useLabelAbbreviation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function SupplierDiversityForTopCustomers() {
  const { abbreviateLabel } = useLabelAbbreviation(12);
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
        backgroundColor: "#1D4ED8",
        borderColor: "#1D4ED8",
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
        align: 'start',
        color: '#1f2937',
        padding: { top: 6, bottom: 10 },
      },
      tooltip: { enabled: true },
      datalabels: {
        color: '#ffffff',
        anchor: 'center',
        align: 'center',
        clamp: true,
        clip: true,
        font: { weight: 'bold', size: 10 },
        formatter: (value) => Number(value).toLocaleString(),
      },
    },
    scales: {
      x: {
        title: { display: false },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
          callback: function(value, index) {
            const original = data.labels?.[index] ?? String(value);
            return abbreviateLabel(original);
          }
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