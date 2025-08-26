import React from 'react';

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

// Reusable card component
const GraphCard = ({ children }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-300 h-full">
      {children}
    </div>
  );
};

const GraphSection = () => {
  const charts = [
    { component: <SpendBySeasonChart /> },
    { component: <TopVendorsChart /> },
    { component: <ProjectsCompletedByMonths /> },
    { component: <TotalSalesPerMonth /> },
    { component: <DayOfWeekSalesChart /> },
    { component: <SuppliersByTotalSpend /> },
    { component: <CustomersByTotalRevenue /> },
    { component: <TypicalDealSize /> },
    { component: <DealSizeDistribution /> },
    { component: <ProjectsByTotalRevenue /> },
    { component: <LoyalLegion /> },
    { component: <TheCustomerValueMatrix /> },
    { component: <ProjectEfficiency /> },
    { component: <WhoFundsOurTopProjects /> },
    // { component: <SupplyChainConcentrationRisk /> },
    { component: <SupplierDiversityForTopCustomers /> },
    { component: <TheProjectPortfolio /> },
  ];

  return (
    <div className="w-full p-4 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h2>
        <p className="text-sm text-gray-500">Comprehensive overview of market performance and trends</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charts.map((chart, index) => (
          <GraphCard key={index}>
            {chart.component}
          </GraphCard>
        ))}
      </div>
    </div>
  );
};

// ✅ THIS LINE IS CRITICAL
export default GraphSection;