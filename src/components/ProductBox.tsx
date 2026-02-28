import { useState } from 'react'
import { Location, Product } from '../types'
import { getProductTypes } from '../store'

interface ProductBoxProps {
  product: Product
  location: Location
  color: string
}

export function ProductBox({ product, location, color }: ProductBoxProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const types = getProductTypes()
  const typeName = types.find(t => t.id === product.productTypeId)?.name ?? ''

  const handleDragStart = (e: React.DragEvent) => {
    const payload = JSON.stringify({ product, fromLocation: location })
    e.dataTransfer.setData('application/json', payload)
    e.dataTransfer.setData('text/plain', payload)
    e.dataTransfer.effectAllowed = 'move'
    ;(e.target as HTMLElement).classList.add('dragging')
  }

  const handleDragEnd = (e: React.DragEvent) => {
    ;(e.target as HTMLElement).classList.remove('dragging')
  }

  const tooltipText = [
    product.id && `ID: ${product.id}`,
    `Nombre: ${product.name}`,
    `Cantidad: ${product.quantityKg} kg`,
    typeName && `Tipo: ${typeName}`
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <div
      className="product-box"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ backgroundColor: color }}
      title={tooltipText.replace(/\n/g, ' | ')}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="product-name">{product.name}</span>
      <span className="product-qty">{product.quantityKg} kg</span>
      {showTooltip && (
        <div className="product-box-tooltip">
          {product.id && <div><strong>ID:</strong> {product.id}</div>}
          <div><strong>Nombre:</strong> {product.name}</div>
          <div><strong>Cantidad:</strong> {product.quantityKg} kg</div>
          {typeName && <div><strong>Tipo:</strong> {typeName}</div>}
        </div>
      )}
    </div>
  )
}
