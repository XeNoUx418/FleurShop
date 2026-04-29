import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getCategories, adminCreateCategory } from '../../services/api';
import type { Category } from '../../types/shop';
import { FolderOpen, Plus, Hash } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form,       setForm]       = useState({ name: '', description: '' });
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = () => {
    getCategories()
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await adminCreateCategory(form);
    setForm({ name: '', description: '' });
    fetchCategories();
    setSubmitting(false);
  };

  return (
    <AdminLayout>
      <style>{`
        .cat-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
          align-items: flex-start;
        }
        @media (max-width: 768px) {
          .cat-layout { grid-template-columns: 1fr; }
        }
        .cat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #f5f0ea;
        }
        .cat-row:last-child { border-bottom: none; padding-bottom: 0; }
        .cat-row:first-child { padding-top: 0; }
        .cat-icon {
          width: 36px; height: 36px;
          border-radius: 9px;
          background: #f5f0ea;
          display: flex; align-items: center; justify-content: center;
          color: #c0b0a0;
          flex-shrink: 0;
        }
        .cat-name {
          font-weight: 600;
          font-size: 0.88rem;
          color: var(--charcoal);
        }
        .cat-desc {
          font-size: 0.76rem;
          color: var(--muted);
          font-weight: 300;
          margin-top: 2px;
        }
        .cat-id-badge {
          font-size: 0.68rem;
          color: #c0b8b0;
          background: #f5f0ea;
          padding: 3px 8px;
          border-radius: 100px;
          font-family: 'Outfit', sans-serif;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .cat-empty {
          text-align: center;
          padding: 40px 20px;
          color: var(--muted);
          font-size: 0.84rem;
          font-weight: 300;
          font-family: 'Fraunces', serif;
          font-style: italic;
        }
      `}</style>

      <div className="admin-page-header">
        <h1 className="admin-page-title">
          Manage <strong>categories</strong>
        </h1>
      </div>

      <div className="cat-layout">

        {/* Add form */}
        <div className="admin-card">
          <p className="admin-card-title">
            <Plus size={14} strokeWidth={2.5} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--muted)' }} />
            Add new category
          </p>
          <form onSubmit={handleSubmit}>
            <label className="admin-field-label">Category name</label>
            <input
              className="admin-input"
              placeholder="e.g. Seasonal Arrangements"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <label className="admin-field-label">Description (optional)</label>
            <input
              className="admin-input"
              placeholder="Short description…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <button type="submit" className="admin-submit-btn" disabled={submitting}>
              <Plus size={15} strokeWidth={2.5} />
              {submitting ? 'Adding…' : 'Add category'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="admin-card">
          <p className="admin-card-title">
            All categories
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
              {categories.length}
            </span>
          </p>

          {loading ? (
            <div className="admin-spinner-wrap" style={{ padding: '32px 0' }}>
              <div className="admin-spinner" />
            </div>
          ) : categories.length === 0 ? (
            <p className="cat-empty">No categories yet</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="cat-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="cat-icon">
                    <FolderOpen size={16} strokeWidth={1.6} />
                  </div>
                  <div>
                    <p className="cat-name">{cat.name}</p>
                    {cat.description && <p className="cat-desc">{cat.description}</p>}
                  </div>
                </div>
                <span className="cat-id-badge">
                  <Hash size={9} strokeWidth={2.5} style={{ display: 'inline', marginRight: 1 }} />
                  {cat.id}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </AdminLayout>
  );
}