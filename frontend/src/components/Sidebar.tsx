import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, ShoppingCart, Package,
  User, LogOut, Menu, X,
} from 'lucide-react';
import logo from '../pages/login_logo.png';

interface NavItem {
  to:    string;
  icon:  React.ReactNode;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/shop',    icon: <ShoppingBag  size={18} strokeWidth={1.8} />, label: 'Shop'    },
  { to: '/cart',    icon: <ShoppingCart size={18} strokeWidth={1.8} />, label: 'Cart'    },
  { to: '/orders',  icon: <Package      size={18} strokeWidth={1.8} />, label: 'Orders'  },
  { to: '/profile', icon: <User         size={18} strokeWidth={1.8} />, label: 'Profile' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,300&family=Outfit:wght@300;400;500;600&display=swap');

        :root {
          --coral:    #ff7e6b;
          --cream:    #fffaf5;
          --charcoal: #1e1e1e;
          --muted:    #9a9490;
          --border:   #ede6de;
        }

        .sidebar {
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          z-index: 200;
          display: flex;
          flex-direction: column;
          background: rgba(255, 250, 245, 0.93);
          border-right: none;
          font-family: 'Outfit', sans-serif;
          width: 64px;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.3s;
          overflow: hidden;
        }
        .sidebar.expanded {
          width: 224px;
          box-shadow: 6px 0 32px rgba(30, 20, 10, 0.08);
        }

        /* ── Top bar: toggle + brand ── */
        .sidebar-topbar {
          height: 62px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          border-bottom: none;
          overflow: hidden;
        }

        /* Toggle occupies fixed 64px slot so icon never shifts */
        .sidebar-toggle {
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
        .sidebar-toggle:hover { background: #faf6f1; }

        /* Brand area slides in */
        .sidebar-brand {
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
        .sidebar.expanded .sidebar-brand {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }

        /* Dark circle — black bg of logo blends in */
        .sidebar-logo {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: #11111100;
          overflow: hidden;
          flex-shrink: 0;
          border: 1.5px solid #2a2a2a00;
        }
        .sidebar-logo img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          background: #ffffff00;
        }

        .sidebar-brand-name {
          font-family: 'Fraunces', serif;
          font-size: 1.05rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          white-space: nowrap;
          letter-spacing: -0.01em;
        }
        .sidebar-brand-name strong {
          font-style: normal;
          font-weight: 500;
          color: var(--coral);
        }

        /* ── Nav ── */
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 10px 0;
          gap: 2px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 20px;
          text-decoration: none;
          position: relative;
          transition: background 0.16s;
          color: var(--muted);
        }
        .sidebar-link:hover  { background: #faf6f1; color: var(--charcoal); }
        .sidebar-link.active { background: #faf6f1; color: var(--charcoal); }
        .sidebar-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 22%; bottom: 22%;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: var(--coral);
        }

        .nav-icon-wrap {
          width: 24px; height: 24px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-label {
          font-size: 0.84rem;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.18s 0.06s, transform 0.18s 0.06s;
          letter-spacing: 0.01em;
        }
        .sidebar.expanded .nav-label {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── Divider ── */
        .sidebar-divider {
          height: 1px;
          background: rgba(255, 250, 245, 0.93);
          margin: 6px 16px;
          flex-shrink: 0;
        }

        /* ── Logout ── */
        .sidebar-bottom { padding: 10px 0 22px; flex-shrink: 0; }

        .sidebar-logout {
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
        .sidebar-logout:hover { background: #fff5f3; color: var(--coral); }

        .logout-icon-wrap {
          width: 24px; height: 24px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-label {
          font-size: 0.84rem;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.18s 0.06s, transform 0.18s 0.06s;
        }
        .sidebar.expanded .logout-label {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>

      <aside className={`sidebar${expanded ? ' expanded' : ''}`}>

        {/* Top bar */}
        <div className="sidebar-topbar">
          <button
            className="sidebar-toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-label="Toggle navigation"
          >
            {expanded
              ? <X    size={18} strokeWidth={1.8} />
              : <Menu size={18} strokeWidth={1.8} />
            }
          </button>

          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <img src={logo} alt="FleurShop" />
            </div>
            <span className="sidebar-brand-name">
              Fleur<strong>Shop</strong>
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              <span className="nav-icon-wrap">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-divider" />

        {/* Logout */}
        <div className="sidebar-bottom">
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="logout-icon-wrap">
              <LogOut size={17} strokeWidth={1.8} />
            </span>
            <span className="logout-label">Sign out</span>
          </button>
        </div>

      </aside>
    </>
  );
}