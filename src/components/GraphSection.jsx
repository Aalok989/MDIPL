import React, { useState, useCallback } from 'react';
import useResizeKey from '../hooks/useResizeKey';
import { FiEye, FiX } from 'react-icons/fi';
import DateRangeFilter from './DateRangeFilter';
import ModalDateRangeFilter from './ModalDateRangeFilter';

// Import all graph components
import SpendBySeasonChart from '../graphs/SpendBySeasonChart';
import TopVendorsChart from '../graphs/TopVendorsChart';
import ProjectsCompletedByMonths from '../graphs/ProjectsCompletedByMonths';
import TotalSalesPerMonth from '../graphs/TotalSalesPerMonth';
import DayOfWeekSalesChart from '../graphs/DayOfWeekSalesChart';
import SuppliersByTotalSpend from '../graphs/SuppliersByTotalSpend';
import CustomersByTotalRevenue from '../graphs/CustomersByTotalRevenue';
import TypicalDealSize from '../graphs/TypicalDealSize';
import DealSizeDistribution from '../graphs/DealSizeDistribution';
import ProjectsByTotalRevenue from '../graphs/ProjectsByTotalRevenue';
import LoyalLegion from '../graphs/LoyalLegion';
import TheCustomerValueMatrix from '../graphs/TheCustomerValueMatrix';
import ProjectEfficiency from '../graphs/ProjectEfficiency';
import WhoFundsOurTopProjects from '../graphs/WhoFundsOurTopProjects';
import SupplyChainConcentrationRisk from '../graphs/SupplyChainConcentrationRisk';
import SupplierDiversityForTopCustomers from '../graphs/SupplierDiversityForTopCustomers';
import TheProjectPortfolio from '../graphs/TheProjectPortfolio';
import SuccessBlueprintSuppliers from '../graphs/SuccessBlueprintSuppliers';
import SuccessBlueprintCustomers from '../graphs/SuccessBlueprintCustomers';
import RevenueForecast from '../graphs/RevenueForecast';
import CustomerByHealthScore from '../graphs/CustomerByHealthScore';

// Reusable card component
const GraphCard = ({ children, onView }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-300 h-full relative">
      {/* View (expand) control - entire button clickable */}
      <button
        type="button"
        aria-label="View detailed chart"
        title="View detailed chart"
        onClick={onView}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-gray-300 bg-white/90 hover:bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm cursor-pointer backdrop-blur-sm flex-shrink-0"
        style={{ pointerEvents: 'auto' }}
      >
        <span className="text-xs text-gray-600 select-none font-medium">View</span>
        <FiEye className="w-4 h-4 text-gray-600" />
      </button>
      {children}
    </div>
  );
};

const GraphSection = () => {
  const resizeKey = useResizeKey();
  const [selectedChartKey, setSelectedChartKey] = useState(null);
  const [modalDateRange, setModalDateRange] = useState({
    startDate: new Date(2000, 0, 1),
    endDate: new Date()
  });

  const openModal = useCallback((key) => {
    setSelectedChartKey(key);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedChartKey(null);
  }, []);

  const handleModalDateRangeChange = useCallback((startDate, endDate) => {
    setModalDateRange({ startDate, endDate });
  }, []);
  const charts = [
    { key: 'spend-by-season', Component: SpendBySeasonChart },
    // { key: 'top-vendors', Component: TopVendorsChart },
    { key: 'projects-completed-by-months', Component: ProjectsCompletedByMonths },
    { key: 'total-sales-per-month', Component: TotalSalesPerMonth },
    { key: 'day-of-week-sales', Component: DayOfWeekSalesChart },
    { key: 'suppliers-by-total-spend', Component: SuppliersByTotalSpend },
    { key: 'customers-by-total-revenue', Component: CustomersByTotalRevenue },
    { key: 'typical-deal-size', Component: TypicalDealSize },
    { key: 'projects-by-total-revenue', Component: ProjectsByTotalRevenue },
    { key: 'loyal-legion', Component: LoyalLegion },
    { key: 'customer-value-matrix', Component: TheCustomerValueMatrix },
    { key: 'project-efficiency', Component: ProjectEfficiency },
    { key: 'who-funds-top-projects', Component: WhoFundsOurTopProjects },
    // { key: 'supply-chain-concentration-risk', Component: SupplyChainConcentrationRisk },
    { key: 'supplier-diversity-top-customers', Component: SupplierDiversityForTopCustomers },
    { key: 'project-portfolio', Component: TheProjectPortfolio },
    { key: 'revenue-forecast', Component: RevenueForecast },
    { key: 'success-blueprint-customers', Component: SuccessBlueprintCustomers },
    { key: 'customer-by-health', Component: CustomerByHealthScore },
    { key: 'success-blueprint-suppliers', Component: SuccessBlueprintSuppliers },
    // { key: 'deal-size-distribution', Component: DealSizeDistribution },
  ];

  return (
    <div className="w-full p-4 bg-gray-50">
      {/* Header (sticky banner, aligned with grid) */}
      <div className="sticky top-0 z-10 mb-6">
        <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 backdrop-blur-sm rounded-xl border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: Title and subtitle */}
            <div className="text-left">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Insights & Trends</h2>
              <p className="text-xs md:text-sm text-gray-500">Interactive charts for performance and risk</p>
            </div>
            
            {/* Right: Date Range Filter */}
            <DateRangeFilter />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charts.map((chart, index) => {
          const Cmp = chart.Component;
          return (
            <GraphCard key={`${resizeKey}-${index}`} onView={() => openModal(chart.key)}>
              <Cmp />
            </GraphCard>
          );
        })}
      </div>

      {/* Fullscreen modal for enlarged chart */}
      {selectedChartKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeModal}>
          <div className="relative bg-white w-[95vw] h-[90vh] md:w-[85vw] md:h-[85vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            {/* All filters are owned by the charts themselves when inModal is true */}
            <button
              type="button"
              aria-label="Close"
              title="Close"
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 z-10"
            >
              <FiX className="w-6 h-6" />
            </button>
            {/* Chart content area */}
            <div className="w-full h-full p-3 flex flex-col gap-3 overflow-hidden">
              {/* Modal Date Range Filter */}
              <ModalDateRangeFilter 
                onDateRangeChange={handleModalDateRangeChange}
                initialStartDate={modalDateRange.startDate}
                initialEndDate={modalDateRange.endDate}
              />
              
              <div className="w-full flex-1 min-h-0 overflow-y-auto">
                {(() => {
                  const found = charts.find(c => c.key === selectedChartKey);
                  if (!found) return null;
                  const Selected = found.Component;
                  return <Selected inModal modalDateRange={modalDateRange} />;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ THIS LINE IS CRITICAL
export default GraphSection;