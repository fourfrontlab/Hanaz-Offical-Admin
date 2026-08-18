import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import StatusBadge from '../components/StatusBadge';
import { Loader2, Search, Edit2, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  'Pending',
  'Processing',
  'Dispatched',
  'Delivered',
  'Returned',
  'Cancelled'
];

export default function Orders() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const { orders, loading, updateOrderStatus, updateTracking } = useOrders(query);

  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // DB trigger handles profit recalculation, and Realtime handles refetching stats
      toast.success(`Status updated to ${newStatus}. Profit recalculated.`, {
        icon: '🔄',
      });
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    try {
      await updateTracking(orderId, trackingInput);
      toast.success('Tracking number updated.');
      setEditingTracking(null);
    } catch (error) {
      toast.error('Failed to update tracking.');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 md:mb-6">
        <h2 className="text-xl font-medium">Orders & Returns</h2>
        {query && (
          <div className="text-sm text-neutral-500 bg-white px-3 py-1 rounded-full border border-neutral-200">
            Showing results for: <span className="font-medium text-neutral-800">"{query}"</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
                    <p className="text-neutral-500 text-sm">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 font-medium">No orders found.</p>
                    {query && <p className="text-sm text-neutral-400 mt-1">Try adjusting your search query.</p>}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-600">
                      #{order.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">{order.customer_name}</div>
                      <div className="text-sm text-neutral-500">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {order.order_items?.[0]?.count || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      Rs. {order.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded ${
                        order.payment_method === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-sm border-neutral-300 rounded-md shadow-sm focus:border-brand-500 focus:ring-brand-500 cursor-pointer bg-neutral-50 py-1"
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <StatusBadge status={order.status} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      <div className="flex items-center gap-3">
                        {editingTracking === order.id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="text"
                              value={trackingInput}
                              onChange={(e) => setTrackingInput(e.target.value)}
                              className="border border-neutral-300 rounded px-2 py-1 text-sm w-32"
                              placeholder="Tracking #"
                            />
                            <button onClick={() => handleSaveTracking(order.id)} className="text-brand-600 hover:text-brand-700 font-medium">Save</button>
                            <button onClick={() => setEditingTracking(null)} className="text-neutral-400 hover:text-neutral-600">Cancel</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingTracking(order.id);
                              setTrackingInput(order.tracking_number || '');
                            }}
                            className="text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                            title="Update Tracking"
                          >
                            <Edit2 size={16} />
                            {order.tracking_number ? order.tracking_number : 'Add Tracking'}
                          </button>
                        )}
                        <button className="text-neutral-400 hover:text-neutral-600 transition-colors" title="View Courier Journey (Stub)">
                          <Truck size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
