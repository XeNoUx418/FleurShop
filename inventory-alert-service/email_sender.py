import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# --- Config ---
EMAIL_HOST     = os.environ.get('EMAIL_HOST',     'smtp.gmail.com')
EMAIL_PORT     = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_ADDRESS  = os.environ.get('EMAIL_ADDRESS',  '')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD', '')
EMAIL_FROM     = os.environ.get('EMAIL_FROM',     EMAIL_ADDRESS)
ADMIN_EMAIL    = os.environ.get('ADMIN_EMAIL',    EMAIL_ADDRESS)


def send_low_stock_alert(product_name: str, product_id: int,
                          current_stock: int, threshold: int,
                          order_id: int):
    """Sends a low-stock warning email to the admin."""

    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("[Alert] ⚠️  No email credentials — skipping alert")
        return

    subject = f"⚠️ Low Stock Alert: {product_name} — FleurShop"
    html    = _build_template(product_name, product_id,
                               current_stock, threshold, order_id)

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From']    = EMAIL_FROM
    msg['To']      = ADMIN_EMAIL
    msg.attach(MIMEText(html, 'html'))

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, ADMIN_EMAIL, msg.as_string())
        print(f"[Alert] ✅ Low-stock alert sent for '{product_name}' "
              f"(stock: {current_stock})")
    except Exception as e:
        print(f"[Alert] ❌ Error: {e}")


def _build_template(product_name: str, product_id: int,
                     current_stock: int, threshold: int,
                     order_id: int) -> str:
    """Builds the full HTML email including base styling and dynamic content."""

    # UI Logic: Colors and Messaging
    if current_stock == 0:
        badge_bg, badge_color = '#fce8ea', '#b82030'
        badge_text = 'Out of stock'
        urgency_msg = f"<strong>{product_name}</strong> is now completely out of stock after order #{order_id}."
    else:
        badge_bg, badge_color = '#fff3e0', '#e65100'
        badge_text = f'Only {current_stock} left'
        urgency_msg = f"<strong>{product_name}</strong> has dropped to <strong>{current_stock} units</strong>."

    fill_pct = min(current_stock / max(threshold * 2, 1) * 100, 100)

    # Note: Double curly braces {{ }} are used in the CSS section so the f-string doesn't evaluate them.
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Low Stock Alert: {product_name} — FleurShop</title>
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

    /* ── Rainbow stripe ── */
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

    .message {{
      font-size: 14px;
      font-weight: 300;
      color: #6a6460;
      line-height: 1.75;
      margin-bottom: 28px;
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

    /* ── Footer ── */
    .footer {{
      background: #ffffff;
      border-top: 1.5px solid #ede6de;
      padding: 24px 44px;
      text-align: center;
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

    <div class="stripe"></div>

    <div class="header" style="justify-content: space-between;">
      <div class="brand-lockup">
        <div class="brand-name">Fleur<strong>Shop</strong></div>
        <div class="brand-tagline">handpicked with love · Algeria</div>
      </div>
      <span style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; background: #f0ebe4; color: #9a9490; padding: 5px 12px; border-radius: 100px; border: 1px solid #ede6de;">
        Admin Alert
      </span>
    </div>

    <div class="body">
      <div style="display: inline-block; background:{badge_bg}; color:{badge_color}; border: 1px solid {badge_color}30; font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; padding: 5px 12px; border-radius: 100px; margin-bottom: 14px;">
        &#9888; Inventory alert
      </div>

      <h1 class="greeting">Stock level<br>requires attention</h1>

      <p class="message">{urgency_msg} This is below your alert threshold of {threshold} units.</p>

      <div class="order-card">
        <div class="order-card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div class="order-card-title">Product details</div>
          <span style="background:{badge_bg}; color:{badge_color}; font-size:11px; font-weight:700; padding:4px 10px; border-radius:100px;">
            {badge_text}
          </span>
        </div>
        <div class="order-row">
          <span class="order-label">Product</span>
          <span class="order-value">{product_name} (ID: #{product_id})</span>
        </div>
        <div class="order-row">
          <span class="order-label">Current stock</span>
          <span class="order-value" style="color:{badge_color}; font-weight:700;">{current_stock} units</span>
        </div>
        <div class="order-row">
          <span class="order-label">Triggered by</span>
          <span class="order-value">Order #{order_id}</span>
        </div>
        
        <div style="padding:16px 20px; border-top:1.5px solid #ede6de; background:#fdf8f2;">
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#9a9490; margin-bottom:8px;">
            <span>Stock status</span>
            <span>{current_stock} / {threshold * 2} units</span>
          </div>
          <div style="height:6px; background:#ede6de; border-radius:100px; overflow:hidden;">
            <div style="height:100%; background:{badge_color}; width:{fill_pct:.0f}%;"></div>
          </div>
        </div>
      </div>

      <div style="background:#f0ebe4; border-radius:12px; padding:20px; margin-bottom:24px;">
        <div style="font-size:12px; font-weight:700; color:#6a6460; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:10px;">
          Recommended actions
        </div>
        <div style="font-size:13px; color:#6a6460; font-weight:300; line-height:1.8; padding-left:16px; position:relative;">
          <span style="position:absolute; left:0; color:#ff7e6b;">&rarr;</span> Update stock in the admin panel
        </div>
        <div style="font-size:13px; color:#6a6460; font-weight:300; line-height:1.8; padding-left:16px; position:relative;">
          <span style="position:absolute; left:0; color:#ff7e6b;">&rarr;</span> Review pending orders for {product_name}
        </div>
      </div>
    </div>

    <div class="footer">
      <p class="footer-copy">
        &copy; 2026 FleurShop &mdash; inventory monitoring system
      </p>
    </div>

  </div>
</body>
</html>
"""