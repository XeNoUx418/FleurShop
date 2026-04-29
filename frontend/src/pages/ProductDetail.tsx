import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Flower2, Check, Loader2, ShoppingCart, X, Minus, Plus } from 'lucide-react';
import { getProducts, addToCart } from '../services/api';
import type { Product } from '../types/shop';

export default function ProductDetail() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty,     setQty]     = useState(1);
  const [adding,  setAdding]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProducts()
      .then((res) => {
        const found = res.data.find((p: Product) => p.id === Number(id));
        if (!found) { navigate('/shop'); return; }
        setProduct(found);
        setLoading(false);
        requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      })
      .catch(() => navigate('/shop'));
  }, [id]);

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => navigate('/shop'), 280);
  };

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap');
        :root {
          --coral:    #ff7e6b;
          --mint:     #d4f0c0;
          --cream:    #fffaf5;
          --charcoal: #1e1e1e;
          --muted:    #9a9490;
          --border:   #ede6de;
        }

        /* Backdrop */
        .pd-backdrop {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(30,20,10,0.30);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          opacity: 0; transition: opacity 0.28s;
        }
        .pd-backdrop.in { opacity: 1; }

        /* Drawer */
        .pd-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 301;
          width: min(520px, 100vw);
          background: #fff;
          border-left: 1.5px solid var(--border);
          display: flex; flex-direction: column;
          overflow-y: auto; overflow-x: hidden;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          font-family: 'Outfit', sans-serif;
          scrollbar-width: none;
          box-shadow: -8px 0 40px rgba(30,20,10,0.10);
        }
        .pd-drawer::-webkit-scrollbar { display: none; }
        .pd-drawer.in { transform: translateX(0); }

        /* Header bar */
        .pd-close {
          position: sticky; top: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 24px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1.5px solid var(--border);
        }
        .pd-breadcrumb {
          font-size: 0.72rem; color: var(--muted); font-weight: 300;
        }
        .pd-breadcrumb a { color: var(--coral); text-decoration: none; }
        .pd-breadcrumb a:hover { text-decoration: underline; }
        .pd-close-btn {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.76rem; color: var(--muted);
          background: none; border: 1.5px solid var(--border);
          cursor: pointer; font-family: 'Outfit', sans-serif;
          font-weight: 500; padding: 6px 12px;
          border-radius: 8px;
          transition: background 0.16s, color 0.16s, border-color 0.16s;
        }
        .pd-close-btn:hover {
          background: #f5f0ea;
          color: var(--charcoal);
          border-color: #d8d0c8;
        }

        /* Image */
        .pd-image-wrap {
          width: 100%; height: 280px;
          background: linear-gradient(135deg, #fff0ea, #fde8f5);
          overflow: hidden; flex-shrink: 0;
        }
        .pd-image {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }
        .pd-image-wrap:hover .pd-image { transform: scale(1.04); }
        .pd-image-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          color: #e0c8d8;
        }

        /* Body */
        .pd-body {
          padding: 28px 28px 44px;
          display: flex; flex-direction: column; gap: 20px;
        }

        .pd-category-tag {
          display: inline-flex; align-items: center; gap: 5px;
          background: var(--mint); color: #3a7d44;
          font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 4px 11px; border-radius: 100px;
          width: fit-content;
        }

        .pd-name {
          font-family: 'Fraunces', serif;
          font-size: 2rem; font-weight: 300; font-style: italic;
          color: var(--charcoal); letter-spacing: -0.02em; line-height: 1.15;
        }
        .pd-desc {
          font-size: 0.88rem; color: var(--muted);
          font-weight: 300; line-height: 1.7;
        }

        /* Price row */
        .pd-price-row { display: flex; align-items: baseline; gap: 6px; }
        .pd-price {
          font-family: 'Fraunces', serif;
          font-size: 1.7rem; font-weight: 500; color: var(--charcoal);
          letter-spacing: -0.02em;
        }
        .pd-price-currency {
          font-family: 'Outfit', sans-serif;
          font-size: 0.78rem; font-weight: 300; color: var(--muted);
        }

        /* Stock */
        .pd-stock {
          font-size: 0.75rem; font-weight: 400;
          padding: 5px 12px; border-radius: 100px;
          border: 1px solid; display: inline-flex;
          align-items: center; gap: 5px; width: fit-content;
        }
        .pd-stock.in-stock  { color: #3a7d44; background: #f0faf0; border-color: #b8e0b8; }
        .pd-stock.low       { color: #b85c00; background: #fff3e0; border-color: #f0cc90; }
        .pd-stock.out       { color: var(--muted); background: #f5f0ea; border-color: var(--border); }
        .pd-stock-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

        /* Quantity selector */
        .pd-qty-section { display: flex; flex-direction: column; gap: 8px; }
        .pd-qty-label {
          font-size: 0.67rem; font-weight: 600; letter-spacing: 0.09em;
          text-transform: uppercase; color: #c0b8b0;
        }
        .pd-qty-row { display: flex; align-items: center; gap: 10px; }
        .pd-qty-btn {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1.5px solid var(--border); background: #fff;
          cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          color: var(--charcoal);
          transition: border-color 0.16s, background 0.16s, color 0.16s;
        }
        .pd-qty-btn:hover:not(:disabled) {
          border-color: var(--charcoal);
          background: #faf6f1;
        }
        .pd-qty-btn:disabled { opacity: 0.30; cursor: not-allowed; }
        .pd-qty-value {
          font-family: 'Fraunces', serif;
          font-size: 1.2rem; font-weight: 400; color: var(--charcoal);
          min-width: 28px; text-align: center;
        }

        /* Add to cart button */
        .pd-add-btn {
          width: 100%; padding: 15px;
          background: var(--charcoal); color: var(--cream);
          border: none; border-radius: 13px;
          font-family: 'Outfit', sans-serif; font-size: 0.92rem;
          font-weight: 600; letter-spacing: 0.04em; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s, transform 0.12s, box-shadow 0.2s;
          position: relative; overflow: hidden;
        }
        .pd-add-btn:hover:not(:disabled) {
          background: #2e2e2e;
          box-shadow: 0 6px 20px rgba(30,30,30,0.2);
          transform: translateY(-1px);
        }
        .pd-add-btn.success { background: #5aad5e; }
        .pd-add-btn:disabled { background: #d8d0c8; color: #b0a89e; cursor: not-allowed; }
        .pd-add-btn::after {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          transition: left 0.45s;
        }
        .pd-add-btn:hover:not(:disabled)::after { left: 160%; }

        /* Loading state */
        .pd-loading {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 14px;
          padding: 60px;
        }
        .pd-spinner {
          width: 32px; height: 32px;
          border: 2.5px solid var(--border);
          border-top-color: var(--coral);
          border-radius: 50%;
          animation: pdspin 0.8s linear infinite;
        }
        @keyframes pdspin { to { transform: rotate(360deg); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        .pd-loading-text {
          font-family: 'Fraunces', serif;
          font-size: 1rem; font-weight: 300; font-style: italic;
          color: var(--muted);
        }
      `}</style>

      {/* Backdrop */}
      <div
        className={`pd-backdrop${visible ? ' in' : ''}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className={`pd-drawer${visible ? ' in' : ''}`}>

        {/* Header */}
        <div className="pd-close">
          <nav className="pd-breadcrumb">
            <Link to="/shop">Shop</Link> / {product?.name ?? '…'}
          </nav>
          <button className="pd-close-btn" onClick={handleClose}>
            <X size={13} strokeWidth={2.5} />
            Close
          </button>
        </div>

        {loading || !product ? (
          <div className="pd-loading">
            <div className="pd-spinner" />
            <p className="pd-loading-text">Loading product…</p>
          </div>
        ) : (
          <>
            {/* Image */}
            <div className="pd-image-wrap">
              {product.image_url
                ? <img src={product.image_url} alt={product.name} className="pd-image" />
                : (
                  <div className="pd-image-placeholder">
                    <Flower2 size={80} strokeWidth={1.2} />
                  </div>
                )
              }
            </div>

            {/* Content */}
            <div className="pd-body">
              <div>
                <span className="pd-category-tag">{product.category_name}</span>
              </div>

              <h1 className="pd-name">{product.name}</h1>

              <p className="pd-desc">
                {product.description || 'A beautiful handpicked flower, freshly arranged for you.'}
              </p>

              <div className="pd-price-row">
                <span className="pd-price">{Number(product.price).toLocaleString()}</span>
                <span className="pd-price-currency">DZD</span>
              </div>

              {/* Stock */}
              {product.stock === 0 ? (
                <span className="pd-stock out">
                  <span className="pd-stock-dot" /> Out of stock
                </span>
              ) : product.stock <= 5 ? (
                <span className="pd-stock low">
                  <span className="pd-stock-dot" /> Only {product.stock} left
                </span>
              ) : (
                <span className="pd-stock in-stock">
                  <span className="pd-stock-dot" /> {product.stock} in stock
                </span>
              )}

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="pd-qty-section">
                  <span className="pd-qty-label">Quantity</span>
                  <div className="pd-qty-row">
                    <button
                      className="pd-qty-btn"
                      disabled={qty <= 1}
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="pd-qty-value">{qty}</span>
                    <button
                      className="pd-qty-btn"
                      disabled={qty >= product.stock}
                      onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                className={`pd-add-btn${success ? ' success' : ''}`}
                onClick={handleAdd}
                disabled={product.stock === 0 || adding}
              >
                {success ? (
                  <><Check size={16} strokeWidth={2.5} /> Added to cart</>
                ) : adding ? (
                  <><Loader2 size={16} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }} /> Adding…</>
                ) : (
                  <><ShoppingCart size={16} strokeWidth={2} /> Add {qty > 1 ? `${qty} ` : ''}to cart</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}