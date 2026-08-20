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

export interface RawOrder {
  status: string;
  total_amount: number;
  net_profit: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
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
  const [rawOrders, setRawOrders] = useState<RawOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('status, total_amount, net_profit, payment_method, payment_status, created_at');

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
      setRawOrders(orders as RawOrder[]);
      let grossSales = 0;
      let netProfit = 0;
      let pendingCod = 0;
      let returnedCount = 0;
      const totalOrders = orders.length;

      for (const order of orders) {
        // Safely extract and lowercase values for robust comparison
        const status = String(order.status || '').toLowerCase();
        const paymentStatus = String(order.payment_status || 'unpaid').toLowerCase(); // default to unpaid if null
        const paymentMethod = String(order.payment_method || '').toLowerCase();

        const isCancelled = status === 'cancelled';
        const isRefunded = paymentStatus === 'refunded';
        const isReturned = status === 'returned';

        // Gross Sales & Net Profit (exclude cancelled and refunded)
        if (!isCancelled && !isRefunded) {
          grossSales += Number(order.total_amount) || 0;
          netProfit += Number(order.net_profit) || 0;
        }

        // Pending COD (COD, unpaid/pending, not cancelled)
        if (
          paymentMethod === 'cod' &&
          (paymentStatus === 'unpaid' || paymentStatus === 'pending') &&
          !isCancelled
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

  return { stats, rawOrders, loading, refetch: fetchStats };
}
