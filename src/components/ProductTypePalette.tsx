import { getProductTypes } from '../store'
import type { ProductType } from '../types'
import './ProductTypePalette.css'

export function ProductTypePalette() {
  const types = getProductTypes()

  const handleDragStart = (e: React.DragEvent, type: ProductType) => {
    const payload = JSON.stringify({ productType: type })
    e.dataTransfer.setData('application/json', payload)
    e.dataTransfer.setData('text/plain', payload)
    e.dataTransfer.setData('application/x-product-type', '1')
    e.dataTransfer.effectAllowed = 'copy'
    ;(e.target as HTMLElement).classList.add('dragging')
  }

  const handleDragEnd = (e: React.DragEvent) => {
    ;(e.target as HTMLElement).classList.remove('dragging')
  }

  return (
    <div className="product-type-palette">
      <h3>Tipos de producto</h3>
      <p className="palette-hint">Arrastra a una ubicación para añadir</p>
      <div className="palette-items">
        {types.map(t => (
          <div
            key={t.id}
            className="palette-item"
            draggable
            onDragStart={e => handleDragStart(e, t)}
            onDragEnd={handleDragEnd}
            style={{ backgroundColor: t.color }}
          >
            {t.name}
          </div>
        ))}
      </div>
    </div>
  )
}
