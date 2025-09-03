// WhoFundsOurTopProjects.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import Plot from "react-plotly.js";
import { getApiUrl } from "../config/api";
import { useDateFilter } from "../contexts/DateFilterContext";

const WhoFundsOurTopProjects = ({ inModal = false, modalDateRange = null }) => {
  const { dateRange } = useDateFilter();
  
  // Use modal date range if in modal, otherwise use global date range
  const currentDateRange = inModal && modalDateRange ? modalDateRange : dateRange;
  const [labels, setLabels] = useState([]);
  const [parents, setParents] = useState([]);
  const [values, setValues] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color palette for projects - using darker variants of the same beautiful colors
  const projectColors = [
    "#CC5555", "#3DA89C", "#3792A1", "#78A590", "#CCB885",
    "#B180B1", "#7AADA0", "#C5B057", "#966A9E", "#6A9AB9",
    "#C69D5A", "#68B18A", "#C1766E", "#6A9AB9", "#AD96B4",
    "#87A0B7", "#C7B87F", "#A99297", "#83B8A9", "#C8B080"
  ];

  // Function to generate gradient colors for customers under a project
  const generateCustomerColors = (baseColor, customerCount) => {
    const colors = [];
    for (let i = 0; i < customerCount; i++) {
      // Create beautiful gradient variations - mix of lightening and darkening
      const factor = 0.2 + (0.3 * (i + 1) / customerCount);
      if (i % 2 === 0) {
        // Alternate between lightening and darkening for variety
        const lighterColor = lightenColor(baseColor, factor);
        colors.push(lighterColor);
      } else {
        const darkerColor = darkenColor(baseColor, factor);
        colors.push(darkerColor);
      }
    }
    return colors;
  };

  // Function to darken a color (more visible than lightening)
  const darkenColor = (hex, factor) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Darken the color instead of lightening it
    const newR = Math.max(0, Math.round(r * (1 - factor)));
    const newG = Math.max(0, Math.round(g * (1 - factor)));
    const newB = Math.max(0, Math.round(b * (1 - factor)));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  // Function to lighten a color for better variety
  const lightenColor = (hex, factor) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    const newR = Math.min(255, Math.round(r + (255 - r) * factor));
    const newG = Math.min(255, Math.round(g + (255 - g) * factor));
    const newB = Math.min(255, Math.round(b + (255 - b) * factor));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  // Chart height for responsive layout
  const chartHeight = useMemo(() => {
    return inModal ? 400 : 400; // Same height for both views like other charts
  }, [inModal]);

  // Ensure hooks order is stable across renders: define layout hooks before any early returns
  const chartRef = useRef(null);
  useEffect(() => {
    const chart = chartRef.current?.chart || chartRef.current;
    if (chart?.resize) {
      chart.resize();
    }
  }, [chartHeight, labels.length]);

  useEffect(() => {
    const fetchValueChain = async () => {
      try {
        setLoading(true);
        setError(null);
        
              const startDate = currentDateRange.startDate.toISOString().split('T')[0];
      const endDate = currentDateRange.endDate.toISOString().split('T')[0];
        
        const baseUrl = getApiUrl("VALUE_CHAIN");
        const url = `${baseUrl}?start_date=${startDate}&end_date=${endDate}`;
        let res = await fetch(url);
        
        // If the API doesn't support date filtering, try without date parameters
        if (!res.ok && res.status === 500) {
          console.log('WhoFundsOurTopProjects: API returned 500, trying without date parameters');
          const fallbackUrl = getApiUrl("VALUE_CHAIN");
          res = await fetch(fallbackUrl);
        }
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();

        // Expecting shape: { chartType: "sunburst", data: { Project: { Customer: amount, ... }, ... } }
        const dataObj = payload?.data || {};
        console.log(dataObj);

        const root = "All Projects";
        const nextLabels = [root];
        const nextParents = [""];
        const nextValues = [0];
        const nextColors = ["#6366F1"]; // Beautiful indigo for root

        // First pass: add projects and compute project totals
        const projects = Object.keys(dataObj);
        for (let i = 0; i < projects.length; i++) {
          const project = projects[i];
          const customers = dataObj[project];
          const projectTotal = Object.values(customers || {}).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
          
          nextLabels.push(project);
          nextParents.push(root);
          nextValues.push(projectTotal);
          nextValues[0] += projectTotal; // accumulate root total
          
          // Assign unique color to each project
          const projectColor = projectColors[i % projectColors.length];
          nextColors.push(projectColor);
        }

        // Second pass: add customer nodes under each project
        for (let i = 0; i < projects.length; i++) {
          const project = projects[i];
          const customers = dataObj[project];
          const customerEntries = Object.entries(customers || {});
          
          // Generate darker gradient colors for customers under this project
          const customerColors = generateCustomerColors(projectColors[i % projectColors.length], customerEntries.length);
          
          for (let j = 0; j < customerEntries.length; j++) {
            const [customer, amount] = customerEntries[j];
            nextLabels.push(customer);
            nextParents.push(project);
            nextValues.push(typeof amount === 'number' ? amount : 0);
            nextColors.push(customerColors[j]);
          }
        }

        setLabels(nextLabels);
        setParents(nextParents);
        setValues(nextValues);
        setColors(nextColors);
      } catch (e) {
        console.error('Failed to fetch value chain:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchValueChain();
  }, [currentDateRange]);

  return (
    <div className={`w-full flex flex-col ${inModal ? '' : 'h-full'}`} style={inModal ? {} : { height: '400px' }}>
      {/* Chart Section */}
      <div className={`w-full ${inModal ? 'flex-shrink-0' : 'h-full'}`} style={inModal ? {} : { height: '400px' }}>
        <h2 className={`${inModal ? 'text-xl' : 'text-lg'} font-semibold mb-3`}>Who Funds Our Top Projects? A Customer Breakdown</h2>
        {loading ? (
          <div className="text-center text-gray-500">Loading sunburst data...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className={`flex-1 min-h-0`} style={inModal ? {} : { height: 'calc(100% - 60px)' }}>
            <Plot
              data={[
                {
                  type: "sunburst",
                  labels,
                  parents,
                  values,
                  branchvalues: "total",
                  textinfo: "label+value",
                  marker: { 
                    colors: colors,
                    line: { width: 2, color: "#ffffff" } 
                  },
                },
              ]}
              layout={{
                margin: { l: 10, r: 10, t: 40, b: 10 },
                height: inModal ? 400 : 400, // Fixed height for both views
                autosize: true,
              }}
              style={{ width: "100%", height: inModal ? "400px" : "400px" }}
              config={{ responsive: true }}
              useResizeHandler={true}
            />
          </div>
        )}
      </div>

      {/* Funding Analysis Content - Only in Modal View */}
      {inModal && (
        <div className="mt-6 px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Funding Analysis</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Key Numbers & Insights</h5>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Funding</p>
                    <p className="text-sm text-gray-600">Overall funding: ₹317.7M (in crores if converted to INR units).</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Top Contributors</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm text-gray-600">• L&T Minerals and Metals → ₹56,330,582.27</p>
                      <p className="text-sm text-gray-600">  This is the largest single contributor, funding ~18% of total projects.</p>
                      <p className="text-sm text-gray-600">• UTCL Rawan → ₹52,051,971.04</p>
                      <p className="text-sm text-gray-600">  Second-largest, contributing ~16%.</p>
                      <p className="text-sm text-gray-600">• TATA Projects → ₹37,052,841.28</p>
                      <p className="text-sm text-gray-600">  Third-largest, ~12%.</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Notable Sub-Projects</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm text-gray-600">• TPCI – PEB Shed Indirapuram → ₹43,885,218.47</p>
                      <p className="text-sm text-gray-600">• L&T TPCI Project Indirapuram → ₹43,883,281.67</p>
                      <p className="text-sm text-gray-600">Both are individual sub-projects with funding &gt;43M, making them significant stand-alone contributors.</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Other Contributors</p>
                    <p className="text-sm text-gray-600">L&T Construction, L&T Turnkey, UltraTech Cement, and other sub-projects contribute in the 20M–30M range each. These form the mid-tier contributors.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h5>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Strengthen Partnerships with Top 3 Funders</p>
                    <p className="text-sm text-gray-600">Maintain strong engagement with L&T Minerals & Metals, UTCL Rawan, and TATA Projects, since they contribute ~46% of funding.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Monitor Dependence Risk</p>
                    <p className="text-sm text-gray-600">Heavy reliance on a few large funders is a business risk. Explore opportunities to diversify funding sources further.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Replicate Success of Indirapuram Projects</p>
                    <p className="text-sm text-gray-600">The two 43M+ projects indicate successful funding models. Analyze their execution to apply best practices across future projects.</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nurture Mid-Tier Contributors</p>
                    <p className="text-sm text-gray-600">L&T Construction, UltraTech, and other contributors (20M–30M range) show growth potential. With focused engagement, they could scale up to top-tier contributors.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhoFundsOurTopProjects;
