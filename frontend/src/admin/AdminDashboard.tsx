import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminGetDashboard } from '../../services/api';
import type { DashboardData } from '../../types/analytics';
import {
  ShoppingBag, TrendingUp, Clock, AlertTriangle,
  BarChart2, Star, Zap, Activity,
} from 'lucide-react';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: 'Pending',   color: '#b85c00', bg: '#fff3e0', border: '#f0cc90' },
  preparing: { label: 'Preparing', color: '#1560a8', bg: '#e8f4ff', border: '#90c0f0' },
  delivered: { label: 'Delivered', color: '#2a7a32', bg: '#eaf5ea', border: '#90d090' },
  cancelled: { label: 'Cancelled', color: '#b82030', bg: '#fce8ea', border: '#f0a0a8' },
};

export default function AdminDashboard() {
  const [dash,    setDash]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetDashboard()
      .then((res) => setDash(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summary      = dash?.summary      ?? { total_revenue: 0, total_orders: 0 };
  const dailyRevenue = dash?.daily_revenue ?? [];
  const topProducts  = dash?.top_products  ?? [];
  const hourly       = dash?.hourly        ?? [];
  const statusCounts = dash?.status_counts ?? [];
  const recentEvents = dash?.recent_events ?? [];

  const maxRevenue = Math.max(...dailyRevenue.map((d) => Number(d.revenue)), 1);
  const maxHourly  = Math.max(...hourly.map((h) => h.order_count), 1);
  const maxUnits   = Math.max(...topProducts.map((p) => p.units_sold), 1);

  const avgOrderValue = summary.total_orders
    ? Math.round(summary.total_revenue / summary.total_orders)
    : 0;

  const STATS = dash ? [
    {
      label: 'Total Orders',
      value: summary.total_orders,
      suffix: '',
      icon: <ShoppingBag size={20} strokeWidth={1.6} />,
      accent: '#e8f4ff', iconClr: '#1560a8',
    },
    {
      label: 'Total Revenue',
      value: Number(summary.total_revenue).toLocaleString(),
      suffix: ' DZD',
      icon: <TrendingUp size={20} strokeWidth={1.6} />,
      accent: '#eaf5ea', iconClr: '#2a7a32',
    },
    {
      label: 'Avg Order Value',
      value: avgOrderValue.toLocaleString(),
      suffix: ' DZD',
      icon: <BarChart2 size={20} strokeWidth={1.6} />,
      accent: '#f5f0ff', iconClr: '#7c3aed',
    },
    {
      label: 'Pending Orders',
      value: statusCounts.find((s) => s.status === 'pending')?.count ?? 0,
      suffix: '',
      icon: <Clock size={20} strokeWidth={1.6} />,
      accent: '#fff3e0', iconClr: '#b85c00',
    },
    {
      label: 'Products tracked',
      value: topProducts.length,
      suffix: '',
      icon: <AlertTriangle size={20} strokeWidth={1.6} />,
      accent: '#fce8ea', iconClr: '#b82030',
    },
    {
      label: 'Top products',
      value: topProducts.length,
      suffix: '',
      icon: <Star size={20} strokeWidth={1.6} />,
      accent: '#fff8e8', iconClr: '#b87000',
    },
  ] : [];

  return (
    <AdminLayout>
      <style>{`
        /* ── Stat cards ── */
        .dash-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }
        .dash-stat-card {
          background: rgba(255, 250, 245, 0.93);
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 20px 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: box-shadow 0.18s, transform 0.14s;
        }
        .dash-stat-card:hover {
          box-shadow: 0 4px 18px rgba(30,20,10,0.08);
          transform: translateY(-1px);
        }
        .dash-stat-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .dash-stat-value {
          font-family: 'Fraunces', serif;
          font-size: 1.75rem;
          font-weight: 500;
          color: var(--charcoal);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .dash-stat-suffix {
          font-family: 'Outfit', sans-serif;
          font-size: 0.7rem;
          font-weight: 300;
          color: var(--muted);
          margin-left: 3px;
        }
        .dash-stat-label {
          font-size: 0.74rem;
          color: var(--muted);
          font-weight: 400;
        }

        /* ── Layout ── */
        .dash-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 18px;
        }
        @media (max-width: 900px) {
          .dash-two-col { grid-template-columns: 1fr; }
        }
        .dash-section {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 22px 24px;
        }
        .dash-section-title {
          font-family: 'Fraunces', serif;
          font-size: 0.98rem;
          font-weight: 400;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.01em;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dash-section-title-icon { color: var(--muted); }

        /* ── Revenue bar chart ── */
        .dash-bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 110px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .dash-bar-chart::-webkit-scrollbar { display: none; }
        .dash-bar-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          min-width: 26px;
        }
        .dash-bar-wrap { display: flex; align-items: flex-end; height: 90px; }
        .dash-bar {
          width: 18px;
          border-radius: 4px 4px 0 0;
          min-height: 3px;
          background: var(--coral);
          opacity: 0.7;
          transition: opacity 0.16s;
          cursor: default;
        }
        .dash-bar:hover { opacity: 1; }
        .dash-bar-lbl {
          font-size: 8px;
          color: var(--muted);
          margin-top: 5px;
          white-space: nowrap;
        }

        /* ── Status rows ── */
        .dash-status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          border-radius: 10px;
          margin-bottom: 8px;
          border: 1px solid;
        }
        .dash-status-row:last-child { margin-bottom: 0; }
        .dash-status-label {
          font-size: 0.84rem;
          font-weight: 600;
        }
        .dash-status-count {
          font-family: 'Fraunces', serif;
          font-size: 1.4rem;
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        /* ── Top products ── */
        .dash-product-row { margin-bottom: 14px; }
        .dash-product-row:last-child { margin-bottom: 0; }
        .dash-product-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 0.835rem;
        }
        .dash-product-name { font-weight: 500; color: var(--charcoal); }
        .dash-product-units { font-weight: 600; color: var(--coral); }
        .dash-progress-track {
          height: 5px;
          background: #f0ebe4;
          border-radius: 100px;
          overflow: hidden;
        }
        .dash-progress-fill {
          height: 100%;
          background: var(--coral);
          border-radius: 100px;
          opacity: 0.75;
        }

        /* ── Peak hours ── */
        .dash-hour-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 3px;
        }
        .dash-hour-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .dash-hour-wrap { display: flex; align-items: flex-end; height: 48px; }
        .dash-hour-bar {
          width: 100%;
          border-radius: 3px 3px 0 0;
          min-height: 2px;
          background: var(--coral);
        }
        .dash-hour-bar.empty { background: #ede6de; }
        .dash-hour-lbl { font-size: 8px; color: var(--muted); margin-top: 4px; }

        /* ── Event feed ── */
        .dash-event-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid #f5f0ea;
        }
        .dash-event-row:last-child { border-bottom: none; }
        .dash-event-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dash-event-info { flex: 1; min-width: 0; }
        .dash-event-id {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-size: 0.9rem;
          color: var(--charcoal);
        }
        .dash-event-desc {
          font-size: 0.76rem;
          color: var(--muted);
          font-weight: 300;
          margin-top: 1px;
        }
        .dash-event-amount {
          font-weight: 600;
          font-size: 0.84rem;
          color: var(--charcoal);
          white-space: nowrap;
        }
        .dash-event-time {
          font-size: 0.72rem;
          color: #c0b8b0;
          font-weight: 300;
          white-space: nowrap;
        }

        /* ── Empty state ── */
        .dash-empty {
          text-align: center;
          padding: 28px;
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 300;
          color: var(--muted);
          font-size: 0.9rem;
        }
      `}</style>

      <div className="admin-page-header">
        <h1 className="admin-page-title">
          Good morning, <strong>Admin</strong>
        </h1>
        <span style={{
          fontFamily: 'Fraunces, serif',
          fontSize: '0.88rem',
          fontStyle: 'italic',
          color: 'var(--muted)',
          fontWeight: 300,
        }}>
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </span>
      </div>

      {loading ? (
        <div className="admin-spinner-wrap">
          <div className="admin-spinner" />
          <p className="admin-spinner-text">Loading dashboard…</p>
        </div>
      ) : (
        <>
          {/* ── 1. Stat cards ── */}
          <div className="dash-stats">
            {STATS.map((s) => (
              <div key={s.label} className="dash-stat-card">
                <div className="dash-stat-icon" style={{ background: s.accent, color: s.iconClr }}>
                  {s.icon}
                </div>
                <div className="dash-stat-value">
                  {s.value}
                  {s.suffix && <span className="dash-stat-suffix">{s.suffix}</span>}
                </div>
                <div className="dash-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── 2. Daily Revenue + Orders by Status ── */}
          <div className="dash-two-col">

            <div className="dash-section">
              <p className="dash-section-title">
                <span className="dash-section-title-icon">
                  <BarChart2 size={15} strokeWidth={2} />
                </span>
                Daily revenue — last 30 days
              </p>
              {dailyRevenue.length === 0 ? (
                <p className="dash-empty">No revenue data yet</p>
              ) : (
                <div className="dash-bar-chart">
                  {[...dailyRevenue].reverse().map((d) => (
                    <div key={d.date} className="dash-bar-group">
                      <div className="dash-bar-wrap">
                        <div
                          className="dash-bar"
                          title={`${Number(d.revenue).toLocaleString()} DZD`}
                          style={{ height: `${(Number(d.revenue) / maxRevenue) * 90}px` }}
                        />
                      </div>
                      <span className="dash-bar-lbl">
                        {new Date(d.date).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dash-section">
              <p className="dash-section-title">
                <span className="dash-section-title-icon">
                  <Activity size={15} strokeWidth={2} />
                </span>
                Orders by status
              </p>
              {statusCounts.length === 0 ? (
                <p className="dash-empty">No data yet</p>
              ) : statusCounts.map((s) => {
                const cfg = STATUS_CFG[s.status] ?? STATUS_CFG.pending;
                return (
                  <div
                    key={s.status}
                    className="dash-status-row"
                    style={{ background: cfg.bg, borderColor: cfg.border }}
                  >
                    <span className="dash-status-label" style={{ color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span className="dash-status-count" style={{ color: cfg.color }}>
                      {s.count}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* ── 3. Top Products + Peak Hours ── */}
          <div className="dash-two-col">

            <div className="dash-section">
              <p className="dash-section-title">
                <span className="dash-section-title-icon">
                  <Star size={15} strokeWidth={2} />
                </span>
                Top products by units sold
              </p>
              {topProducts.length === 0 ? (
                <p className="dash-empty">No sales data yet</p>
              ) : topProducts.map((p, i: number) => (
                <div key={p.product_id} className="dash-product-row">
                  <div className="dash-product-meta">
                    <span className="dash-product-name">
                      <span style={{ color: 'var(--muted)', fontWeight: 300, marginRight: 6 }}>
                        {i + 1}.
                      </span>
                      {p.product_name}
                    </span>
                    <span className="dash-product-units">{p.units_sold} units</span>
                  </div>
                  <div className="dash-progress-track">
                    <div
                      className="dash-progress-fill"
                      style={{ width: `${(p.units_sold / maxUnits) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="dash-section">
              <p className="dash-section-title">
                <span className="dash-section-title-icon">
                  <Zap size={15} strokeWidth={2} />
                </span>
                Peak order hours
              </p>
              {hourly.filter((h) => h.order_count > 0).length === 0 ? (
                <p className="dash-empty">No hourly data yet</p>
              ) : (
                <div className="dash-hour-grid">
                  {hourly.map((h) => (
                    <div key={h.hour} className="dash-hour-cell">
                      <div className="dash-hour-wrap">
                        <div
                          className={`dash-hour-bar${h.order_count === 0 ? ' empty' : ''}`}
                          title={`${h.hour}:00 — ${h.order_count} orders`}
                          style={{
                            height: `${(h.order_count / maxHourly) * 48}px`,
                            opacity: h.order_count > 0
                              ? 0.5 + (h.order_count / maxHourly) * 0.5
                              : 1,
                          }}
                        />
                      </div>
                      <span className="dash-hour-lbl">{h.hour}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── 4. Live Event Feed ── */}
          <div className="dash-section">
            <p className="dash-section-title">
              <span className="dash-section-title-icon">
                <Activity size={15} strokeWidth={2} />
              </span>
              Live event feed
            </p>
            {recentEvents.length === 0 ? (
              <p className="dash-empty">No events yet — place an order to see it here</p>
            ) : recentEvents.map((e, i: number) => (
              <div key={i} className="dash-event-row">
                <div
                  className="dash-event-dot"
                  style={{
                    background: e.event_type === 'order.created'
                      ? 'var(--coral)'
                      : '#1560a8',
                  }}
                />
                <div className="dash-event-info">
                  <span className="dash-event-id">Order #{e.order_id}</span>
                  <p className="dash-event-desc">
                    {e.event_type === 'order.created'
                      ? `placed by ${e.customer_name}`
                      : `status → ${STATUS_CFG[e.status]?.label ?? e.status}`
                    }
                  </p>
                </div>
                <span className="dash-event-amount">
                  {Number(e.total).toLocaleString()} DZD
                </span>
                <span className="dash-event-time">
                  {new Date(e.occurred_at).toLocaleTimeString('en-GB', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>

        </>
      )}
    </AdminLayout>
  );
}