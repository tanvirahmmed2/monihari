export const printPurchaseInvoice = (purchase) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Order #${purchase.purchase_id}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { 
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
              color: #333; font-size: 13px; line-height: 1.6; margin: 0; 
            }
            .header-container { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            .company-brand { color: #1e40af; }
            .invoice-details { text-align: right; }
            
            .address-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
            .address-box h3 { margin-top: 0; font-size: 14px; text-transform: uppercase; color: #666; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f8fafc; color: #475569; font-weight: 600; text-align: left; padding: 12px 10px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
            
            .totals-container { display: flex; justify-content: flex-end; }
            .totals-table { width: 300px; }
            .totals-table tr td { border: none; padding: 4px 10px; }
            .totals-table tr.grand-total { font-size: 16px; font-weight: bold; color: #1e40af; background-color: #f0f9ff; }
            
            .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            .badge-paid { background: #dcfce7; color: #166534; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="company-brand">
              <h1 style="margin:0;">NIZAM VARIETIES STORE</h1>
              <p style="margin:0;">Pakuritala, Tarakanda, 2252</p>
              <p style="margin:0;">Contact: 01645-172356</p>
            </div>
            <div class="invoice-details">
              <h2 style="margin:0; color: #64748b;">PURCHASE RECORD</h2>
              <p style="margin:2px 0;"><strong>ID:</strong> PR-${purchase.purchase_id}</p>
              <p style="margin:2px 0;"><strong>Invoice:</strong> ${purchase.invoice_no || 'N/A'}</p>
              <p style="margin:2px 0;"><strong>Date:</strong> ${new Date(purchase.created_at || purchase.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="address-section">
            <div class="address-box">
              <h3>Supplier Details</h3>
              <p><strong>${purchase.supplier_name}</strong><br>
              Phone: ${purchase.supplier_phone || 'N/A'}<br>
              ${purchase.supplier_address || ''}</p>
            </div>
            <div class="address-box">
                <h3>Payment Info</h3>
                <p>Method: <span class="badge badge-paid">${purchase.payment_method || 'Cash'}</span><br>
                Status: Verified Record<br>
                Note: ${purchase.note || 'No additional instructions'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 10%;">SL</th>
                <th style="width: 45%;">Product Description</th>
                <th style="width: 15%; text-align: center;">Price</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 20%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${purchase.items?.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${item.name}</strong></td>
                  <td style="text-align: center;">৳${parseFloat(item.purchase_price).toFixed(2)}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">৳${(parseFloat(item.purchase_price) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-container">
            <table class="totals-table">
              <tr>
                <td>Subtotal</td>
                <td style="text-align: right;">৳${parseFloat(purchase.subtotal_amount || 0).toFixed(2)}</td>
              </tr>
              ${purchase.extra_discount > 0 ? `
              <tr>
                <td>Discount</td>
                <td style="text-align: right; color: #dc2626;">-৳${parseFloat(purchase.extra_discount).toFixed(2)}</td>
              </tr>` : ''}
              <tr class="grand-total">
                <td>NET AMOUNT</td>
                <td style="text-align: right;">৳${parseFloat(purchase.total_amount).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>This is a computer-generated document. No signature is required.</p>
            <p>© ${new Date().getFullYear()} Razers LTD</p>
          </div>
        </body>
      </html>
    `;

    const pri = iframe.contentWindow;
    pri.document.open();
    pri.document.write(invoiceContent);
    pri.document.close();

    // Small delay to ensure styles and fonts are loaded before printing
    setTimeout(() => {
        pri.focus();
        pri.print();
        // Remove the iframe after the print dialog closes
        window.onafterprint = () => document.body.removeChild(iframe);
        // Fallback for browsers that don't support onafterprint
        setTimeout(() => { if(iframe.parentNode) document.body.removeChild(iframe); }, 1000);
    }, 750);
};