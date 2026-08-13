import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_method: string;
  status: string;
  tracking_number: string | null;
  created_at: string;
  order_items: [{ count: number }];
}

export function useOrders(searchQuery: string | null = null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*, order_items(count)')
      .order('created_at', { ascending: false });

    if (searchQuery) {
      // Supabase text search for multiple columns
      query = query.or(`order_number.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%,tracking_number.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // Setup real-time subscription for orders
    const channel = supabase
      .channel('public:orders_list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchQuery]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) throw error;
  };

  const updateTracking = async (id: string, newTracking: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ tracking_number: newTracking })
      .eq('id', id);
    
    if (error) throw error;
  };

  return { orders, loading, updateOrderStatus, updateTracking, refetch: fetchOrders };
}
