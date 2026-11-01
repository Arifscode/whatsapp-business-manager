import { useEffect, useState } from 'react';
import { Plus, Search, Share2, Edit2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PageHeader from '../components/PageHeader';
import MarginBadge from '../components/MarginBadge';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import ShareSheet from '../components/ShareSheet';

const CATEGORIES = ['All', 'Purse', 'Handbag', 'BridalPurse', 'Jewelry', 'Other'];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [shareProduct, setShareProduct] = useState(null);

  async function loadProducts() {
    try {
      const res = await api.get('/products');
      setProducts(res.data.filter((p) => p.isActive));
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  const filtered = products.filter((p) => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  async function handleSave(data, id) {
    try {
      if (id) {
        await api.put(`/products/${id}`, data);
        toast.success('Product updated');
      } else {
        await api.post('/products', data);
        toast.success('Product added');
      }
      setShowAddModal(false);
      setEditProduct(null);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    }
  }

  async function handleDeactivate(id) {
    if (!confirm('Remove this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product removed');
      loadProducts();
    } catch {
      toast.error('Failed to remove');
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Products" showLogout />

      <div className="px-4 pt-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary w-full"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="px-4 mt-4">
        {loading ? (
          <Spinner className="mt-8" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No products yet"
            description="Add your first product to get started"
          />
        ) : (
          <div className="space-y-3 pb-4">
            {filtered.map((product) => (
              <div key={product.id} className="card">
                <div className="flex gap-3">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">👜</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                      </div>
                      <MarginBadge percent={product.marginPercent} />
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <div>
                        <p className="text-xs text-gray-400">Sell</p>
                        <p className="text-sm font-bold text-gray-900">Rs. {product.sellingPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Buy</p>
                        <p className="text-sm text-gray-600">Rs. {product.buyingPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Stock</p>
                        <p className={`text-sm font-medium ${product.stockQty <= 3 ? 'text-red-500' : 'text-gray-700'}`}>
                          {product.stockQty} {product.stockQty <= 3 && '⚠️'}
                        </p>
                      </div>
                    </div>

                    {/* Variants */}
                    {product.variants.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.variants.map((v) => (
                          <span key={v.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {v.name} ({v.stockQty})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setShareProduct(product)}
                    className="btn-primary flex-1 py-2 text-sm"
                  >
                    <Share2 size={15} /> Share
                  </button>
                  <button
                    onClick={() => setEditProduct(product)}
                    className="btn-secondary flex-1 py-2 text-sm"
                  >
                    <Edit2 size={15} /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editProduct) && (
        <Modal
          title={editProduct ? 'Edit Product' : 'Add Product'}
          onClose={() => { setShowAddModal(false); setEditProduct(null); }}
          size="lg"
        >
          <ProductForm
            product={editProduct}
            onSave={handleSave}
            onCancel={() => { setShowAddModal(false); setEditProduct(null); }}
          />
        </Modal>
      )}

      {/* Share Sheet */}
      {shareProduct && (
        <Modal title="Share Product" onClose={() => setShareProduct(null)}>
          <ShareSheet product={shareProduct} onClose={() => setShareProduct(null)} />
        </Modal>
      )}
    </div>
  );
}
