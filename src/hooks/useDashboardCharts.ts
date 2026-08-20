import { useMemo } from 'react';
import type { RawOrder } from './useDashboardStats';
import type { DateRangeLabel } from '../context/FilterContext';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TrendPoint {
  label: string;       // x-axis label (e.g. "Aug 14" or "Wk 33")
  grossSales: number;
  netProfit: number;
}

export interface StatusSlice {
  status: string;
  count: number;
}

export interface ChartData {
  trend: TrendPoint[];
  statusBreakdown: StatusSlice[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true if this order should be included in revenue metrics
 * (same exclusion logic as useDashboardStats — excludes Cancelled & Refunded).
 */
function isRevenueOrder(order: RawOrder): boolean {
  const status = (order.status || '').toLowerCase();
  const paymentStatus = (order.payment_status || 'unpaid').toLowerCase();
  return status !== 'cancelled' && paymentStatus !== 'refunded';
}

/**
 * Formats a Date into a short "Mon DD" label (e.g. "Aug 14").
 */
function dayLabel(date: Date): string {
  return date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
}

/**
 * ISO week number (Mon-Sun, ISO 8601).
 */
function isoWeek(date: Date): number {
  const tmp = new Date(date.valueOf());
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((tmp.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

function weekLabel(date: Date): string {
  return `Wk ${isoWeek(date)}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardCharts(
  rawOrders: RawOrder[],
  rangeLabel: DateRangeLabel
): ChartData {
  return useMemo(() => {
    // -- Determine bucketing strategy -----------------------------------------
    // <=30 days -> bucket by day; larger / All Time -> bucket by week
    const byDay = rangeLabel === 'Last 7 Days' || rangeLabel === 'Last 30 Days';

    // -- Revenue Trend ---------------------------------------------------------
    const trendMap = new Map<string, TrendPoint>();

    for (const order of rawOrders) {
      const date = new Date(order.created_at);
      const key = byDay
        ? order.created_at.slice(0, 10)
        : `${date.getFullYear()}-W${String(isoWeek(date)).padStart(2, '0')}`;
      const label = byDay ? dayLabel(date) : weekLabel(date);

      if (!trendMap.has(key)) {
        trendMap.set(key, { label, grossSales: 0, netProfit: 0 });
      }

      const point = trendMap.get(key)!;
      if (isRevenueOrder(order)) {
        point.grossSales += Number(order.total_amount) || 0;
        point.netProfit += Number(order.net_profit) || 0;
      }
    }

    // Sort by bucket key (ISO date or year-week strings sort correctly)
    const trend = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, point]) => point);

    // -- Order Status Breakdown ------------------------------------------------
    const statusMap = new Map<string, number>();

    for (const order of rawOrders) {
      const status = order.status || 'Unknown';
      statusMap.set(status, (statusMap.get(status) ?? 0) + 1);
    }

    const statusBreakdown: StatusSlice[] = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    return { trend, statusBreakdown };
  }, [rawOrders, rangeLabel]);
}
