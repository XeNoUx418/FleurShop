import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  getProducts, getCategories,
  adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
} from '../../services/api';
import type { Product, Category } from '../../types/shop';
import { Plus, Pencil, Trash2, X, Flower2 } from 'lucide-react';

const EMPTY_FORM = { name: '', description: '', price: 0, stock: 0, category: 0, image_url: '' };

export default function AdminProducts() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form,       setForm]       = useState<any>(EMPTY_FORM);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [showForm,   setShowForm]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');

  const fetchAll = async () => {
    const [p, c] = await Promise.all([getProducts(), getCategories()]);
    setProducts(p.data);
    setCategories(c.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await adminUpdateProduct(editingId, form);
    } else {
      await adminCreateProduct(form);
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    fetchAll();
  };

  const handleEdit = (product: Product) => {
    setForm({
      name:        product.name,
      description: product.description,
      price:       product.price,
      stock:       product.stock,
      category:    product.category,
      image_url:   product.image_url,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await adminDeleteProduct(id);
    fetchAll();
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <style>{`
        .prod-modal-backdrop {
          position: fixed; inset: 0; z-index: 400;
          background: rgba(30,20,10,0.35);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .prod-modal-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .prod-modal-card::-webkit-scrollbar { display: none; }
        .prod-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .prod-modal-title {
          font-family: 'Fraunces', serif;
          font-size: 1.4rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.01em;
        }
        .prod-modal-close {
          width: 34px; height: 34px;
          border-radius: 8px;
          border: 1.5px solid var(--border);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--muted);
          transition: all 0.16s;
        }
        .prod-modal-close:hover {
          border-color: var(--charcoal);
          color: var(--charcoal);
          background: #faf6f1;
        }
        .prod-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 14px;
        }
        .prod-form-actions {
          display: flex;
          gap: 10px;
          margin-top: 6px;
        }
        .prod-cancel-btn {
          flex: 1;
          padding: 11px;
          background: transparent;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.86rem;
          font-weight: 500;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.18s;
        }
        .prod-cancel-btn:hover {
          border-color: var(--charcoal);
          color: var(--charcoal);
        }
        .prod-save-btn {
          flex: 1;
        }

        /* Search bar */
        .prod-search {
          padding: 9px 14px 9px 36px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.84rem;
          color: var(--charcoal);
          background: #fff
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='%23c0b8b0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E")
            no-repeat 11px center;
          outline: none;
          min-width: 220px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .prod-search:focus {
          border-color: var(--coral);
          box-shadow: 0 0 0 3px rgba(255,126,107,0.12);
        }
        .prod-search::placeholder { color: #d0c8c0; }

        /* Product thumb */
        .prod-thumb {
          width: 40px; height: 40px;
          border-radius: 9px;
          background: linear-gradient(135deg, #fff0ea, #fde8f5);
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          color: #ddc8d8;
          flex-shrink: 0;
        }
        .prod-thumb img {
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .prod-name { font-weight: 600; font-size: 0.875rem; color: var(--charcoal); }
        .prod-desc-preview {
          font-size: 0.75rem;
          color: var(--muted);
          margin-top: 2px;
          font-weight: 300;
        }
        .prod-stock-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.03em;
        }
        .prod-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1.5px solid var(--border);
          background: transparent;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.16s;
          color: var(--muted);
        }
        .prod-edit-btn:hover  { border-color: var(--charcoal); color: var(--charcoal); background: #faf6f1; }
        .prod-del-btn:hover   { border-color: var(--coral); color: var(--coral); background: #fff5f3; }
        .prod-actions-cell { display: flex; gap: 7px; align-items: center; }
      `}</style>

      <div className="admin-page-header">
        <h1 className="admin-page-title">
          Manage <strong>products</strong>
        </h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="prod-search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="admin-btn-primary" onClick={openAdd}>
            <Plus size={15} strokeWidth={2.5} />
            Add Product
          </button>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="prod-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="prod-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="prod-modal-header">
              <p className="prod-modal-title">
                {editingId ? 'Edit product' : 'New product'}
              </p>
              <button className="prod-modal-close" onClick={() => setShowForm(false)}>
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="admin-field-label">Product name</label>
              <input
                className="admin-input"
                placeholder="e.g. Red Rose Bouquet"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <label className="admin-field-label">Description</label>
              <input
                className="admin-input"
                placeholder="Short description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />

              <div className="prod-form-row">
                <div>
                  <label className="admin-field-label">Price (DZD)</label>
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="admin-field-label">Stock</label>
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <label className="admin-field-label">Category</label>
              <select
                className="admin-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: Number(e.target.value) })}
                required
              >
                <option value={0} disabled>Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <label className="admin-field-label">Image URL (optional)</label>
              <input
                className="admin-input"
                placeholder="https://…"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />

              <div className="prod-form-actions">
                <button
                  type="button"
                  className="prod-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-submit-btn prod-save-btn">
                  {editingId ? 'Save changes' : 'Create product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="admin-spinner-wrap">
          <div className="admin-spinner" />
          <p className="admin-spinner-text">Loading products…</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th">Product</th>
                  <th className="admin-th">Category</th>
                  <th className="admin-th">Price</th>
                  <th className="admin-th">Stock</th>
                  <th className="admin-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isLow = p.stock < 5;
                  return (
                    <tr key={p.id} className="admin-tr">
                      <td className="admin-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="prod-thumb">
                            {p.image_url
                              ? <img src={p.image_url} alt={p.name} />
                              : <Flower2 size={18} strokeWidth={1.4} />
                            }
                          </div>
                          <div>
                            <p className="prod-name">{p.name}</p>
                            <p className="prod-desc-preview">
                              {p.description.substring(0, 48)}…
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="admin-td">
                        <span style={{
                          background: '#f5f0ea',
                          color: 'var(--muted)',
                          padding: '3px 9px',
                          borderRadius: 100,
                          fontSize: '0.72rem',
                          fontWeight: 500,
                        }}>
                          {p.category_name}
                        </span>
                      </td>
                      <td className="admin-td" style={{ fontWeight: 500 }}>
                        {Number(p.price).toLocaleString()} DZD
                      </td>
                      <td className="admin-td">
                        <span
                          className="prod-stock-badge"
                          style={{
                            background: isLow ? '#fce8ea' : '#eaf5ea',
                            color:      isLow ? '#b82030' : '#2a7a32',
                          }}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="admin-td">
                        <div className="prod-actions-cell">
                          <button
                            className="prod-action-btn prod-edit-btn"
                            onClick={() => handleEdit(p)}
                          >
                            <Pencil size={12} strokeWidth={2} />
                            Edit
                          </button>
                          <button
                            className="prod-action-btn prod-del-btn"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 size={12} strokeWidth={2} />
                            Delete
                          </button>
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