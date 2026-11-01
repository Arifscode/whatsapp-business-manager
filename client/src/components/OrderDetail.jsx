import { useState } from 'react';
import { Phone, MapPin, MessageSquare, Package, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import StatusBadge from './StatusBadge';
import Modal from './Modal';

const NEXT_STATUS = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED:['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_LABELS = {
  CONFIRMED: 'Confirm Order',
  DISPATCHED: 'Mark Dispatched',
  DELIVERED: 'Mark Delivered',
  CANCELLED: 'Cancel Order',
};

export default function OrderDetail({ order, onStatusChange, onClose, onRefresh }) {
  const [showPackaging, setShowPackaging] = useState(false);
  const [packagingMaterials, setPackagingMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [qtyUsed, setQtyUsed] = useState(1);
  const [savingPkg, setSavingPkg] = useState(false);

  async function openPackagingModal() {
    try {
      const res = await api.get('/packaging');
      setPackagingMaterials(res.data);
      setShowPackaging(true);
    } catch {
      toast.error('Failed to load packaging');
    }
  }

  async function handleAssignPackaging() {
    if (!selectedMaterial) return;
    setSavingPkg(true);
    try {
      await api.post('/packaging/use', {
        materialId: selectedMaterial,
        orderId: order.id,
        qtyUsed,
      });
      toast.success('Packaging assigned');
      setShowPackaging(false);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign packaging');
    } finally {
      setSavingPkg(false);
    }
  }

  const nextStatuses = NEXT_STATUS[order.status] || [];
  const totalShipping = order.shippingCost || 0;
  const totalPackaging = (order.packagingUsages || []).reduce((s, u) => s + u.totalCost, 0);

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center gap-2">
        <StatusBadge status={order.status} />
        <span className="text-xs text-gray-400">
          {order.source === 'FORM' ? '📝 Customer form' : '💬 Manual entry'}
        </span>
      </div>

      {/* Customer info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800 text-base">{order.customerName}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={14} />
          <a href={`tel:${order.customerPhone}`} className="text-brand-600">{order.customerPhone}</a>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin size={14} className="mt-0.5 flex-shrink-0" />
          <span>{order.deliveryAddress}</span>
        </div>
      </div>

      {/* Items */}
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Items</h4>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-gray-700">{item.itemDesc}</span>
              <span className="text-gray-500">×{item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-yellow-50 rounded-xl p-3 flex gap-2">
          <MessageSquare size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700">{order.notes}</p>
        </div>
      )}
      {order.internalNotes && (
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-xs text-blue-500 font-medium mb-0.5">Internal note</p>
          <p className="text-sm text-blue-700">{order.internalNotes}</p>
        </div>
      )}

      {/* Cost breakdown */}
      {(totalShipping > 0 || totalPackaging > 0) && (
        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Cost Breakdown</h4>
          {totalShipping > 0 && (
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1.5 text-gray-600"><Truck size={13} /> Shipping</div>
              <span className="font-medium">Rs. {totalShipping.toFixed(0)}</span>
            </div>
          )}
          {totalPackaging > 0 && (
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1.5 text-gray-600"><Package size={13} /> Packaging</div>
              <span className="font-medium">Rs. {totalPackaging.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Assign packaging button */}
      {(order.status === 'DISPATCHED' || order.status === 'DELIVERED') && (
        <button onClick={openPackagingModal} className="btn-secondary w-full text-sm">
          <Package size={15} /> Assign Packaging Cost
        </button>
      )}

      {/* Status change buttons */}
      {nextStatuses.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          {nextStatuses.map((status) => (
            <button
              key={status}
              onClick={() => {
                if (!confirm(`${STATUS_LABELS[status]}?`)) return;
                onStatusChange(order.id, status);
              }}
              className={status === 'CANCELLED' ? 'btn-danger w-full' : 'btn-primary w-full'}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      )}

      {/* Packaging assignment modal */}
      {showPackaging && (
        <Modal title="Assign Packaging" onClose={() => setShowPackaging(false)}>
          <div className="space-y-4">
            <div>
              <label className="label">Packaging Material</label>
              <select
                className="input"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              >
                <option value="">Select…</option>
                {packagingMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — Rs. {m.perUnitCost.toFixed(2)}/unit (Stock: {m.currentStock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Quantity Used</label>
              <input
                className="input"
                type="number" min="1"
                value={qtyUsed}
                onChange={(e) => setQtyUsed(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setShowPackaging(false)}>Cancel</button>
              <button
                className="btn-primary flex-1"
                disabled={!selectedMaterial || savingPkg}
                onClick={handleAssignPackaging}
              >
                {savingPkg ? 'Saving…' : 'Assign'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
