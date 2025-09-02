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
import { useDateFilter } from "../contexts/DateFilterContext";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Client-side filtering function for date range
const filterDataByDateRange = (labels, forecast, lower, upper, startDate, endDate) => {
  const filteredIndices = [];
  
  labels.forEach((label, index) => {
    // Handle different date formats: "YYYY-MM", "MMM YYYY", etc.
    let labelDate;
    if (label.includes('-')) {
      // Format: "YYYY-MM"
      labelDate = new Date(label + '-01');
    } else if (label.includes(' ')) {
      // Format: "MMM YYYY"
      labelDate = new Date(label + ' 01');
    } else {
      // Try to parse as is
      labelDate = new Date(label);
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (labelDate >= start && labelDate <= end) {
      filteredIndices.push(index);
    }
  });
  
  return {
    labels: filteredIndices.map(i => labels[i]),
    forecast: filteredIndices.map(i => forecast[i]),
    lower: filteredIndices.map(i => lower[i]),
    upper: filteredIndices.map(i => upper[i])
  };
};

const RevenueForecast = ({ inModal = false }) => {
  const { dateRange } = useDateFilter();
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
        
        const startDate = dateRange.startDate.toISOString().split('T')[0];
        const endDate = dateRange.endDate.toISOString().split('T')[0];
        
        console.log('RevenueForecast: Fetching data for date range:', { startDate, endDate });
        
        const baseUrl = getApiUrl('REVENUE_FORECAST');
        const url = `${baseUrl}?start_date=${startDate}&end_date=${endDate}`;
        console.log('RevenueForecast: API URL:', url);
        
        let res = await fetch(url);
        
        // If the API doesn't support date filtering, try without date parameters
        if (!res.ok && res.status === 500) {
          console.log('RevenueForecast: API returned 500, trying without date parameters');
          const fallbackUrl = getApiUrl('REVENUE_FORECAST');
          res = await fetch(fallbackUrl);
        }
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const apiLabels = json?.data?.labels || [];
        const datasets = json?.data?.datasets || [];
        const f = datasets.find(d => /forecast/i.test(d.label))?.data || [];
        const lb = datasets.find(d => /lower/i.test(d.label))?.data || [];
        const ub = datasets.find(d => /upper/i.test(d.label))?.data || [];
        // Client-side filtering if API doesn't support date filtering
        const filteredData = filterDataByDateRange(apiLabels, f, lb, ub, startDate, endDate);
        
        setLabels(filteredData.labels);
        setForecast(filteredData.forecast);
        setLower(filteredData.lower);
        setUpper(filteredData.upper);
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
  }, [dateRange]);

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
