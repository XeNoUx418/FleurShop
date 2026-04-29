import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, User, ShieldCheck } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { getCart } from '../services/api';
import logo from '../pages/login_logo.png';

interface TokenPayload { role: string; }

export default function Navbar() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [scrolled,  setScrolled]  = useState(false);
  const [isAdmin,   setIsAdmin]   = useState(false);

  useEffect(() => {
    getCart()
      .then((res) => setCartCount(res.data.active_items?.length ?? 0))
      .catch(() => setCartCount(0));
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = jwtDecode<TokenPayload>(token);
        setIsAdmin(payload.role === 'admin');
      } catch {}
    }
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const PAGE_TITLES: Record<string, string> = {
    '/shop':     'Shop',
    '/cart':     'My Cart',
    '/orders':   'My Orders',
    '/profile':  'My Profile',
    '/checkout': 'Checkout',
  };
  const baseRoute = '/' + location.pathname.split('/')[1];
  const pageTitle = PAGE_TITLES[baseRoute] ?? '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,300&family=Outfit:wght@300;400;500;600&display=swap');
        :root {
          --coral:    #ff7e6b;
          --mint:     #d4f0c0;
          --cream:    #fffaf5;
          --charcoal: #1e1e1e;
          --muted:    #9a9490;
          --border:   #ede6de;
          --amber:    #c8880c;
          --amber-lt: rgba(200,136,12,0.22);
        }

        /* 3-column grid */
        .nav-bar {
          position: sticky; top: 0; z-index: 100;
          height: 62px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 22px;
          background: rgba(255, 250, 245, 0.93);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: none;
          font-family: 'Outfit', sans-serif;
          transition: box-shadow 0.25s;
        }
        .nav-bar.scrolled {
          box-shadow: 0 2px 22px rgba(30,20,10,0.08), 0 1px 0 rgba(200,136,12,0.12);
        }

        /* Left */
        .nav-left { display: flex; align-items: center; gap: 7px; }

        /* Center brand */
        .nav-center {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none;
          padding: 6px 16px; border-radius: 100px;
          transition: background 0.18s;
        }
        .nav-center:hover { background: rgba(200,136,12,0.07); }

        .nav-logo-circle {
          width: 28px; height: 28px;
          border-radius: 50%; background: #11111100;
          overflow: hidden; flex-shrink: 0;
          border: 1.5px solid #2a2a2a00;
        }
        .nav-logo-circle img { width:100%; height:100%; object-fit:cover; display:block; }

        .nav-brand-name {
          font-family: 'Fraunces', serif;
          font-size: 1.05rem; font-weight: 300; font-style: italic;
          color: var(--charcoal); white-space: nowrap; letter-spacing: -0.01em;
        }
        .nav-brand-name strong {
          font-style: normal; font-weight: 700;
          color: var(--coral);
        }

        /* Right */
        .nav-right { display: flex; align-items: center; gap: 7px; justify-content: flex-end; }

        /* Page title (inner pages) */
        .nav-page-title {
          font-family: 'Fraunces', serif;
          font-size: 0.84rem; font-weight: 300; font-style: italic;
          color: var(--muted); letter-spacing: -0.01em;
          white-space: nowrap;
        }

        /* Admin pill */
        .nav-admin-link {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 100px;
          border: 1.5px solid #f0d8f8; background: #faf0ff;
          font-family: 'Outfit', sans-serif; font-size: 0.73rem;
          font-weight: 600; color: #8b45b0; text-decoration: none;
          transition: all 0.18s; white-space: nowrap;
        }
        .nav-admin-link:hover { border-color:#8b45b0; color:#6a2090; background:#f3e0ff; }

        /* Orders pill */
        .nav-orders-link {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 100px;
          border: 1.5px solid var(--border); background: #fff;
          font-family: 'Outfit', sans-serif; font-size: 0.73rem;
          font-weight: 500; color: var(--muted); text-decoration: none;
          transition: all 0.18s; white-space: nowrap;
        }
        .nav-orders-link:hover { border-color:var(--charcoal); color:var(--charcoal); background:#faf6f1; }

        /* Icon buttons */
        .nav-icon-btn {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          border: 1.5px solid var(--border); text-decoration: none;
          transition: transform 0.15s, border-color 0.18s, background 0.18s;
          color: var(--charcoal);
        }
        .nav-cart-btn { background: #fff5f2; color: #c05040; }
        .nav-cart-btn:hover { background:#ffe8e2; border-color:var(--coral); transform:scale(1.06); color:var(--coral); }
        .nav-profile-btn { background: #f2f5f2; color: #507850; }
        .nav-profile-btn:hover { background:#e4f0e4; border-color:#7abf7e; transform:scale(1.06); color:#3a7d44; }

        .nav-cart-badge {
          position: absolute; top: -4px; right: -4px;
          background: var(--coral); color: #fff;
          font-size: 10px; font-weight: 700;
          width: 17px; height: 17px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid #fffaf5; font-family: 'Outfit', sans-serif;
          animation: badge-pop 0.2s ease;
        }
        @keyframes badge-pop {
          0%{transform:scale(0.5)} 70%{transform:scale(1.15)} 100%{transform:scale(1)}
        }
      `}</style>

      <header className={`nav-bar${scrolled ? ' scrolled' : ''}`}>

        {/* Left */}
        <div className="nav-left">
          {isAdmin && (
            <Link to="/admin" className="nav-admin-link" aria-label="Admin">
              <ShieldCheck size={12} strokeWidth={2.5} /> Admin
            </Link>
          )}
          {pageTitle && baseRoute !== '/shop' ? (
            <span className="nav-page-title">{pageTitle}</span>
          ) : (
            <Link to="/orders" className="nav-orders-link" aria-label="My Orders">
              <Package size={13} strokeWidth={2} /> My Orders
            </Link>
          )}
        </div>

        {/* Center — brand */}
        <Link to="/shop" className="nav-center" aria-label="FleurShop home">
          <div className="nav-logo-circle">
            <img src={logo} alt="FleurShop" />
          </div>
          <span className="nav-brand-name">Fleur<strong>Shop</strong></span>
        </Link>

        {/* Right */}
        <div className="nav-right">
          <Link to="/cart" className="nav-icon-btn nav-cart-btn" aria-label="Cart">
            <ShoppingCart size={17} strokeWidth={1.8} />
            {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
          </Link>
          <Link to="/profile" className="nav-icon-btn nav-profile-btn" aria-label="Profile">
            <User size={17} strokeWidth={1.8} />
          </Link>
        </div>

      </header>
    </>
  );
}