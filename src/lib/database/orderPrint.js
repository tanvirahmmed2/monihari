export const printOrder = (order) => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const orderDate = new Date(order.date || Date.now());
  const formattedDate = orderDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const receiptContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Order #${order.order_id}</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
        <style>
          @page { size: 80mm auto; margin: 0; }
          *, *::before, *::after { box-sizing: border-box; }

          body {
            font-family: 'DM Sans', sans-serif;
            background: #fff;
            color: #1a1a2e;
            font-size: 10.5px;
            line-height: 1.5;
            width: 76mm;
            margin: 0 auto;
            padding: 6mm 3mm 8mm;
          }

          /* HEADER */
          .header {
            text-align: center;
            padding-bottom: 10px;
            margin-bottom: 10px;
            border-bottom: 2px solid #1a1a2e;
          }
          .store-name {
            font-family: 'Playfair Display', serif;
            font-size: 20px;
            font-weight: 700;
            color: #1a1a2e;
            margin: 0 0 2px;
            letter-spacing: 0.3px;
          }
          .store-tagline {
            font-size: 8px;
            color: #6b7280;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            margin: 0 0 3px;
          }
          .store-contact {
            font-family: 'DM Mono', monospace;
            font-size: 8px;
            color: #9ca3af;
            margin: 0 0 6px;
          }
          .receipt-type {
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #6b7280;
          }

          /* META ROWS */
          .meta-section {
            padding: 8px 0;
            border-bottom: 1px dashed #d1d5db;
            margin-bottom: 8px;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            padding: 1px 0;
          }
          .meta-label {
            font-size: 9px;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .meta-value {
            font-family: 'DM Mono', monospace;
            font-size: 9.5px;
            color: #1a1a2e;
            font-weight: 500;
          }
          .meta-value.accent { color: #2563eb; font-weight: 600; }

          /* CUSTOMER */
          .customer-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding-bottom: 8px;
            border-bottom: 1px dashed #d1d5db;
            margin-bottom: 10px;
          }
          .customer-name {
            font-size: 11px;
            font-weight: 600;
            color: #1a1a2e;
          }
          .payment-method {
            font-family: 'DM Mono', monospace;
            font-size: 8.5px;
            font-weight: 600;
            color: #059669;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          /* ITEMS */
          .items-header {
            display: grid;
            grid-template-columns: 1fr 26px 54px;
            gap: 4px;
            padding: 4px 0;
            border-top: 1px solid #1a1a2e;
            border-bottom: 1px solid #1a1a2e;
            margin-bottom: 3px;
          }
          .items-header span {
            font-size: 7.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #6b7280;
          }
          .items-header span:nth-child(2) { text-align: center; }
          .items-header span:nth-child(3) { text-align: right; }

          .item-row {
            display: grid;
            grid-template-columns: 1fr 26px 54px;
            gap: 4px;
            padding: 5px 0;
            border-bottom: 1px dashed #e5e7eb;
            align-items: start;
          }
          .item-row:last-child { border-bottom: none; }

          .item-name {
            font-size: 10.5px;
            font-weight: 600;
            color: #1a1a2e;
            display: block;
          }
          .item-unit {
            font-family: 'DM Mono', monospace;
            font-size: 8.5px;
            color: #9ca3af;
            display: block;
          }
          .item-disc {
            font-family: 'DM Mono', monospace;
            font-size: 8px;
            color: #dc2626;
            display: block;
          }
          .item-qty {
            font-family: 'DM Mono', monospace;
            font-size: 10px;
            text-align: center;
            font-weight: 500;
            padding-top: 1px;
          }
          .item-total {
            font-family: 'DM Mono', monospace;
            font-size: 10.5px;
            font-weight: 600;
            text-align: right;
            padding-top: 1px;
          }

          /* TOTALS */
          .totals-section {
            margin-top: 8px;
            border-top: 1px solid #e5e7eb;
            padding-top: 6px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
          }
          .total-row .t-label { font-size: 9.5px; color: #6b7280; }
          .total-row .t-value {
            font-family: 'DM Mono', monospace;
            font-size: 9.5px;
            color: #374151;
          }
          .total-row.discount .t-label,
          .total-row.discount .t-value { color: #dc2626; }

          hr.solid { border: none; border-top: 1px solid #1a1a2e; margin: 7px 0; }
          hr.dash  { border: none; border-top: 1px dashed #d1d5db; margin: 7px 0; }

          .net-total-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 2px 0;
          }
          .net-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #1a1a2e;
          }
          .net-value {
            font-family: 'Playfair Display', serif;
            font-size: 16px;
            font-weight: 700;
            color: #1a1a2e;
          }

          .cash-row {
            display: flex;
            justify-content: space-between;
            padding: 1.5px 0;
          }
          .cash-row .c-label {
            font-size: 9px;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .cash-row .c-value {
            font-family: 'DM Mono', monospace;
            font-size: 9.5px;
            color: #374151;
            font-weight: 500;
          }
          .cash-row.change .c-label,
          .cash-row.change .c-value {
            font-weight: 700;
            color: #1a1a2e;
            font-size: 10px;
          }

          /* BARCODE */
          .barcode-area { margin: 12px auto 0; text-align: center; }
          .barcode-lines {
            display: inline-flex;
            align-items: flex-end;
            gap: 1px;
            height: 26px;
            margin-bottom: 3px;
          }
          .bar { background: #1a1a2e; display: inline-block; }
          .barcode-number {
            font-family: 'DM Mono', monospace;
            font-size: 7.5px;
            color: #9ca3af;
            letter-spacing: 3px;
          }

          /* FOOTER */
          .footer {
            margin-top: 14px;
            padding-top: 10px;
            border-top: 1px dashed #d1d5db;
            text-align: center;
          }
          .footer-thanks {
            font-family: 'Playfair Display', serif;
            font-size: 13px;
            color: #1a1a2e;
            margin: 0 0 3px;
          }
          .footer-note { font-size: 8px; color: #9ca3af; margin: 0 0 4px; }
          .footer-brand {
            font-family: 'DM Mono', monospace;
            font-size: 7.5px;
            color: #d1d5db;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>

        <div class="header">
          <p class="store-name">Nizam Varieties Store</p>
          <p class="store-contact">Pakuritala Bazar, Tarakanda &nbsp;·&nbsp;</p>
          <p class="store-contact">Contact: 01645-172356</p>
          <p class="receipt-type">— Sales Receipt —</p>
        </div>

        <div class="meta-section">
          <div class="meta-row">
            <span class="meta-label">Invoice No.</span>
            <span class="meta-value accent">#${order.order_id}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Date</span>
            <span class="meta-value">${formattedDate}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Time</span>
            <span class="meta-value">${formattedTime}</span>
          </div>
        </div>

        <div class="customer-row">
          <span class="customer-name">${order.name || 'Walk-in Customer'}</span>
          <span class="payment-method">${order.payment_method?.toUpperCase() || 'CASH'}</span>
        </div>

        <div class="items-header">
          <span>Description</span>
          <span>Qty</span>
          <span>Amount</span>
        </div>

        ${order.product_list?.map((item) => `
          <div class="item-row">
            <div>
              <span class="item-name">${item.name}</span>
              <span class="item-unit">@ ৳${parseFloat(item.price).toFixed(2)}</span>
              ${item.discount > 0 ? `<span class="item-disc">disc −৳${item.discount}</span>` : ''}
            </div>
            <div class="item-qty">${item.quantity}</div>
            <div class="item-total">৳${(parseFloat(item.price) * item.quantity - (item.discount || 0)).toFixed(2)}</div>
          </div>
        `).join('')}

        <div class="totals-section">
          <div class="total-row">
            <span class="t-label">Subtotal</span>
            <span class="t-value">৳${parseFloat(order.subtotal || 0).toFixed(2)}</span>
          </div>
          ${order.discount > 0 ? `
          <div class="total-row discount">
            <span class="t-label">Total Discount</span>
            <span class="t-value">− ৳${parseFloat(order.discount).toFixed(2)}</span>
          </div>` : ''}
        </div>

        <hr class="solid">

        <div class="net-total-row">
          <span class="net-label">Net Total</span>
          <span class="net-value">৳${parseFloat(order.total_amount).toFixed(2)}</span>
        </div>

        <hr class="dash">

        <div class="cash-row">
          <span class="c-label">Paid Amount</span>
          <span class="c-value">৳${parseFloat(order.amount_received || 0).toFixed(2)}</span>
        </div>
        <div class="cash-row change">
          <span class="c-label">Change Due</span>
          <span class="c-value">৳${parseFloat(order.change_amount || 0).toFixed(2)}</span>
        </div>

        <div class="barcode-area">
          <div class="barcode-lines">
            ${Array.from({ length: 44 }, (_, i) => {
              const h = [18,24,16,28,20,14,26,22,18,28,12,24,20,16,28,18,22,14,26,20,18,28,16,24,20,18,12,26,22,28,14,20,18,24,16,28,22,18,26,14,20,24,16,22][i];
              const w = [1,2,1,3,1,2,1,1,2,3,1,2,1,1,3,1,2,1,3,1,2,3,1,2,1,2,1,3,2,3,1,2,1,2,1,3,2,1,3,1,2,2,1,2][i];
              return `<span class="bar" style="height:${h}px;width:${w}px;"></span>`;
            }).join('')}
          </div>
          <div class="barcode-number">${String(order.order_id).padStart(12, '0')}</div>
        </div>

        <div class="footer">
          <p class="footer-thanks">Thank you for shopping with us</p>
          <p class="footer-note">Exchange within 7 days with receipt &nbsp;·&nbsp; Keep receipt for reference</p>
          <p class="footer-brand">© ${new Date().getFullYear()} &nbsp; Powered by Razers</p>
        </div>

      </body>
    </html>
  `;

  const pri = iframe.contentWindow;
  pri.document.open();
  pri.document.write(receiptContent);
  pri.document.close();

  setTimeout(() => {
    pri.focus();
    pri.print();
    if (iframe.parentNode) document.body.removeChild(iframe);
  }, 600);
};
