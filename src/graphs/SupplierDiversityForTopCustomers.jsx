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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

// Abbreviate long customer labels
function abbreviateLabel(raw, maxLength = 12) {
  if (!raw || typeof raw !== 'string') return raw || '';
  const name = raw.replace(/\s+/g, ' ').trim();
  if (name.length <= maxLength) return name;

  const stopwords = new Set(['AND', 'OF', 'THE', 'PVT', 'PVT.', 'PRIVATE', 'LTD', 'LTD.', 'LIMITED', 'CO', 'COMPANY']);
  const words = name.split(' ').filter(Boolean);
  const initials = words
    .filter(w => !stopwords.has(w.toUpperCase()))
    .map(w => w[0].toUpperCase())
    .join('');
  if (initials.length >= 2) return initials.slice(0, maxLength);

  let out = '';
  for (let i = 0; i < words.length; i += 1) {
    const w = words[i];
    const chunk = (w.length > 6 ? w.slice(0, 6) + '.' : w) + (i < words.length - 1 ? ' ' : '');
    if ((out + chunk).length > maxLength - 1) break;
    out += chunk;
  }
  const truncated = out.trim().replace(/[ .]+$/, '');
  if (truncated) return (truncated.length > maxLength ? truncated.slice(0, maxLength - 1) : truncated) + '…';
  return name.slice(0, maxLength - 1) + '…';
}
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

export default SupplierDiversityForTopCustomers;