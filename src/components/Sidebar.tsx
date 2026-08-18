import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Package, ShoppingBag, Users, Settings, LogOut, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/', icon: Activity },
    { name: 'Orders & Returns', path: '/orders', icon: ShoppingBag },
    { name: 'Product CMS', path: '/products', icon: Package },
    { name: 'Marketing & CRM', path: '/marketing', icon: Users },
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
            {item.name}
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
