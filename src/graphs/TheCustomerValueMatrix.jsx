// CustomerValueMatrix.jsx
import React, { useEffect, useState } from "react";
import { Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  LinearScale,
  PointElement,
} from "chart.js";
import { getApiUrl } from "../config/api";
import useResizeKey from '../hooks/useResizeKey';
import useLabelAbbreviation from '../hooks/useLabelAbbreviation';
import { useDateFilter } from "../contexts/DateFilterContext";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export default function CustomerValueMatrix({ inModal = false, modalDateRange = null }) {
  const { dateRange } = useDateFilter();
  const { formatAxisValue } = useLabelAbbreviation(12);
  
  // Use modal date range if in modal, otherwise use global date range
  const currentDateRange = inModal && modalDateRange ? modalDateRange : dateRange;
  const resizeKey = useResizeKey();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
              const startDate = currentDateRange.startDate.toISOString().split('T')[0];
      const endDate = currentDateRange.endDate.toISOString().split('T')[0];
        
        const baseUrl = getApiUrl("CUSTOMER_VALUE_MATRIX");
        const url = `${baseUrl}?start_date=${startDate}&end_date=${endDate}`;
        const response = await fetch(url);
        const data = await response.json();

        const colors = {
          "1_Low": "rgba(239, 68, 68, 0.6)",     // red
          "2_Medium": "rgba(245, 158, 11, 0.6)", // amber
          "3_High": "rgba(34, 197, 94, 0.6)",    // green
          "4_VIP": "rgba(59, 130, 246, 0.6)",    // blue
        };

        const datasets = data.datasets.map((ds) => ({
          label: ds.label,
          data: ds.data.map((p) => ({
            x: p.x,
            y: p.y,
            r: Math.max(p.r / 5000, 3) // minimum radius 3px
          })),
          backgroundColor: colors[ds.label] || "rgba(107,114,128,0.6)",
        }));

        setChartData({ datasets });
      } catch (error) {
        console.error("Error fetching CVM data:", error);
      }
    };

    fetchData();
  }, [currentDateRange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false, // This is crucial for full width display
    plugins: {
      legend: { position: "top" },
      tooltip: {
        enabled: true, // keep tooltip on hover
        callbacks: {
          // Optional: clean up tooltip text if needed
          label: function (context) {
            return `x: ${context.raw.x}, y: ${context.raw.y.toLocaleString()}`;
          },
        },
      },
      datalabels: {
        display: false, // 🚫 completely hide data labels
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Customer Frequency" },
      },
      y: {
        title: { display: true, text: "Revenue" },
        ticks: {
          callback: (value) => formatAxisValue(value),
          maxTicksLimit: 6,
        },
      },
    },
  };

  return (
    <div className={`w-full flex flex-col ${inModal ? '' : 'h-full'}`}>
      {/* Chart Section */}
      <div className={`relative w-full ${inModal ? 'flex-shrink-0' : 'h-full'}`} style={inModal ? {} : { height: '400px' }}>
        <h2 className={`${inModal ? 'text-xl' : 'text-lg'} font-semibold text-gray-800 mb-4`}>
          Customer Value Matrix
        </h2>
        {chartData ? (
          <div className={`w-full ${inModal ? 'h-[500px]' : 'h-full'}`} style={inModal ? { minHeight: '500px' } : { height: 'calc(100% - 60px)' }}>
            <Bubble data={chartData} options={options} />
          </div>
        ) : (
          <p className="text-gray-500">Loading data...</p>
        )}
      </div>

      {/* Customer Value Matrix Analysis Content - Only in Modal View */}
      {inModal && (
        <div className="mt-6 px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Customer Value Matrix Analysis</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-base font-semibold text-gray-700 mb-2">Customer Segments</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">1. VIP Cluster (Purple on top-right)</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm text-gray-600">• These are suppliers you engage with very frequently and spend a lot.</p>
                      <p className="text-sm text-gray-600">• They are critical — any disruption here can cause supply risk.</p>
                      <p className="text-sm text-gray-600">• Should maintain strong relationships, negotiate long-term contracts.</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">2. High Value but Less Frequent (Purple on mid-top / right-top)</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm text-gray-600">• Spend is huge, but not too frequent.</p>
                      <p className="text-sm text-gray-600">• These are project-specific suppliers (big bulk orders).</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">3. Frequent but Low Spend (Bottom-right, green/blue)</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm text-gray-600">• Suppliers with many small-value transactions.</p>
                      <p className="text-sm text-gray-600">• May indicate inefficiency — too many small POs instead of consolidated orders.</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">4. Low Engagement (Bottom-left)</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm text-gray-600">• Few transactions, low spend.</p>
                      <p className="text-sm text-gray-600">• These are non-strategic or ad-hoc suppliers.</p>
                      <p className="text-sm text-gray-600">• Can be optimized or dropped to reduce admin overhead.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                <h5 className="text-base font-semibold text-gray-800 mb-2">Business Uses</h5>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">• Supplier Dependency: Identify which suppliers are most important.</p>
                  <p className="text-sm text-gray-600">• Negotiation Strategy: Focus on VIP suppliers for volume discounts.</p>
                  <p className="text-sm text-gray-600">• Risk Management: If a few suppliers dominate spend (purple cluster), dependency risk is high.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
