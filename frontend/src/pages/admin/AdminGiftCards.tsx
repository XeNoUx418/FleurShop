import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminGetGiftCards, adminCreateGiftCard } from '../../services/api';
import { Gift, Plus, Mail } from 'lucide-react';

const EMPTY = { balance: '', issued_to: '', expires_at: '', code: '' };

export default function AdminGiftCards() {
  const [cards,      setCards]      = useState<any[]>([]);
  const [form,       setForm]       = useState<any>(EMPTY);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCards = () => {
    adminGetGiftCards()
      .then((res) => setCards(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCards(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await adminCreateGiftCard(form);
    setForm(EMPTY);
    fetchCards();
    setSubmitting(false);
  };

  const remainingPct = (c: any) =>
    c.initial_balance > 0
      ? Math.round((Number(c.remaining_balance) / Number(c.initial_balance)) * 100)
      : 0;

  return (
    <AdminLayout>
      <style>{`
        .gc-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
          align-items: flex-start;
        }
        @media (max-width: 900px) { .gc-layout { grid-template-columns: 1fr; } }

        .gc-row {
          padding: 16px 0;
          border-bottom: 1px solid #f5f0ea;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .gc-row:last-child { border-bottom: none; padding-bottom: 0; }
        .gc-row:first-child { padding-top: 0; }

        .gc-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #d4f0c0, #e8f5ea);
          border: 1.5px solid #c0e8c0;
          display: flex; align-items: center; justify-content: center;
          color: #3a7d44;
          flex-shrink: 0;
        }

        .gc-code {
          font-family: 'Outfit', monospace;
          font-size: 0.86rem;
          font-weight: 700;
          color: var(--charcoal);
          letter-spacing: 0.06em;
        }
        .gc-meta {
          font-size: 0.74rem;
          color: var(--muted);
          font-weight: 300;
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .gc-balance-wrap { flex-shrink: 0; text-align: right; }
        .gc-balance-remaining {
          font-family: 'Fraunces', serif;
          font-size: 1.05rem;
          font-weight: 500;
          color: #2a7a32;
          letter-spacing: -0.01em;
        }
        .gc-balance-remaining span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem;
          font-weight: 300;
          color: var(--muted);
          margin-left: 2px;
        }
        .gc-balance-of {
          font-size: 0.72rem;
          color: var(--muted);
          font-weight: 300;
          margin-top: 3px;
        }
        .gc-bar-track {
          width: 80px; height: 4px;
          background: #f0ebe4;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 6px;
          margin-left: auto;
        }
        .gc-bar-fill {
          height: 100%;
          border-radius: 2px;
          background: #5aad5e;
          transition: width 0.4s;
        }
      `}</style>

      <div className="admin-page-header">
        <h1 className="admin-page-title">
          Manage <strong>gift cards</strong>
        </h1>
      </div>

      <div className="gc-layout">

        {/* Form */}
        <div className="admin-card">
          <p className="admin-card-title">
            <Plus size={14} strokeWidth={2.5} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--muted)' }} />
            Generate gift card
          </p>
          <form onSubmit={handleSubmit}>
            <label className="admin-field-label">Balance (DZD)</label>
            <input
              className="admin-input"
              type="number"
              placeholder="e.g. 5000"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
              required
            />

            <label className="admin-field-label">Issue to email (optional)</label>
            <input
              className="admin-input"
              type="email"
              placeholder="customer@email.com"
              value={form.issued_to}
              onChange={(e) => setForm({ ...form, issued_to: e.target.value })}
            />

            <label className="admin-field-label">Custom code</label>
            <input
              className="admin-input"
              placeholder="Leave blank to auto-generate"
              value={form.code}
              style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />

            <label className="admin-field-label">Expires at</label>
            <input
              className="admin-input"
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              required
            />

            <button type="submit" className="admin-submit-btn" disabled={submitting}>
              <Gift size={15} strokeWidth={2} />
              {submitting ? 'Generating…' : 'Generate gift card'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="admin-card">
          <p className="admin-card-title">
            All gift cards
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
              {cards.length}
            </span>
          </p>

          {loading ? (
            <div className="admin-spinner-wrap" style={{ padding: '32px 0' }}>
              <div className="admin-spinner" />
            </div>
          ) : cards.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontStyle: 'italic', fontFamily: 'Fraunces, serif', fontWeight: 300 }}>
              No gift cards yet
            </p>
          ) : cards.map((c) => (
            <div key={c.id} className="gc-row">
              <div className="gc-icon">
                <Gift size={18} strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="gc-code">{c.code}</p>
                <p className="gc-meta">
                  {c.issued_to ? (
                    <><Mail size={10} strokeWidth={2} /> {c.issued_to}</>
                  ) : (
                    'No recipient'
                  )}
                  {' · '}
                  Expires {new Date(c.expires_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
              <div className="gc-balance-wrap">
                <p className="gc-balance-remaining">
                  {Number(c.remaining_balance).toLocaleString()}
                  <span>DZD</span>
                </p>
                <p className="gc-balance-of">
                  of {Number(c.initial_balance).toLocaleString()} DZD
                </p>
                <div className="gc-bar-track">
                  <div
                    className="gc-bar-fill"
                    style={{ width: `${remainingPct(c)}%` }}
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