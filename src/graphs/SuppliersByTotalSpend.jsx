import React, { useEffect, useState, useMemo, useRef } from "react";
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

export default function SuppliersByTotalSpend({ inModal = false }) {
  const { abbreviateLabel, formatAxisValue } = useLabelAbbreviation(12);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state for modal view
  const [nValue, setNValue] = useState(10); // Default to show top 10
  
  // Ensure hooks order is stable across renders: define layout hooks before any early returns
  const chartRef = useRef(null);
  const chartHeight = useMemo(() => {
    return inModal ? Math.min(800, Math.max(400, nValue * 30)) : 400;
  }, [inModal, nValue]);
  
  useEffect(() => {
    const chart = chartRef.current?.chart || chartRef.current;
    if (chart?.resize) {
      chart.resize();
    }
  }, [chartHeight, nValue]);

  // Fallback sample data in case API fails
  const fallbackData = [
    { supplier_name: "Sample Supplier 1", bill_total: 50000 },
    { supplier_name: "Sample Supplier 2", bill_total: 45000 },
    { supplier_name: "Sample Supplier 3", bill_total: 40000 },
    { supplier_name: "Sample Supplier 4", bill_total: 35000 },
    { supplier_name: "Sample Supplier 5", bill_total: 30000 }
  ];

  // 🔹 Fetch live suppliers data
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(getApiUrl('TOP_SUPPLIERS'));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        

        // Check if data is already in Chart.js format
        if (data && data.labels && data.datasets && Array.isArray(data.labels)) {
          console.log('Data is already in Chart.js format with', data.labels.length, 'labels');
          // Convert Chart.js format to our internal format
          const suppliersArray = data.labels.map((label, index) => ({
            supplier_name: label,
            bill_total: data.datasets[0].data[index] || 0
          }));
          setSuppliers(suppliersArray);
        } else if (Array.isArray(data)) {
          console.log('Data is an array with', data.length, 'items');
          setSuppliers(data);
        } else if (data && typeof data === 'object') {
          // If data is an object, check if it has a results property (common in Django REST)
          if (Array.isArray(data.results)) {
            console.log('Data has results array with', data.results.length, 'items');
            setSuppliers(data.results);
          } else if (Array.isArray(data.data)) {
            console.log('Data has data array with', data.data.length, 'items');
            setSuppliers(data.data);
          } else {
            console.warn('Unexpected data structure:', data);
            console.log('Available keys:', Object.keys(data));
            // Try to extract any array from the object
            const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              console.log('Found arrays in data:', possibleArrays);
              setSuppliers(possibleArrays[0]); // Use the first array found
            } else {
              setSuppliers([]);
            }
          }
        } else {
          console.warn('Data is not an array:', data);
          console.log('Data type:', typeof data);
          setSuppliers([]);
        }
        
        setError(null);
      } catch (error) {
        console.error("Error fetching suppliers data:", error);
        setError(error.message);
        // Use fallback data instead of empty array
        setSuppliers(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // 🔹 Sort suppliers ascending (so largest appears at top) and apply filter
  const filteredSuppliers = useMemo(() => {
    if (!Array.isArray(suppliers)) return [];
    
    const sorted = [...suppliers].sort((a, b) => b.bill_total - a.bill_total);
    
    if (!inModal || nValue === 'all') {
      return sorted;
    }
    
    // Normalize data and ensure exactly nValue items
    const normalized = sorted.slice(0, nValue).map(s => ({
      supplier_name: s?.supplier_name && String(s.supplier_name).trim() !== "" ? s.supplier_name : "Unknown Supplier",
      bill_total: s?.bill_total || 0
    }));
    
    return normalized;
  }, [suppliers, nValue, inModal]);

  // Validate and prepare chart data
  const chartData = {
    labels: filteredSuppliers.map((s) => s?.supplier_name || 'Unknown Supplier'),
    datasets: [
      {
        label: "Total Spend",
        data: filteredSuppliers.map((s) => s?.bill_total || 0),
        backgroundColor: filteredSuppliers.map((_, index) => {
          // Create a gradient from navy to light blue
          const ratio = index / (filteredSuppliers.length - 1);
          const r = Math.round(0 + (173 - 0) * ratio);      // 0 to 173 (navy to light blue)
          const g = Math.round(0 + (216 - 0) * ratio);      // 0 to 216
          const b = Math.round(128 + (230 - 128) * ratio);  // 128 to 230
          return `rgb(${r}, ${g}, ${b})`;
        }),
        borderColor: filteredSuppliers.map((_, index) => {
          // Create a gradient from navy to light blue
          const ratio = index / (filteredSuppliers.length - 1);
          const r = Math.round(0 + (173 - 0) * ratio);      // 0 to 173 (navy to light blue)
          const g = Math.round(0 + (216 - 0) * ratio);      // 0 to 216
          const b = Math.round(128 + (230 - 128) * ratio);  // 128 to 230
          return `rgb(${r}, ${g}, ${b})`;
        }),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y", // 🔹 horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: error 
          ? "Sample Data: Top Suppliers by Total Spend" 
          : inModal && nValue !== 'all'
            ? `Our Lifelines: Top ${nValue} Suppliers by Total Spend`
            : "Our Lifelines: Top Suppliers by Total Spend",
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
        ticks: {
          callback: function(value) {
            return formatAxisValue(value);
          },
          maxTicksLimit: 6,
        },
      },
      y: {
        ticks: {
          autoSkip: false,
          font: { size: 10 },
          callback: function(value, index) {
            const original = chartData.labels?.[index] ?? String(value);
            return abbreviateLabel(original);
          }
        }
      }
    },
  };

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p>Loading supplier data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!Array.isArray(suppliers) || suppliers.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-3xl mx-auto">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p>No supplier data found. Please check your API connection.</p>
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
            onChange={(e) => setNValue(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white shadow-sm"
          >
            <option value="all">All Suppliers</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
            <option value={25}>Top 25</option>
            <option value={30}>Top 30</option>
          </select>
        </div>
      )}
      
      <div className={`w-full ${inModal ? 'h-full' : ''}`} style={inModal ? {} : { height: chartHeight }}>
        <Bar 
          ref={chartRef}
          key={`suppliers-${filteredSuppliers.length}`}
          data={chartData} 
          options={options} 
        />
      </div>
    </div>
  );
};
