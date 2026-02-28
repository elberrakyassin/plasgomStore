import type { Zone, Location, ProductType } from '../types'
import { getProductsAtLocation } from '../store'

function getTypeName(types: ProductType[], productTypeId: string): string {
  return types.find(t => t.id === productTypeId)?.name ?? productTypeId
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function buildZoneHtml(zone: Zone, types: ProductType[]): string {
  const cells: Location[] = []
  for (let row = zone.rows; row >= 1; row--) {
    for (let col = 1; col <= zone.columns; col++) {
      cells.push({ zoneName: zone.name, row, column: col })
    }
  }

  const cols = zone.columns
  const rowChunks: string[] = []
  for (let i = 0; i < cells.length; i += cols) {
    const rowCells = cells.slice(i, i + cols)
    const tdHtml = rowCells
      .map(loc => {
        const products = getProductsAtLocation(loc)
        const productLines = products.map(p => {
          const typeName = getTypeName(types, p.productTypeId)
          const parts: string[] = []
          if (p.id) parts.push(`ID: ${escapeHtml(p.id)}`)
          parts.push(`Nombre: ${escapeHtml(p.name)}`)
          parts.push(`Tipo: ${escapeHtml(typeName)}`)
          parts.push(`${p.quantityKg} kg`)
          return parts.join('<br>')
        })
        const content = productLines.length ? productLines.join('<br><br>') : '—'
        return `<td class="print-cell">${content}<br><small>(${loc.zoneName},${loc.row},${loc.column})</small></td>`
      })
      .join('')
    rowChunks.push(`<tr>${tdHtml}</tr>`)
  }

  return `
    <div class="print-zone">
      <h2>Zona ${escapeHtml(zone.name)}</h2>
      <table class="print-table">
        <tbody>${rowChunks.join('')}</tbody>
      </table>
    </div>
  `
}

export function printZones(zones: Zone[], types: ProductType[], singleZone?: Zone): void {
  const toPrint = singleZone ? [singleZone] : zones
  if (toPrint.length === 0) return

  const zonesHtml = toPrint.map(z => buildZoneHtml(z, types)).join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Almacén - ${singleZone ? `Zona ${singleZone.name}` : 'Todas las zonas'}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 20px; font-size: 12px; }
    .print-zone { margin-bottom: 2rem; break-inside: avoid; }
    .print-zone h2 { margin: 0 0 12px 0; font-size: 16px; }
    .print-table { border-collapse: collapse; width: 100%; }
    .print-cell {
      border: 1px solid #333;
      padding: 8px;
      vertical-align: top;
      min-width: 80px;
      min-height: 50px;
    }
    .print-cell small { color: #666; font-size: 10px; }
  </style>
</head>
<body>
  <h1>Almacén Industrial</h1>
  <p>${singleZone ? `Zona: ${singleZone.name}` : 'Todas las zonas'} · ${new Date().toLocaleString('es')}</p>
  ${zonesHtml}
</body>
</html>
  `

  const win = window.open('', '_blank')
  if (!win) {
    alert('Permite las ventanas emergentes para exportar a PDF.')
    return
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}
