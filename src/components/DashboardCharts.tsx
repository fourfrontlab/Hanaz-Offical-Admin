import { Loader2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardCharts } from '../hooks/useDashboardCharts';
import type { RawOrder } from '../hooks/useDashboardStats';
import type { DateRangeLabel } from '../context/FilterContext';

// ─── Palette ──────────────────────────────────────────────────────────────────
// Brand colours pulled from the existing Tailwind brand palette in use across the app

const GROSS_COLOR  = '#7c3aed'; // brand-600
const PROFIT_COLOR = '#10b981'; // emerald-500

const STATUS_COLORS: Record<string, string> = {
  Pending:    '#f59e0b', // amber-400
  Processing: '#3b82f6', // blue-500
  Dispatched: '#8b5cf6', // violet-500
  Delivered:  '#10b981', // emerald-500
  Returned:   '#f97316', // orange-500
  Cancelled:  '#ef4444', // red-500
};

const FALLBACK_COLORS = ['#6366f1', '#14b8a6', '#ec4899', '#84cc16', '#0ea5e9'];

function getStatusColor(status: string, index: number): string {
  return STATUS_COLORS[status] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

// ─── Currency formatter ───────────────────────────────────────────────────────

function fmtPKR(val: number): string {
  if (val >= 1_000_000) return `Rs ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `Rs ${(val / 1_000).toFixed(0)}K`;
  return `Rs ${val}`;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-neutral-700 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-neutral-500">{entry.name}:</span>
          <span className="font-medium text-neutral-900">
            {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-neutral-700">{name}</p>
      <p className="text-neutral-500 mt-0.5">{value} order{value !== 1 ? 's' : ''}</p>
    </div>
  );
}

// ─── Custom Legend for Donut ──────────────────────────────────────────────────

function DonutLegend({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="flex flex-col gap-1.5 min-w-[130px]">
      {data.map((d, i) => (
        <div key={d.status} className="flex items-center gap-2 text-xs">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: getStatusColor(d.status, i) }}
          />
          <span className="text-neutral-600 flex-1 truncate">{d.status}</span>
          <span className="text-neutral-400 font-medium">
            {total > 0 ? `${Math.round((d.count / total) * 100)}%` : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface DashboardChartsProps {
  rawOrders: RawOrder[];
  loading: boolean;
  rangeLabel: DateRangeLabel;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardCharts({ rawOrders, loading, rangeLabel }: DashboardChartsProps) {
  const { trend, statusBreakdown } = useDashboardCharts(rawOrders, rangeLabel);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm min-h-[360px] flex flex-col items-center justify-center gap-3 text-neutral-400">
        <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
        <span className="text-sm">Loading charts…</span>
      </div>
    );
  }

  if (rawOrders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm min-h-[360px] flex flex-col items-center justify-center gap-3 text-neutral-400">
        <svg className="w-10 h-10 text-neutral-200" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h18v18H3z" fillOpacity="0" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 14l3-3 2 2 4-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm font-medium">No orders in this period</p>
        <p className="text-xs text-neutral-300">Change the date range to see chart data.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

      {/* ── Revenue Trend (left 60%) ── */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-neutral-700">Revenue Trend</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gross Sales vs Net Profit — {rangeLabel} · excludes Cancelled &amp; Refunded
          </p>
        </div>

        {trend.length === 0 ? (
          <div className="flex items-center justify-center h-52 text-neutral-300 text-sm">No data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GROSS_COLOR} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={GROSS_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PROFIT_COLOR} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={PROFIT_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#a3a3a3' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={fmtPKR}
                tick={{ fontSize: 11, fill: '#a3a3a3' }}
                tickLine={false}
                axisLine={false}
                width={68}
              />
              <Tooltip content={<TrendTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />
              <Area
                type="monotone"
                dataKey="grossSales"
                name="Gross Sales"
                stroke={GROSS_COLOR}
                strokeWidth={2}
                fill="url(#colorGross)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="netProfit"
                name="Net Profit"
                stroke={PROFIT_COLOR}
                strokeWidth={2}
                fill="url(#colorProfit)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Order Status Donut (right 40%) ── */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-neutral-700">Order Status Breakdown</h3>
          <p className="text-xs text-neutral-400 mt-0.5">All orders — {rangeLabel}</p>
        </div>

        {statusBreakdown.length === 0 ? (
          <div className="flex items-center justify-center h-52 text-neutral-300 text-sm">No data for this period</div>
        ) : (
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell
                      key={entry.status}
                      fill={getStatusColor(entry.status, index)}
                    />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <DonutLegend data={statusBreakdown} />
          </div>
        )}

        {/* Total count */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center text-sm">
          <span className="text-neutral-400">Total Orders</span>
          <span className="font-semibold text-neutral-700">
            {statusBreakdown.reduce((s, d) => s + d.count, 0)}
          </span>
        </div>
      </div>

    </div>
  );
}
