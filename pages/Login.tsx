import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import type { LoginData } from '../types/auth';
import logo    from './login_logo.png';
import flowers from './flowers.png';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState<LoginData>({ username: '', password: '' });
  const [error, setError]     = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [focused, setFocused] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(form);
      localStorage.setItem('access_token',  res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      navigate('/shop');
    } catch {
      setError("Hmm, those credentials don't match. Try again?");
    } finally {
      setLoading(false);
    }
  };

  // Soft transparent strips — each one echoes a flower from the illustration
  const strips = [
    'rgba(232, 123, 176, 0.17)', // pink flower
    'rgba(185, 146, 212, 0.19)', // purple flower
    'rgba(244, 133, 106, 0.20)', // coral / orange flower
    'rgba(245, 200,  66, 0.18)', // yellow flower
    'rgba( 91, 155, 212, 0.19)', // blue daisy
  ];

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
        }

        html, body, #root { height: 100%; overflow: hidden; }

        .login-root {
          display: flex;
          height: 100vh;
          font-family: 'Outfit', sans-serif;
          background: var(--cream);
          overflow: hidden;
        }

        /* ─────────── LEFT PANEL ─────────── */
        .login-left {
          flex: 0 0 450px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 32px 44px;
          background: var(--cream);
          position: relative;
          z-index: 2;
        }

        .login-brand { display: flex; align-items: center; gap: 10px; }
        .brand-logo {
          width: 34px; height: 34px;
          object-fit: cover;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .brand-name {
          font-family: 'Fraunces', serif;
          font-size: 1.15rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.01em;
        }
        .brand-name strong {
          font-style: normal;
          font-weight: 500;
          color: var(--coral);
        }

        .login-form-section { display: flex; flex-direction: column; }

        .pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--mint);
          color: #3a7d44;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 100px;
          width: fit-content;
          margin-bottom: 12px;
        }
        .pill-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #3a7d44;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }

        .login-heading {
          font-family: 'Fraunces', serif;
          font-size: 2.5rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          line-height: 1.1;
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }
        .login-heading strong {
          font-style: normal;
          font-weight: 500;
          color: var(--coral);
        }

        .login-sub {
          font-size: 0.81rem;
          color: var(--muted);
          font-weight: 300;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .field-wrap { position: relative; margin-bottom: 11px; }

        .field-label {
          display: block;
          font-size: 0.67rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #c0b8b0;
          margin-bottom: 5px;
          transition: color 0.2s;
        }
        .field-label.on { color: var(--coral); }

        .field-input {
          width: 100%;
          padding: 12px 15px;
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.88rem;
          color: var(--charcoal);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input:focus {
          border-color: var(--coral);
          box-shadow: 0 0 0 3.5px rgba(255,126,107,0.13);
        }
        .field-input::placeholder { color: #d8d0c8; }

        .row-between {
          display: flex;
          justify-content: flex-end;
          margin: 3px 0 20px;
        }
        .forgot-link {
          font-size: 0.75rem;
          color: var(--coral);
          text-decoration: none;
          font-weight: 500;
        }
        .forgot-link:hover { text-decoration: underline; }

        .error-msg {
          background: #fff2f0;
          border-left: 3px solid var(--coral);
          color: #c0504a;
          font-size: 0.78rem;
          padding: 9px 13px;
          border-radius: 8px;
          margin-bottom: 14px;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: var(--charcoal);
          color: var(--cream);
          border: none;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background 0.2s, transform 0.12s, box-shadow 0.2s;
          overflow: hidden;
          position: relative;
        }
        .submit-btn:hover:not(:disabled) {
          background: #2e2e2e;
          box-shadow: 0 6px 20px rgba(30,30,30,0.2);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .submit-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          transition: left 0.5s;
        }
        .submit-btn:hover::after { left: 160%; }

        .login-footer-text {
          font-size: 0.77rem;
          color: var(--muted);
          text-align: center;
          margin-top: 14px;
        }
        .login-footer-text a { color: var(--coral); text-decoration: none; font-weight: 500; }
        .login-footer-text a:hover { text-decoration: underline; }

        .login-contact { font-size: 0.71rem; color: #c0b8b0; text-align: center; }
        .login-contact a { color: var(--coral); text-decoration: none; }

        /* ─────────── RIGHT PANEL ─────────── */
        .login-right {
          flex: 1;
          position: relative;
          overflow: hidden;
          /* warm off-white base so strips read as tints, not muddy */
          background: #fdf9f4;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Vertical color strips ── */
        .strips-layer {
          position: absolute;
          inset: 0;
          display: flex;
          z-index: 0;
        }

        .strip {
          flex: 1;
          height: 100%;
        }

        /* hairline between strips so they read as distinct bands */
        .strip + .strip {
          border-left: 1px solid rgba(255, 255, 255, 0.55);
        }

        /* ── Content on top of strips ── */
        .right-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 32px;
          gap: 0;
        }

        .right-eyebrow {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(80, 55, 35, 0.4);
          margin-bottom: 8px;
        }

        .right-title {
          font-family: 'Fraunces', serif;
          font-size: 1.85rem;
          font-weight: 300;
          font-style: italic;
          color: rgba(40, 28, 18, 0.72);
          letter-spacing: -0.02em;
          text-align: center;
          line-height: 1.2;
          margin-bottom: 8px;
        }

        .right-rule {
          width: 34px;
          height: 1.5px;
          background: rgba(190, 140, 90, 0.3);
          border-radius: 2px;
          margin-bottom: 30px;
        }

        /*
          mix-blend-mode: multiply is the key trick:
          on a light background it blends the black areas of the PNG
          away so only the colourful flowers remain visible.
        */
        .flowers-img {
          width: 62%;
          max-width: 360px;
          min-width: 200px;
          object-fit: contain;
          mix-blend-mode: multiply;
          display: block;
          flex-shrink: 0;
        }

        /* ── Bottom caption ── */
        .right-bottom {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          z-index: 3;
          padding: 14px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .right-caption {
          font-size: 0.68rem;
          color: rgba(80, 55, 35, 0.35);
          font-weight: 300;
        }

        .swatch-row { display: flex; gap: 6px; align-items: center; }
        .swatch {
          width: 9px; height: 9px;
          border-radius: 50%;
        }

        @media (max-width: 780px) {
          .login-right { display: none; }
          .login-left  { flex: 1; max-width: 100%; }
        }
      `}</style>

      <div className="login-root">

        {/* ── LEFT ── */}
        <div className="login-left">
          <div className="login-brand">
            <img src={logo} alt="FleurShop" className="brand-logo" />
            <span className="brand-name">
              Fleur<strong>Shop</strong>
            </span>
          </div>

          <div className="login-form-section">
            <div className="pill-tag">
              <span className="pill-dot" />
              Spring collection is live
            </div>

            <h1 className="login-heading">
              Hey,<br />welcome <strong>back!</strong>
            </h1>
            <p className="login-sub">Sign in to browse this season's drops.</p>

            {error && <div className="error-msg">{error}</div>}

            <div className="field-wrap">
              <label className={`field-label ${focused === 'username' ? 'on' : ''}`}>Username</label>
              <input
                className="field-input"
                name="username"
                placeholder="your username"
                value={form.username}
                onChange={handleChange}
                onFocus={() => setFocused('username')}
                onBlur={() => setFocused('')}
                required
              />
            </div>

            <div className="field-wrap">
              <label className={`field-label ${focused === 'password' ? 'on' : ''}`}>Password</label>
              <input
                className="field-input"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                required
              />
            </div>

            <div className="row-between">
              <a href="/forgot-password" className="forgot-link">Forgot password?</a>
            </div>

            <button
              className="submit-btn"
              type="button"
              disabled={loading}
              onClick={handleSubmit as any}
            >
              {loading ? 'One sec…' : 'Let me in →'}
            </button>

            <p className="login-footer-text">
              New here? <Link to="/register">Create an account</Link>
            </p>
          </div>

          <div className="login-contact">
            Need help?&nbsp;<a href="mailto:fleurshop.support@gmail.com">fleurshop.support@gmail.com</a>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="login-right">

          {/* Soft color strips behind everything */}
          <div className="strips-layer">
            {strips.map((color, i) => (
              <div key={i} className="strip" style={{ background: color }} />
            ))}
          </div>

          <div className="right-content">
            <span className="right-eyebrow">handpicked with love</span>
            <h2 className="right-title">every bloom<br />tells a story</h2>
            <div className="right-rule" />

            <img
              src={flowers}
              alt="Illustrated spring flowers"
              className="flowers-img"
            />
          </div>

          <div className="right-bottom">
            <span className="right-caption">© 2026 FleurShop — Spring Collection</span>
            <div className="swatch-row">
              <div className="swatch" style={{ background: 'rgba(244,133,106,0.75)' }} />
              <div className="swatch" style={{ background: 'rgba(232,123,176,0.75)' }} />
              <div className="swatch" style={{ background: 'rgba(185,146,212,0.75)' }} />
              <div className="swatch" style={{ background: 'rgba(245,200, 66,0.75)' }} />
              <div className="swatch" style={{ background: 'rgba( 91,155,212,0.75)' }} />
            </div>
          </div>
        </div>

      </div>
    </>
  );
}