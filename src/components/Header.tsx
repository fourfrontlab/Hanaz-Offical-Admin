import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Calendar, ChevronDown, LogOut, Menu, ShoppingBag, XCircle, RotateCcw, AlertTriangle, CheckCheck, Package } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFilter, type DateRangeLabel } from '../context/FilterContext';
import { useNotifications, formatRelativeTime, type Notification, type NotificationType } from '../hooks/useNotifications';

// ─── Icon mapping per notification type ──────────────────────────────────────
function NotifIcon({ type }: { type: NotificationType }) {
  const base = 'h-4 w-4 flex-shrink-0';
  switch (type) {
    case 'new_order':    return <ShoppingBag  className={`${base} text-brand-600`} />;
    case 'cancelled':   return <XCircle       className={`${base} text-red-500`} />;
    case 'refunded':    return <RotateCcw     className={`${base} text-amber-500`} />;
    case 'low_stock':   return <AlertTriangle className={`${base} text-orange-500`} />;
  }
}

// ─── Dot colour per type ──────────────────────────────────────────────────────
function dotClass(type: NotificationType) {
  switch (type) {
    case 'new_order':  return 'bg-brand-500';
    case 'cancelled':  return 'bg-red-400';
    case 'refunded':   return 'bg-amber-400';
    case 'low_stock':  return 'bg-orange-400';
  }
}

// ─── Single notification row ──────────────────────────────────────────────────
function NotifRow({
  notif,
  isUnread,
  onClick,
}: {
  notif: Notification;
  isUnread: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-neutral-50 transition-colors group ${
        isUnread ? 'bg-brand-50/60' : ''
      }`}
    >
      {/* Coloured icon circle */}
      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUnread ? 'bg-white shadow-sm ring-1 ring-neutral-200' : 'bg-neutral-100'
      }`}>
        <NotifIcon type={notif.type} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${isUnread ? 'font-medium text-neutral-800' : 'text-neutral-600'}`}>
          {notif.message}
        </p>
        <p className="text-xs text-neutral-400 mt-0.5">{formatRelativeTime(notif.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dotClass(notif.type)}`} />
      )}
    </button>
  );
}

// ─── Notification dropdown panel ─────────────────────────────────────────────
function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, lastReadAt, markAllAsRead, loading } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click (desktop)
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Prevent body scroll when mobile dropdown is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleNotifClick = (notif: Notification) => {
    setOpen(false);
    navigate(notif.navigateTo);
  };

  // ── Shared panel inner content ────────────────────────────────────────────
  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-neutral-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto divide-y divide-neutral-100">
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-neutral-400">
            <div className="w-4 h-4 border-2 border-neutral-300 border-t-brand-500 rounded-full animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <Package className="h-6 w-6 text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-600">No new notifications</p>
            <p className="text-xs text-neutral-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotifRow
              key={notif.id}
              notif={notif}
              isUnread={new Date(notif.createdAt).getTime() > new Date(lastReadAt).getTime()}
              onClick={() => handleNotifClick(notif)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-neutral-100 px-4 py-2.5 text-center">
          <p className="text-xs text-neutral-400">
            Showing activity from the last 48 hours
          </p>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile backdrop — renders behind the panel, above page content */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="relative" ref={panelRef}>
        {/* Bell button */}
        <button
          id="notification-bell-btn"
          aria-label="Notifications"
          onClick={handleOpen}
          className="relative p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          <Bell className={`h-5 w-5 transition-transform duration-200 ${open ? 'scale-110' : ''}`} />
          {/* Unread dot */}
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 flex h-2 w-2 items-center justify-center"
              aria-hidden
            >
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 animate-ping" />
              <span className="relative block h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
            </span>
          )}
        </button>

        {/* ── MOBILE dropdown: fixed, full-width-minus-margins, below header ── */}
        {open && (
          <div
            id="notification-panel"
            className="sm:hidden fixed left-3 right-3 top-[64px] bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 overflow-hidden"
            style={{ animation: 'notifSlideIn 0.15s ease-out' }}
          >
            {panelContent}
          </div>
        )}

        {/* ── DESKTOP dropdown: absolute, right-anchored, constrained width ── */}
        {open && (
          <div
            id="notification-panel-desktop"
            className="hidden sm:block absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden"
            style={{ animation: 'notifSlideIn 0.15s ease-out' }}
          >
            {panelContent}
          </div>
        )}
      </div>

      {/* Keyframe inline (avoids extra CSS file) */}
      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

// ─── Main Header component ────────────────────────────────────────────────────
export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { dateRange, setDateRange } = useFilter();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const label = e.target.value as DateRangeLabel;
    const end = new Date();
    let start: Date | null = new Date();
    
    if (label === 'Last 7 Days') {
      start.setDate(end.getDate() - 7);
    } else if (label === 'Last 30 Days') {
      start.setDate(end.getDate() - 30);
    } else if (label === 'This Month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else {
      start = null; // All Time
    }
    
    setDateRange({ startDate: start, endDate: end, label });
  };

  return (
    <header className="bg-white border-b border-neutral-200 px-4 md:px-8 py-3 md:py-4 flex flex-wrap md:flex-nowrap justify-between items-center sticky top-0 z-20 gap-4 md:gap-6">
      
      <div className="flex items-center gap-2">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full order-last md:order-none md:flex-1 max-w-full md:max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-neutral-400" />
        </div>
        <input
          type="text"
          placeholder="Search Order ID, phone, tracking #..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const query = e.currentTarget.value;
              navigate(query ? `/orders?q=${encodeURIComponent(query)}` : '/orders');
            }
          }}
          className="block w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors placeholder-neutral-400"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-6 ml-auto">
        {/* Date Range Selector */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-200">
          <Calendar className="h-4 w-4" />
          <select 
            value={dateRange.label} 
            onChange={handleDateRangeChange}
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium cursor-pointer"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Month">This Month</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 md:gap-3 p-1 md:pr-2 rounded-full hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-200 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-medium text-sm flex-shrink-0">
              AD
            </div>
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-sm font-medium text-neutral-700 leading-none mb-1">
                Admin
              </span>
              <span className="text-xs text-neutral-500 leading-none">
                {session?.user?.email || 'admin@hanaz.com'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-neutral-400 ml-0 md:ml-1 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-neutral-100 mb-1">
                <p className="text-xs text-neutral-500">Signed in as</p>
                <p className="text-sm font-medium truncate">{session?.user?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
