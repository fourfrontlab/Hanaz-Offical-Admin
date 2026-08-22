import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Package, ShoppingBag, Users, Settings, LogOut, X, Mail } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
      setUnreadCount(count || 0);
    };
    
    fetchUnread();

    // Optionally set up real-time subscription here, but simple polling or just on mount is fine for v1
    const channel = supabase
      .channel('messages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
        fetchUnread();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/', icon: Activity },
    { name: 'Orders & Returns', path: '/orders', icon: ShoppingBag },
    { name: 'Product CMS', path: '/products', icon: Package },
    { name: 'Marketing & CRM', path: '/marketing', icon: Users },
    { name: 'Messages', path: '/messages', icon: Mail },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 flex flex-col h-screen transition-transform duration-300 ease-in-out
      md:sticky md:top-0 md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-neutral-900">Hanaz Official</h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">Admin Dashboard</p>
        </div>
        <button onClick={onClose} className="md:hidden text-neutral-400 hover:text-neutral-600">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`
            }
          >
            <item.icon size={18} />
            <span className="flex-1">{item.name}</span>
            {item.name === 'Messages' && unreadCount > 0 && (
              <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-neutral-200">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-red-50 hover:text-red-600 rounded-md font-medium text-sm transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
