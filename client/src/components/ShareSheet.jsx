import { Copy, MessageCircle, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ShareSheet({ product, onClose }) {
  const [copied, setCopied] = useState(false);
  const orderFormUrl = import.meta.env.VITE_ORDER_FORM_URL || `${window.location.origin}/order`;

  const message = `✨ *${product.name}*
📦 Category: ${product.category}
💰 Price: Rs. ${product.sellingPrice.toLocaleString()}
🛍️ Available: ${product.stockQty} pcs${product.variants.length > 0 ? `\n🎨 Colors: ${product.variants.map(v => v.name).join(', ')}` : ''}${product.description ? `\n\n${product.description}` : ''}

To order, click here 👇
${orderFormUrl}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success('Message copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — please copy manually');
    }
  }

  function handleWhatsApp() {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }

  return (
    <div className="space-y-4">
      {/* Product image */}
      {product.imageUrl && (
        <div className="rounded-xl overflow-hidden">
          <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
          <p className="text-xs text-gray-400 text-center mt-1">Long-press image to save and forward separately</p>
        </div>
      )}

      {/* Message preview */}
      <div>
        <label className="label">WhatsApp Message</label>
        <pre className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
          {message}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button onClick={handleCopy} className="btn-secondary w-full">
          {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          {copied ? 'Copied!' : 'Copy Message'}
        </button>
        <button onClick={handleWhatsApp} className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-medium px-4 py-3 rounded-xl active:bg-[#1da851] transition-colors">
          <MessageCircle size={18} />
          Open in WhatsApp
        </button>
      </div>
    </div>
  );
}
