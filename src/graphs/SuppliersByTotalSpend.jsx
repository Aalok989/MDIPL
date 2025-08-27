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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getApiUrl } from "../config/api";
import useLabelAbbreviation from '../hooks/useLabelAbbreviation';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function SuppliersByTotalSpend() {
  const { abbreviateLabel, formatAxisValue } = useLabelAbbreviation(12);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 🔹 Sort suppliers ascending (so largest appears at top)
  // Ensure suppliers is always an array before spreading
  const sortedSuppliers = Array.isArray(suppliers) 
    ? [...suppliers].sort((a, b) => a.bill_total - b.bill_total)
    : [];

  // Validate and prepare chart data
  const chartData = {
    labels: sortedSuppliers.map((s) => s?.supplier_name || 'Unknown Supplier'),
    datasets: [
      {
        label: "Total Spend",
        data: sortedSuppliers.map((s) => s?.bill_total || 0),
        backgroundColor: "#3E0703",
        borderColor: "#3E0703",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y", // 🔹 horizontal bar chart
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: error ? "Sample Data: Top Suppliers by Total Spend" : "Our Lifelines: Top 10 Suppliers by Total Spend",
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
    <Bar data={chartData} options={options} />
  );
};
