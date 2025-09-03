import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { useDateFilter } from "../contexts/DateFilterContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TypicalDealSize = ({ inModal = false, modalDateRange = null }) => {
  const { dateRange } = useDateFilter();
  
  // Use modal date range if in modal, otherwise use global date range
  const currentDateRange = inModal && modalDateRange ? modalDateRange : dateRange;
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [binN, setBinN] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Add date range parameters to the API call
              const startDate = currentDateRange.startDate.toISOString().split('T')[0];
      const endDate = currentDateRange.endDate.toISOString().split('T')[0];
        
        console.log('TypicalDealSize: Fetching data for date range:', { startDate, endDate });
        
        const urlWithParams = `/api/chart_deal_size_distribution?start_date=${startDate}&end_date=${endDate}`;
        const response = await fetch(urlWithParams);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Clean up labels: remove duplicates like "1M-1M", "2M-2M" etc.
        const uniqueLabels = [];
        const uniqueData = [];
        data.labels.forEach((label, i) => {
          if (!uniqueLabels.includes(label)) {
            uniqueLabels.push(label);
            uniqueData.push(data.datasets[0].data[i]);
          } else {
            // if duplicate bin exists, sum the counts
            const idx = uniqueLabels.indexOf(label);
            uniqueData[idx] += data.datasets[0].data[i];
          }
        });

        const limit = binN === 'all' ? uniqueLabels.length : Math.min(uniqueLabels.length, Number(binN) || uniqueLabels.length);
        const transformedData = {
          labels: uniqueLabels.slice(0, limit),
          datasets: [
            {
              label: "Number of Deals",
              data: uniqueData.slice(0, limit),
              backgroundColor: uniqueData.slice(0, limit).map((_, index) => {
                // Create a gradient from light green to emerald green
                const ratio = index / (limit - 1);
                const r = Math.round(144 + (0 - 144) * ratio);     // 144 to 0 (light green to emerald)
                const g = Math.round(238 + (128 - 238) * ratio);   // 238 to 128
                const b = Math.round(144 + (0 - 144) * ratio);     // 144 to 0
                return `rgb(${r}, ${g}, ${b})`;
              }),
              borderColor: uniqueData.slice(0, limit).map((_, index) => {
                // Create a gradient from light green to emerald green
                const ratio = index / (limit - 1);
                const r = Math.round(144 + (0 - 144) * ratio);     // 144 to 0 (light green to emerald)
                const g = Math.round(238 + (128 - 238) * ratio);   // 238 to 128
                const b = Math.round(144 + (0 - 144) * ratio);     // 144 to 0
                return `rgb(${r}, ${g}, ${b})`;
              }),
              borderWidth: 1,
              borderRadius: 0, // flat bars for histogram look
              barPercentage: 1.0,
              categoryPercentage: 1.0,
            },
          ],
        };

        setChartData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching deal size data:", err);
        setError("Failed to load deal size data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [binN, currentDateRange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Same as SuppliersByTotalSpend
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'What is a "Typical" Deal Size?',
        font: { size: 18 },
        align: "start",
        color: "#1f2937",
        padding: { top: 6, bottom: 10 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Number of Deals" },
      },
      x: {
        title: { display: true, text: "Deal Size Range" },
      },
    },
  };

  // Ensure hooks order is stable across renders: define layout hooks before any early returns
  const chartHeight = useMemo(() => {
    return inModal ? 400 : 400; // Same height for both views like SuppliersByTotalSpend
  }, [inModal]);
  const chartRef = useRef(null);
  useEffect(() => {
    const c = chartRef.current?.chart || chartRef.current;
    if (c?.resize) c.resize();
  }, [chartHeight, chartData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading deal size data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col ${inModal ? '' : 'h-full'}`} style={inModal ? {} : { height: chartHeight }}>
      {/* Chart Section */}
      <div className={`relative w-full ${inModal ? 'flex-shrink-0' : 'h-full'}`} style={inModal ? {} : { height: chartHeight }}>
        {/* Quick select filter - only in modal */}
        {inModal && (
          <div className="absolute top-1 right-12 z-20">
            <select
              value={binN}
              onChange={(e) => setBinN(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs bg-white shadow-sm"
              title="Quick select"
            >
              <option value="all">All</option>
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
        )}
        
        <div className={`w-full ${inModal ? 'h-96' : 'h-full'}`} style={inModal ? {} : { height: chartHeight }}>
          <Bar ref={chartRef} data={chartData} options={options} />
        </div>
      </div>

      {/* Deal Size Analysis Content - Only in Modal View */}
      {inModal && (
        <div className="mt-6 px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Deal Size Distribution Analysis</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-base font-semibold text-gray-700 mb-2">Observations</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">1. Majority of deals are very small</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm text-gray-600">• The first bar (₹23 – ₹319,532) contains 4,455 deals.</p>
                      <p className="text-sm text-gray-600">• This means almost all deals fall in this small-value range.</p>
                      <p className="text-sm text-gray-600">• In storytelling: "Most of our business comes from smaller deals — this is the typical deal size."</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">2. Sharp drop after the first range</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm text-gray-600">• The second range (₹639,041 – ₹958,550) has only 334 deals.</p>
                      <p className="text-sm text-gray-600">• Compared to 4,455, this is a drastic drop of more than 85%.</p>
                      <p className="text-sm text-gray-600">• Storytelling: "Only a small fraction of deals move beyond the typical small size."</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">3. High-value deals are extremely rare</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm text-gray-600">• As the deal size increases, the frequency decreases.</p>
                      <p className="text-sm text-gray-600">• For example:</p>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm text-gray-600">₹1,270,896 – ₹1,597,586 → 154 deals</p>
                        <p className="text-sm text-gray-600">₹19,70,717 – ₹22,23,566 → 36 deals</p>
                        <p className="text-sm text-gray-600">Beyond ₹50 lakh → fewer than 5 deals per range, many ranges have just 1 deal.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">4. Long tail effect</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm text-gray-600">• This distribution shows a long tail — where a few deals are extremely large but very rare.</p>
                      <p className="text-sm text-gray-600">• Storytelling: "Big-ticket deals exist, but they're outliers. They don't define the business pattern."</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                <h5 className="text-base font-semibold text-gray-800 mb-2">Storytelling Version</h5>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>When we look at our deal sizes, the story is clear. Almost all our deals — 4,455 out of the total — are small, under ₹3.2 lakh. This is the heartbeat of our business, the 'typical' deal size.</p>
                  
                  <p>But once we move beyond this range, the numbers drop dramatically. For example, only 334 deals fall between ₹6.3 lakh and ₹9.5 lakh, and this trend continues — only 154 deals go up to ₹16 lakh.</p>
                  
                  <p>As deal sizes grow, they become rarer. By the time we reach crores, we're only seeing 1–3 deals in those ranges.</p>
                  
                  <p>This tells us something powerful: Our business thrives on volume of small deals, not on a few large deals. The rare, big-ticket deals make headlines, but they don't define the business reality.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypicalDealSize;
