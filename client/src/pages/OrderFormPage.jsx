import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function OrderFormPage() {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    itemDesc: '',
    quantity: 1,
    deliveryAddress: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/orders/public`, form);
      setSubmittedName(form.customerName);
      setSubmittedPhone(form.customerPhone);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-green-800 mb-2">Order Received!</h1>
        <p className="text-green-700 text-base mb-4 max-w-xs">
          Thank you <strong>{submittedName}</strong>! We'll contact you on{' '}
          <strong>{submittedPhone}</strong> to confirm your order.
        </p>
        <p className="text-sm text-green-600">You can close this page now.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white px-4 py-6 text-center">
        <div className="text-4xl mb-2">👜</div>
        <h1 className="text-xl font-bold">Place Your Order</h1>
        <p className="text-brand-100 text-sm mt-1">Fill in your details and we'll confirm via WhatsApp</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>
        )}

        <div>
          <label className="label" htmlFor="name">Your Name *</label>
          <input
            id="name"
            className="input"
            value={form.customerName}
            onChange={set('customerName')}
            placeholder="Full name"
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label className="label" htmlFor="phone">Phone Number *</label>
          <input
            id="phone"
            className="input"
            type="tel"
            value={form.customerPhone}
            onChange={set('customerPhone')}
            placeholder="03XX XXXXXXX"
            required
            autoComplete="tel"
          />
        </div>

        <div>
          <label className="label" htmlFor="item">What would you like to order? *</label>
          <input
            id="item"
            className="input"
            value={form.itemDesc}
            onChange={set('itemDesc')}
            placeholder="e.g. Golden Bridal Clutch, Brown Handbag"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="qty">Quantity *</label>
          <input
            id="qty"
            className="input"
            type="number"
            min="1"
            value={form.quantity}
            onChange={set('quantity')}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="address">Delivery Address *</label>
          <textarea
            id="address"
            className="input resize-none"
            rows={3}
            value={form.deliveryAddress}
            onChange={set('deliveryAddress')}
            placeholder="House/flat number, street, area, city"
            required
            autoComplete="street-address"
          />
        </div>

        <div>
          <label className="label" htmlFor="notes">Additional Notes (optional)</label>
          <input
            id="notes"
            className="input"
            value={form.notes}
            onChange={set('notes')}
            placeholder="Any special instructions or requests"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
          {loading ? 'Placing Order…' : '🛍️ Place Order'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          We'll confirm your order via WhatsApp and arrange delivery. COD available.
        </p>
      </form>
    </div>
  );
}
