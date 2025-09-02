import React, { createContext, useContext, useState } from 'react';

const DateFilterContext = createContext();

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};

export const DateFilterProvider = ({ children }) => {
  // Default to last 12 months
  const currentDate = new Date();
  const defaultStartDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
  const defaultEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

  const [dateRange, setDateRange] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate
  });

  const updateDateRange = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
  };

  const resetDateRange = () => {
    setDateRange({
      startDate: defaultStartDate,
      endDate: defaultEndDate
    });
  };

  const value = {
    dateRange,
    updateDateRange,
    resetDateRange
  };

  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  );
};

