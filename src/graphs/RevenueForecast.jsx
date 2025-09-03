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
import useLabelAbbreviation from '../hooks/useLabelAbbreviation';
import { useDateFilter } from "../contexts/DateFilterContext";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);



const RevenueForecast = ({ inModal = false, modalDateRange = null }) => {
  const { dateRange } = useDateFilter();
  const { formatAxisValue } = useLabelAbbreviation(12);
  
  // Use modal date range if in modal, otherwise use global date range
  const currentDateRange = inModal && modalDateRange ? modalDateRange : dateRange;
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
        
                      const baseUrl = getApiUrl('REVENUE_FORECAST');
        const res = await fetch(baseUrl);
        
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
        title: { display: true, text: "Revenue" },
        ticks: {
          callback: function(value) {
            return formatAxisValue(value);
          },
          maxTicksLimit: 6,
        },
      },
      x: {
        title: { display: true, text: "Month" },
      },
    },
  };

  return (
    <div className={`w-full flex flex-col ${inModal ? '' : 'h-full'}`} style={inModal ? {} : { height: '400px' }}>
      {/* Chart Section */}
      <div className={`w-full ${inModal ? 'flex-shrink-0' : 'h-full'}`} style={inModal ? {} : { height: '400px' }}>
        <h2 className={`${inModal ? 'text-xl' : 'text-lg'} font-semibold text-gray-800 mb-4`}>
          The Oracle's Vision: 12-Month Revenue Forecast
        </h2>
        {loading ? (
          <div className="text-gray-500">Loading forecast…</div>
        ) : labels.length ? (
          <div className={`${inModal ? 'h-96' : 'h-full'} min-h-0 overflow-hidden`} style={inModal ? {} : { height: 'calc(100% - 60px)' }}>
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

      {/* Revenue Forecast Analysis Content - Only in Modal View */}
      {inModal && (
        <div className="mt-6 px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Revenue Forecast Analysis</h4>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Story:</p>
                <p className="text-sm text-gray-600">This line chart projects revenue over the next 12 months, showing forecasted trends with upper and lower bounds.</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Observation:</p>
                <div className="ml-4 space-y-1">
                  <p className="text-sm text-gray-600">• Current revenue peaks at around ₹40M.</p>
                  <p className="text-sm text-gray-600">• Optimistic forecast stabilizes at ₹20M, while pessimistic projection shows a sharp decline.</p>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                <p className="text-sm text-gray-600">Secure new contracts, diversify customers, and optimize spend to stabilize revenue and reduce forecast risk.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RevenueForecast;
