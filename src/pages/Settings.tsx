import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { Key, User, Info, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { session } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully');
      setPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-medium mb-6">Settings</h2>
      
      {/* Admin Profile Section */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center gap-2">
          <User className="w-5 h-5 text-neutral-500" />
          <h3 className="font-medium text-neutral-900">Admin Profile</h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={session?.user?.email || ''} 
              disabled 
              className="w-full md:w-96 border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-neutral-100 text-neutral-500 cursor-not-allowed"
            />
            <p className="text-xs text-neutral-500 mt-1">Email cannot be changed.</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 pt-4 border-t border-neutral-100">
            <h4 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
              <Key className="w-4 h-4" /> Change Password
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || !password}
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Store Settings Section */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden opacity-75">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center gap-2">
          <Info className="w-5 h-5 text-neutral-500" />
          <h3 className="font-medium text-neutral-900">Store Settings</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-neutral-600 mb-4">
            Store settings such as Free Shipping Threshold, Return Policy window, and Contact Information are currently managed directly within the storefront repository. 
          </p>
          <p className="text-sm text-neutral-600">
            A future update will connect these configurations to this dashboard once the storefront API is updated to read from the database.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pointer-events-none opacity-50">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Free Shipping Threshold (Rs.)</label>
              <input type="number" value={5000} disabled className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-neutral-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Return Window (Days)</label>
              <input type="number" value={3} disabled className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-neutral-100" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
