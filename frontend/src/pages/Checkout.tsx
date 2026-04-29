import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banknote, CreditCard, Wallet, Check, X, ArrowRight, Tag, Gift, Truck,
} from 'lucide-react';
import { getCart, validateCoupon, validateGiftCard, placeOrder } from '../services/api';
import type { Cart, CouponResponse, GiftCardResponse } from '../types/shop';

const PAYMENT_METHODS = [
  {
    value: 'cash',
    label: 'Cash on Delivery',
    icon:  <Banknote  size={20} strokeWidth={1.6} />,
    desc:  'Pay when your blooms arrive',
  },
  {
    value: 'cib',
    label: 'CIB Card',
    icon:  <CreditCard size={20} strokeWidth={1.6} />,
    desc:  'Secure card payment',
  },
  {
    value: 'edahabia',
    label: 'Edahabia Card',
    icon:  <Wallet size={20} strokeWidth={1.6} />,
    desc:  'Pay with Edahabia',
  },
];

export default function Checkout() {
  const navigate = useNavigate();

  const [cart,          setCart]          = useState<Cart | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [couponCode,    setCouponCode]    = useState('');
  const [giftCardCode,  setGiftCardCode]  = useState('');
  const [couponData,    setCouponData]    = useState<CouponResponse | null>(null);
  const [giftCardData,  setGiftCardData]  = useState<GiftCardResponse | null>(null);
  const [couponError,   setCouponError]   = useState('');
  const [giftCardError, setGiftCardError] = useState('');
  const [placing,       setPlacing]       = useState(false);
  const [orderError,    setOrderError]    = useState('');

  useEffect(() => {
    getCart()
      .then((res) => setCart(res.data))
      .catch(() => navigate('/login'));
  }, []);

  const originalTotal  = Number(cart?.cart_total ?? 0);
  const discountAmount = couponData ? originalTotal - Number(couponData.discounted_total) : 0;
  const afterCoupon    = originalTotal - discountAmount;
  const giftCardAmount = giftCardData
    ? Math.min(Number(giftCardData.remaining_balance), afterCoupon)
    : 0;
  const finalTotal = Math.max(afterCoupon - giftCardAmount, 0);

  const handleValidateCoupon = async () => {
    setCouponError(''); setCouponData(null);
    try {
      const res = await validateCoupon(couponCode, originalTotal);
      setCouponData(res.data);
    } catch (err: any) {
      setCouponError(err.response?.data?.error ?? 'Invalid coupon');
    }
  };

  const handleValidateGiftCard = async () => {
    setGiftCardError(''); setGiftCardData(null);
    try {
      const res = await validateGiftCard(giftCardCode);
      setGiftCardData(res.data);
    } catch (err: any) {
      setGiftCardError(err.response?.data?.error ?? 'Invalid gift card');
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.active_items.length === 0) return;
    setPlacing(true); setOrderError('');
    try {
      const items = cart.active_items.map((item) => ({
        product_id: item.product,
        quantity:   item.quantity,
      }));
      const res = await placeOrder({
        items,
        coupon_code:    couponData   ? couponCode   : undefined,
        gift_card_code: giftCardData ? giftCardCode : undefined,
        payment_method: paymentMethod,
      });
      navigate(`/orders/${res.data.id}`);
    } catch (err: any) {
      setOrderError(err.response?.data?.error ?? 'Failed to place order. Try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap');

        :root {
          --coral:    #ff7e6b;
          --mint:     #d4f0c0;
          --cream:    #fffaf5;
          --charcoal: #1e1e1e;
          --muted:    #9a9490;
          --border:   #ede6de;
        }

        .co-page {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Outfit', sans-serif;
        }
        .co-main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 32px 80px;
        }

        /* ── Header ── */
        .co-page-header { margin-bottom: 36px; }
        .co-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--mint);
          color: #3a7d44;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 11px;
          border-radius: 100px;
          margin-bottom: 10px;
        }
        .co-title {
          font-family: 'Fraunces', serif;
          font-size: 2.4rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .co-title strong { font-style: normal; font-weight: 500; color: var(--coral); }

        /* ── Loading ── */
        .co-loading {
          text-align: center;
          padding: 100px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .co-spinner {
          display: inline-block;
          width: 34px; height: 34px;
          border: 2.5px solid var(--border);
          border-top-color: var(--coral);
          border-radius: 50%;
          animation: cospin 0.8s linear infinite;
        }
        @keyframes cospin { to { transform: rotate(360deg); } }
        .co-loading-text {
          font-family: 'Fraunces', serif;
          font-size: 1.1rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
        }

        /* ── Layout ── */
        .co-layout {
          display: flex;
          gap: 28px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .co-left  { flex: 2; min-width: 300px; display: flex; flex-direction: column; gap: 16px; }
        .co-right { flex: 1; min-width: 280px; }

        /* ── Section cards ── */
        .co-section {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 22px 24px;
        }
        .co-section-title {
          font-family: 'Fraunces', serif;
          font-size: 1rem;
          font-weight: 400;
          font-style: italic;
          color: var(--charcoal);
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }

        /* ── Payment method buttons ── */
        .co-payment-grid { display: flex; flex-direction: column; gap: 9px; }
        .co-payment-btn {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1.5px solid var(--border);
          background: #fff;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          font-family: 'Outfit', sans-serif;
        }
        .co-payment-btn:hover {
          border-color: #d8d0c8;
          background: #fdf9f4;
        }
        .co-payment-btn.active {
          border-color: var(--charcoal);
          background: #fdf9f4;
          box-shadow: 0 0 0 3px rgba(30,30,30,0.06);
        }
        .co-payment-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: var(--cream);
          border: 1.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--muted);
          transition: border-color 0.18s, color 0.18s, background 0.18s;
        }
        .co-payment-btn.active .co-payment-icon {
          background: #f5efe8;
          border-color: #d8cec4;
          color: var(--charcoal);
        }
        .co-payment-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .co-payment-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--charcoal);
          letter-spacing: 0.01em;
        }
        .co-payment-desc {
          font-size: 0.73rem;
          color: var(--muted);
          font-weight: 300;
        }
        .co-payment-check {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: transparent;
          flex-shrink: 0;
          transition: all 0.18s;
        }
        .co-payment-btn.active .co-payment-check {
          background: var(--charcoal);
          border-color: var(--charcoal);
          color: #fff;
        }

        /* ── Code inputs ── */
        .co-input-row {
          display: flex;
          gap: 8px;
        }
        .co-input {
          flex: 1;
          padding: 10px 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: var(--charcoal);
          background: var(--cream);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          letter-spacing: 0.04em;
        }
        .co-input:focus {
          border-color: var(--coral);
          box-shadow: 0 0 0 3px rgba(255,126,107,0.12);
          background: #fff;
        }
        .co-input::placeholder { color: #d0c8c0; letter-spacing: 0; }

        .co-apply-btn {
          padding: 10px 18px;
          background: var(--charcoal);
          color: var(--cream);
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s;
          white-space: nowrap;
        }
        .co-apply-btn:hover {
          background: #2e2e2e;
          transform: translateY(-1px);
        }

        .co-feedback {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 10px;
          padding: 9px 13px;
          border-radius: 9px;
          font-size: 0.78rem;
          font-weight: 400;
        }
        .co-feedback.error {
          background: #fff2f0;
          border-left: 3px solid var(--coral);
          color: #c05040;
        }
        .co-feedback.success {
          background: #f0faf0;
          border-left: 3px solid #6abf6e;
          color: #3a7d44;
        }

        /* ── Summary card ── */
        .co-summary-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 18px;
          padding: 24px;
          position: sticky;
          top: 80px;
        }
        .co-summary-items { margin-bottom: 4px; }
        .co-summary-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          color: var(--muted);
          font-weight: 300;
          margin-bottom: 8px;
        }
        .co-summary-item-name {
          flex: 1;
          padding-right: 10px;
        }
        .co-summary-divider {
          border: none;
          border-top: 1.5px solid var(--border);
          margin: 14px 0;
        }
        .co-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.83rem;
          color: var(--muted);
          font-weight: 300;
          margin-bottom: 9px;
        }
        .co-summary-row.discount { color: #5aad5e; }
        .co-summary-total {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 20px;
        }
        .co-total-label {
          font-size: 0.83rem;
          font-weight: 600;
          color: var(--charcoal);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .co-total-value {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--charcoal);
          letter-spacing: -0.02em;
        }
        .co-total-value span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 300;
          color: var(--muted);
          margin-left: 3px;
        }

        .co-order-error {
          background: #fff2f0;
          border-left: 3px solid var(--coral);
          color: #c05040;
          font-size: 0.78rem;
          padding: 9px 13px;
          border-radius: 8px;
          margin-bottom: 14px;
        }

        .co-place-btn {
          width: 100%;
          padding: 14px;
          background: var(--charcoal);
          color: var(--cream);
          border: none;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.12s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .co-place-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          transition: left 0.45s;
        }
        .co-place-btn:hover:not(:disabled)::after { left: 160%; }
        .co-place-btn:hover:not(:disabled) {
          background: #2e2e2e;
          box-shadow: 0 6px 20px rgba(30,30,30,0.2);
          transform: translateY(-1px);
        }
        .co-place-btn:disabled { background: #d8d0c8; color: #b0a89e; cursor: not-allowed; }

        .co-place-note {
          text-align: center;
          font-size: 0.7rem;
          color: #c0b8b0;
          font-weight: 300;
          margin-top: 10px;
          line-height: 1.5;
        }

        .co-delivery-note {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px;
          background: #f0faf0;
          border-radius: 10px;
          border: 1px solid #c8e8c8;
          font-size: 0.76rem;
          color: #3a7d44;
          font-weight: 400;
          margin-bottom: 16px;
        }

        @media (max-width: 680px) {
          .co-main { padding: 28px 16px 60px; }
          .co-title { font-size: 1.9rem; }
          .co-layout { flex-direction: column; }
        }
      `}</style>

      <div className="co-page">
        {!cart ? (
          <div className="co-loading">
            <div className="co-spinner" />
            <p className="co-loading-text">Preparing your checkout…</p>
          </div>
        ) : (
          <main className="co-main">

            <div className="co-page-header">
              <div className="co-eyebrow">Almost there</div>
              <h1 className="co-title">
                Complete your <strong>order</strong>
              </h1>
            </div>

            <div className="co-layout">

              {/* ── Left column ── */}
              <div className="co-left">

                {/* Payment Method */}
                <div className="co-section">
                  <p className="co-section-title">How would you like to pay?</p>
                  <div className="co-payment-grid">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.value}
                        className={`co-payment-btn${paymentMethod === m.value ? ' active' : ''}`}
                        onClick={() => setPaymentMethod(m.value)}
                      >
                        <div className="co-payment-icon">{m.icon}</div>
                        <div className="co-payment-text">
                          <span className="co-payment-label">{m.label}</span>
                          <span className="co-payment-desc">{m.desc}</span>
                        </div>
                        <div className="co-payment-check">
                          {paymentMethod === m.value && <Check size={11} strokeWidth={3} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coupon */}
                <div className="co-section">
                  <p className="co-section-title">
                    <Tag size={14} strokeWidth={2} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--muted)' }} />
                    Have a coupon?
                  </p>
                  <div className="co-input-row">
                    <input
                      className="co-input"
                      placeholder="e.g. SPRING20"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponData(null); setCouponError(''); }}
                    />
                    <button className="co-apply-btn" onClick={handleValidateCoupon}>
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <div className="co-feedback error">
                      <X size={13} strokeWidth={2.5} /> {couponError}
                    </div>
                  )}
                  {couponData && (
                    <div className="co-feedback success">
                      <Check size={13} strokeWidth={2.5} />
                      {couponData.coupon.code} — you save {Number(couponData.you_save).toLocaleString()} DZD
                    </div>
                  )}
                </div>

                {/* Gift Card */}
                <div className="co-section">
                  <p className="co-section-title">
                    <Gift size={14} strokeWidth={2} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--muted)' }} />
                    Got a gift card?
                  </p>
                  <div className="co-input-row">
                    <input
                      className="co-input"
                      placeholder="e.g. GIFT2025"
                      value={giftCardCode}
                      onChange={(e) => { setGiftCardCode(e.target.value); setGiftCardData(null); setGiftCardError(''); }}
                    />
                    <button className="co-apply-btn" onClick={handleValidateGiftCard}>
                      Apply
                    </button>
                  </div>
                  {giftCardError && (
                    <div className="co-feedback error">
                      <X size={13} strokeWidth={2.5} /> {giftCardError}
                    </div>
                  )}
                  {giftCardData && (
                    <div className="co-feedback success">
                      <Check size={13} strokeWidth={2.5} />
                      Gift card applied — {Number(giftCardData.remaining_balance).toLocaleString()} DZD available
                    </div>
                  )}
                </div>

              </div>

              {/* ── Right column — Summary ── */}
              <div className="co-right">
                <div className="co-summary-card">
                  <p className="co-section-title">Order summary</p>

                  <div className="co-summary-items">
                    {cart.active_items.map((item) => (
                      <div key={item.id} className="co-summary-item">
                        <span className="co-summary-item-name">
                          {item.product_name} × {item.quantity}
                        </span>
                        <span>{Number(item.subtotal).toLocaleString()} DZD</span>
                      </div>
                    ))}
                  </div>

                  <hr className="co-summary-divider" />

                  <div className="co-summary-row">
                    <span>Subtotal</span>
                    <span>{originalTotal.toLocaleString()} DZD</span>
                  </div>
                  <div className="co-summary-row">
                    <span>Delivery</span>
                    <span style={{ color: '#5aad5e', fontWeight: 500 }}>Free</span>
                  </div>

                  {couponData && (
                    <div className="co-summary-row discount">
                      <span>Coupon ({couponData.coupon.code})</span>
                      <span>− {discountAmount.toLocaleString()} DZD</span>
                    </div>
                  )}
                  {giftCardData && (
                    <div className="co-summary-row discount">
                      <span>Gift card</span>
                      <span>− {giftCardAmount.toLocaleString()} DZD</span>
                    </div>
                  )}

                  <hr className="co-summary-divider" />

                  <div className="co-summary-total">
                    <span className="co-total-label">Total</span>
                    <span className="co-total-value">
                      {finalTotal.toLocaleString()}
                      <span>DZD</span>
                    </span>
                  </div>

                  <div className="co-delivery-note">
                    <Truck size={14} strokeWidth={2} />
                    Free delivery included
                  </div>

                  {orderError && (
                    <div className="co-order-error">{orderError}</div>
                  )}

                  <button
                    className="co-place-btn"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                  >
                    {placing ? 'Placing your order…' : (
                      <>Place order <ArrowRight size={16} strokeWidth={2.5} /></>
                    )}
                  </button>

                  <p className="co-place-note">
                    By placing your order you agree to our terms &amp; conditions.
                  </p>
                </div>
              </div>

            </div>
          </main>
        )}
      </div>
    </>
  );
}