import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Flower2, Leaf, Clock, ShoppingCart, Bookmark, Trash2, ArrowRight, RotateCcw,
} from 'lucide-react';
import { getCart, removeFromCart, toggleSaveForLater } from '../services/api';
import type { Cart, CartItem } from '../types/shop';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart,    setCart]    = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await getCart();
      setCart(res.data);
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async (item_id: number) => {
    await removeFromCart(item_id);
    fetchCart();
  };

  const handleToggleSave = async (item_id: number) => {
    await toggleSaveForLater(item_id);
    fetchCart();
  };

  const activeItems = cart?.active_items ?? [];
  const savedItems  = cart?.saved_items  ?? [];

  return (
    <>
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

        .cart-page {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Outfit', sans-serif;
        }
        .cart-main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 32px 80px;
        }

        /* ── Page header ── */
        .cart-page-header { margin-bottom: 36px; }
        .cart-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--mint);
          color: #3a7d44;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 11px;
          border-radius: 100px;
          margin-bottom: 10px;
        }
        .cart-title {
          font-family: 'Fraunces', serif;
          font-size: 2.4rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .cart-title strong { font-style: normal; font-weight: 500; color: var(--coral); }

        /* ── Loading ── */
        .cart-loading {
          text-align: center;
          padding: 100px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .cart-spinner {
          display: inline-block;
          width: 34px; height: 34px;
          border: 2.5px solid var(--border);
          border-top-color: var(--coral);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cart-loading-text {
          font-family: 'Fraunces', serif;
          font-size: 1.1rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
        }

        /* ── Empty ── */
        .cart-empty {
          text-align: center;
          padding: 90px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .cart-empty-icon {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: #f5f0ea;
          display: flex; align-items: center; justify-content: center;
          color: #d8d0c8;
          margin-bottom: 8px;
        }
        .cart-empty-title {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
        }
        .cart-empty-sub {
          font-size: 0.83rem;
          color: var(--muted);
          font-weight: 300;
          margin-bottom: 14px;
        }
        .cart-empty-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 24px;
          background: var(--charcoal);
          color: var(--cream);
          border-radius: 11px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-decoration: none;
          transition: background 0.2s, transform 0.12s;
        }
        .cart-empty-link:hover {
          background: #2e2e2e;
          transform: translateY(-1px);
        }

        /* ── Layout ── */
        .cart-layout {
          display: flex;
          gap: 28px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        /* ── Items column ── */
        .cart-items-col {
          flex: 2;
          min-width: 300px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cart-item-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          gap: 16px;
          align-items: center;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cart-item-card:hover {
          border-color: #e0d8d0;
          box-shadow: 0 4px 18px rgba(30,20,10,0.07);
        }

        .cart-item-thumb {
          width: 54px; height: 54px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fff0ea, #fde8f5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ddc8d8;
          flex-shrink: 0;
          overflow: hidden;
        }
        .cart-item-thumb img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-name {
          font-family: 'Fraunces', serif;
          font-size: 1rem;
          font-weight: 400;
          font-style: italic;
          color: var(--charcoal);
          margin-bottom: 3px;
          letter-spacing: -0.01em;
        }
        .cart-item-price {
          font-size: 0.78rem;
          color: var(--muted);
          font-weight: 300;
        }
        .cart-item-expiry {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 5px;
          font-size: 0.68rem;
          color: #c0b8b0;
          font-weight: 300;
          background: #fdf8f2;
          border: 1px solid var(--border);
          padding: 2px 8px;
          border-radius: 100px;
        }

        .cart-item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 7px;
          flex-shrink: 0;
        }
        .cart-item-subtotal {
          font-family: 'Fraunces', serif;
          font-size: 1.05rem;
          font-weight: 500;
          color: var(--charcoal);
          letter-spacing: -0.01em;
        }
        .cart-item-subtotal span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.7rem;
          font-weight: 300;
          color: var(--muted);
          margin-left: 2px;
        }

        .cart-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px;
          border-radius: 8px;
          border: 1.5px solid var(--border);
          background: transparent;
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          letter-spacing: 0.01em;
        }
        .btn-save {
          color: var(--muted);
        }
        .btn-save:hover {
          border-color: var(--charcoal);
          color: var(--charcoal);
          background: #faf6f1;
        }
        .btn-remove {
          color: #c09090;
          border-color: #f0e0de;
        }
        .btn-remove:hover {
          border-color: var(--coral);
          color: var(--coral);
          background: #fff5f3;
        }

        /* ── Summary column ── */
        .cart-summary-col {
          flex: 1;
          min-width: 270px;
        }
        .cart-summary-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 18px;
          padding: 24px;
          position: sticky;
          top: 80px;
        }
        .cart-summary-title {
          font-family: 'Fraunces', serif;
          font-size: 1.1rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.01em;
          margin-bottom: 18px;
        }
        .cart-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.83rem;
          color: var(--muted);
          font-weight: 300;
          margin-bottom: 10px;
        }
        .cart-summary-divider {
          border: none;
          border-top: 1.5px solid var(--border);
          margin: 16px 0;
        }
        .cart-summary-total {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 20px;
        }
        .cart-total-label {
          font-size: 0.83rem;
          font-weight: 600;
          color: var(--charcoal);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .cart-total-value {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--charcoal);
          letter-spacing: -0.02em;
        }
        .cart-total-value span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 300;
          color: var(--muted);
          margin-left: 3px;
        }
        .cart-checkout-btn {
          width: 100%;
          padding: 13px;
          background: var(--charcoal);
          color: var(--cream);
          border: none;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.12s, box-shadow 0.2s;
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
        }
        .cart-checkout-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          transition: left 0.45s;
        }
        .cart-checkout-btn:hover::after { left: 160%; }
        .cart-checkout-btn:hover {
          background: #2e2e2e;
          box-shadow: 0 6px 20px rgba(30,30,30,0.2);
          transform: translateY(-1px);
        }
        .cart-continue-link {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.78rem;
          color: var(--muted);
          text-decoration: none;
          font-weight: 300;
          transition: color 0.18s;
        }
        .cart-continue-link:hover { color: var(--coral); }

        /* ── Saved for later ── */
        .saved-section { margin-top: 52px; }
        .saved-header {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 16px;
        }
        .saved-title {
          font-family: 'Fraunces', serif;
          font-size: 1.3rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.01em;
        }
        .saved-count {
          font-size: 0.72rem;
          color: var(--muted);
          font-weight: 300;
          background: #f5f0ea;
          padding: 3px 9px;
          border-radius: 100px;
          border: 1px solid var(--border);
        }
        .saved-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .saved-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 14px;
          padding: 15px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          opacity: 0.88;
          transition: opacity 0.2s, border-color 0.2s;
        }
        .saved-card:hover { opacity: 1; border-color: #e0d8d0; }
        .saved-thumb {
          width: 44px; height: 44px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f5f0ea, #ede6de);
          display: flex; align-items: center; justify-content: center;
          color: #d0c8c0;
          flex-shrink: 0;
          overflow: hidden;
        }
        .saved-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .saved-info { flex: 1; min-width: 0; }
        .saved-name {
          font-family: 'Fraunces', serif;
          font-size: 0.95rem;
          font-weight: 400;
          font-style: italic;
          color: var(--charcoal);
          margin-bottom: 2px;
        }
        .saved-price {
          font-size: 0.76rem;
          color: var(--muted);
          font-weight: 300;
        }
        .saved-actions { display: flex; gap: 7px; }
        .btn-move {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 13px;
          background: var(--charcoal);
          color: var(--cream);
          border: none;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.18s;
          letter-spacing: 0.02em;
        }
        .btn-move:hover { background: #2e2e2e; }

        @media (max-width: 680px) {
          .cart-main { padding: 28px 16px 60px; }
          .cart-layout { flex-direction: column; }
          .cart-title { font-size: 1.9rem; }
        }
      `}</style>

      <div className="cart-page">
        {loading ? (
          <div className="cart-loading">
            <div className="cart-spinner" />
            <p className="cart-loading-text">Fetching your blooms…</p>
          </div>
        ) : (
          <main className="cart-main">

            <div className="cart-page-header">
              <div className="cart-eyebrow">Your bag</div>
              <h1 className="cart-title">
                {activeItems.length === 0
                  ? <>Your cart is <strong>empty</strong></>
                  : <>{activeItems.length} {activeItems.length === 1 ? 'bloom' : 'blooms'} <strong>waiting</strong></>
                }
              </h1>
            </div>

            {activeItems.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">
                  <ShoppingCart size={28} strokeWidth={1.4} />
                </div>
                <p className="cart-empty-title">Nothing here yet</p>
                <p className="cart-empty-sub">Browse our spring collection and add something beautiful.</p>
                <Link to="/shop" className="cart-empty-link">
                  <Leaf size={15} strokeWidth={2} />
                  Shop the collection
                </Link>
              </div>
            ) : (
              <div className="cart-layout">

                {/* Items */}
                <div className="cart-items-col">
                  {activeItems.map((item: CartItem) => (
                    <div key={item.id} className="cart-item-card">
                      <div className="cart-item-thumb">
                        <Flower2 size={26} strokeWidth={1.4} />
                      </div>

                      <div className="cart-item-info">
                        <p className="cart-item-name">{item.product_name}</p>
                        <p className="cart-item-price">
                          {Number(item.product_price).toLocaleString()} DZD × {item.quantity}
                        </p>
                        <span className="cart-item-expiry">
                          <Clock size={10} strokeWidth={2} />
                          Reserved for 24h
                        </span>
                      </div>

                      <div className="cart-item-actions">
                        <p className="cart-item-subtotal">
                          {Number(item.subtotal).toLocaleString()}
                          <span>DZD</span>
                        </p>
                        <button
                          className="cart-action-btn btn-save"
                          onClick={() => handleToggleSave(item.id)}
                        >
                          <Bookmark size={11} strokeWidth={2} />
                          Save for later
                        </button>
                        <button
                          className="cart-action-btn btn-remove"
                          onClick={() => handleRemove(item.id)}
                        >
                          <Trash2 size={11} strokeWidth={2} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="cart-summary-col">
                  <div className="cart-summary-card">
                    <p className="cart-summary-title">Order summary</p>

                    <div className="cart-summary-row">
                      <span>Items ({activeItems.length})</span>
                      <span>{Number(cart?.cart_total).toLocaleString()} DZD</span>
                    </div>
                    <div className="cart-summary-row">
                      <span>Delivery</span>
                      <span style={{ color: '#5aad5e', fontWeight: 500 }}>Free</span>
                    </div>

                    <hr className="cart-summary-divider" />

                    <div className="cart-summary-total">
                      <span className="cart-total-label">Total</span>
                      <span className="cart-total-value">
                        {Number(cart?.cart_total).toLocaleString()}
                        <span>DZD</span>
                      </span>
                    </div>

                    <button
                      className="cart-checkout-btn"
                      onClick={() => navigate('/checkout')}
                    >
                      Proceed to checkout
                      <ArrowRight size={15} strokeWidth={2.5} />
                    </button>

                    <Link to="/shop" className="cart-continue-link">
                      ← Continue shopping
                    </Link>
                  </div>
                </div>

              </div>
            )}

            {/* Saved for later */}
            {savedItems.length > 0 && (
              <div className="saved-section">
                <div className="saved-header">
                  <h2 className="saved-title">Saved for later</h2>
                  <span className="saved-count">{savedItems.length}</span>
                </div>
                <div className="saved-grid">
                  {savedItems.map((item: CartItem) => (
                    <div key={item.id} className="saved-card">
                      <div className="saved-thumb">
                        <Flower2 size={20} strokeWidth={1.4} />
                      </div>
                      <div className="saved-info">
                        <p className="saved-name">{item.product_name}</p>
                        <p className="saved-price">{Number(item.product_price).toLocaleString()} DZD</p>
                      </div>
                      <div className="saved-actions">
                        <button className="btn-move" onClick={() => handleToggleSave(item.id)}>
                          <RotateCcw size={11} strokeWidth={2.5} />
                          Move to cart
                        </button>
                        <button className="cart-action-btn btn-remove" onClick={() => handleRemove(item.id)}>
                          <Trash2 size={11} strokeWidth={2} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        )}
      </div>
    </>
  );
}