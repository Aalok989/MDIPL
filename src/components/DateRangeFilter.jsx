import React, { useState, useEffect } from 'react';
import { useDateFilter } from '../contexts/DateFilterContext';
import { apiRequest } from '../config/api';

const DateRangeFilter = () => {
  const { dateRange, updateDateRange, resetDateRange } = useDateFilter();
  const [tempStartDate, setTempStartDate] = useState(
    dateRange.startDate.toISOString().split('T')[0]
  );
  const [tempEndDate, setTempEndDate] = useState(
    dateRange.endDate.toISOString().split('T')[0]
  );
  const [availableDateRange, setAvailableDateRange] = useState({
    minDate: '2000-01-01',
    maxDate: new Date().toISOString().split('T')[0]
  });

  // Fetch available date range from backend
  useEffect(() => {
    const fetchAvailableDateRange = async () => {
      try {
        // Use the existing apiRequest function with CORS handling
        const data = await apiRequest('AVAILABLE_DATE_RANGE');
        console.log('Backend response:', data);
        
        setAvailableDateRange({
          minDate: data.min_date,
          maxDate: data.max_date
        });
        
        // Update temp dates to use the backend max_date if current end date is beyond it
        const currentEndDate = new Date(dateRange.endDate);
        const backendMaxDate = new Date(data.max_date);
        
        if (currentEndDate > backendMaxDate) {
          setTempEndDate(data.max_date);
          // Also update the global date range context
          updateDateRange(new Date(dateRange.startDate), backendMaxDate);
        }
      } catch (error) {
        console.error('Failed to fetch available date range:', error);
        // No fallback - let the component use default values
      }
    };

    fetchAvailableDateRange();
  }, [dateRange.endDate, dateRange.startDate, updateDateRange]);

  // Update temp dates only when availableDateRange is first loaded from API
  useEffect(() => {
    console.log('availableDateRange changed:', availableDateRange);
    // Only update temp dates if they are still at default values (first load)
    const isDefaultStartDate = tempStartDate === dateRange.startDate.toISOString().split('T')[0];
    const isDefaultEndDate = tempEndDate === dateRange.endDate.toISOString().split('T')[0];
    
    if ((availableDateRange.minDate !== '2000-01-01' || availableDateRange.maxDate !== new Date().toISOString().split('T')[0]) 
        && isDefaultStartDate && isDefaultEndDate) {
      // Only update if we have real data from backend AND temp dates are still at default values
      console.log('Updating temp dates to API values on first load:', availableDateRange.minDate, availableDateRange.maxDate);
      setTempStartDate(availableDateRange.minDate);
      setTempEndDate(availableDateRange.maxDate);
    }
  }, [availableDateRange, tempStartDate, tempEndDate, dateRange.startDate, dateRange.endDate]);

  const handleApply = () => {
    const newStartDate = new Date(tempStartDate);
    const newEndDate = new Date(tempEndDate);
    
    // Set time to start of day for start date and end of day for end date
    newStartDate.setHours(0, 0, 0, 0);
    newEndDate.setHours(23, 59, 59, 999);
    
    updateDateRange(newStartDate, newEndDate);
  };

  const handleReset = () => {
    console.log('Reset clicked - availableDateRange:', availableDateRange);
    const defaultStartDate = new Date(availableDateRange.minDate);
    const defaultEndDate = new Date(availableDateRange.maxDate);
    
    console.log('Setting dates to:', {
      start: defaultStartDate.toISOString().split('T')[0],
      end: defaultEndDate.toISOString().split('T')[0]
    });
    
    setTempStartDate(defaultStartDate.toISOString().split('T')[0]);
    setTempEndDate(defaultEndDate.toISOString().split('T')[0]);
    
    // Update the global date range context
    updateDateRange(defaultStartDate, defaultEndDate);
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
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
            type="date"
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* End Date */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500">To:</label>
          <input
            type="date"
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
            max={availableDateRange.maxDate}
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
          title={`Reset to all data (${availableDateRange.minDate} to ${availableDateRange.maxDate})`}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default DateRangeFilter;

