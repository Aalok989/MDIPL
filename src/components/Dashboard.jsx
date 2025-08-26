import React from 'react';
import KPICards from './KPICards';
import GraphSection from './GraphSection';

const Dashboard = () => {
  return (
    <div className="flex h-full w-full bg-gray-50">
      {/* Fixed KPI Section */}
      <div className="fixed left-0 top-0 h-full w-1/4 bg-gray-50 z-20">
        <KPICards />
      </div>
      
      {/* Scrollable Graph Section */}
      <div className="ml-[25%] w-[75%] h-full overflow-y-auto">
        <GraphSection />
      </div>
    </div>
  );
};

export default Dashboard;