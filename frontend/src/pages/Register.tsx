import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import type { RegisterData } from '../types/auth';
import logo    from './login_logo.png';
import flower2 from './flower2.png';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterData>({
    username: '', email: '', password: '', phone: '', role: 'customer',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerUser(form);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.username?.[0] || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const strips = [
    'rgba(220,  80, 180, 0.17)',
    'rgba(130,  80, 200, 0.18)',
    'rgba(240, 165,  50, 0.20)',
    'rgba( 30, 140, 130, 0.17)',
    'rgba(130, 200, 220, 0.18)',
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
        .reg-root {
          display: flex; height: 100vh;
          font-family: 'Outfit', sans-serif;
          background: var(--cream); overflow: hidden;
        }
        .reg-left {
          flex: 0 0 450px;
          display: flex; flex-direction: column;
          /* allow the left column to scroll when content overflows */
          overflow-y: auto;
          overflow-x: hidden;
          padding: 32px 44px;
          background: var(--cream);
          position: relative; z-index: 2;
          /* hide scrollbar visually but keep it functional */
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .reg-left::-webkit-scrollbar { display: none; }
        /* give form section a gap at the bottom so contact doesn't crowd it */
        .reg-left-inner {
          display: flex;
          flex-direction: column;
          gap: 0;
          min-height: 100%;
        }
        .reg-brand { display: flex; align-items: center; gap: 10px; }
        .brand-logo { width: 34px; height: 34px; object-fit: cover; border-radius: 50%; flex-shrink: 0; }
        .brand-name {
          font-family: 'Fraunces', serif; font-size: 1.15rem;
          font-weight: 500; font-style: italic;
          color: var(--charcoal); letter-spacing: -0.01em;
        }
        .reg-form-section { display: flex; flex-direction: column; }
        .pill-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--mint); color: #3a7d44;
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 5px 12px; border-radius: 100px;
          width: fit-content; margin-bottom: 12px;
        }
        .pill-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #3a7d44;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        .reg-heading {
          font-family: 'Fraunces', serif; font-size: 2.4rem;
          font-weight: 300; font-style: italic;
          color: var(--charcoal); line-height: 1.1;
          margin-bottom: 6px; letter-spacing: -0.02em;
        }
        .reg-heading strong { font-style: normal; font-weight: 500; color: var(--coral); }
        .reg-sub { font-size: 0.81rem; color: var(--muted); font-weight: 300; margin-bottom: 22px; line-height: 1.5; }
        .field-wrap { position: relative; margin-bottom: 10px; }
        .field-label {
          display: block; font-size: 0.67rem; font-weight: 600;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: #c0b8b0; margin-bottom: 5px; transition: color 0.2s;
        }
        .field-label.on { color: var(--coral); }
        .field-input {
          width: 100%; padding: 11px 15px;
          background: #fff; border: 1.5px solid var(--border);
          border-radius: 12px; font-family: 'Outfit', sans-serif;
          font-size: 0.88rem; color: var(--charcoal); outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input:focus { border-color: var(--coral); box-shadow: 0 0 0 3.5px rgba(255,126,107,0.13); }
        .field-input::placeholder { color: #d8d0c8; }
        .error-msg {
          background: #fff2f0; border-left: 3px solid var(--coral);
          color: #c0504a; font-size: 0.78rem;
          padding: 9px 13px; border-radius: 8px; margin-bottom: 12px;
        }
        .submit-btn {
          width: 100%; padding: 13px;
          background: var(--charcoal); color: var(--cream);
          border: none; border-radius: 12px;
          font-family: 'Outfit', sans-serif; font-size: 0.88rem;
          font-weight: 600; letter-spacing: 0.04em;
          cursor: pointer; margin-top: 8px;
          transition: background 0.2s, transform 0.12s, box-shadow 0.2s;
          overflow: hidden; position: relative;
        }
        .submit-btn:hover:not(:disabled) {
          background: #2e2e2e;
          box-shadow: 0 6px 20px rgba(30,30,30,0.2);
          transform: translateY(-1px);
        }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .reg-switch { font-size: 0.77rem; color: var(--muted); text-align: center; margin-top: 12px; }
        .reg-switch a { color: var(--coral); text-decoration: none; font-weight: 500; }
        .reg-switch a:hover { text-decoration: underline; }
        .reg-contact { font-size: 0.71rem; color: #c0b8b0; text-align: center; }
        .reg-contact a { color: var(--coral); text-decoration: none; }

        /* ── Right ── */
        .reg-right {
          flex: 1; position: relative; overflow: hidden;
          background: #fdf9f4;
          display: flex; align-items: center; justify-content: center;
        }
        .strips-layer { position: absolute; inset: 0; display: flex; z-index: 0; }
        .strip { flex: 1; height: 100%; }
        .strip + .strip { border-left: 1px solid rgba(255,255,255,0.55); }
        .right-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          width: 100%; height: 100%; padding: 32px;
        }
        .right-eyebrow {
          font-size: 0.62rem; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(80,55,35,0.4); margin-bottom: 8px;
        }
        .right-title {
          font-family: 'Fraunces', serif; font-size: 1.85rem;
          font-weight: 300; font-style: italic;
          color: rgba(40,28,18,0.72); letter-spacing: -0.02em;
          text-align: center; line-height: 1.2; margin-bottom: 8px;
        }
        .right-rule {
          width: 34px; height: 1.5px;
          background: rgba(190,140,90,0.3);
          border-radius: 2px; margin-bottom: 26px;
        }
        .flowers-img {
          width: 62%; max-width: 360px; min-width: 200px;
          object-fit: contain; mix-blend-mode: multiply; display: block;
        }
        .right-bottom {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
          padding: 14px 32px; display: flex; align-items: center; justify-content: space-between;
        }
        .right-caption { font-size: 0.68rem; color: rgba(80,55,35,0.35); font-weight: 300; }
        .swatch-row { display: flex; gap: 6px; align-items: center; }
        .swatch { width: 9px; height: 9px; border-radius: 50%; }

        @media (max-width: 780px) {
          .reg-right { display: none; }
          .reg-left  { flex: 1; max-width: 100%; }
        }
      `}</style>

      <div className="reg-root">
        <div className="reg-left">
          <div className="reg-left-inner">
          <div className="reg-brand" style={{ marginBottom: 32 }}>
            <img src={logo} alt="FleurShop" className="brand-logo" />
            <span className="brand-name">FleurShop</span>
          </div>

          <div className="reg-form-section">
            <div className="pill-tag"><span className="pill-dot" /> Join the community</div>
            <h1 className="reg-heading">Let's get<br />you <strong>blooming.</strong></h1>
            <p className="reg-sub">Create your account — it only takes a minute.</p>

            {error && <div className="error-msg">{error}</div>}

            <div className="field-wrap">
              <label className={`field-label ${focused === 'username' ? 'on' : ''}`}>Username</label>
              <input className="field-input" name="username" placeholder="pick a username"
                value={form.username} onChange={handleChange}
                onFocus={() => setFocused('username')} onBlur={() => setFocused('')} required />
            </div>
            <div className="field-wrap">
              <label className={`field-label ${focused === 'email' ? 'on' : ''}`}>Email</label>
              <input className="field-input" name="email" type="email" placeholder="your@email.com"
                value={form.email} onChange={handleChange}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')} />
            </div>
            <div className="field-wrap">
              <label className={`field-label ${focused === 'phone' ? 'on' : ''}`}>
                Phone <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, fontSize: '0.65rem', color: '#d0c8c0' }}>(optional)</span>
              </label>
              <input className="field-input" name="phone" placeholder="+1 234 567 8900"
                value={form.phone} onChange={handleChange}
                onFocus={() => setFocused('phone')} onBlur={() => setFocused('')} />
            </div>
            <div className="field-wrap" style={{ marginBottom: 18 }}>
              <label className={`field-label ${focused === 'password' ? 'on' : ''}`}>Password</label>
              <input className="field-input" name="password" type="password" placeholder="••••••••"
                value={form.password} onChange={handleChange}
                onFocus={() => setFocused('password')} onBlur={() => setFocused('')} required />
            </div>

            <button className="submit-btn" type="button" disabled={loading}
              onClick={handleSubmit as any}>
              {loading ? 'Creating your account…' : 'Start blooming →'}
            </button>

            <p className="reg-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          </div>

          <div className="reg-contact" style={{ marginTop: 24, paddingBottom: 8 }}>
            Need help?&nbsp;<a href="mailto:fleurshop.support@gmail.com">fleurshop.support@gmail.com</a>
          </div>
          </div>{/* end reg-left-inner */}
        </div>

        <div className="reg-right">
          <div className="strips-layer">
            {strips.map((color, i) => (
              <div key={i} className="strip" style={{ background: color }} />
            ))}
          </div>
          <div className="right-content">
            <span className="right-eyebrow">crafted for every moment</span>
            <h2 className="right-title">your story starts<br />with a flower</h2>
            <div className="right-rule" />
            <img src={flower2} alt="Watercolour flowers" className="flowers-img" />
          </div>
          <div className="right-bottom">
            <span className="right-caption">© 2026 FleurShop — Spring Collection</span>
            <div className="swatch-row">
              <div className="swatch" style={{ background: 'rgba(220,80,180,0.75)' }} />
              <div className="swatch" style={{ background: 'rgba(130,80,200,0.75)' }} />
              <div className="swatch" style={{ background: 'rgba(240,165,50,0.75)' }} />
              <div className="swatch" style={{ background: 'rgba(30,140,130,0.75)' }} />
              <div className="swatch" style={{ background: 'rgba(130,200,220,0.75)' }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}