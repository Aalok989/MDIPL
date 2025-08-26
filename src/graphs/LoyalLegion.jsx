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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LoyalLegion = () => {
  const [customers, setCustomers] = useState([]);
  const [billCounts, setBillCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback sample data in case API fails
  const fallbackCustomers = [
    "Alice Corp", "Beta Ltd", "Gamma Inc", "Delta Co", "Epsilon Group",
    "Zeta Systems", "Eta Partners", "Theta LLC", "Iota Pvt Ltd", "Kappa Enterprises",
    "Lambda Traders", "Mu Industries", "Nu Solutions", "Xi Tech", "Omicron Holdings"
  ];
  
  const fallbackBillCounts = [
    48, 44, 42, 40, 39, 38, 36, 35, 34, 32, 30, 29, 28, 27, 25
  ];

  // 🔹 Fetch live customer loyalty data
  useEffect(() => {
    const fetchCustomerLoyalty = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(getApiUrl('CUSTOMER_LOYALTY'));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if data is already in Chart.js format
        if (data && data.labels && data.datasets && Array.isArray(data.labels)) {
          console.log('Data is already in Chart.js format with', data.labels.length, 'labels');
          // Filter out empty labels and set the data
          const validLabels = data.labels.filter(label => label && label.trim() !== '');
          const validData = data.datasets[0].data.slice(0, validLabels.length);
          
          setCustomers(validLabels);
          setBillCounts(validData);
        } else if (Array.isArray(data)) {
          console.log('Data is an array with', data.length, 'items');
          // Handle array format if needed
          setCustomers([]);
          setBillCounts([]);
        } else if (data && typeof data === 'object') {
          // If data is an object, check if it has a results property (common in Django REST)
          if (Array.isArray(data.results)) {
            console.log('Data has results array with', data.results.length, 'items');
            // Process results array if needed
            setCustomers([]);
            setBillCounts([]);
          } else if (Array.isArray(data.data)) {
            console.log('Data has data array with', data.data.length, 'items');
            // Process data array if needed
            setCustomers([]);
            setBillCounts([]);
          } else {
            console.warn('Unexpected data structure:', data);
            console.log('Available keys:', Object.keys(data));
            setCustomers([]);
            setBillCounts([]);
          }
        } else {
          console.warn('Data is not in expected format:', data);
          console.log('Data type:', typeof data);
          setCustomers([]);
          setBillCounts([]);
        }
        
        setError(null);
      } catch (error) {
        console.error("Error fetching customer loyalty data:", error);
        setError(error.message);
        // Use fallback data instead of empty arrays
        setCustomers(fallbackCustomers);
        setBillCounts(fallbackBillCounts);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerLoyalty();
  }, []);

  const data = {
    labels: customers.map(c => c || 'Unknown Customer'),
    datasets: [
      {
        label: "Number of Bills",
        data: billCounts.map(b => b || 0),
        backgroundColor: "rgba(34,197,94,0.7)", // Tailwind green-500
        borderColor: "rgb(34,197,94)",
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
        text: error ? "🛡️ Sample Data: Top Customers by Number of Bills" : "🛡️ Loyal Legion: Top 15 Customers by Number of Bills",
        font: { size: 18 },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: "Number of Bills" },
      },
      y: {
        title: { display: true, text: "Customer" },
        ticks: {
          autoSkip: false,
          maxTicksLimit: customers.length || 50,
          font: { size: 10 },
        },
      },
    },
  };

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

  return (
    <Bar data={data} options={options} />
  );
};

export default LoyalLegion;
