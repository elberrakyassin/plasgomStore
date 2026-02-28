import { useState } from 'react'
import { Zone, Location } from '../types'
import { getProductsAtLocation, removeZone } from '../store'
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
