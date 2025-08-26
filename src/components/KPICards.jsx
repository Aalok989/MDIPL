import React, { useEffect, useState, useCallback } from "react";
import { FiDollarSign, FiUsers, FiFolder, FiTrendingUp, FiStar } from "react-icons/fi";
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
    <div className="w-full h-full p-6 flex flex-col overflow-hidden lg:min-h-screen">
      <div className="mb-4 flex items-center gap-3 w-full">
        <img src={mdiplLogo} alt="MDIPL logo" className="h-16 md:h-20 w-auto" />
        <div className="flex-1">
          <h1 className="text-2xl md:text-2xl lg:text-2xl font-extrabold text-center font-outfit" style={{ color: '#0B1D51' }}>
            Analytics Dashboard
          </h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0">
      <div className="space-y-3 pr-1 lg:flex-none lg:max-h-[60vh] lg:overflow-auto">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-3 rounded-2xl shadow-lg border border-blue-300/50">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Total Bills</p>
              <p className="text-2xl font-extrabold text-blue-900">{kpis["Total Bills"] || "₹0"}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-md">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 p-3 rounded-2xl shadow-lg border border-emerald-300/50">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Unique Vendors</p>
              <p className="text-2xl font-extrabold text-emerald-900">{kpis["Unique Vendors"] || 0}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-md">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 p-3 rounded-2xl shadow-lg border border-purple-300/50">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">Unique Projects</p>
              <p className="text-2xl font-extrabold text-purple-900">{kpis["Unique Projects"] || 0}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-md">
              <FiFolder className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 p-3 rounded-2xl shadow-lg border border-orange-300/50">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">Monthly Avg Spend</p>
              <p className="text-2xl font-extrabold text-orange-900">{kpis["Monthly Avg Spend"] || "₹0"}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-md">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-200 p-3 rounded-2xl shadow-lg border border-indigo-300/50">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Top Vendor Contribution</p>
              <p className="text-2xl font-extrabold text-indigo-900">{kpis["Top Vendor Contribution"] || "0%"}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-md">
              <FiStar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 rounded-2xl border border-gray-200 overflow-hidden lg:flex-none lg:h-[40vh]">
        <div className="relative w-full h-full lg:h-[40vh]">
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


