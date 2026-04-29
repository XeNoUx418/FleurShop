import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Package, Check, Clock, XCircle,
  Flower2, CreditCard, ChevronRight, ArrowLeft,
} from 'lucide-react';
import { getOrders, getOrderById } from '../services/api';
import type { Order } from '../types/shop';

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}> = {
  pending: {
    label: 'Pending',
    color: '#b85c00',
    bg: '#fff3e0',
    border: '#f0cc90',
    icon: <Clock size={12} strokeWidth={2} />,
  },
  preparing: {
    label: 'Preparing',
    color: '#1560a8',
    bg: '#e8f4ff',
    border: '#90c0f0',
    icon: <Package size={12} strokeWidth={2} />,
  },
  delivered: {
    label: 'Delivered',
    color: '#2a7a32',
    bg: '#eaf5ea',
    border: '#90d090',
    icon: <Check size={12} strokeWidth={2.5} />,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#b82030',
    bg: '#fce8ea',
    border: '#f0a0a8',
    icon: <XCircle size={12} strokeWidth={2} />,
  },
};

function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'lg' }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: size === 'lg' ? '7px 16px' : '4px 10px',
      borderRadius: 100,
      fontSize: size === 'lg' ? '0.82rem' : '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
    }}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── Order List ────────────────────────────────────────────────
