def get_base_template(content: str, title: str) -> str:
    """
    Base HTML email template with FleurShop branding.
    Matches the web UI: Fraunces serif headings, Outfit body,
    cream/coral/mint palette, clean bordered cards.
    """
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}

    body {{
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #f0ebe4;
      color: #1e1e1e;
      -webkit-font-smoothing: antialiased;
    }}

    .wrapper {{
      max-width: 580px;
      margin: 40px auto;
      background: #fffaf5;
      border-radius: 20px;
      overflow: hidden;
      border: 1.5px solid #ede6de;
    }}

    /* ── Rainbow stripe (matches Profile card) ── */
    .stripe {{
      height: 6px;
      background: linear-gradient(
        90deg,
        rgba(232,123,176,0.65),
        rgba(185,146,212,0.65),
        rgba(255,126,107,0.65),
        rgba(245,200, 66,0.65),
        rgba( 91,155,212,0.65)
      );
    }}

    /* ── Header ── */
    .header {{
      padding: 36px 44px 30px;
      border-bottom: 1.5px solid #ede6de;
      display: flex;
      align-items: center;
      gap: 14px;
    }}
    .brand-lockup {{
      display: flex;
      flex-direction: column;
      gap: 2px;
    }}
    .brand-name {{
      font-family: 'Fraunces', Georgia, serif;
      font-size: 22px;
      font-weight: 300;
      font-style: italic;
      color: #1e1e1e;
      letter-spacing: -0.02em;
      line-height: 1;
    }}
    .brand-name strong {{
      font-style: normal;
      font-weight: 500;
      color: #ff7e6b;
    }}
    .brand-tagline {{
      font-size: 11px;
      font-weight: 300;
      color: #9a9490;
      letter-spacing: 0.03em;
    }}

    /* ── Body ── */
    .body {{
      padding: 40px 44px;
    }}

    .eyebrow {{
      display: inline-block;
      background: #d4f0c0;
      color: #3a7d44;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 5px 12px;
      border-radius: 100px;
      margin-bottom: 14px;
    }}

    .greeting {{
      font-family: 'Fraunces', Georgia, serif;
      font-size: 28px;
      font-weight: 300;
      font-style: italic;
      color: #1e1e1e;
      letter-spacing: -0.02em;
      line-height: 1.15;
      margin-bottom: 14px;
    }}
    .greeting strong {{
      font-style: normal;
      font-weight: 500;
      color: #ff7e6b;
    }}

    .message {{
      font-size: 14px;
      font-weight: 300;
      color: #6a6460;
      line-height: 1.75;
      margin-bottom: 28px;
    }}

    /* ── Status badge ── */
    .status-badge {{
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 16px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      margin-bottom: 28px;
      border: 1px solid;
    }}
    .status-dot {{
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      display: inline-block;
    }}

    /* ── Order card ── */
    .order-card {{
      background: #ffffff;
      border: 1.5px solid #ede6de;
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 28px;
    }}
    .order-card-header {{
      padding: 14px 20px;
      border-bottom: 1.5px solid #ede6de;
      background: #fdf8f2;
    }}
    .order-card-title {{
      font-size: 10px;
      font-weight: 700;
      color: #9a9490;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }}
    .order-card-id {{
      font-family: 'Fraunces', Georgia, serif;
      font-size: 15px;
      font-weight: 400;
      font-style: italic;
      color: #1e1e1e;
      margin-top: 2px;
    }}
    .order-row {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid #f5f0ea;
      font-size: 13.5px;
    }}
    .order-row:last-child {{ border-bottom: none; }}
    .order-label {{
      color: #9a9490;
      font-weight: 300;
    }}
    .order-value {{
      font-weight: 500;
      color: #1e1e1e;
    }}
    .order-item-name {{
      color: #1e1e1e;
      font-weight: 400;
    }}
    .order-item-qty {{
      font-size: 11px;
      color: #9a9490;
      font-weight: 300;
      margin-top: 1px;
    }}

    /* ── Total row ── */
    .total-row {{
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 14px 20px;
      background: #fdf8f2;
      border-top: 1.5px solid #ede6de;
    }}
    .total-label {{
      font-size: 11px;
      font-weight: 700;
      color: #9a9490;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }}
    .total-value {{
      font-family: 'Fraunces', Georgia, serif;
      font-size: 20px;
      font-weight: 500;
      color: #1e1e1e;
      letter-spacing: -0.02em;
    }}
    .total-currency {{
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 300;
      color: #9a9490;
      margin-left: 3px;
    }}

    /* ── CTA button ── */
    .cta-button {{
      display: block;
      text-align: center;
      background: #1e1e1e;
      color: #fffaf5 !important;
      padding: 15px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.04em;
      margin: 28px 0;
    }}

    /* ── Divider ── */
    .divider {{
      height: 1px;
      background: #ede6de;
      margin: 24px 0;
    }}

    /* ── Note (small text) ── */
    .note {{
      font-size: 12px;
      font-weight: 300;
      color: #b8b0a8;
      line-height: 1.7;
    }}

    /* ── Footer ── */
    .footer {{
      background: #ffffff;
      border-top: 1.5px solid #ede6de;
      padding: 24px 44px;
      text-align: center;
    }}
    .footer-links {{
      font-size: 12px;
      color: #9a9490;
      font-weight: 300;
      margin-bottom: 10px;
    }}
    .footer-links a {{
      color: #ff7e6b;
      text-decoration: none;
    }}
    .footer-copy {{
      font-size: 11px;
      color: #c0b8b0;
      font-weight: 300;
      font-family: 'Fraunces', Georgia, serif;
      font-style: italic;
    }}
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- Rainbow stripe -->
    <div class="stripe"></div>

    <!-- Header -->
    <div class="header">
      <div class="brand-lockup">
        <div class="brand-name">Fleur<strong>Shop</strong></div>
        <div class="brand-tagline">handpicked with love · Algeria</div>
      </div>
    </div>

    <!-- Body -->
    <div class="body">
      {content}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-links">
        <a href="#">Unsubscribe</a> &nbsp;&middot;&nbsp;
        <a href="#">Privacy Policy</a> &nbsp;&middot;&nbsp;
        <a href="#">Contact Us</a>
      </p>
      <p class="footer-copy">
        &copy; 2026 FleurShop &mdash; every bloom tells a story
      </p>
    </div>

  </div>
</body>
</html>
"""


def order_confirmed_template(order_id: int, customer_name: str,
                              total: str, items: list) -> str:
    items_html = ''.join([
        f"""
        <div class="order-row">
          <div>
            <div class="order-item-name">{item.get('name', 'Product')}</div>
            <div class="order-item-qty">Qty: {item.get('quantity', 1)}</div>
          </div>
          <span class="order-value">{item.get('subtotal', '&mdash;')} DZD</span>
        </div>
        """ for item in items
    ])

    content = f"""
      <div class="eyebrow">Order confirmed</div>

      <h1 class="greeting">
        Thank you,<br><strong>{customer_name}!</strong>
      </h1>

      <p class="message">
        We&rsquo;ve received your order and our florists are getting started.
        You&rsquo;ll hear from us again once your bouquet is being prepared.
      </p>

      <span class="status-badge" style="background:#eaf5ea; color:#2a7a32; border-color:#b8e0b8;">
        <span class="status-dot"></span>
        Confirmed &amp; received
      </span>

      <div class="order-card">
        <div class="order-card-header">
          <div class="order-card-title">Order summary</div>
          <div class="order-card-id">Order #{order_id}</div>
        </div>
        {items_html}
        <div class="total-row">
          <span class="total-label">Total paid</span>
          <span class="total-value">{total}<span class="total-currency">DZD</span></span>
        </div>
      </div>

      <p class="note">
        Questions? Reply to this email or reach us at
        <a href="mailto:support@fleurshop.com" style="color:#ff7e6b; text-decoration:none;">support@fleurshop.com</a>
      </p>
    """
    return get_base_template(content, f"Order #{order_id} Confirmed — FleurShop")


def order_preparing_template(order_id: int, customer_name: str,
                              total: str) -> str:
    content = f"""
      <div class="eyebrow">In progress</div>

      <h1 class="greeting">
        Your blooms are<br><strong>being prepared</strong>
      </h1>

      <p class="message">
        Hi {customer_name}, our florists have started working on your order.
        We&rsquo;re taking care to make sure everything arrives fresh and beautiful.
      </p>

      <span class="status-badge" style="background:#e8f4ff; color:#1560a8; border-color:#90c0f0;">
        <span class="status-dot"></span>
        Preparing your order
      </span>

      <div class="order-card">
        <div class="order-card-header">
          <div class="order-card-title">Order details</div>
          <div class="order-card-id">Order #{order_id}</div>
        </div>
        <div class="order-row">
          <span class="order-label">Status</span>
          <span class="order-value">Being prepared by our florists</span>
        </div>
        <div class="order-row">
          <span class="order-label">Total</span>
          <span class="order-value">{total} DZD</span>
        </div>
        <div class="total-row">
          <span class="total-label">Next update</span>
          <span style="font-size:13px; color:#9a9490; font-weight:300;">When your order is on its way</span>
        </div>
      </div>

      <p class="message">
        Sit back &mdash; we&rsquo;ll notify you as soon as your order is out for delivery.
      </p>

      <p class="note">Thank you for your patience. Every bloom is worth the wait.</p>
    """
    return get_base_template(content, f"Order #{order_id} Is Being Prepared — FleurShop")


def order_delivered_template(order_id: int, customer_name: str,
                              total: str) -> str:
    content = f"""
      <div class="eyebrow">Delivered</div>

      <h1 class="greeting">
        Your flowers have<br><strong>arrived!</strong>
      </h1>

      <p class="message">
        Hi {customer_name}, we hope your blooms bring you joy.
        Your order has been successfully delivered &mdash; pop them in water
        right away to keep them fresh as long as possible.
      </p>

      <span class="status-badge" style="background:#eaf5ea; color:#2a7a32; border-color:#b8e0b8;">
        <span class="status-dot"></span>
        Delivered successfully
      </span>

      <div class="order-card">
        <div class="order-card-header">
          <div class="order-card-title">Order details</div>
          <div class="order-card-id">Order #{order_id}</div>
        </div>
        <div class="order-row">
          <span class="order-label">Status</span>
          <span class="order-value" style="color:#2a7a32;">Delivered</span>
        </div>
        <div class="order-row">
          <span class="order-label">Total paid</span>
          <span class="order-value">{total} DZD</span>
        </div>
      </div>

      <div class="divider"></div>

      <p class="message">
        We&rsquo;d love to hear how everything went. Was your experience everything you hoped for?
      </p>

      <p class="note">
        Thank you for choosing FleurShop &mdash; we hope to see you again soon.
      </p>
    """
    return get_base_template(content, f"Order #{order_id} Delivered — FleurShop")


def order_cancelled_template(order_id: int, customer_name: str,
                              total: str) -> str:
    content = f"""
      <div class="eyebrow" style="background:#fce8ea; color:#b82030;">Order cancelled</div>

      <h1 class="greeting">
        Your order has<br>been <strong style="color:#b82030;">cancelled</strong>
      </h1>

      <p class="message">
        Hi {customer_name}, we&rsquo;re sorry to let you know that
        order #{order_id} has been cancelled.
        If you didn&rsquo;t request this or have any questions,
        please reach out and we&rsquo;ll make it right.
      </p>

      <span class="status-badge" style="background:#fce8ea; color:#b82030; border-color:#f0a0a8;">
        <span class="status-dot"></span>
        Cancelled
      </span>

      <div class="order-card">
        <div class="order-card-header">
          <div class="order-card-title">Order details</div>
          <div class="order-card-id">Order #{order_id}</div>
        </div>
        <div class="order-row">
          <span class="order-label">Status</span>
          <span class="order-value" style="color:#b82030;">Cancelled</span>
        </div>
        <div class="order-row">
          <span class="order-label">Amount</span>
          <span class="order-value">{total} DZD</span>
        </div>
      </div>

      <p class="message">
        If a payment was made, a refund will be processed within
        3&ndash;5 business days back to your original payment method.
      </p>

      <div class="divider"></div>

      <p class="note">
        We hope to welcome you back soon &mdash;
        <a href="#" style="color:#ff7e6b; text-decoration:none;">browse the new collection</a>.
      </p>
    """
    return get_base_template(content, f"Order #{order_id} Cancelled — FleurShop")