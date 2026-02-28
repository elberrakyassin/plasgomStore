import type { Zone, ProductType, ProductAtLocation } from '../types'
import { getZones, getProductTypes, getProductsAtLocations } from '../store'

function escapeCsvCell(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportAsJson(zones: Zone[], types: ProductType[], singleZone?: Zone): void {
  const data = getProductsAtLocations()
  const filtered = singleZone
    ? data.filter(p => p.location.zoneName === singleZone.name)
    : data

  const payload = {
    exportedAt: new Date().toISOString(),
    zones: singleZone ? [singleZone] : zones,
    productTypes: types,
    productsAtLocations: filtered
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = singleZone
    ? `almacen_zona_${singleZone.name}.json`
    : 'almacen_completo.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function exportAsCsv(zones: Zone[], types: ProductType[], singleZone?: Zone): void {
  const data = getProductsAtLocations()
  const filtered = singleZone
    ? data.filter(p => p.location.zoneName === singleZone.name)
    : data

  const typeNames = new Map(types.map(t => [t.id, t.name]))
  const headers = ['zona', 'fila', 'columna', 'producto_id', 'producto_nombre', 'tipo_producto', 'cantidad_kg']

  const rows = filtered.map(({ product, location }) => [
    location.zoneName,
    location.row,
    location.column,
    product.id,
    product.name,
    typeNames.get(product.productTypeId) ?? product.productTypeId,
    product.quantityKg
  ])

  const csvLines = [
    headers.join(','),
    ...rows.map(r => r.map(escapeCsvCell).join(','))
  ]
  const csv = csvLines.join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = singleZone
    ? `almacen_zona_${singleZone.name}.csv`
    : 'almacen_completo.csv'
  a.click()
  URL.revokeObjectURL(url)
}
