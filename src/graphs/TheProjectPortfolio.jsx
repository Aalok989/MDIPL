// ProjectPersonalitiesScatter.jsx
import React, { useEffect, useState } from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LinearScale,
} from "chart.js";
import { getApiUrl } from "../config/api";
import useLabelAbbreviation from '../hooks/useLabelAbbreviation';

ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale);

// Abbreviate long names for axis tick labels if needed in custom axes
function abbreviateLabel(raw, maxLength = 12) {
  if (!raw || typeof raw !== 'string') return raw || '';
  const name = raw.replace(/\s+/g, ' ').trim();
  if (name.length <= maxLength) return name;
  const words = name.split(' ').filter(Boolean);
  const initials = words.map(w => w[0].toUpperCase()).join('');
  if (initials.length >= 2) return initials.slice(0, maxLength);
  let out = name.slice(0, maxLength - 1);
  return out + '…';
}

export default function TheProjectPortfolio() {
  const { formatAxisValue } = useLabelAbbreviation();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clusterColors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"]; // extend if needed

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(getApiUrl("PROJECT_CLUSTERS"));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const data = payload?.data || payload; // support wrapper
        const items = Array.isArray(data?.datasets?.[0]?.data) ? data.datasets[0].data : [];
        const mapped = items.map((item) => ({
          x: item?.x || 0,
          y: item?.y || 0,
          cluster: item?.cluster ?? 0,
          name: item?.name || "",
        }));
        setPoints(mapped);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClusters();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-md w-full max-w-3xl mx-auto text-center text-gray-500">Loading project clusters...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-md w-full max-w-3xl mx-auto text-center text-red-500">{error}</div>
    );
  }

  const chartData = {
    datasets: [
      {
        label: "Projects",
        data: points.map((p) => ({ x: p.x, y: p.y, name: p.name, cluster: p.cluster })),
        backgroundColor: points.map((p) => clusterColors[(Number(p.cluster) || 0) % clusterColors.length]),
        pointRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const d = ctx.raw || {};
            const x = d.x ?? ctx.parsed.x;
            const y = d.y ?? ctx.parsed.y;
            const name = d.name || "";
            return name ? `${name}\nTx: ${x}, Revenue: ₹${y.toLocaleString()}` : `Tx: ${x}, Revenue: ₹${y.toLocaleString()}`;
          },
        },
      },
      datalabels: { // Disable data labels
        display: false
      }
    },
    scales: {
      x: { 
        title: { display: true, text: "Transaction Count" }, 
        beginAtZero: true,
        ticks: {
          callback: (v) => formatAxisValue(v),
          maxTicksLimit: 6,
        }
      },
      y: { 
        title: { display: true, text: "Total Revenue (₹)" }, 
        beginAtZero: true, 
        ticks: { callback: (v) => formatAxisValue(v), maxTicksLimit: 6 } 
      },
    },
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">The Project Portfolio</h2>
      <Scatter data={chartData} options={options} />
    </>
  );
};
