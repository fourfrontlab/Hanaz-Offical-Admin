import { useState } from 'react';
import { Search, Bell, Calendar, ChevronDown, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-neutral-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
      
      {/* Search Bar */}
      <div className="relative w-96">
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

      <div className="flex items-center gap-6">
        {/* Date Range Selector */}
        <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
          <Calendar className="h-4 w-4" />
          <span>Last 30 Days</span>
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-50">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1 pr-2 rounded-full hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-200 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-medium text-sm">
              AD
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium text-neutral-700 leading-none mb-1">
                Admin
              </span>
              <span className="text-xs text-neutral-500 leading-none">
                {session?.user?.email || 'admin@hanaz.com'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-neutral-400 ml-1" />
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
