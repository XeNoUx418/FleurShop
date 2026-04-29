import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package, CheckCircle2, Clock, TrendingUp, Mail, IdCard, Key,
  LogOut, ChevronRight,
} from 'lucide-react';
import { getOrders } from '../services/api';
import type { Order } from '../types/shop';

function decodeToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload as { user_id: number; username: string; email?: string; exp: number };
  } catch {
    return null;
  }
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#b85c00', bg: '#fff3e0' },
  preparing: { label: 'Preparing', color: '#1560a8', bg: '#e8f4ff' },
  delivered: { label: 'Delivered', color: '#2a7a32', bg: '#eaf5ea' },
  cancelled: { label: 'Cancelled', color: '#b82030', bg: '#fce8ea' },
};

export default function Profile() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('access_token');
  const user = token ? decodeToken(token) : null;

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    getOrders()
      .then((res) => setOrders(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const totalSpent = orders.reduce((s, o) => s + Number(o.final_total), 0);
  const delivered = orders.filter((o) => o.status === 'delivered').length;
  const pending = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;
  const recentOrders = orders.slice(0, 4);

  const expiresAt = user ? new Date(user.exp * 1000) : null;
  const expiresLabel = expiresAt
    ? expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const STATS = [
    { icon: <Package size={20} strokeWidth={1.6} />, value: orders.length, suffix: '', label: 'Total orders' },
    { icon: <CheckCircle2 size={20} strokeWidth={1.6} />, value: delivered, suffix: '', label: 'Delivered' },
    { icon: <Clock size={20} strokeWidth={1.6} />, value: pending, suffix: '', label: 'In progress' },
    { icon: <TrendingUp size={20} strokeWidth={1.6} />, value: totalSpent.toLocaleString(), suffix: ' DZD', label: 'Total spent' },
  ];

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
        .pf-page { min-height: 100vh; background: var(--cream); font-family: 'Outfit', sans-serif; }
        .pf-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 32px 80px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .pf-header { margin-bottom: 4px; }
        .pf-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--mint); color: #3a7d44;
          font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 4px 11px; border-radius: 100px; margin-bottom: 10px;
        }
        .pf-title {
          font-family: 'Fraunces', serif;
          font-size: 2.4rem; font-weight: 300; font-style: italic;
          color: var(--charcoal); letter-spacing: -0.02em; line-height: 1.1;
        }
        .pf-title strong { font-style: normal; font-weight: 500; color: var(--coral); }

        /* ── Profile card ── */
        .pf-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 18px;
          overflow: hidden;
        }
        .pf-card-stripe {
          height: 6px;
          background: linear-gradient(90deg,
            rgba(232,123,176,0.5),
            rgba(185,146,212,0.5),
            rgba(244,133,106,0.5),
            rgba(245,200,66,0.5),
            rgba(91,155,212,0.5)
          );
        }
        .pf-card-body {
          padding: 26px 26px 22px;
          display: flex;
          align-items: flex-start;
          gap: 22px;
          flex-wrap: wrap;
        }
        .pf-avatar {
          width: 68px; height: 68px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffe0ea, #fde8c4);
          border: 2px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: #c8907e;
          flex-shrink: 0;
        }
        .pf-info { flex: 1; min-width: 180px; }
        .pf-username {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem; font-weight: 400; font-style: italic;
          color: var(--charcoal); letter-spacing: -0.01em; margin-bottom: 6px;
        }
        .pf-meta { display: flex; flex-direction: column; gap: 4px; }
        .pf-meta-item {
          display: flex; align-items: center; gap: 7px;
          font-size: 0.77rem; color: var(--muted); font-weight: 300;
        }
        .pf-meta-icon { color: #c8c0b8; flex-shrink: 0; }
        .pf-card-actions {
          padding: 14px 26px;
          border-top: 1.5px solid var(--border);
        }
        .pf-logout-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 18px;
          background: transparent;
          border: 1.5px solid #f0e0de;
          color: #c09090; border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem; font-weight: 500;
          cursor: pointer; letter-spacing: 0.02em;
          transition: border-color 0.18s, color 0.18s, background 0.18s;
        }
        .pf-logout-btn:hover {
          border-color: var(--coral); color: var(--coral); background: #fff5f3;
        }

        /* ── Stats ── */
        .pf-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
          gap: 14px;
        }
        .pf-stat {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 14px;
          padding: 20px 20px 18px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .pf-stat-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: #f5f0ea;
          display: flex; align-items: center; justify-content: center;
          color: #c0b0a0;
          margin-bottom: 2px;
        }
        .pf-stat-value {
          font-family: 'Fraunces', serif;
          font-size: 1.55rem; font-weight: 500;
          color: var(--charcoal); letter-spacing: -0.02em;
          line-height: 1;
        }
        .pf-stat-label {
          font-size: 0.73rem; color: var(--muted); font-weight: 300;
        }

        /* ── Recent orders ── */
        .pf-section-title {
          font-family: 'Fraunces', serif;
          font-size: 1.15rem; font-weight: 300; font-style: italic;
          color: var(--charcoal); letter-spacing: -0.01em;
          margin-bottom: 12px;
        }
        .pf-orders-list { display: flex; flex-direction: column; gap: 9px; }
        .pf-order-row {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 13px;
          padding: 13px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-decoration: none;
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.14s;
        }
        .pf-order-row:hover {
          border-color: #e0d8d0;
          box-shadow: 0 4px 16px rgba(30,20,10,0.07);
          transform: translateY(-1px);
        }
        .pf-order-left { display: flex; flex-direction: column; gap: 2px; }
        .pf-order-id {
          font-family: 'Fraunces', serif;
          font-size: 0.95rem; font-weight: 400; font-style: italic;
          color: var(--charcoal);
        }
        .pf-order-date { font-size: 0.72rem; color: var(--muted); font-weight: 300; }
        .pf-order-right { display: flex; align-items: center; gap: 10px; }
        .pf-order-total {
          font-family: 'Fraunces', serif;
          font-size: 0.95rem; font-weight: 500; color: var(--charcoal);
        }
        .pf-order-total span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem; font-weight: 300; color: var(--muted); margin-left: 2px;
        }
        .pf-status {
          font-size: 0.65rem; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; padding: 3px 9px; border-radius: 100px;
        }
        .pf-caret { color: #d0c8c0; }
        .pf-see-all {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.78rem; color: var(--coral);
          text-decoration: none; font-weight: 500; margin-top: 6px;
        }
        .pf-see-all:hover { text-decoration: underline; }
        .pf-spinner {
          display: inline-block; width: 26px; height: 26px;
          border: 2px solid var(--border); border-top-color: var(--coral);
          border-radius: 50%; animation: pfspin 0.8s linear infinite;
        }
        @keyframes pfspin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .pf-main { padding: 24px 16px 60px; }
          .pf-title { font-size: 1.9rem; }
        }
      `}</style>

      <div className="pf-page">
        <main className="pf-main">

          <div className="pf-header">
            <div className="pf-eyebrow">Your account</div>
            <h1 className="pf-title">Hello, <strong>{user?.username ?? '…'}</strong></h1>
          </div>

          {/* Profile card */}
          <div className="pf-card">
            <div className="pf-card-stripe" />
            <div className="pf-card-body">
              <div className="pf-avatar">
                <IdCard size={28} strokeWidth={1.4} />
              </div>
              <div className="pf-info">
                <p className="pf-username">{user?.username ?? '—'}</p>
                <div className="pf-meta">
                  {user?.email && (
                    <span className="pf-meta-item">
                      <Mail size={13} strokeWidth={2} className="pf-meta-icon" />
                      {user.email}
                    </span>
                  )}
                  <span className="pf-meta-item">
                    <IdCard size={13} strokeWidth={2} className="pf-meta-icon" />
                    User ID #{user?.user_id ?? '—'}
                  </span>
                  <span className="pf-meta-item">
                    <Key size={13} strokeWidth={2} className="pf-meta-icon" />
                    Session valid until {expiresLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className="pf-card-actions">
              <button className="pf-logout-btn" onClick={handleLogout}>
                <LogOut size={14} strokeWidth={2} />
                Sign out of account
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="pf-stats">
            {STATS.map((s, i) => (
              <div key={i} className="pf-stat">
                <div className="pf-stat-icon">{s.icon}</div>
                <div className="pf-stat-value">{s.value}{s.suffix && <span style={{ fontSize: '0.7rem', fontFamily: 'Outfit, sans-serif', fontWeight: 300, color: 'var(--muted)', marginLeft: 3 }}>{s.suffix}</span>}</div>
                <div className="pf-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          <div>
            <p className="pf-section-title">Recent orders</p>

            {loading ? (
              <div style={{ padding: '20px 0' }}><div className="pf-spinner" /></div>
            ) : recentOrders.length === 0 ? (
              <p style={{ fontSize: '0.83rem', color: 'var(--muted)', fontWeight: 300 }}>
                No orders yet —{' '}
                <Link to="/shop" style={{ color: 'var(--coral)', textDecoration: 'none' }}>
                  start shopping →
                </Link>
              </p>
            ) : (
              <>
                <div className="pf-orders-list">
                  {recentOrders.map((order) => {
                    const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
                    return (
                      <Link key={order.id} to={`/orders/${order.id}`} className="pf-order-row">
                        <div className="pf-order-left">
                          <span className="pf-order-id">Order #{order.id}</span>
                          <span className="pf-order-date">
                            {new Date(order.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="pf-order-right">
                          <span className="pf-order-total">
                            {Number(order.final_total).toLocaleString()}
                            <span>DZD</span>
                          </span>
                          <span className="pf-status" style={{ background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                          <ChevronRight size={14} strokeWidth={1.8} className="pf-caret" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {orders.length > 4 && (
                  <Link to="/orders" className="pf-see-all">
                    View all {orders.length} orders →
                  </Link>
                )}
              </>
            )}
          </div>

        </main>
      </div>
    </>
  );
}