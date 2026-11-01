import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, TrendingUp, AlertTriangle, Plus, LogOut } from 'lucide-react';
import api from '../lib/api';
import Spinner from '../components/Spinner';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, productsRes, financialsRes, packagingRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products'),
          api.get('/financials?period=today'),
          api.get('/packaging'),
        ]);

        const orders = ordersRes.data;
        const products = productsRes.data;
        const financials = financialsRes.data;
        const packaging = packagingRes.data;

        setStats({
          pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
          todayOrders: orders.filter((o) => {
            const today = new Date().toDateString();
            return new Date(o.createdAt).toDateString() === today;
          }).length,
          lowStockProducts: products.filter((p) => p.stockQty <= 3 && p.isActive).length,
          lowPackaging: packaging.filter((p) => p.currentStock < 10).length,
          todayRevenue: financials.revenue,
          todayProfit: financials.grossProfit,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleLogout() {
    if (confirm('Log out?')) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }

  if (loading) return <Spinner className="mt-20" />;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-600 to-brand-500 text-white px-4 pt-6 pb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">👜 Business Manager</h1>
            <p className="text-brand-100 text-sm mt-0.5">
              {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button onClick={handleLogout} className="p-2 text-brand-200">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="px-4 -mt-4">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Today's Orders</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.todayOrders ?? 0}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Pending</p>
            <p className={`text-3xl font-bold ${stats?.pendingOrders > 0 ? 'text-yellow-500' : 'text-gray-900'}`}>
              {stats?.pendingOrders ?? 0}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Today Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              Rs. {(stats?.todayRevenue ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Today Profit</p>
            <p className={`text-2xl font-bold ${(stats?.todayProfit ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              Rs. {(stats?.todayProfit ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {(stats?.lowStockProducts > 0 || stats?.lowPackaging > 0) && (
          <div className="mb-6 space-y-2">
            {stats.lowStockProducts > 0 && (
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
                <AlertTriangle size={18} className="text-orange-500 flex-shrink-0" />
                <p className="text-sm text-orange-700">
                  <span className="font-semibold">{stats.lowStockProducts} product(s)</span> running low on stock
                </p>
              </div>
            )}
            {stats.lowPackaging > 0 && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  <span className="font-semibold">{stats.lowPackaging} packaging material(s)</span> running low
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="card flex flex-col items-center gap-2 py-5 active:bg-gray-50 transition-colors"
          >
            <ShoppingBag size={28} className="text-brand-500" />
            <span className="text-sm font-medium text-gray-700">View Orders</span>
          </button>
          <button
            onClick={() => navigate('/products')}
            className="card flex flex-col items-center gap-2 py-5 active:bg-gray-50 transition-colors"
          >
            <Package size={28} className="text-brand-500" />
            <span className="text-sm font-medium text-gray-700">Add Product</span>
          </button>
          <button
            onClick={() => navigate('/finance')}
            className="card flex flex-col items-center gap-2 py-5 active:bg-gray-50 transition-colors"
          >
            <TrendingUp size={28} className="text-brand-500" />
            <span className="text-sm font-medium text-gray-700">Financials</span>
          </button>
          <button
            onClick={() => navigate('/orders?add=1')}
            className="card flex flex-col items-center gap-2 py-5 active:bg-gray-50 transition-colors"
          >
            <Plus size={28} className="text-brand-500" />
            <span className="text-sm font-medium text-gray-700">New Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
