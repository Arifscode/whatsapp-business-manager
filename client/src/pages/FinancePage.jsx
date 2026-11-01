import { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week',  label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all',   label: 'All Time' },
];

const EXPENSE_CATEGORIES = ['Marketing', 'Transport', 'Packaging', 'Supplies', 'Other'];

export default function FinancePage() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', category: 'Other' });
  const [savingExpense, setSavingExpense] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/financials?period=${period}`);
      setData(res.data);
    } catch {
      toast.error('Failed to load financials');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [period]);

  async function handleAddExpense(e) {
    e.preventDefault();
    setSavingExpense(true);
    try {
      await api.post('/expenses', {
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
      });
      toast.success('Expense added');
      setShowAddExpense(false);
      setExpenseForm({ description: '', amount: '', category: 'Other' });
      load();
    } catch {
      toast.error('Failed to add expense');
    } finally {
      setSavingExpense(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Financials" showLogout />

      <div className="px-4 pt-4">
        {/* Period tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === key ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner className="mt-8" />
      ) : data ? (
        <div className="px-4 mt-4 space-y-4 pb-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card">
              <p className="text-xs text-gray-400 mb-1">Revenue</p>
              <p className="text-xl font-bold text-gray-900">Rs. {data.revenue.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">{data.orderCount} orders</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-400 mb-1">Total Cost</p>
              <p className="text-xl font-bold text-gray-900">Rs. {data.costs.total.toLocaleString()}</p>
            </div>
            <div className={`card col-span-2 border-2 ${data.grossProfit >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Gross Profit</p>
                  <p className={`text-2xl font-bold ${data.grossProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    Rs. {data.grossProfit.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Margin</p>
                  <div className="flex items-center gap-1">
                    {data.grossProfit >= 0 ? <TrendingUp size={18} className="text-green-500" /> : <TrendingDown size={18} className="text-red-400" />}
                    <p className={`text-xl font-bold ${data.marginPercent >= 30 ? 'text-green-600' : data.marginPercent >= 15 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {data.marginPercent}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Cost Breakdown</h3>
            {[
              { label: 'Product Cost', value: data.costs.product, color: 'bg-blue-400' },
              { label: 'Packaging',    value: data.costs.packaging, color: 'bg-purple-400' },
              { label: 'Shipping',     value: data.costs.shipping, color: 'bg-orange-400' },
              { label: 'Other Expenses', value: data.costs.other, color: 'bg-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3 mb-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                <span className="text-sm text-gray-600 flex-1">{label}</span>
                <span className="text-sm font-medium text-gray-800">Rs. {value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Top products */}
          {data.topProducts.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Products by Profit</h3>
              <div className="space-y-2">
                {data.topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{p.name}</span>
                    <span className="text-sm font-medium text-green-600">Rs. {p.profit.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Expenses</h3>
              <button onClick={() => setShowAddExpense(true)} className="flex items-center gap-1 text-brand-600 text-sm font-medium">
                <Plus size={15} /> Add
              </button>
            </div>
            {data.expenses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No expenses logged</p>
            ) : (
              <div className="space-y-2">
                {data.expenses.map((exp) => (
                  <div key={exp.id} className="card py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{exp.description}</p>
                        <p className="text-xs text-gray-400">
                          {exp.category} · {new Date(exp.expenseDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-red-500 flex-shrink-0 ml-2">Rs. {exp.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <Modal title="Add Expense" onClose={() => setShowAddExpense(false)}>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="label">Description</label>
              <input
                className="input"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Bought packaging bags"
                required
              />
            </div>
            <div>
              <label className="label">Amount (Rs.)</label>
              <input
                className="input"
                type="number" min="0"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))}
              >
                {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAddExpense(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={savingExpense} className="btn-primary flex-1">
                {savingExpense ? 'Adding…' : 'Add Expense'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
