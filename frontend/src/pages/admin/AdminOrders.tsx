import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminGetAllOrders, adminUpdateOrderStatus } from '../../services/api';
import type { Order } from '../../types/shop';
import { Package, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'preparing', 'delivered', 'cancelled'];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: 'Pending',   color: '#b85c00', bg: '#fff3e0', border: '#f0cc90' },
  preparing: { label: 'Preparing', color: '#1560a8', bg: '#e8f4ff', border: '#90c0f0' },
  delivered: { label: 'Delivered', color: '#2a7a32', bg: '#eaf5ea', border: '#90d090' },
  cancelled: { label: 'Cancelled', color: '#b82030', bg: '#fce8ea', border: '#f0a0a8' },
};

export default function AdminOrders() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<string>('all');
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchOrders = () => {
    adminGetAllOrders()
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdating(id);
    await adminUpdateOrderStatus(id, newStatus);
    fetchOrders();
    setUpdating(null);
  };

  const filtered = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  const countOf = (s: string) => orders.filter((o) => o.status === s).length;

  return (
    <AdminLayout>
      <style>{`
        .ord-filter-bar {
          display: flex;
          gap: 7px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .ord-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 100px;
          border: 1.5px solid var(--border);
          background: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.18s;
        }
        .ord-filter-btn:hover { border-color: #d8d0c8; color: var(--charcoal); }
        .ord-filter-btn.active {
          background: var(--charcoal);
          border-color: var(--charcoal);
          color: var(--cream);
        }
        .ord-filter-count {
          font-size: 0.68rem;
          background: rgba(255,255,255,0.22);
          padding: 1px 6px;
          border-radius: 10px;
        }
        .ord-filter-btn:not(.active) .ord-filter-count {
          background: #f0ebe4;
          color: var(--muted);
        }

        /* Status select */
        .ord-status-wrap { position: relative; display: inline-block; }
        .ord-status-select {
          appearance: none;
          -webkit-appearance: none;
          padding: 5px 28px 5px 10px;
          border-radius: 100px;
          border: 1px solid;
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          transition: opacity 0.18s;
        }
        .ord-status-select:disabled { opacity: 0.5; }
        .ord-status-chevron {
          position: absolute;
          right: 8px; top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: currentColor;
          opacity: 0.7;
        }

        /* Customer cell */
        .ord-customer-name { font-weight: 600; font-size: 0.875rem; }
        .ord-customer-email { font-size: 0.74rem; color: var(--muted); font-weight: 300; margin-top: 1px; }
      `}</style>

      <div className="admin-page-header">
        <h1 className="admin-page-title">
          Manage <strong>orders</strong>
        </h1>
        <span style={{
          fontFamily: 'Fraunces, serif',
          fontSize: '0.88rem',
          fontStyle: 'italic',
          color: 'var(--muted)',
          fontWeight: 300,
        }}>
          {orders.length} total orders
        </span>
      </div>

      {/* Filter tabs */}
      <div className="ord-filter-bar">
        <button
          className={`ord-filter-btn${filter === 'all' ? ' active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
          <span className="ord-filter-count">{orders.length}</span>
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            className={`ord-filter-btn${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {STATUS_CFG[s].label}
            <span className="ord-filter-count">{countOf(s)}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-spinner-wrap">
          <div className="admin-spinner" />
          <p className="admin-spinner-text">Loading orders…</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th">Order</th>
                  <th className="admin-th">Customer</th>
                  <th className="admin-th">Items</th>
                  <th className="admin-th">Total</th>
                  <th className="admin-th">Payment</th>
                  <th className="admin-th">Date</th>
                  <th className="admin-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)', fontStyle: 'italic', fontFamily: 'Fraunces, serif', fontWeight: 300 }}
                    >
                      No orders found
                    </td>
                  </tr>
                ) : filtered.map((order) => {
                  const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.pending;
                  return (
                    <tr key={order.id} className="admin-tr">
                      <td className="admin-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 9,
                            background: '#f5f0ea',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#c0b0a0', flexShrink: 0,
                          }}>
                            <Package size={16} strokeWidth={1.6} />
                          </div>
                          <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>
                            #{order.id}
                          </span>
                        </div>
                      </td>
                      <td className="admin-td">
                        <p className="ord-customer-name">{order.customer_username}</p>
                        {order.customer_email && (
                          <p className="ord-customer-email">{order.customer_email}</p>
                        )}
                      </td>
                      <td className="admin-td" style={{ color: 'var(--muted)' }}>
                        {order.items?.length ?? 0} items
                      </td>
                      <td className="admin-td" style={{ fontWeight: 600 }}>
                        {Number(order.final_total).toLocaleString()} DZD
                      </td>
                      <td className="admin-td" style={{ textTransform: 'capitalize', color: 'var(--muted)' }}>
                        {order.payment?.method ?? '—'}
                      </td>
                      <td className="admin-td" style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="admin-td">
                        <div className="ord-status-wrap">
                          <select
                            className="ord-status-select"
                            style={{
                              background:  cfg.bg,
                              color:       cfg.color,
                              borderColor: cfg.border,
                            }}
                            value={order.status}
                            disabled={updating === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_CFG[s].label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={10}
                            strokeWidth={2.5}
                            className="ord-status-chevron"
                            style={{ color: cfg.color }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}