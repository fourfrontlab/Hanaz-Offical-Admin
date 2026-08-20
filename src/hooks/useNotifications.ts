import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export type NotificationType = 'new_order' | 'cancelled' | 'refunded' | 'low_stock';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  navigateTo: string;
}

const LAST_READ_KEY = 'hanaz_notif_last_read';
const LOW_STOCK_THRESHOLD = 5;
const LOOKBACK_HOURS = 48;

function getLastRead(): string {
  return localStorage.getItem(LAST_READ_KEY) ?? new Date(0).toISOString();
}

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastReadAt, setLastReadAt] = useState<string>(getLastRead);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, total_amount, status, payment_status, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false });

    if (ordersError) console.error('[useNotifications] orders error:', ordersError);

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, stock_quantity, created_at')
      .lte('stock_quantity', LOW_STOCK_THRESHOLD)
      .order('stock_quantity', { ascending: true });

    if (productsError) console.error('[useNotifications] products error:', productsError);

    const items: Notification[] = [];

    for (const o of orders ?? []) {
      if (o.status === 'Cancelled') {
        items.push({
          id: `cancelled-${o.id}`,
          type: 'cancelled',
          message: `Order #${o.order_number} was cancelled`,
          createdAt: o.created_at,
          navigateTo: `/orders?q=${encodeURIComponent(o.order_number)}`,
        });
      } else if (o.payment_status === 'refunded') {
        items.push({
          id: `refunded-${o.id}`,
          type: 'refunded',
          message: `Payment for order #${o.order_number} was refunded`,
          createdAt: o.created_at,
          navigateTo: `/orders?q=${encodeURIComponent(o.order_number)}`,
        });
      } else {
        const amount = Number(o.total_amount).toLocaleString('en-PK');
        items.push({
          id: `new-${o.id}`,
          type: 'new_order',
          message: `New order #${o.order_number} from ${o.customer_name} — Rs. ${amount}`,
          createdAt: o.created_at,
          navigateTo: `/orders?q=${encodeURIComponent(o.order_number)}`,
        });
      }
    }

    for (const p of products ?? []) {
      items.push({
        id: `low-stock-${p.id}`,
        type: 'low_stock',
        message: `${p.title} is low on stock (${p.stock_quantity} left)`,
        createdAt: p.created_at,
        navigateTo: '/products',
      });
    }

    const seen = new Set<string>();
    const sorted = items
      .filter((n) => { if (seen.has(n.id)) return false; seen.add(n.id); return true; })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setNotifications(sorted);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const ordersChannel = supabase
      .channel('notif:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchNotifications();
      })
      .subscribe();

    const productsChannel = supabase
      .channel('notif:products')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_READ_KEY, now);
    setLastReadAt(now);
  }, []);

  const unreadCount = notifications.filter(
    (n) => new Date(n.createdAt).getTime() > new Date(lastReadAt).getTime()
  ).length;

  return { notifications, loading, unreadCount, lastReadAt, markAllAsRead };
}
