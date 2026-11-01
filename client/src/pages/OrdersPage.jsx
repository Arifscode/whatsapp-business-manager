import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Send, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import OrderForm from '../components/OrderForm';
import OrderDetail from '../components/OrderDetail';
import DispatchModal from '../components/DispatchModal';

const TABS = ['All', 'PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dispatchOrders, setDispatchOrders] = useState([]);
  const [showDispatch, setShowDispatch] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('add') === '1') setShowAddModal(true);
  }, [searchParams]);

  async function loadOrders() {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  const filtered = tab === 'All' ? orders : orders.filter((o) => o.status === tab);
  const confirmedOrders = orders.filter((o) => o.status === 'CONFIRMED');

  function countByStatus(status) {
    return orders.filter((o) => o.status === status).length;
  }

  async function handleAddOrder(data) {
    try {
      await api.post('/orders', data);
      toast.success('Order added');
      setShowAddModal(false);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add order');
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order marked ${status.toLowerCase()}`);
      setSelectedOrder(null);
      loadOrders();
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleDispatch(orderIds, totalShippingCost) {
    try {
      const res = await api.post('/dispatch', { orderIds, totalShippingCost });
      toast.success(res.data.summary);
      setShowDispatch(false);
      setDispatchOrders([]);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Dispatch failed');
    }
  }

  function toggleDispatchOrder(order) {
    setDispatchOrders((prev) =>
      prev.find((o) => o.id === order.id)
        ? prev.filter((o) => o.id !== order.id)
        : [...prev, order]
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Orders" showLogout />

      <div className="px-4 pt-3">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {TABS.map((t) => {
            const count = t === 'All' ? orders.length : countByStatus(t);
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  tab === t ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {t === 'All' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                {count > 0 && (
                  <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                    tab === t ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex-1 py-2.5 text-sm">
            <Plus size={16} /> Add Order
          </button>
          {confirmedOrders.length > 0 && (
            <button
              onClick={() => setShowDispatch(true)}
              className="btn-secondary flex-1 py-2.5 text-sm"
            >
              <Send size={16} /> Dispatch
            </button>
          )}
        </div>
      </div>

      <div className="px-4 mt-4">
        {loading ? (
          <Spinner className="mt-8" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🛍️"
            title={tab === 'All' ? 'No orders yet' : `No ${tab.toLowerCase()} orders`}
            description={tab === 'All' ? 'Orders will appear here once customers place them' : undefined}
          />
        ) : (
          <div className="space-y-3 pb-4">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="card cursor-pointer active:bg-gray-50 transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-gray-400">
                        {order.source === 'FORM' ? '📝 Form' : '💬 Manual'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{order.customerName}</h3>
                    <p className="text-sm text-gray-500">{order.customerPhone}</p>
                    {order.items.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {order.items[0].itemDesc}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <Modal title="Add New Order" onClose={() => setShowAddModal(false)} size="lg">
          <OrderForm onSave={handleAddOrder} onCancel={() => setShowAddModal(false)} />
        </Modal>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal title="Order Details" onClose={() => setSelectedOrder(null)} size="lg">
          <OrderDetail
            order={selectedOrder}
            onStatusChange={handleStatusChange}
            onClose={() => setSelectedOrder(null)}
            onRefresh={loadOrders}
          />
        </Modal>
      )}

      {/* Dispatch Modal */}
      {showDispatch && (
        <Modal title="Dispatch Orders" onClose={() => setShowDispatch(false)} size="lg">
          <DispatchModal
            orders={confirmedOrders}
            onDispatch={handleDispatch}
            onCancel={() => setShowDispatch(false)}
          />
        </Modal>
      )}
    </div>
  );
}
