import { useDashboardStats } from '../hooks/useDashboardStats';
import { Loader2 } from 'lucide-react';

export default function DashboardOverview() {
  const { stats, loading } = useDashboardStats();

  // Format currency
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-4 md:space-y-6">
      
      {loading && stats.grossSales === 0 ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm relative overflow-hidden">
            <h3 className="text-neutral-500 text-sm font-medium">Gross Sales</h3>
            <p className="text-2xl sm:text-3xl font-medium mt-2 break-words">{formatCurrency(stats.grossSales)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm relative overflow-hidden">
            <h3 className="text-neutral-500 text-sm font-medium">Net Profit</h3>
            <p className="text-2xl sm:text-3xl font-medium mt-2 text-green-600 break-words">{formatCurrency(stats.netProfit)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm relative overflow-hidden">
            <h3 className="text-neutral-500 text-sm font-medium">Pending COD</h3>
            <p className="text-2xl sm:text-3xl font-medium mt-2 text-amber-600 break-words">{formatCurrency(stats.pendingCod)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm relative overflow-hidden">
            <h3 className="text-neutral-500 text-sm font-medium">Return Rate</h3>
            <p className="text-2xl sm:text-3xl font-medium mt-2 text-red-500 break-words">{stats.returnRate.toFixed(1)}%</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm min-h-[400px] flex items-center justify-center text-neutral-400">
        Chart / Data Grid Area
      </div>
    </div>
  );
}
