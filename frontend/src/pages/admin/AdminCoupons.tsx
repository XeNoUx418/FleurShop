import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminGetCoupons, adminCreateCoupon } from '../../services/api';
import { Tag, Plus, Percent, DollarSign, Truck } from 'lucide-react';

const EMPTY = {
  code: '', coupon_type: 'percentage', value: '',
  min_order_value: '', max_uses: '100', valid_until: '',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  percentage: <Percent    size={14} strokeWidth={2} />,
  fixed:      <DollarSign size={14} strokeWidth={2} />,
  free_ship:  <Truck      size={14} strokeWidth={2} />,
};

export default function AdminCoupons() {
  const [coupons,    setCoupons]    = useState<any[]>([]);
  const [form,       setForm]       = useState<any>(EMPTY);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = () => {
    adminGetCoupons()
      .then((res) => setCoupons(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await adminCreateCoupon(form);
    setForm(EMPTY);
    fetchCoupons();
    setSubmitting(false);
  };

  const discountLabel = (c: any) => {
    if (c.coupon_type === 'percentage') return `${c.value}% off`;
    if (c.coupon_type === 'fixed')      return `${Number(c.value).toLocaleString()} DZD off`;
    return 'Free shipping';
  };

  const usagePct = (c: any) =>
    c.max_uses > 0 ? Math.round(((c.times_used ?? 0) / c.max_uses) * 100) : 0;

  return (
    <AdminLayout>
      <style>{`
        .coup-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
          align-items: flex-start;
        }
        @media (max-width: 900px) { .coup-layout { grid-template-columns: 1fr; } }
        .coup-row {
          padding: 16px 0;
          border-bottom: 1px solid #f5f0ea;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .coup-row:last-child { border-bottom: none; padding-bottom: 0; }
        .coup-row:first-child { padding-top: 0; }
        .coup-icon {
          width: 36px; height: 36px;
          border-radius: 9px;
          background: #fff5f3;
          border: 1.5px solid #f0d8d4;
          display: flex; align-items: center; justify-content: center;
          color: var(--coral);
          flex-shrink: 0;
        }
        .coup-code {
          font-family: 'Outfit', monospace;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--coral);
          letter-spacing: 0.05em;
        }
        .coup-meta {
          font-size: 0.75rem;
          color: var(--muted);
          font-weight: 300;
          margin-top: 2px;
        }
        .coup-usage-wrap { flex-shrink: 0; text-align: right; }
        .coup-usage-text {
          font-size: 0.72rem;
          color: var(--muted);
          font-weight: 300;
          margin-bottom: 5px;
        }
        .coup-bar-track {
          width: 80px; height: 4px;
          background: #f0ebe4;
          border-radius: 2px;
          overflow: hidden;
        }
        .coup-bar-fill {
          height: 100%;
          border-radius: 2px;
          background: var(--coral);
          transition: width 0.4s;
        }
      `}</style>

      <div className="admin-page-header">
        <h1 className="admin-page-title">
          Manage <strong>coupons</strong>
        </h1>
      </div>

      <div className="coup-layout">

        {/* Form */}
        <div className="admin-card">
          <p className="admin-card-title">
            <Plus size={14} strokeWidth={2.5} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--muted)' }} />
            Create coupon
          </p>
          <form onSubmit={handleSubmit}>
            <label className="admin-field-label">Coupon code</label>
            <input
              className="admin-input"
              placeholder="e.g. SPRING20"
              value={form.code}
              style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
            />

            <label className="admin-field-label">Discount type</label>
            <select
              className="admin-input"
              value={form.coupon_type}
              onChange={(e) => setForm({ ...form, coupon_type: e.target.value })}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (DZD)</option>
              <option value="free_ship">Free Shipping</option>
            </select>

            <label className="admin-field-label">Value</label>
            <input
              className="admin-input"
              type="number"
              placeholder="e.g. 20"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              required
            />

            <label className="admin-field-label">Minimum order (DZD)</label>
            <input
              className="admin-input"
              type="number"
              placeholder="0 = no minimum"
              value={form.min_order_value}
              onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
            />

            <label className="admin-field-label">Max uses</label>
            <input
              className="admin-input"
              type="number"
              placeholder="100"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
            />

            <label className="admin-field-label">Valid until</label>
            <input
              className="admin-input"
              type="datetime-local"
              value={form.valid_until}
              onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
              required
            />

            <button type="submit" className="admin-submit-btn" disabled={submitting}>
              <Tag size={14} strokeWidth={2} />
              {submitting ? 'Creating…' : 'Create coupon'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="admin-card">
          <p className="admin-card-title">
            Active coupons
            <span style={{
              marginLeft: 10,
              fontFamily: 'Outfit, sans-serif',
              fontStyle: 'normal',
              fontSize: '0.72rem',
              background: '#f5f0ea',
              color: 'var(--muted)',
              padding: '2px 8px',
              borderRadius: 100,
              fontWeight: 500,
            }}>
              {coupons.length}
            </span>
          </p>

          {loading ? (
            <div className="admin-spinner-wrap" style={{ padding: '32px 0' }}>
              <div className="admin-spinner" />
            </div>
          ) : coupons.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontStyle: 'italic', fontFamily: 'Fraunces, serif', fontWeight: 300 }}>
              No coupons yet
            </p>
          ) : coupons.map((c) => (
            <div key={c.id} className="coup-row">
              <div className="coup-icon">
                {TYPE_ICONS[c.coupon_type] ?? <Tag size={14} strokeWidth={2} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="coup-code">{c.code}</p>
                <p className="coup-meta">
                  {discountLabel(c)}
                  {Number(c.min_order_value) > 0 && ` · min ${Number(c.min_order_value).toLocaleString()} DZD`}
                </p>
              </div>
              <div className="coup-usage-wrap">
                <p className="coup-usage-text">{c.times_used ?? 0} / {c.max_uses} used</p>
                <div className="coup-bar-track">
                  <div
                    className="coup-bar-fill"
                    style={{ width: `${usagePct(c)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}