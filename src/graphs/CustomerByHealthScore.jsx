import React, { useEffect, useState, useMemo, useRef } from 'react';
import Plot from 'react-plotly.js';
import { getApiUrl } from '../config/api';
import useLabelAbbreviation from '../hooks/useLabelAbbreviation';
import useResizeKey from '../hooks/useResizeKey';
import { useDateFilter } from '../contexts/DateFilterContext';

export default function CustomerHealthChart({ inModal = false }) {
  const { dateRange } = useDateFilter();
  const { abbreviateLabel } = useLabelAbbreviation(12); // Max ~12 chars
  const resizeKey = useResizeKey(200);
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state for modal view
  const [nValue, setNValue] = useState(15); // Default to show top 15
  
  // Ensure hooks order is stable across renders: define layout hooks before any early returns
  const chartRef = useRef(null);
  const chartHeight = useMemo(() => {
    return inModal ? 400 : 400; // Same height for both views like other charts
  }, [inModal]);

  // Fallback data (for consistency and UX)
  const fallbackLabels = [
    'Alpha Enterprises', 'Beta Solutions', 'Gamma Tech', 'Delta Systems',
    'Epsilon Group', 'Zeta Innovations', 'Eta Global', 'Theta Dynamics',
    'Iota Services', 'Kappa Industries', 'Lambda Labs', 'Mu Networks',
    'Nu Data', 'Xi Analytics', 'Omicron Consulting'
  ];
  const fallbackValues = [94, 88, 85, 82, 79, 76, 73, 70, 68, 65, 62, 60, 58, 55, 52];

  useEffect(() => {
    const fetchHealthScores = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const startDate = dateRange.startDate.toISOString().split('T')[0];
        const endDate = dateRange.endDate.toISOString().split('T')[0];
        
        const baseUrl = getApiUrl('CUSTOMER_HEALTH');
        const url = `${baseUrl}?start_date=${startDate}&end_date=${endDate}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const apiLabels = json?.data?.labels || [];
        const apiValues = json?.data?.datasets?.[0]?.data || [];

        if (Array.isArray(apiLabels) && Array.isArray(apiValues) && apiLabels.length > 0) {
          setLabels(apiLabels);
          setValues(apiValues);
        } else {
          throw new Error('Unexpected API response shape');
        }
      } catch (e) {
        console.error('Failed to fetch customer health scores:', e);
        setError(e.message || 'Failed to load data');
        // Use fallback data
        setLabels(fallbackLabels);
        setValues(fallbackValues);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthScores();
  }, [dateRange]);

  // Pair and sort by health score (descending) and apply filter
  const filteredData = useMemo(() => {
    const paired = labels.map((label, i) => ({
      customer_name: label,
      health_score: Number(values[i] ?? 0),
    })).sort((a, b) => b.health_score - a.health_score);
    
    if (!inModal || nValue === 'all') {
      return paired;
    }
    
    // For customer health, show top N customers by health score
    return paired.slice(0, nValue);
  }, [labels, values, nValue, inModal]);

  const x = filteredData.map(d => abbreviateLabel(d.customer_name)); // Abbreviated for X-axis
  const y = filteredData.map(d => d.health_score);
  const fullNames = filteredData.map(d => d.customer_name); // Full names for hover

  const trace = {
    x,
    y,
    customdata: fullNames, // ✅ Correct property name and syntax
    type: 'bar',
    width: 0.6,
    marker: {
      color: y,
      colorscale: 'RdYlGn',
      reversescale: false,
      line: {
        width: 1,
        color: '#f0f0f0',
      },
      colorbar: {
        title: 'Health',
        ticksuffix: '',
        thickness: 15,
        tickfont: { size: 10 },
      },
    },
    hovertemplate: '<b>%{customdata}</b><br>Health Score: %{y}<extra></extra>', // Uses customdata
  };

  const layout = {
    title: {
      text: inModal && nValue !== 'all'
        ? `Customer Triage: Top ${nValue}`
        : `Customer Triage: Top ${filteredData.length}`,
      x: 0.01,
      xanchor: 'left',
      font: { size: 14 },
    },
    margin: { l: 40, r: 16, t: 32, b: 64 },
    autosize: true,
    xaxis: {
      title: { text: 'Customer', font: { size: 11 } },
      tickfont: { size: 10 },
      tickangle: -45,
      automargin: true,
      type: 'category',
      categoryarray: x, // Ensures order matches data
    },
    yaxis: {
      range: [0, 100],
      title: { text: 'Health Score', font: { size: 11 } },
      tickfont: { size: 10 },
      fixedrange: false,
    },
    height: inModal ? undefined : Math.min(340, Math.max(300, 22 * x.length + 120)), // Responsive height for modal
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    font: { size: 10 },
    bargap: 0.15,
    bargroupgap: 0,
  };

  const config = {
    responsive: true,
    displayModeBar: false,
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-sm">
        <div className="text-center text-gray-500 text-sm">Loading customer health data...</div>
      </div>
    );
  }

  if (error && filteredData.length === 0) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">Customer Health</h2>
          <div className="text-xs text-red-500">Error: {error}</div>
        </div>
        <div className="text-center text-gray-500 text-sm">
          Failed to load data. Showing sample data.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Quick select filter - only in modal */}
      {inModal && (
        <div className="absolute top-1 right-12 z-20">
          <select
            value={nValue}
            onChange={(e) => setNValue(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white shadow-sm"
          >
            <option value="all">All Customers</option>
            <option value={20}>Top 20</option>
            <option value={15}>Top 15</option>
            <option value={10}>Top 10</option>
            <option value={5}>Top 5</option>
          </select>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3 px-4 pt-4">
        <h2 className="text-base font-semibold text-gray-800">
          Customer Health — Top {filteredData.length}
        </h2>
        {error && (
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-red-500 underline hover:text-red-600 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
      
      <div className="flex-1 min-h-0 px-4 pb-4">
        <Plot
          key={`${resizeKey}-${filteredData.length}`}
          data={[trace]}
          layout={layout}
          config={config}
          style={{ width: '100%', height: inModal ? '100%' : `${layout.height}px` }}
          useResizeHandler
        />
      </div>
    </div>
  );
}