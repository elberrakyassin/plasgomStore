import { useState } from 'react'
import { Zone, Location } from '../types'
import {
  getProductsAtLocation,
  removeZone,
  canRemoveLastRow,
  canRemoveLastColumn,
  addZoneRow,
  addZoneColumn,
  removeZoneRow,
  removeZoneColumn
} from '../store'
import { LocationCell } from './LocationCell'
import { MoveProductModal } from './MoveProductModal'
import type { Product } from '../types'

interface ZoneGridProps {
  zone: Zone
}

export function ZoneGrid({ zone }: ZoneGridProps) {
  const [moveModal, setMoveModal] = useState<{
    product: Product
    fromLocation: Location
    toLocation: Location
  } | null>(null)

  const handleProductDrop = (product: Product, from: Location, to: Location) => {
    if (from.zoneName === to.zoneName && from.row === to.row && from.column === to.column) return
    setMoveModal({ product, fromLocation: from, toLocation: to })
  }

  const handleCloseMoveModal = () => setMoveModal(null)

  const handleRemove = () => {
    if (confirm(`¿Eliminar la zona "${zone.name}"? Se perderán los productos en ella.`)) {
      removeZone(zone.id)
    }
  }

  const cells: Location[] = []
  for (let row = zone.rows; row >= 1; row--) {
    for (let col = 1; col <= zone.columns; col++) {
      cells.push({ zoneName: zone.name, row, column: col })
    }
  }

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  return (
    <div
      className="zone-grid-container"
      onDragOver={handleContainerDragOver}
    >
      <div className="zone-grid-header">
        <h2>{zone.name}</h2>
        <span className="zone-dimensions">
          {zone.rows} filas × {zone.columns} columnas
        </span>
        <div className="zone-edit-controls">
          <div className="zone-edit-group" title="Añadir o quitar filas">
            <button
              type="button"
              className="btn-zone-edit"
              onClick={() => addZoneRow(zone.id)}
              title="Añadir fila"
            >
              + Fila
            </button>
            <button
              type="button"
              className="btn-zone-edit"
              disabled={zone.rows <= 1 || !canRemoveLastRow(zone.id)}
              onClick={() => removeZoneRow(zone.id)}
              title={!canRemoveLastRow(zone.id) ? 'La fila superior debe estar vacía' : 'Quitar fila superior'}
            >
              − Fila
            </button>
          </div>
          <div className="zone-edit-group" title="Añadir o quitar columnas">
            <button
              type="button"
              className="btn-zone-edit"
              onClick={() => addZoneColumn(zone.id)}
              title="Añadir columna"
            >
              + Col
            </button>
            <button
              type="button"
              className="btn-zone-edit"
              disabled={zone.columns <= 1 || !canRemoveLastColumn(zone.id)}
              onClick={() => removeZoneColumn(zone.id)}
              title={!canRemoveLastColumn(zone.id) ? 'La columna derecha debe estar vacía' : 'Quitar última columna'}
            >
              − Col
            </button>
          </div>
        </div>
        <button onClick={handleRemove} className="btn-remove-zone" title="Eliminar zona">
          × Eliminar zona
        </button>
      </div>
      <div
        className="zone-grid"
        style={{
          gridTemplateRows: `repeat(${zone.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${zone.columns}, 1fr)`
        }}
      >
        {cells.map(loc => (
          <LocationCell
            key={`${zone.name}-${loc.row}-${loc.column}`}
            location={loc}
            products={getProductsAtLocation(loc)}
            onProductDrop={handleProductDrop}
          />
        ))}
      </div>

      {moveModal && (
        <MoveProductModal
          product={moveModal.product}
          fromLocation={moveModal.fromLocation}
          toLocation={moveModal.toLocation}
          onClose={handleCloseMoveModal}
        />
      )}
    </div>
  )
}