export function OrderList() {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, []);

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
        .ord-page {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Outfit', sans-serif;
        }
        .ord-main {
          max-width: 860px;
          margin: 0 auto;
          padding: 40px 32px 80px;
        }
        .ord-page-header { margin-bottom: 32px; }
        .ord-eyebrow {
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
        .ord-title {
          font-family: 'Fraunces', serif;
          font-size: 2.4rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .ord-title strong { font-style: normal; font-weight: 500; color: var(--coral); }
        .ord-loading {
          text-align: center;
          padding: 80px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .ord-spinner {
          width: 34px; height: 34px;
          border: 2.5px solid var(--border);
          border-top-color: var(--coral);
          border-radius: 50%;
          animation: ospin 0.8s linear infinite;
        }
        @keyframes ospin { to { transform: rotate(360deg); } }
        .ord-loading-text {
          font-family: 'Fraunces', serif;
          font-size: 1rem;
          font-weight: 300;
          font-style: italic;
          color: var(--muted);
        }
        .ord-empty {
          text-align: center;
          padding: 80px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .ord-empty-icon {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: #f5f0ea;
          display: flex; align-items: center; justify-content: center;
          color: #d0c8c0;
          margin-bottom: 8px;
        }
        .ord-empty-title {
          font-family: 'Fraunces', serif;
          font-size: 1.3rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
        }
        .ord-empty-sub {
          font-size: 0.82rem;
          color: var(--muted);
          font-weight: 300;
          margin-bottom: 8px;
        }
        .ord-shop-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 22px;
          background: var(--charcoal);
          color: var(--cream);
          border-radius: 11px;
          font-size: 0.84rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s, transform 0.12s;
        }
        .ord-shop-link:hover { background: #2e2e2e; transform: translateY(-1px); }

        /* ── Order list ── */
        .ord-list { display: flex; flex-direction: column; gap: 12px; }
        .ord-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.14s;
          text-decoration: none;
        }
        .ord-card:hover {
          border-color: #e0d8d0;
          box-shadow: 0 4px 18px rgba(30,20,10,0.07);
          transform: translateY(-1px);
        }
        .ord-card-icon {
          width: 44px; height: 44px;
          border-radius: 11px;
          background: #f5f0ea;
          display: flex; align-items: center; justify-content: center;
          color: #c0b0a8;
          flex-shrink: 0;
        }
        .ord-card-left { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .ord-card-id {
          font-family: 'Fraunces', serif;
          font-size: 0.96rem;
          font-weight: 400;
          font-style: italic;
          color: var(--charcoal);
        }
        .ord-card-meta {
          font-size: 0.74rem;
          color: var(--muted);
          font-weight: 300;
        }
        .ord-card-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        .ord-card-total {
          font-family: 'Fraunces', serif;
          font-size: 1rem;
          font-weight: 500;
          color: var(--charcoal);
          letter-spacing: -0.01em;
        }
        .ord-card-total span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem;
          font-weight: 300;
          color: var(--muted);
          margin-left: 2px;
        }
        .ord-card-caret {
          color: #d0c8c0;
          flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .ord-main { padding: 28px 16px 60px; }
        }
      `}</style>

      <div className="ord-page">
        <main className="ord-main">
          <div className="ord-page-header">
            <div className="ord-eyebrow">
              <Package size={10} strokeWidth={2.5} />
              Your history
            </div>
            <h1 className="ord-title">My <strong>orders</strong></h1>
          </div>

          {loading ? (
            <div className="ord-loading">
              <div className="ord-spinner" />
              <p className="ord-loading-text">Loading your orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="ord-empty">
              <div className="ord-empty-icon">
                <Package size={26} strokeWidth={1.4} />
              </div>
              <p className="ord-empty-title">No orders yet</p>
              <p className="ord-empty-sub">Browse our collection and place your first order.</p>
              <Link to="/shop" className="ord-shop-link">Start shopping</Link>
            </div>
          ) : (
            <div className="ord-list">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="ord-card"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="ord-card-icon">
                    <Package size={20} strokeWidth={1.6} />
                  </div>
                  <div className="ord-card-left">
                    <span className="ord-card-id">Order #{order.id}</span>
                    <span className="ord-card-meta">
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                      {' · '}{order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="ord-card-right">
                    <span className="ord-card-total">
                      {Number(order.final_total).toLocaleString()}
                      <span>DZD</span>
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <ChevronRight size={16} strokeWidth={1.8} className="ord-card-caret" />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// ── Order Detail ──────────────────────────────────────────────
export function OrderDetail() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getOrderById(Number(id))
      .then((res) => setOrder(res.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !order) return (
    <div style={{ minHeight: '100vh', background: '#fffaf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 34, height: 34, border: '2.5px solid #ede6de', borderTopColor: '#ff7e6b', borderRadius: '50%', animation: 'ospin 0.8s linear infinite' }} />
        <p style={{ fontFamily: 'Fraunces, serif', fontSize: '1rem', fontWeight: 300, fontStyle: 'italic', color: '#9a9490' }}>Loading order…</p>
      </div>
    </div>
  );

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
        @keyframes ospin { to { transform: rotate(360deg); } }
        .det-page { min-height: 100vh; background: var(--cream); font-family: 'Outfit', sans-serif; }
        .det-main { max-width: 1000px; margin: 0 auto; padding: 40px 32px 80px; }
        .det-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 14px;
        }
        .det-title {
          font-family: 'Fraunces', serif;
          font-size: 2rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .det-date {
          font-size: 0.78rem;
          color: var(--muted);
          font-weight: 300;
        }
        .det-layout {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .det-left {
          flex: 2; min-width: 300px;
          display: flex; flex-direction: column; gap: 18px;
        }
        .det-right { flex: 1; min-width: 260px; }
        .det-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 22px 24px;
        }
        .det-card-title {
          font-family: 'Fraunces', serif;
          font-size: 1rem;
          font-weight: 400;
          font-style: italic;
          color: var(--charcoal);
          margin-bottom: 18px;
          letter-spacing: -0.01em;
        }
        .det-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 11px 0;
          border-bottom: 1px solid var(--border);
        }
        .det-item:last-child { border-bottom: none; padding-bottom: 0; }
        .det-item:first-child { padding-top: 0; }
        .det-item-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #fff0ea, #fde8f5);
          display: flex; align-items: center; justify-content: center;
          color: #ddc8d8;
          flex-shrink: 0;
        }
        .det-item-name {
          flex: 1;
          font-family: 'Fraunces', serif;
          font-size: 0.92rem;
          font-weight: 400;
          font-style: italic;
          color: var(--charcoal);
        }
        .det-item-qty {
          font-size: 0.72rem;
          color: var(--muted);
          font-weight: 300;
          margin-top: 2px;
        }
        .det-item-price {
          font-family: 'Fraunces', serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--charcoal);
        }
        .det-payment-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.83rem;
          color: var(--muted);
          font-weight: 300;
          padding: 9px 0;
          border-bottom: 1px solid var(--border);
        }
        .det-payment-row:last-child { border-bottom: none; padding-bottom: 0; }
        .det-payment-row:first-child { padding-top: 0; }
        .det-summary {
          position: sticky;
          top: 80px;
        }
        .det-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.83rem;
          color: var(--muted);
          font-weight: 300;
          margin-bottom: 9px;
        }
        .det-summary-row.discount { color: #5aad5e; }
        .det-summary-divider {
          border: none;
          border-top: 1.5px solid var(--border);
          margin: 14px 0;
        }
        .det-summary-total {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .det-total-label {
          font-size: 0.83rem;
          font-weight: 600;
          color: var(--charcoal);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .det-total-value {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--charcoal);
          letter-spacing: -0.02em;
        }
        .det-total-value span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 300;
          color: var(--muted);
          margin-left: 3px;
        }
        .det-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 32px;
          color: var(--muted);
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 400;
          transition: color 0.18s;
        }
        .det-back-link:hover { color: var(--charcoal); }
        @media (max-width: 640px) {
          .det-main { padding: 28px 16px 60px; }
        }
      `}</style>

      <div className="det-page">
        <main className="det-main">

          <div className="det-header">
            <div>
              <h1 className="det-title">Order #{order.id}</h1>
              <p className="det-date">
                Placed on {new Date(order.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <StatusBadge status={order.status} size="lg" />
          </div>

          <div className="det-layout">

            {/* ── Items + Payment ── */}
            <div className="det-left">
              <div className="det-card">
                <p className="det-card-title">Items in this order</p>
                {order.items.map((item) => (
                  <div key={item.id} className="det-item">
                    <div className="det-item-icon">
                      <Flower2 size={18} strokeWidth={1.4} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p className="det-item-name">{item.product_name}</p>
                      <p className="det-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="det-item-price">
                      {(Number(item.price) * item.quantity).toLocaleString()} DZD
                    </p>
                  </div>
                ))}
              </div>

              <div className="det-card">
                <p className="det-card-title">
                  <CreditCard size={14} strokeWidth={2} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--muted)' }} />
                  Payment
                </p>
                <div className="det-payment-row">
                  <span>Method</span>
                  <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--charcoal)' }}>
                    {order.payment?.method ?? '—'}
                  </span>
                </div>
                <div className="det-payment-row">
                  <span>Status</span>
                  <span style={{
                    color: order.payment?.status === 'paid' ? '#5aad5e' : '#b85c00',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}>
                    {order.payment?.status ?? '—'}
                  </span>
                </div>
                {order.payment?.transaction_id && (
                  <div className="det-payment-row">
                    <span>Transaction ID</span>
                    <span style={{ fontSize: 12, color: '#bbb', fontFamily: 'monospace' }}>
                      {order.payment.transaction_id}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Price Breakdown ── */}
            <div className="det-right">
              <div className="det-card det-summary">
                <p className="det-card-title">Price breakdown</p>
                <div className="det-summary-row">
                  <span>Original Total</span>
                  <span>{Number(order.original_total).toLocaleString()} DZD</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="det-summary-row discount">
                    <span>Coupon discount</span>
                    <span>− {Number(order.discount_amount).toLocaleString()} DZD</span>
                  </div>
                )}
                {Number(order.gift_card_amount) > 0 && (
                  <div className="det-summary-row discount">
                    <span>Gift card</span>
                    <span>− {Number(order.gift_card_amount).toLocaleString()} DZD</span>
                  </div>
                )}
                <hr className="det-summary-divider" />
                <div className="det-summary-total">
                  <span className="det-total-label">Final Total</span>
                  <span className="det-total-value">
                    {Number(order.final_total).toLocaleString()}
                    <span>DZD</span>
                  </span>
                </div>
              </div>
            </div>

          </div>

          <Link to="/orders" className="det-back-link">
            <ArrowLeft size={15} strokeWidth={2} />
            Back to orders
          </Link>

        </main>
      </div>
    </>
  );
}