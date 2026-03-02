import type { Transaction } from '../types'

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  })
}

function formatLocation(l: { zoneName: string; row: number; column: number }): string {
  return l.zoneName === 'PALETA' ? 'Paleta' : `${l.zoneName}, ${l.row}, ${l.column}`
}

export function printTransaction(tx: Transaction): void {
  const loc = (l: { zoneName: string; row: number; column: number }) =>
    escapeHtml(formatLocation(l))

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Transacción ${escapeHtml(tx.id)}</title>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js" crossorigin="anonymous"></script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 24px; font-size: 14px; }
    h1 { margin: 0 0 1rem 0; font-size: 18px; }
    .tx-section { margin-bottom: 1rem; }
    .tx-row { display: flex; gap: 1rem; margin: 0.25rem 0; }
    .tx-label { font-weight: 600; min-width: 140px; color: #475569; }
    .barcode-container { margin: 1.5rem 0; text-align: center; }
    .barcode-container img { max-width: 100%; height: auto; }
    .tx-id { font-family: monospace; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <h1>Transacción de movimiento</h1>
  <div class="barcode-container">
    <canvas id="barcode-canvas"></canvas>
    <p class="tx-id">${escapeHtml(tx.id)}</p>
  </div>
  <div class="tx-section">
    <div class="tx-row"><span class="tx-label">Fecha:</span> ${escapeHtml(formatDate(tx.timestamp))}</div>
    <div class="tx-row"><span class="tx-label">Producto:</span> ${escapeHtml(tx.productName)}</div>
    <div class="tx-row"><span class="tx-label">ID producto:</span> ${escapeHtml(tx.productId)}</div>
    <div class="tx-row"><span class="tx-label">Cantidad:</span> ${tx.quantityKg} kg</div>
    <div class="tx-row"><span class="tx-label">Origen:</span> ${loc(tx.fromLocation)}</div>
    <div class="tx-row"><span class="tx-label">Destino:</span> ${loc(tx.toLocation)}</div>
  </div>
  <script>
    (function() {
      var data = ${JSON.stringify(tx.id)};
      var canvas = document.getElementById('barcode-canvas');
      if (canvas && typeof JsBarcode !== 'undefined') {
        try {
          JsBarcode(canvas, data, { format: 'CODE128', width: 2, height: 60, displayValue: false });
        } catch (e) { console.error(e); }
      }
    })();
  </script>
</body>
</html>
  `

  const win = window.open('', '_blank')
  if (!win) {
    alert('Permite las ventanas emergentes para imprimir.')
    return
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}
