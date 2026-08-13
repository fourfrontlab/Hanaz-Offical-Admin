import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface DashboardStats {
  grossSales: number;
  netProfit: number;
  pendingCod: number;
  returnRate: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    grossSales: 0,
    netProfit: 0,
    pendingCod: 0,
    returnRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    // Fetch all orders for the POC. In production, add date range filtering.
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, total_amount, net_profit, payment_method');

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
        // Gross Sales
        grossSales += Number(order.total_amount) || 0;
        
        // Net Profit
        netProfit += Number(order.net_profit) || 0;

        // Pending COD
        if (
          order.payment_method === 'COD' &&
          !['Delivered', 'Returned', 'Cancelled'].includes(order.status)
        ) {
          pendingCod += Number(order.total_amount) || 0;
        }

        // Return Count
        if (order.status === 'Returned') {
          returnedCount++;
        }
      }

      const returnRate = totalOrders > 0 ? (returnedCount / totalOrders) * 100 : 0;

      setStats({
        grossSales,
        netProfit,
        pendingCod,
        returnRate,
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
  }, []);

  return { stats, loading, refetch: fetchStats };
}
