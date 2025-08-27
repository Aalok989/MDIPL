import React from 'react';
import useResizeKey from '../hooks/useResizeKey';

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
const GraphCard = ({ children }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-300 h-full">
      {children}
    </div>
  );
};

const GraphSection = () => {
  const resizeKey = useResizeKey();
  const charts = [
    { component: <SpendBySeasonChart /> },
    { component: <TopVendorsChart /> },
    { component: <ProjectsCompletedByMonths /> },
    { component: <TotalSalesPerMonth /> },
    { component: <DayOfWeekSalesChart /> },
    { component: <SuppliersByTotalSpend /> },
    { component: <CustomersByTotalRevenue /> },
    { component: <TypicalDealSize /> },
    
    { component: <ProjectsByTotalRevenue /> },
    { component: <LoyalLegion /> },
    { component: <TheCustomerValueMatrix /> },
    { component: <ProjectEfficiency /> },
    { component: <WhoFundsOurTopProjects /> },
    // { component: <SupplyChainConcentrationRisk /> },
    { component: <SupplierDiversityForTopCustomers /> },
    { component: <TheProjectPortfolio /> },
    { component: <RevenueForecast /> },
    { component: <SuccessBlueprintCustomers /> },
    { component: <CustomerByHealthScore /> },
    { component: <SuccessBlueprintSuppliers /> },
    { component: <DealSizeDistribution /> },
  ];

  return (
    <div className="w-full p-4 bg-gray-50">
      {/* Header (sticky banner, aligned with grid) */}
      <div className="sticky top-0 z-10 mb-6">
        <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 backdrop-blur-sm rounded-xl border-b border-gray-200">
          <div className="text-center px-4 py-3">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Insights & Trends</h2>
            <p className="text-xs md:text-sm text-gray-500">Interactive charts for performance and risk</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charts.map((chart, index) => (
          <GraphCard key={`${resizeKey}-${index}`}>
            {chart.component}
          </GraphCard>
        ))}
      </div>
    </div>
  );
};

// ✅ THIS LINE IS CRITICAL
export default GraphSection;