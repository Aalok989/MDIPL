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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function LoyalLegion({ inModal = false, n }) {
  const { abbreviateLabel, formatAxisValue } = useLabelAbbreviation(12);
  const [customers, setCustomers] = useState([]);
  const [billCounts, setBillCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nValue, setNValue] = useState(typeof n === 'number' ? n : 15);

  // Fallback sample data in case API fails
  const fallbackCustomers = [
    "Alice Corp", "Beta Ltd", "Gamma Inc", "Delta Co", "Epsilon Group",
    "Zeta Systems", "Eta Partners", "Theta LLC", "Iota Pvt Ltd", "Kappa Enterprises",
    "Lambda Traders", "Mu Industries", "Nu Solutions", "Xi Tech", "Omicron Holdings"
  ];
  
  const fallbackBillCounts = [
    48, 44, 42, 40, 39, 38, 36, 35, 34, 32, 30, 29, 28, 27, 25
  ];

  // Sync with external n (from modal quick select)
  useEffect(() => {
    if (n === 'all') {
      setNValue(100);
    } else if (typeof n === 'number' && n > 0) {
      setNValue(n);
    }
  }, [n]);

  // Fetch data with ?n=
  useEffect(() => {
    const fetchCustomerLoyalty = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = getApiUrl('CUSTOMER_LOYALTY');
        const url = `${baseUrl}?n=${nValue}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.labels && data.datasets && Array.isArray(data.labels)) {
          // Normalize to preserve count N
          const rawLabels = data.labels.slice(0, nValue);
          const normalizedLabels = rawLabels.map((l) => (l && String(l).trim() !== '' ? l : 'Unknown Customer'));
          const rawData = (data.datasets?.[0]?.data || []).slice(0, normalizedLabels.length);
          const normalizedData = rawData.map((v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0));
          setCustomers(normalizedLabels);
          setBillCounts(normalizedData);
        } else {
          throw new Error('Unexpected data structure');
        }
        setError(null);
      } catch (error) {
        console.error("Error fetching customer loyalty data:", error);
        setError(error.message);
        const requested = nValue;
        setCustomers(fallbackCustomers.slice(0, requested));
        setBillCounts(fallbackBillCounts.slice(0, requested));
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerLoyalty();
  }, [nValue]);

  const data = {
    labels: customers.map(c => c || 'Unknown Customer'),
    datasets: [
      {
        label: "Number of Bills",
        data: billCounts.map(b => b || 0),
        backgroundColor: "#932F67",
        borderColor: "#932F67",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y", // 🔹 Horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: error ? `Sample Data: Top ${nValue} Customers by Number of Bills` : `Loyal Legion: Top ${nValue} Customers by Number of Bills`,
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
        title: { display: true, text: "Number of Bills" },
        ticks: {
          callback: function(value) { return formatAxisValue(value); },
          maxTicksLimit: 6,
        }
      },
      y: {
        title: { display: true, text: "Customer" },
        ticks: {
          autoSkip: false,
          maxTicksLimit: customers.length || 50,
          font: { size: 10 },
          callback: function(value, index) {
            const original = data.labels?.[index] ?? String(value);
            return abbreviateLabel(original);
          }
        },
      },
    },
  };

  // Compute layout metrics and attach resize handler BEFORE any early returns to keep hook order stable
  const desiredRowHeight = 26;
  const chartHeight = useMemo(() => Math.min(1200, Math.max(300, customers.length * desiredRowHeight)), [customers.length]);
  const chartRef = useRef(null);
  useEffect(() => {
    const chart = chartRef.current?.chart || chartRef.current;
    if (chart?.resize) chart.resize();
  }, [chartHeight, customers.length, billCounts.length]);

  // Show error state
  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl mx-auto">
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
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl mx-auto">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p>Loading customer loyalty data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!Array.isArray(customers) || customers.length === 0 || !Array.isArray(billCounts) || billCounts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl mx-auto">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p>No customer loyalty data found. Please check your API connection.</p>
        </div>
      </div>
    );
  }

  // Height handling similar to other chart for modal fill (already defined above)

  return (
    <div className={inModal ? 'w-full h-full' : ''}>
      <div style={{ position: 'relative', width: '100%', height: inModal ? '100%' : chartHeight, minHeight: 0, overflow: 'hidden' }}>
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
        <Bar ref={chartRef} key={customers.length + '-' + (inModal ? 'modal' : 'card')} data={data} options={options} />
      </div>
    </div>
  );
};
