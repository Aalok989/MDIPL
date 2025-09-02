import React, { useEffect, useMemo, useRef, useState } from "react";
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getApiUrl } from "../config/api";
import useLabelAbbreviation from '../hooks/useLabelAbbreviation';
import { useDateFilter } from "../contexts/DateFilterContext";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function CustomersByTotalRevenue({ inModal = false }) {
  const { abbreviateLabel, formatAxisValue } = useLabelAbbreviation(12);
  const { dateRange } = useDateFilter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nValue, setNValue] = useState(10);

  // Fallback sample data in case API fails
  const fallbackData = [
    { customer_name: "Alice Corp", bill_total: 15000 },
    { customer_name: "Beta Ltd", bill_total: 14000 },
    { customer_name: "Charlie Inc", bill_total: 12500 },
    { customer_name: "Delta Group", bill_total: 11800 },
    { customer_name: "Echo Enterprises", bill_total: 11000 },
    { customer_name: "Foxtrot LLC", bill_total: 10500 },
    { customer_name: "Gamma Traders", bill_total: 9800 },
    { customer_name: "Helios Systems", bill_total: 9500 },
    { customer_name: "Icarus Corp", bill_total: 9100 },
    { customer_name: "Jupiter Pvt Ltd", bill_total: 8800 },
  ];

  // 🔹 Fetch live customers data with ?n=
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = getApiUrl('TOP_CUSTOMERS');
        const startDate = dateRange.startDate.toISOString().split('T')[0];
        const endDate = dateRange.endDate.toISOString().split('T')[0];
        
        const urlWithParams = `${baseUrl}?n=${nValue}&start_date=${startDate}&end_date=${endDate}`;
        const response = await fetch(urlWithParams);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Normalize to preserve exact N
        if (data && data.labels && data.datasets && Array.isArray(data.labels)) {
          const rawLabels = data.labels.slice(0, nValue);
          const normalizedLabels = rawLabels.map(l => (l && String(l).trim() !== '' ? l : 'Unknown Customer'));
          const rawData = (data.datasets?.[0]?.data || []).slice(0, normalizedLabels.length);
          const normalizedData = rawData.map(v => (typeof v === 'number' && !Number.isNaN(v) ? v : 0));
          const customersArray = normalizedLabels.map((label, index) => ({ customer_name: label, bill_total: normalizedData[index] || 0 }));
          setCustomers(customersArray);
        } else if (Array.isArray(data)) {
          console.log('Data is an array with', data.length, 'items');
          setCustomers(data);
        } else if (data && typeof data === 'object') {
          // If data is an object, check if it has a results property (common in Django REST)
          if (Array.isArray(data.results)) {
            console.log('Data has results array with', data.results.length, 'items');
            setCustomers(data.results);
          } else if (Array.isArray(data.data)) {
            console.log('Data has data array with', data.data.length, 'items');
            setCustomers(data.data);
          } else {
            console.warn('Unexpected data structure:', data);
            console.log('Available keys:', Object.keys(data));
            // Try to extract any array from the object
            const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              console.log('Found arrays in data:', possibleArrays);
              setCustomers(possibleArrays[0]); // Use the first array found
            } else {
              setCustomers([]);
            }
          }
        } else {
          console.warn('Data is not an array:', data);
          console.log('Data type:', typeof data);
          setCustomers([]);
        }
        
        setError(null);
      } catch (error) {
        console.error("Error fetching customers data:", error);
        setError(error.message);
        // Use fallback data instead of empty array
        setCustomers(fallbackData.slice(0, nValue));
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [nValue, dateRange]);

  // 🔹 Sort customers ascending (so largest appears at top)
  // Ensure customers is always an array before spreading
  const sortedCustomers = Array.isArray(customers) 
    ? [...customers].sort((a, b) => a.bill_total - b.bill_total)
    : [];

  const data = {
    labels: sortedCustomers.map((c) => c?.customer_name || 'Unknown Customer'),
    datasets: [
      {
        label: "Total Revenue",
        data: sortedCustomers.map((c) => c?.bill_total || 0),
        backgroundColor: sortedCustomers.map((_, index) => {
          // Create a gradient from turquoise to aqua to deep sea blue to teal
          const ratio = index / (sortedCustomers.length - 1);
          if (ratio <= 0.33) {
            // First third: turquoise to aqua
            const turquoiseRatio = ratio / 0.33; // 0 to 1
            const r = Math.round(64 + (0 - 64) * turquoiseRatio);      // 64 to 0 (turquoise to aqua)
            const g = Math.round(224 + (255 - 224) * turquoiseRatio);  // 224 to 255
            const b = Math.round(208 + (255 - 208) * turquoiseRatio);  // 208 to 255
            return `rgb(${r}, ${g}, ${b})`;
          } else if (ratio <= 0.66) {
            // Second third: aqua to deep sea blue
            const aquaRatio = (ratio - 0.33) / 0.33; // 0 to 1
            const r = Math.round(0 + (0 - 0) * aquaRatio);            // 0 to 0 (aqua to deep sea blue)
            const g = Math.round(255 + (105 - 255) * aquaRatio);       // 255 to 105
            const b = Math.round(255 + (148 - 255) * aquaRatio);       // 255 to 148
            return `rgb(${r}, ${g}, ${b})`;
          } else {
            // Last third: deep sea blue to teal
            const seaRatio = (ratio - 0.66) / 0.34; // 0 to 1
            const r = Math.round(0 + (0 - 0) * seaRatio);             // 0 to 0 (deep sea blue to teal)
            const g = Math.round(105 + (128 - 105) * seaRatio);        // 105 to 128
            const b = Math.round(148 + (128 - 148) * seaRatio);        // 148 to 128
            return `rgb(${r}, ${g}, ${b})`;
          }
        }),
        borderColor: sortedCustomers.map((_, index) => {
          // Create a gradient from turquoise to aqua to deep sea blue to teal
          const ratio = index / (sortedCustomers.length - 1);
          if (ratio <= 0.33) {
            // First third: turquoise to aqua
            const turquoiseRatio = ratio / 0.33; // 0 to 1
            const r = Math.round(64 + (0 - 64) * turquoiseRatio);      // 64 to 0 (turquoise to aqua)
            const g = Math.round(224 + (255 - 224) * turquoiseRatio);  // 224 to 255
            const b = Math.round(208 + (255 - 208) * turquoiseRatio);  // 208 to 255
            return `rgb(${r}, ${g}, ${b})`;
          } else if (ratio <= 0.66) {
            // Second third: aqua to deep sea blue
            const aquaRatio = (ratio - 0.33) / 0.33; // 0 to 1
            const r = Math.round(0 + (0 - 0) * aquaRatio);            // 0 to 0 (aqua to deep sea blue)
            const g = Math.round(255 + (105 - 255) * aquaRatio);       // 255 to 105
            const b = Math.round(255 + (148 - 255) * aquaRatio);       // 255 to 148
            return `rgb(${r}, ${g}, ${b})`;
          } else {
            // Last third: deep sea blue to teal
            const seaRatio = (ratio - 0.66) / 0.34; // 0 to 1
            const r = Math.round(0 + (0 - 0) * seaRatio);             // 0 to 0 (deep sea blue to teal)
            const g = Math.round(105 + (128 - 105) * seaRatio);        // 105 to 128
            const b = Math.round(148 + (128 - 148) * seaRatio);        // 148 to 128
            return `rgb(${r}, ${g}, ${b})`;
          }
        }),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y", // 🔹 Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false, // Same as SuppliersByTotalSpend
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: error ? "Sample Data: Top Customers by Total Revenue" : "Our Whales: Top 10 Customers by Total Revenue",
        font: { size: 18 },
        align: 'start',
        color: '#1f2937',
        padding: { top: 6, bottom: 10 },
      },
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
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Revenue ($)",
          font: { size: 12, weight: "bold" },
          color: "#374151",
        },
        ticks: {
          callback: function(value) {
            return formatAxisValue(value);
          },
          maxTicksLimit: 6,
        },
      },
      y: {
        title: {
          display: true,
          text: "Customer Name",
          font: { size: 12, weight: "bold" },
          color: "#374151",
        },
        ticks: {
          autoSkip: false,
          font: { size: 10 },
          callback: function(value, index) {
            const original = data.labels?.[index] ?? String(value);
            return abbreviateLabel(original);
          }
        }
      }
    },
  };

  // Compute layout metrics and attach resize handler BEFORE any early returns to keep hook order stable
  const chartHeight = useMemo(() => {
    return inModal ? 400 : 400; // Same height for both views like SuppliersByTotalSpend
  }, [inModal]);
  const chartRef = useRef(null);
  useEffect(() => {
    const chart = chartRef.current?.chart || chartRef.current;
    if (chart?.resize) chart.resize();
  }, [chartHeight, customers.length]);

  // Show error state
  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-3xl mx-auto">
        <div className="text-center text-red-500">
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-sm">{error}</p>
          <p className="text-xs text-gray-500 mt-2">Showing sample data instead</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-3xl mx-auto">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading customer data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!Array.isArray(customers) || customers.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-3xl mx-auto">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p>No customer data found. Please check your API connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${inModal ? 'h-full' : ''}`} style={inModal ? {} : { height: chartHeight }}>
      {/* Quick select filter - only in modal */}
      {inModal && (
        <div className="absolute top-1 right-12 z-20">
          <select
            value={nValue}
            onChange={(e) => {
              const val = e.target.value;
              setNValue(val === 'all' ? 100 : parseInt(val, 10));
            }}
            className="px-2 py-1 border border-gray-300 rounded text-xs bg-white shadow-sm"
            title="Quick select"
          >
            <option value="all">All</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
            <option value={25}>Top 25</option>
            <option value={30}>Top 30</option>
            <option value={50}>Top 50</option>
          </select>
        </div>
      )}
      
      <div className={`w-full ${inModal ? 'h-full' : ''}`} style={inModal ? {} : { height: chartHeight }}>
        <Bar ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
};
