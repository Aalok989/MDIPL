import React, { useEffect, useState, useCallback } from "react";
import { FiUsers, FiFolder, FiTrendingUp, FiStar } from "react-icons/fi";
import mdiplLogo from "../assets/MDIPL Logo.png";
import GeoMap from "../components/GeoMap";

const Sidebar = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKPIs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/kpis");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setKpis(data);
    } catch (err) {
      console.error("Error fetching KPIs:", err);
      setError(err.message || "Failed to fetch KPI data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading KPIs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Failed to load KPI data</p>
          <p className="text-sm text-gray-500 mb-3">{error}</p>
          <button 
            onClick={fetchKPIs}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!kpis || Object.keys(kpis).length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-2">No KPI data available</p>
          <button 
            onClick={fetchKPIs}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 flex flex-col overflow-hidden lg:min-h-screen">
      {/* Header with smaller logo and text */}
      <div className="mb-4 flex items-center gap-2 w-full">
        <img src={mdiplLogo} alt="MDIPL logo" className="h-10 w-auto" />
        <div className="flex-1">
          <h1 className="text-lg font-bold text-center font-outfit" style={{ color: '#0B1D51' }}>
            Analytics Dashboard
          </h1>
        </div>
      </div>

      {/* KPI Cards with better spacing and no overlap */}
      <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto">
        {/* Total Bills */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-3 rounded-xl shadow-md border border-blue-300/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Total Bills</p>
                <p className="text-lg font-bold text-blue-900">{kpis["Total Bills"] || "₹0"}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="flex items-center justify-center w-4 h-4 text-white text-sm">₹</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unique Vendors */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 p-3 rounded-xl shadow-md border border-emerald-300/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Unique Vendor</p>
                <p className="text-lg font-bold text-emerald-900">{kpis["Unique Vendors"] || 0}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-md">
                <FiUsers className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Unique Projects */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 p-3 rounded-xl shadow-md border border-purple-300/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                
                <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">Unique Project</p>
                <p className="text-lg font-bold text-purple-900">{kpis["Unique Projects"] || 0}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
                <FiFolder className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Avg Spend */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 p-3 rounded-xl shadow-md border border-orange-300/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">Monthly Avg Spend</p>
                <p className="text-lg font-bold text-orange-900">{kpis["Monthly Avg Spend"] || "₹0"}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-md">
                <FiTrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Vendor Contribution */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-200 p-3 rounded-xl shadow-md border border-indigo-300/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Top Vendor Contribution</p>
                <p className="text-lg font-bold text-indigo-900">{kpis["Top Vendor Contribution"] || "0%"}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                <FiStar className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {/* GeoMap with proper sizing */}
        <div className="flex-1 min-h-0 rounded-xl border border-gray-200 overflow-hidden">
          <div className="relative w-full h-full">
            <div className="absolute inset-0">
              <GeoMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


