import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useFilter } from '../context/FilterContext';

export interface OrderItem {
  id: string;
  product_id: string | null;
  title_snapshot: string;
  qty: number;
  price_at_order: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  email: string | null;
  address: string | null;
  total_amount: number;
  payment_method: string;
  status: string;
  tracking_number: string | null;
  courier: string | null;
  created_at: string;
  order_items: [{ count: number }];
}

export function useOrders(searchQuery: string | null = null) {
  const { dateRange } = useFilter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*, order_items(count)')
      .order('created_at', { ascending: false });

    if (dateRange.startDate) {
      query = query.gte('created_at', dateRange.startDate.toISOString());
    }
    if (dateRange.endDate) {
      query = query.lte('created_at', dateRange.endDate.toISOString());
    }

    if (searchQuery) {
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

  // Lazy-load full item data for a specific order (called on row expand)
  const fetchOrderItems = async (orderId: string): Promise<OrderItem[]> => {
    const { data, error } = await supabase
      .from('order_items')
      .select('id, product_id, title_snapshot, qty, price_at_order')
      .eq('order_id', orderId);

    if (error) {
      console.error('Error fetching order items:', error);
      return [];
    }
    return (data as OrderItem[]) || [];
  };

  useEffect(() => {
    fetchOrders();

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
  }, [searchQuery, dateRange]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) throw error;
  };

  const updateTracking = async (id: string, newTracking: string, courier: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ tracking_number: newTracking, courier })
      .eq('id', id);
    
    if (error) throw error;
  };

  return { orders, loading, updateOrderStatus, updateTracking, fetchOrderItems, refetch: fetchOrders };
}

