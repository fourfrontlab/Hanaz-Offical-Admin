import React, { createContext, useContext, useState, ReactNode } from 'react';

export type DateRangeLabel = 'Last 7 Days' | 'Last 30 Days' | 'This Month' | 'All Time';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  label: DateRangeLabel;
}

interface FilterContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  // Default to Last 30 Days
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultEndDate.getDate() - 30);

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    label: 'Last 30 Days',
  });

  return (
    <FilterContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
