import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useFilter } from '../context/FilterContext';

export interface DashboardStats {
  grossSales: number;
  netProfit: number;
  pendingCod: number;
  returnRate: number;
  totalOrders: number;
}

export function useDashboardStats() {
  const { dateRange } = useFilter();
  const [stats, setStats] = useState<DashboardStats>({
    grossSales: 0,
    netProfit: 0,
    pendingCod: 0,
    returnRate: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('status, total_amount, net_profit, payment_method, payment_status');

    if (dateRange.startDate) {
      query = query.gte('created_at', dateRange.startDate.toISOString());
    }
    if (dateRange.endDate) {
      query = query.lte('created_at', dateRange.endDate.toISOString());
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
      return;
    }

    if (orders) {
      let grossSales = 0;
      let netProfit = 0;
      let pendingCod = 0;
      let returnedCount = 0;
      const totalOrders = orders.length;

      for (const order of orders) {
        const isCancelled = order.status === 'Cancelled';
        const isRefunded = order.payment_status === 'refunded';
        const isReturned = order.status === 'Returned';

        // Gross Sales & Net Profit (exclude cancelled and refunded)
        if (!isCancelled && !isRefunded) {
          grossSales += Number(order.total_amount) || 0;
          netProfit += Number(order.net_profit) || 0;
        }

        // Pending COD (COD, unpaid, not cancelled/returned)
        if (
          order.payment_method === 'COD' &&
          order.payment_status === 'unpaid' &&
          !isCancelled && 
          !isReturned
        ) {
          pendingCod += Number(order.total_amount) || 0;
        }

        // Return Rate Count (Cancelled + Refunded + Returned)
        if (isCancelled || isRefunded || isReturned) {
          returnedCount++;
        }
      }

      const returnRate = totalOrders > 0 ? (returnedCount / totalOrders) * 100 : 0;

      setStats({
        grossSales,
        netProfit,
        pendingCod,
        returnRate,
        totalOrders,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();

    // Setup real-time subscription for orders
    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Refetch stats when any order changes
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateRange]);

  return { stats, loading, refetch: fetchStats };
}
