// ProjectPersonalities.jsx
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
import { getApiUrl } from "../config/api";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import useLabelAbbreviation from '../hooks/useLabelAbbreviation';
import { useDateFilter } from '../contexts/DateFilterContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function SupplierDiversityForTopCustomers({ inModal = false, modalDateRange = null }) {
  const { dateRange } = useDateFilter();
  
  // Use modal date range if in modal, otherwise use global date range
  const currentDateRange = inModal && modalDateRange ? modalDateRange : dateRange;
  const { abbreviateLabel, formatAxisValue } = useLabelAbbreviation(12);
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state for modal view
  const [nValue, setNValue] = useState(10); // Default to show top 10
  
  // Color array for different bars
  const barColors = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
    "#a6cee3", "#fb9a99", "#fdbf6f", "#cab2d6", "#ff9896",
    "#f0027f", "#386cb0", "#fdc086", "#beaed4", "#7fc97f"
  ];

  // Ensure hooks order is stable across renders: define layout hooks before any early returns
  const chartRef = useRef(null);
  const chartHeight = useMemo(() => {
    return inModal ? 400 : 400; // Same height for both views like other charts
  }, [inModal]);
  
  useEffect(() => {
    const chart = chartRef.current?.chart || chartRef.current;
    if (chart?.resize) {
      chart.resize();
    }
  }, [chartHeight, labels.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
              const startDate = currentDateRange.startDate.toISOString().split('T')[0];
      const endDate = currentDateRange.endDate.toISOString().split('T')[0];
        
        const baseUrl = getApiUrl("RISK_ANALYSIS");
        const url = `${baseUrl}?start_date=${startDate}&end_date=${endDate}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const data = payload?.data || payload;
        const lbls = data?.labels || [];
        const ds = (data?.datasets && data?.datasets[0]?.data) ? data.datasets[0].data : [];
        setLabels(lbls);
        setValues(ds);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentDateRange]);

  // Apply filter to data
  const filteredData = useMemo(() => {
    if (!inModal || nValue === 'all') {
      return { labels, values };
    }
    
    // For customer diversity, show top N customers by supplier count
    const sortedData = labels.map((label, index) => ({
      label,
      value: values[index] || 0
    })).sort((a, b) => b.value - a.value);
    
    const topN = sortedData.slice(0, nValue);
    
    return {
      labels: topN.map(item => item.label),
      values: topN.map(item => item.value)
    };
  }, [labels, values, nValue, inModal]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center text-gray-500">Loading supplier diversity...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  const data = {
    labels: filteredData.labels,
    datasets: [
      {
        label: "Unique Suppliers",
        data: filteredData.values,
        backgroundColor: filteredData.labels.map((_, index) => barColors[index % barColors.length]),
        borderColor: filteredData.labels.map((_, index) => barColors[index % barColors.length]),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Same as other charts
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: inModal && nValue !== 'all'
          ? `Supplier Diversity - Top ${nValue} Customers`
          : "Supplier Diversity for Top Customers (Unique Suppliers)",
        font: { size: 16 },
        align: 'start',
        color: '#1f2937',
        padding: { top: 6, bottom: 10 },
      },
      tooltip: { enabled: true },
      datalabels: {
        color: '#ffffff',
        anchor: 'center',
        align: 'center',
        clamp: true,
        clip: true,
        font: { weight: 'bold', size: 10 },
        formatter: (value) => formatAxisValue(value),
      },
    },
    scales: {
      x: {
        title: { display: false },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
          callback: function(value, index) {
            const original = data.labels?.[index] ?? String(value);
            return abbreviateLabel(original);
          }
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...filteredData.values) * 1.1, // ← Prevents bars from hitting the top
        title: {
          display: true,
          text: "Unique Suppliers",
        },
        ticks: {
          precision: 0, // whole numbers only
        },
      },
    },
  };

  return (
    <div className={`w-full flex flex-col ${inModal ? '' : 'h-full'}`} style={inModal ? {} : { height: chartHeight }}>
      {/* Chart Section */}
      <div className={`relative w-full ${inModal ? 'flex-shrink-0' : 'h-full'}`} style={inModal ? {} : { height: chartHeight }}>
        {/* Quick select filter - only in modal */}
        {inModal && (
          <div className="absolute top-1 right-12 z-20">
            <select
              value={nValue}
              onChange={(e) => setNValue(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
              className="px-3 py-1 border border-gray-300 rounded text-sm bg-white shadow-sm"
            >
              <option value="all">All Customers</option>
              <option value={10}>Top 10</option>
              <option value={5}>Top 5</option>
              <option value={3}>Top 3</option>
              <option value={2}>Top 2</option>
            </select>
          </div>
        )}
        
        <div className={`w-full ${inModal ? 'h-96' : 'h-full'}`} style={inModal ? {} : { height: chartHeight }}>
          <Bar 
            ref={chartRef}
            key={`supplier-diversity-${filteredData.labels.length}`}
            data={data} 
            options={options} 
          />
        </div>
      </div>

      {/* Supplier Diversity Analysis Content - Only in Modal View */}
      {inModal && (
        <div className="mt-6 px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Supplier Diversity Analysis</h4>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Key Findings:</p>
                <div className="ml-4 space-y-1">
                  <p className="text-sm text-gray-600">• Most big customers rely on 10–30 suppliers.</p>
                  <p className="text-sm text-gray-600">• Outlier: Logython India uses 50+ suppliers → diversified approach.</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Story:</p>
                <p className="text-sm text-gray-600">A concentrated supplier base increases risk, while diversified customers like Logython India demonstrate resilience and flexibility.</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                <p className="text-sm font-medium text-gray-700">Actionable Recommendation:</p>
                <p className="text-sm text-gray-600">Encourage diversification for concentrated clients and reduce dependency on a few suppliers.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};