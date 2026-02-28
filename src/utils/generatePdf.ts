import type { Zone, Location, ProductType } from '../types'
import { getProductsAtLocation } from '../store'

type JsPDF = any

const MARGIN = 15
const CELL_PADDING = 3
const FONT_SIZE_SMALL = 6
const MIN_CELL_WIDTH = 35
const MIN_CELL_HEIGHT = 22
const LINE_HEIGHT = 3.5

function getTypeName(types: ProductType[], productTypeId: string): string {
  return types.find(t => t.id === productTypeId)?.name ?? productTypeId
}

function formatProductInfo(p: { id?: string }): string[] {
  const lines: string[] = []
  if (p.id) lines.push('')
  lines.push('', '', '') // Nombre, Tipo, kg
  return lines
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.substring(0, max - 1) + '…' : str
}

function addZoneToPdf(
  doc: JsPDF,
  zone: Zone,
  types: ProductType[],
  startY: number
): number {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const usableWidth = pageWidth - 2 * MARGIN

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Zona ${zone.name}`, MARGIN, startY)
  startY += 8

  const cols = zone.columns
  const cellWidth = Math.max(MIN_CELL_WIDTH, (usableWidth - 2) / cols)

  const cells: Location[] = []
  for (let row = zone.rows; row >= 1; row--) {
    for (let col = 1; col <= zone.columns; col++) {
      cells.push({ zoneName: zone.name, row, column: col })
    }
  }

  let currentY = startY
  const maxCharsPerLine = Math.floor((cellWidth - CELL_PADDING * 2) / 2.5)

  for (let i = 0; i < cells.length; i += cols) {
    const rowCells = cells.slice(i, i + cols)
    let rowHeight = MIN_CELL_HEIGHT
    for (const loc of rowCells) {
      const products = getProductsAtLocation(loc)
      let lines = 1
      for (const p of products) {
        lines += formatProductInfo(p).length
      }
      rowHeight = Math.max(rowHeight, lines * LINE_HEIGHT + 6)
    }

    if (currentY + rowHeight > pageHeight - MARGIN) {
      doc.addPage()
      currentY = MARGIN
    }

    let x = MARGIN
    for (const loc of rowCells) {
      doc.setDrawColor(100, 100, 100)
      doc.rect(x, currentY, cellWidth, rowHeight)

      const products = getProductsAtLocation(loc)
      doc.setFontSize(FONT_SIZE_SMALL)
      doc.setFont('helvetica', 'normal')
      doc.text(`(${loc.zoneName},${loc.row},${loc.column})`, x + CELL_PADDING, currentY + 5)

      let textY = currentY + 8
      for (const p of products) {
        const typeName = getTypeName(types, p.productTypeId)
        if (p.id) {
          doc.text(truncate(`ID: ${p.id}`, maxCharsPerLine), x + CELL_PADDING, textY)
          textY += LINE_HEIGHT
        }
        doc.text(truncate(`Nombre: ${p.name}`, maxCharsPerLine), x + CELL_PADDING, textY)
        textY += LINE_HEIGHT
        doc.text(truncate(`Tipo: ${typeName}`, maxCharsPerLine), x + CELL_PADDING, textY)
        textY += LINE_HEIGHT
        doc.text(`${p.quantityKg} kg`, x + CELL_PADDING, textY)
        textY += LINE_HEIGHT
      }

      x += cellWidth
    }
    currentY += rowHeight
  }

  return currentY + 10
}

export async function generateZonePdf(
  zone: Zone,
  types: ProductType[]
): Promise<void> {
  const jspdfModule = await import(/* @vite-ignore */ 'jspdf')
  const { jsPDF } = jspdfModule
  const doc = new jsPDF()
  addZoneToPdf(doc, zone, types, MARGIN)
  doc.save(`Almacen_Zona_${zone.name}.pdf`)
}

export async function generateAllZonesPdf(
  zones: Zone[],
  types: ProductType[]
): Promise<void> {
  const jspdfModule = await import(/* @vite-ignore */ 'jspdf')
  const { jsPDF } = jspdfModule
  const doc = new jsPDF()
  let y = MARGIN

  for (let i = 0; i < zones.length; i++) {
    if (i > 0) doc.addPage()
    y = addZoneToPdf(doc, zones[i], types, MARGIN)
  }

  doc.save('Almacen_Todas_las_zonas.pdf')
}
