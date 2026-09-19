/**
 * Utility for triggering browser printing reliably, even within sandboxed iframes
 */
export function triggerPrintReport(elementId?: string, documentTitle = 'Park College Academic Report') {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const el = elementId ? document.getElementById(elementId) : null;
  const contentHtml = el ? el.innerHTML : document.body.innerHTML;

  // 1. Try opening a clean dedicated print window (bypasses iframe sandbox print restrictions)
  try {
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (printWindow && !printWindow.closed) {
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>${documentTitle}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 24px;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            * { box-sizing: border-box; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 12px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; color: #1e293b; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .font-extrabold { font-weight: 800; }
            .font-black { font-weight: 900; }
            .text-xs { font-size: 11px; }
            .text-sm { font-size: 13px; }
            .text-base { font-size: 15px; }
            .text-lg { font-size: 18px; }
            .text-xl { font-size: 20px; }
            .text-slate-400 { color: #94a3b8; }
            .text-slate-500 { color: #64748b; }
            .text-slate-600 { color: #475569; }
            .text-slate-700 { color: #334155; }
            .text-slate-800 { color: #1e293b; }
            .text-slate-900 { color: #0f172a; }
            .text-blue-700, .text-blue-800 { color: #1d4ed8; }
            .text-indigo-700, .text-indigo-800 { color: #4338ca; }
            .text-rose-700, .text-rose-800 { color: #be123c; }
            .text-emerald-700, .text-emerald-800 { color: #047857; }
            .bg-slate-50 { background-color: #f8fafc; }
            .bg-slate-100 { background-color: #f1f5f9; }
            .bg-blue-50 { background-color: #eff6ff; }
            .bg-indigo-50 { background-color: #eef2ff; }
            .border-b { border-bottom: 1px solid #cbd5e1; }
            .border-t { border-top: 1px solid #cbd5e1; }
            .border { border: 1px solid #cbd5e1; }
            .rounded-lg, .rounded-xl, .rounded-2xl { border-radius: 8px; }
            .p-3 { padding: 12px; }
            .p-4 { padding: 16px; }
            .p-6 { padding: 24px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .px-3 { padding-left: 12px; padding-right: 12px; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .gap-4 { gap: 16px; }
            .gap-2 { gap: 8px; }
            .print-hidden, .no-print, button { display: none !important; }
          </style>
        </head>
        <body>
          <div style="margin-bottom: 16px; text-align: right;" class="no-print">
            <button onclick="window.print()" style="display:inline-block !important; padding:8px 16px; background:#4338ca; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
              Click here if print dialog does not appear
            </button>
          </div>
          ${contentHtml}
          <script>
            window.addEventListener('load', function() {
              setTimeout(function() {
                try {
                  window.focus();
                  window.print();
                } catch(e) {
                  console.error('Print call error:', e);
                }
              }, 400);
            });
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      return;
    }
  } catch (err) {
    console.warn('Popup window print blocked, attempting direct window print fallback:', err);
  }

  // 2. Direct print fallback for in-window or top-level viewing
  try {
    window.focus();
    window.print();
  } catch (e) {
    console.error('Direct print failed:', e);
  }
}
