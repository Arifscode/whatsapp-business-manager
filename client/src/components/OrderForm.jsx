import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function OrderForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    notes: '',
    internalNotes: '',
  });
  const [items, setItems] = useState([{ itemDesc: '', quantity: 1 }]);
  const [saving, setSaving] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function updateItem(idx, field, value) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  function addItem() {
    setItems((prev) => [...prev, { itemDesc: '', quantity: 1 }]);
  }

  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.deliveryAddress) return;
    if (items.some((i) => !i.itemDesc)) {
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...form, items });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Customer Name *</label>
        <input className="input" value={form.customerName} onChange={set('customerName')} placeholder="Full name" required />
      </div>
      <div>
        <label className="label">Phone Number *</label>
        <input className="input" type="tel" value={form.customerPhone} onChange={set('customerPhone')} placeholder="03XX XXXXXXX" required />
      </div>
      <div>
        <label className="label">Delivery Address *</label>
        <textarea className="input resize-none" rows={2} value={form.deliveryAddress} onChange={set('deliveryAddress')} placeholder="Full delivery address" required />
      </div>

      {/* Items */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="label mb-0">Items *</label>
          <button type="button" onClick={addItem} className="text-brand-600 text-sm font-medium flex items-center gap-1">
            <Plus size={14} /> Add Item
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                className="input flex-1 py-2"
                placeholder="Item description"
                value={item.itemDesc}
                onChange={(e) => updateItem(idx, 'itemDesc', e.target.value)}
                required
              />
              <input
                className="input w-16 py-2"
                type="number" min="1"
                value={item.quantity}
                onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
              />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-400">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Customer Notes</label>
        <input className="input" value={form.notes} onChange={set('notes')} placeholder="Special instructions from customer" />
      </div>
      <div>
        <label className="label">Internal Notes</label>
        <input className="input" value={form.internalNotes} onChange={set('internalNotes')} placeholder="Your private notes (not shown to customer)" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving…' : 'Add Order'}
        </button>
      </div>
    </form>
  );
}
