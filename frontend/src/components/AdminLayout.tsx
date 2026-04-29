import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Flower2, FolderOpen, Package,
  Tag, Gift, LogOut, ShieldCheck, Menu, X,
} from 'lucide-react';
import logo    from './login_logo.png';

const NAV_ITEMS = [
  { path: '/admin',            icon: <LayoutDashboard size={18} strokeWidth={1.8} />, label: 'Dashboard'  },
  { path: '/admin/products',   icon: <Flower2         size={18} strokeWidth={1.8} />, label: 'Products'   },
  { path: '/admin/categories', icon: <FolderOpen      size={18} strokeWidth={1.8} />, label: 'Categories' },
  { path: '/admin/orders',     icon: <Package         size={18} strokeWidth={1.8} />, label: 'Orders'     },
  { path: '/admin/coupons',    icon: <Tag             size={18} strokeWidth={1.8} />, label: 'Coupons'    },
  { path: '/admin/giftcards',  icon: <Gift            size={18} strokeWidth={1.8} />, label: 'Gift Cards' },
];

const SIDEBAR_COLLAPSED = 64;   // px
const SIDEBAR_EXPANDED  = 224;  // px

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/shop');
  };

  const sidebarWidth = expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --coral:    #ff7e6b;
          --mint:     #d4f0c0;
          --cream:    #fffaf5;
          --charcoal: #1e1e1e;
          --muted:    #9a9490;
          --border:   #ede6de;
          --admin-bg: #f7f4f0;
        }

        /* ── Shell ── */
        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: var(--admin-bg);
          font-family: 'Outfit', sans-serif;
        }

        /* ── Sidebar ── */
        .admin-sidebar {
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          z-index: 200;
          display: flex;
          flex-direction: column;
          background: rgba(255, 250, 245, 0.93);
          border-right: none;
          overflow: hidden;
          /* width driven by inline style so JS constant stays in sync */
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.3s;
        }
        .admin-sidebar.expanded {
          box-shadow: 6px 0 32px rgba(30, 20, 10, 0.08);
        }

        /* ── Top bar (toggle + brand) ── */
        .admin-topbar {
          height: 62px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          border-bottom: none;
          overflow: hidden;
        }

        /* Toggle — always 64px wide so icon never shifts */
        .admin-toggle {
          width: 64px;
          height: 62px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--charcoal);
          transition: background 0.16s;
        }
        .admin-toggle:hover { background: #faf6f1; }

        /* Brand — slides in */
        .admin-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-right: 16px;
          flex: 1;
          min-width: 0;
          opacity: 0;
          transform: translateX(-10px);
          transition: opacity 0.18s 0.1s, transform 0.18s 0.1s;
          pointer-events: none;
        }
        .admin-sidebar.expanded .admin-brand {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }

        /* Dark circle — pure black logo bg blends in */
        .admin-logo-circle {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: #ffffff00;
          overflow: hidden;
          flex-shrink: 0;
          border: 1.5px solid #ffffff00;
        }
        .admin-logo-circle img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          background: #ffffff00;
        }

        .admin-brand-name {
          font-family: 'Fraunces', serif;
          font-size: 1.05rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          white-space: nowrap;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }
        .admin-brand-name strong {
          font-style: normal;
          font-weight: 500;
          color: var(--coral);
        }

        /* Admin badge below brand name */
        .admin-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #fff5f3;
          border: 1px solid #f0d8d4;
          color: var(--coral);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 100px;
          margin-top: 3px;
          width: fit-content;
        }

        /* ── Nav ── */
        .admin-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 10px 0;
          gap: 2px;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 20px;
          text-decoration: none;
          position: relative;
          transition: background 0.16s;
          color: var(--muted);
        }
        .admin-nav-item:hover  { background: #faf6f1; color: var(--charcoal); }
        .admin-nav-item.active { background: #fff5f3; color: var(--coral); }
        .admin-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 22%; bottom: 22%;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: var(--coral);
        }

        .admin-nav-icon {
          width: 24px; height: 24px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-nav-label {
          font-size: 0.855rem;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.18s 0.06s, transform 0.18s 0.06s;
          letter-spacing: 0.01em;
        }
        .admin-sidebar.expanded .admin-nav-label {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── Divider ── */
        .admin-sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 6px 16px;
          flex-shrink: 0;
        }

        /* ── Logout ── */
        .admin-sidebar-bottom { padding: 10px 0 22px; flex-shrink: 0; }

        .admin-logout-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 20px;
          width: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          color: #c09090;
          transition: background 0.16s, color 0.16s;
        }
        .admin-logout-btn:hover { background: #fff5f3; color: var(--coral); }

        .admin-logout-icon {
          width: 24px; height: 24px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-logout-label {
          font-size: 0.84rem;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.18s 0.06s, transform 0.18s 0.06s;
        }
        .admin-sidebar.expanded .admin-logout-label {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── Main content area — shifts with sidebar ── */
        .admin-main {
          flex: 1;
          padding: 36px 36px 60px;
          overflow-y: auto;
          min-width: 0;
          /* margin-left is set via inline style — driven by JS constant */
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* ── Reusable page components ── */
        .admin-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 14px;
        }
        .admin-page-title {
          font-family: 'Fraunces', serif;
          font-size: 2rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .admin-page-title strong {
          font-style: normal;
          font-weight: 500;
          color: var(--coral);
        }

        .admin-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 20px;
          background: var(--charcoal);
          color: var(--cream);
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.84rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
        }
        .admin-btn-primary:hover {
          background: #2e2e2e;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(30,30,30,0.18);
        }

        .admin-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 24px;
        }
        .admin-card-title {
          font-family: 'Fraunces', serif;
          font-size: 1rem;
          font-weight: 400;
          font-style: italic;
          color: var(--charcoal);
          margin-bottom: 18px;
          letter-spacing: -0.01em;
        }

        .admin-field-label {
          display: block;
          font-size: 0.67rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #c0b8b0;
          margin-bottom: 5px;
        }
        .admin-input {
          width: 100%;
          padding: 10px 14px;
          margin-bottom: 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.86rem;
          color: var(--charcoal);
          background: var(--cream);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .admin-input:focus {
          border-color: var(--coral);
          box-shadow: 0 0 0 3px rgba(255,126,107,0.12);
          background: #fff;
        }
        .admin-input::placeholder { color: #d0c8c0; }

        .admin-submit-btn {
          width: 100%;
          padding: 12px;
          background: var(--charcoal);
          color: var(--cream);
          border: none;
          border-radius: 11px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: background 0.18s, transform 0.12s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }
        .admin-submit-btn:hover {
          background: #2e2e2e;
          transform: translateY(-1px);
        }

        .admin-table-wrap {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }
        .admin-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .admin-table-scroll { overflow-x: auto; }
        .admin-th {
          padding: 12px 18px;
          text-align: left;
          font-size: 0.67rem;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: #faf6f1;
          border-bottom: 1.5px solid var(--border);
          white-space: nowrap;
        }
        .admin-td {
          padding: 14px 18px;
          font-size: 0.855rem;
          color: var(--charcoal);
          border-bottom: 1px solid #f5f0ea;
          vertical-align: middle;
        }
        .admin-tr:last-child .admin-td { border-bottom: none; }
        .admin-tr:hover .admin-td { background: #fdf9f4; }

        .admin-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .admin-status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .admin-spinner-wrap {
          text-align: center;
          padding: 60px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .admin-spinner {
          width: 32px; height: 32px;
          border: 2.5px solid var(--border);
          border-top-color: var(--coral);
          border-radius: 50%;
          animation: aspin 0.8s linear infinite;
        }
        @keyframes aspin { to { transform: rotate(360deg); } }
        .admin-spinner-text {
          font-family: 'Fraunces', serif;
          font-size: 0.95rem;
          font-weight: 300;
          font-style: italic;
          color: var(--muted);
        }
      `}</style>

      <div className="admin-shell">

        {/* ── Sidebar ── */}
        <aside
          className={`admin-sidebar${expanded ? ' expanded' : ''}`}
          style={{ width: sidebarWidth }}
        >
          {/* Top bar */}
          <div className="admin-topbar">
            <button
              className="admin-toggle"
              onClick={() => setExpanded((v) => !v)}
              aria-label="Toggle navigation"
            >
              {expanded
                ? <X    size={18} strokeWidth={1.8} />
                : <Menu size={18} strokeWidth={1.8} />
              }
            </button>

            <div className="admin-brand">
              <div className="admin-logo-circle">
                <img src={logo} alt="FleurShop" />
              </div>
              <div>
                <div className="admin-brand-name">
                  Fleur<strong>Shop</strong>
                </div>
                <div className="admin-brand-badge">
                  <ShieldCheck size={8} strokeWidth={2.5} />
                  Admin
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="admin-nav">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`admin-nav-item${active ? ' active' : ''}`}
                >
                  <span className="admin-nav-icon">{item.icon}</span>
                  <span className="admin-nav-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="admin-sidebar-divider" />

          {/* Logout */}
          <div className="admin-sidebar-bottom">
            <button className="admin-logout-btn" onClick={handleLogout}>
              <span className="admin-logout-icon">
                <LogOut size={17} strokeWidth={1.8} />
              </span>
              <span className="admin-logout-label">Sign out</span>
            </button>
          </div>
        </aside>

        {/* ── Main — margin shifts with sidebar ── */}
        <main
          className="admin-main"
          style={{ marginLeft: sidebarWidth }}
        >
          {children}
        </main>

      </div>
    </>
  );
}