import { useState, useRef } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const CATEGORIES = ['Purse', 'Handbag', 'BridalPurse', 'Jewelry', 'Other'];

export default function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'Handbag',
    description: product?.description || '',
    buyingPrice: product?.buyingPrice || '',
    sellingPrice: product?.sellingPrice || '',
    stockQty: product?.stockQty || '',
    imageUrl: product?.imageUrl || '',
    isUnique: product?.isUnique || false,
  });
  const [variants, setVariants] = useState(product?.variants || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const margin = form.sellingPrice && form.buyingPrice
    ? Math.round(((form.sellingPrice - form.buyingPrice) / form.sellingPrice) * 100)
    : null;

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, imageUrl: res.data.url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  function addVariant() {
    setVariants((v) => [...v, { name: '', stockQty: 0 }]);
  }

  function updateVariant(idx, field, value) {
    setVariants((v) => v.map((variant, i) => i === idx ? { ...variant, [field]: value } : variant));
  }

  function removeVariant(idx) {
    setVariants((v) => v.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.buyingPrice || !form.sellingPrice) {
      toast.error('Name, buying price and selling price are required');
      return;
    }
    setSaving(true);
    try {
      await onSave(
        { ...form, variants: form.isUnique ? [] : variants },
        product?.id
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image */}
      <div>
        <label className="label">Product Photo</label>
        <div className="flex gap-3 items-center">
          <div
            className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="product" className="w-full h-full object-cover" />
            ) : (
              <Upload size={20} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-secondary w-full py-2 text-sm"
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Choose Photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="label" htmlFor="name">Product Name *</label>
        <input id="name" className="input" value={form.name} onChange={set('name')} placeholder="e.g. Golden Bridal Clutch" required />
      </div>

      {/* Category */}
      <div>
        <label className="label" htmlFor="category">Category *</label>
        <select id="category" className="input" value={form.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="buyingPrice">Buying Price (Rs.) *</label>
          <input
            id="buyingPrice" type="number" min="0" className="input"
            value={form.buyingPrice} onChange={set('buyingPrice')} placeholder="0"
          />
        </div>
        <div>
          <label className="label" htmlFor="sellingPrice">Selling Price (Rs.) *</label>
          <input
            id="sellingPrice" type="number" min="0" className="input"
            value={form.sellingPrice} onChange={set('sellingPrice')} placeholder="0"
          />
        </div>
      </div>

      {/* Margin preview */}
      {margin !== null && (
        <p className={`text-sm font-medium ${margin >= 30 ? 'text-green-600' : margin >= 15 ? 'text-yellow-600' : 'text-red-500'}`}>
          Margin: {margin}% {margin < 15 && '— consider raising your price'}
        </p>
      )}

      {/* Stock */}
      <div>
        <label className="label" htmlFor="stockQty">Stock Quantity</label>
        <input
          id="stockQty" type="number" min="0" className="input"
          value={form.stockQty} onChange={set('stockQty')} placeholder="0"
        />
      </div>

      {/* Unique toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="w-5 h-5 rounded accent-brand-600"
          checked={form.isUnique}
          onChange={(e) => setForm((f) => ({ ...f, isUnique: e.target.checked }))}
        />
        <span className="text-sm text-gray-700">This is a unique one-off piece (no variants)</span>
      </label>

      {/* Variants */}
      {!form.isUnique && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="label mb-0">Variants (e.g. colors)</label>
            <button type="button" onClick={addVariant} className="text-brand-600 text-sm font-medium flex items-center gap-1">
              <Plus size={14} /> Add
            </button>
          </div>
          {variants.length === 0 && (
            <p className="text-xs text-gray-400">No variants — add colors or styles if applicable</p>
          )}
          <div className="space-y-2">
            {variants.map((v, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  className="input flex-1 py-2"
                  placeholder="e.g. Red, Gold, Blue"
                  value={v.name}
                  onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                />
                <input
                  className="input w-20 py-2"
                  type="number" min="0"
                  placeholder="Qty"
                  value={v.stockQty}
                  onChange={(e) => updateVariant(idx, 'stockQty', parseInt(e.target.value) || 0)}
                />
                <button type="button" onClick={() => removeVariant(idx)} className="p-2 text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="label" htmlFor="description">Description (optional)</label>
        <textarea
          id="description" rows={2} className="input resize-none"
          value={form.description} onChange={set('description')}
          placeholder="Brief description for WhatsApp messages"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving…' : product ? 'Update' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
