import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function PackagingPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [restockMaterial, setRestockMaterial] = useState(null);
  const [form, setForm] = useState({ name: '', qtyPurchased: '', totalCost: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await api.get('/packaging');
      setMaterials(res.data);
    } catch {
      toast.error('Failed to load packaging');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/packaging', {
        name: form.name,
        qtyPurchased: parseInt(form.qtyPurchased),
        totalCost: parseFloat(form.totalCost),
      });
      toast.success('Packaging material added');
      setShowAdd(false);
      setForm({ name: '', qtyPurchased: '', totalCost: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add');
    } finally {
      setSaving(false);
    }
  }

  async function handleRestock(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/packaging/${restockMaterial.id}/stock`, {
        qtyPurchased: parseInt(form.qtyPurchased),
        totalCost: parseFloat(form.totalCost),
      });
      toast.success('Stock updated');
      setRestockMaterial(null);
      setForm({ name: '', qtyPurchased: '', totalCost: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to restock');
    } finally {
      setSaving(false);
    }
  }

  const preview =
    form.qtyPurchased && form.totalCost
      ? (parseFloat(form.totalCost) / parseInt(form.qtyPurchased)).toFixed(2)
      : null;

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Packaging" showLogout />

      <div className="px-4 pt-4">
        <button onClick={() => setShowAdd(true)} className="btn-primary w-full">
          <Plus size={18} /> Add Packaging Material
        </button>
      </div>

      <div className="px-4 mt-4">
        {loading ? (
          <Spinner className="mt-8" />
        ) : materials.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No packaging materials"
            description="Add bags, boxes, or bubble wrap to track costs"
          />
        ) : (
          <div className="space-y-3 pb-4">
            {materials.map((m) => (
              <div key={m.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{m.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Rs. {m.perUnitCost.toFixed(2)} per unit
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${m.currentStock < 10 ? 'text-red-500' : 'text-gray-900'}`}>
                      {m.currentStock}
                    </p>
                    <p className="text-xs text-gray-400">in stock {m.currentStock < 10 && '⚠️'}</p>
                  </div>
                </div>

                {/* Recent purchases */}
                {m.purchases && m.purchases.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1.5">Recent purchases</p>
                    {m.purchases.slice(0, 2).map((p) => (
                      <div key={p.id} className="flex justify-between text-xs text-gray-500">
                        <span>{new Date(p.purchasedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</span>
                        <span>{p.qtyPurchased} units @ Rs. {p.perUnitCost.toFixed(2)} each</span>
                        <span>Rs. {p.totalCost.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => { setRestockMaterial(m); setForm({ name: '', qtyPurchased: '', totalCost: '' }); }}
                  className="btn-secondary w-full mt-3 py-2 text-sm"
                >
                  <RefreshCw size={15} /> Restock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add Packaging Material" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="label">Material Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Small Gift Bag" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Qty Purchased</label>
                <input className="input" type="number" min="1" value={form.qtyPurchased} onChange={(e) => setForm((f) => ({ ...f, qtyPurchased: e.target.value }))} placeholder="e.g. 500" required />
              </div>
              <div>
                <label className="label">Total Cost (Rs.)</label>
                <input className="input" type="number" min="0" value={form.totalCost} onChange={(e) => setForm((f) => ({ ...f, totalCost: e.target.value }))} placeholder="e.g. 2000" required />
              </div>
            </div>
            {preview && <p className="text-sm text-brand-600 font-medium">Rs. {preview} per unit</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Adding…' : 'Add Material'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Restock Modal */}
      {restockMaterial && (
        <Modal title={`Restock: ${restockMaterial.name}`} onClose={() => setRestockMaterial(null)}>
          <form onSubmit={handleRestock} className="space-y-4">
            <p className="text-sm text-gray-500">Current stock: {restockMaterial.currentStock} units @ Rs. {restockMaterial.perUnitCost.toFixed(2)}/unit</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Qty Purchased</label>
                <input className="input" type="number" min="1" value={form.qtyPurchased} onChange={(e) => setForm((f) => ({ ...f, qtyPurchased: e.target.value }))} placeholder="e.g. 200" required />
              </div>
              <div>
                <label className="label">Total Cost (Rs.)</label>
                <input className="input" type="number" min="0" value={form.totalCost} onChange={(e) => setForm((f) => ({ ...f, totalCost: e.target.value }))} placeholder="e.g. 800" required />
              </div>
            </div>
            {preview && <p className="text-sm text-brand-600 font-medium">Rs. {preview} per unit (new batch) — cost will be blended</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setRestockMaterial(null)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Add Stock'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
