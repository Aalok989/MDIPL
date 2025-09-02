import React, { useState } from 'react';
import { useDateFilter } from '../contexts/DateFilterContext';

const DateRangeFilter = () => {
  const { dateRange, updateDateRange, resetDateRange } = useDateFilter();
  const [tempStartDate, setTempStartDate] = useState(
    `${dateRange.startDate.getFullYear()}-${String(dateRange.startDate.getMonth() + 1).padStart(2, '0')}`
  );
  const [tempEndDate, setTempEndDate] = useState(
    `${dateRange.endDate.getFullYear()}-${String(dateRange.endDate.getMonth() + 1).padStart(2, '0')}`
  );

  const handleApply = () => {
    const [startYear, startMonth] = tempStartDate.split('-').map(Number);
    const [endYear, endMonth] = tempEndDate.split('-').map(Number);
    
    const newStartDate = new Date(startYear, startMonth - 1, 1);
    const newEndDate = new Date(endYear, endMonth, 0); // Last day of the month
    
    updateDateRange(newStartDate, newEndDate);
  };

  const handleReset = () => {
    const currentDate = new Date();
    const defaultStartDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
    const defaultEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    
    setTempStartDate(`${defaultStartDate.getFullYear()}-${String(defaultStartDate.getMonth() + 1).padStart(2, '0')}`);
    setTempEndDate(`${defaultEndDate.getFullYear()}-${String(defaultEndDate.getMonth() + 1).padStart(2, '0')}`);
    resetDateRange();
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 font-medium">Date Range:</span>
      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 flex items-center gap-2">
        {/* Start Date */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500">From:</label>
          <input
            type="month"
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* End Date */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500">To:</label>
          <input
            type="month"
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200"
        >
          Apply
        </button>
        
        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors duration-200"
          title="Reset to last 12 months"
        >
          Reset
        </button>
      </div>
      
      {/* Current Range Display */}
      <div className="text-xs text-gray-500">
        {formatDisplayDate(dateRange.startDate)} - {formatDisplayDate(dateRange.endDate)}
      </div>
    </div>
  );
};

export default DateRangeFilter;

