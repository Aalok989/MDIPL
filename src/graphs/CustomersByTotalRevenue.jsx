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

export default function CustomersByTotalRevenue() {
  const { abbreviateLabel, formatAxisValue } = useLabelAbbreviation(12);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 🔹 Fetch live customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(getApiUrl('TOP_CUSTOMERS'));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if data is already in Chart.js format
        if (data && data.labels && data.datasets && Array.isArray(data.labels)) {
          console.log('Data is already in Chart.js format with', data.labels.length, 'labels');
          // Convert Chart.js format to our internal format
          const customersArray = data.labels.map((label, index) => ({
            customer_name: label,
            bill_total: data.datasets[0].data[index] || 0
          }));
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
        setCustomers(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

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
        backgroundColor: "#3338A0",
        borderColor: "#3338A0",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y", // 🔹 Horizontal bar chart
    responsive: true,
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
            const original = data.labels?.[index] ?? String(value);
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
    <Bar data={data} options={options} />
  );
};
