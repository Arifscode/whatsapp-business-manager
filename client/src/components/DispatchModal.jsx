import { useState } from 'react';

export default function DispatchModal({ orders, onDispatch, onCancel }) {
  const [selected, setSelected] = useState(orders.map((o) => o.id));
  const [shippingCost, setShippingCost] = useState('');
  const [saving, setSaving] = useState(false);

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  const perOrder = selected.length > 0 && shippingCost
    ? (parseFloat(shippingCost) / selected.length).toFixed(0)
    : null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (selected.length === 0 || !shippingCost) return;
    setSaving(true);
    try {
      await onDispatch(selected, parseFloat(shippingCost));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">Select orders to dispatch together. Shipping cost will be split equally.</p>

      {/* Order checkboxes */}
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {orders.map((order) => (
          <label key={order.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 accent-brand-600"
              checked={selected.includes(order.id)}
              onChange={() => toggle(order.id)}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
              <p className="text-xs text-gray-500 truncate">
                {order.items[0]?.itemDesc}{order.items.length > 1 && ` +${order.items.length - 1}`}
              </p>
            </div>
          </label>
        ))}
      </div>

      {/* Shipping cost */}
      <div>
        <label className="label">Total Shipping Cost (Rs.)</label>
        <input
          className="input"
          type="number" min="0"
          value={shippingCost}
          onChange={(e) => setShippingCost(e.target.value)}
          placeholder="e.g. 300"
          required
        />
        {perOrder && (
          <p className="text-xs text-brand-600 mt-1 font-medium">
            Rs. {perOrder} per order ({selected.length} orders)
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button
          type="submit"
          disabled={saving || selected.length === 0 || !shippingCost}
          className="btn-primary flex-1"
        >
          {saving ? 'Dispatching…' : `Dispatch ${selected.length} Order${selected.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </form>
  );
}
