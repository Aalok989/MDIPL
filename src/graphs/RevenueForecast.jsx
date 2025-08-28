// RevenueForecastChart.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

import { getApiUrl } from "../config/api";
import useResizeKey from '../hooks/useResizeKey';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const RevenueForecast = ({ inModal = false }) => {
  const [labels, setLabels] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [lower, setLower] = useState([]);
  const [upper, setUpper] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart height for responsive layout
  const chartHeight = useMemo(() => {
    return inModal ? 400 : 400; // Same height for both views like other charts
  }, [inModal]);

  // Ensure hooks order is stable across renders: define layout hooks before any early returns
  const chartRef = useRef(null);
  useEffect(() => {
    const chart = chartRef.current?.chart || chartRef.current;
    if (chart?.resize) {
      chart.resize();
    }
  }, [chartHeight, labels.length]);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(getApiUrl('REVENUE_FORECAST'));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const apiLabels = json?.data?.labels || [];
        const datasets = json?.data?.datasets || [];
        const f = datasets.find(d => /forecast/i.test(d.label))?.data || [];
        const lb = datasets.find(d => /lower/i.test(d.label))?.data || [];
        const ub = datasets.find(d => /upper/i.test(d.label))?.data || [];
        setLabels(apiLabels);
        setForecast(f);
        setLower(lb);
        setUpper(ub);
      } catch (e) {
        console.error('Failed to fetch revenue forecast:', e);
        setError(e?.message || 'Failed to load');
        setLabels([]);
        setForecast([]);
        setLower([]);
        setUpper([]);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: "Forecast",
        data: forecast,
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        borderDash: [6, 6],
        tension: 0.25,
        pointRadius: 0,
      },
      {
        label: "Lower Bound",
        data: lower,
        borderColor: "rgba(239, 68, 68, 0.8)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderDash: [2, 2],
        tension: 0.2,
        pointRadius: 0,
      },
      {
        label: "Upper Bound",
        data: upper,
        borderColor: "rgba(59, 130, 246, 0.8)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderDash: [2, 2],
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: "Revenue (₹)" },
      },
      x: {
        title: { display: true, text: "Month" },
      },
    },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        The Oracle's Vision: 12-Month Revenue Forecast
      </h2>
      {loading ? (
        <div className="text-gray-500">Loading forecast…</div>
      ) : labels.length ? (
        <div className="flex-1 min-h-0">
          <Line 
            ref={chartRef}
            data={data} 
            options={{
              ...options,
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      ) : (
        <div className="text-red-500">{error || 'No forecast data available.'}</div>
      )}
    </div>
  );
}

export default RevenueForecast;
