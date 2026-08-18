import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrders, type OrderItem } from '../hooks/useOrders';
import StatusBadge from '../components/StatusBadge';
import { Loader2, Search, Edit2, Truck, ChevronDown, ChevronUp, Package, MapPin, Phone, User } from 'lucide-react';
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
  
  const { orders, loading, updateOrderStatus, updateTracking, fetchOrderItems } = useOrders(query);

  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('');

  // Expandable row state
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, OrderItem[]>>({});
  const [itemsLoading, setItemsLoading] = useState<Record<string, boolean>>({});

  const handleToggleExpand = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    // Load items if not cached yet
    if (!expandedItems[orderId]) {
      setItemsLoading((prev) => ({ ...prev, [orderId]: true }));
      const items = await fetchOrderItems(orderId);
      setExpandedItems((prev) => ({ ...prev, [orderId]: items }));
      setItemsLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Status updated to ${newStatus}.`, { icon: '🔄' });
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    if (!trackingInput.trim() || !courierInput.trim()) {
      toast.error('Both Tracking Number and Courier are required.');
      return;
    }
    try {
      await updateTracking(orderId, trackingInput, courierInput);
      toast.success('Tracking details updated.');
      setEditingTracking(null);
    } catch (error) {
      toast.error('Failed to update tracking details.');
    }
  };

  const formatCurrency = (val: number) =>
    `Rs. ${Number(val).toLocaleString('en-PK')}`;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 md:mb-6">
        <h2 className="text-xl font-medium">Orders &amp; Returns</h2>
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
                orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const items = expandedItems[order.id] || [];
                  const isLoadingItems = itemsLoading[order.id];
                  const itemCount = order.order_items?.[0]?.count ?? 0;

                  return (
                    <>
                      {/* ── Main Row ── */}
                      <tr
                        key={order.id}
                        className={`hover:bg-neutral-50 transition-colors cursor-pointer ${isExpanded ? 'bg-brand-50 hover:bg-brand-50' : ''}`}
                        onClick={() => handleToggleExpand(order.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isExpanded
                              ? <ChevronUp size={14} className="text-brand-500 flex-shrink-0" />
                              : <ChevronDown size={14} className="text-neutral-400 flex-shrink-0" />
                            }
                            <span className="text-sm font-medium text-brand-600">#{order.order_number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-neutral-900">{order.customer_name}</div>
                          <div className="text-sm text-neutral-500">{order.customer_phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded ${
                            order.payment_method === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {order.payment_method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-3">
                            {editingTracking === order.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={courierInput}
                                  onChange={(e) => setCourierInput(e.target.value)}
                                  className="border border-neutral-300 rounded px-2 py-1 text-sm w-24"
                                  placeholder="Courier"
                                  required
                                />
                                <input
                                  type="text"
                                  value={trackingInput}
                                  onChange={(e) => setTrackingInput(e.target.value)}
                                  className="border border-neutral-300 rounded px-2 py-1 text-sm w-32"
                                  placeholder="Tracking #"
                                  required
                                />
                                <button onClick={() => handleSaveTracking(order.id)} className="text-brand-600 hover:text-brand-700 font-medium">Save</button>
                                <button onClick={() => setEditingTracking(null)} className="text-neutral-400 hover:text-neutral-600">Cancel</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingTracking(order.id); setTrackingInput(order.tracking_number || ''); setCourierInput(order.courier || ''); }}
                                className="text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                                title="Update Tracking"
                              >
                                <Edit2 size={16} />
                                {order.tracking_number && order.courier ? `${order.courier}: ${order.tracking_number}` : (order.tracking_number ? order.tracking_number : 'Add Tracking')}
                              </button>
                            )}
                            <button className="text-neutral-400 hover:text-neutral-600 transition-colors" title="View Courier Journey (Stub)">
                              <Truck size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Expanded Detail Panel ── */}
                      {isExpanded && (
                        <tr key={`${order.id}-detail`} className="bg-brand-50/60">
                          <td colSpan={7} className="px-6 py-0">
                            <div className="border-t border-brand-100 py-5">
                              {isLoadingItems ? (
                                <div className="flex items-center gap-2 text-neutral-500 text-sm py-2">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Loading order details…
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                  {/* Items list */}
                                  <div className="lg:col-span-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                                      <Package size={13} /> Items Ordered
                                    </h4>
                                    {items.length === 0 ? (
                                      <p className="text-sm text-neutral-400 italic">No item records found for this order.</p>
                                    ) : (
                                      <div className="space-y-2">
                                        {items.map((item) => (
                                          <div key={item.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-neutral-100">
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-neutral-900 truncate">{item.title_snapshot}</p>
                                              <p className="text-xs text-neutral-500 mt-0.5">{formatCurrency(item.price_at_order)} × {item.qty}</p>
                                            </div>
                                            <div className="text-sm font-semibold text-neutral-800 ml-4 flex-shrink-0">
                                              {formatCurrency(item.price_at_order * item.qty)}
                                            </div>
                                          </div>
                                        ))}
                                        <div className="flex justify-end pt-1">
                                          <div className="text-sm font-semibold text-neutral-700">
                                            Order Total: <span className="text-brand-700">{formatCurrency(order.total_amount)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Customer & Order Info */}
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                                        <User size={13} /> Customer
                                      </h4>
                                      <div className="bg-white rounded-lg border border-neutral-100 px-4 py-3 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-neutral-700">
                                          <User size={13} className="text-neutral-400 flex-shrink-0" />
                                          {order.customer_name}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-neutral-700">
                                          <Phone size={13} className="text-neutral-400 flex-shrink-0" />
                                          {order.customer_phone}
                                        </div>
                                        {order.address && (
                                          <div className="flex items-start gap-2 text-sm text-neutral-700">
                                            <MapPin size={13} className="text-neutral-400 flex-shrink-0 mt-0.5" />
                                            <span>{order.address}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Order Info</h4>
                                      <div className="bg-white rounded-lg border border-neutral-100 px-4 py-3 space-y-2 text-sm text-neutral-700">
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Payment</span>
                                          <span className="font-medium">{order.payment_method}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Status</span>
                                          <StatusBadge status={order.status} />
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Tracking</span>
                                          <span className="font-medium">{order.tracking_number ? `${order.courier || 'Unknown'}: ${order.tracking_number}` : '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Placed</span>
                                          <span>{new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
