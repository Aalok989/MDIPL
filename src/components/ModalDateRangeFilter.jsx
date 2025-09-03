import React, { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';

const ModalDateRangeFilter = ({ onDateRangeChange, initialStartDate, initialEndDate }) => {
  const [tempStartDate, setTempStartDate] = useState(
    initialStartDate ? initialStartDate.toISOString().split('T')[0] : ''
  );
  const [tempEndDate, setTempEndDate] = useState(
    initialEndDate ? initialEndDate.toISOString().split('T')[0] : ''
  );
  const [availableDateRange, setAvailableDateRange] = useState({
    minDate: '2000-01-01',
    maxDate: new Date().toISOString().split('T')[0]
  });

  // Fetch available date range from backend
  useEffect(() => {
    const fetchAvailableDateRange = async () => {
      try {
        const data = await apiRequest('AVAILABLE_DATE_RANGE');
        console.log('Modal - Backend response:', data);
        
        setAvailableDateRange({
          minDate: data.min_date,
          maxDate: data.max_date
        });
        
        // Set initial dates if not provided
        if (!initialStartDate && !initialEndDate) {
          setTempStartDate(data.min_date);
          setTempEndDate(data.max_date);
        }
      } catch (error) {
        console.error('Modal - Failed to fetch available date range:', error);
        // No fallback - let the component use default values
      }
    };

    fetchAvailableDateRange();
  }, [initialStartDate, initialEndDate]);

  const handleApply = () => {
    const newStartDate = new Date(tempStartDate);
    const newEndDate = new Date(tempEndDate);
    
    // Set time to start of day for start date and end of day for end date
    newStartDate.setHours(0, 0, 0, 0);
    newEndDate.setHours(23, 59, 59, 999);
    
    // Call the parent callback with the new date range
    onDateRangeChange(newStartDate, newEndDate);
  };

  const handleReset = () => {
    console.log('Modal - Reset clicked - availableDateRange:', availableDateRange);
    const defaultStartDate = new Date(availableDateRange.minDate);
    const defaultEndDate = new Date(availableDateRange.maxDate);
    
    console.log('Modal - Setting dates to:', {
      start: defaultStartDate.toISOString().split('T')[0],
      end: defaultEndDate.toISOString().split('T')[0]
    });
    
    setTempStartDate(defaultStartDate.toISOString().split('T')[0]);
    setTempEndDate(defaultEndDate.toISOString().split('T')[0]);
    
    // Apply the reset dates immediately
    onDateRangeChange(defaultStartDate, defaultEndDate);
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-sm text-gray-600 font-medium">Date Range:</span>
      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 flex items-center gap-2">
        {/* Start Date */}
        <div className="flex items-center gap-1">
          <label className="text-sm text-gray-500">From:</label>
          <input
            type="date"
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* End Date */}
        <div className="flex items-center gap-1">
          <label className="text-sm text-gray-500">To:</label>
          <input
            type="date"
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
            max={availableDateRange.maxDate}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="px-3 py-1.5 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200"
        >
          Apply
        </button>
        
        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors duration-200"
          title={`Reset to all data (${availableDateRange.minDate} to ${availableDateRange.maxDate})`}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ModalDateRangeFilter;
