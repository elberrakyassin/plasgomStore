import { useState } from 'react'
import './Modal.css'
import { moveProduct } from '../store'
import type { Product, Location } from '../types'

interface MoveProductModalProps {
  product: Product
  fromLocation: Location
  toLocation: Location
  onClose: () => void
}

export function MoveProductModal({
  product,
  fromLocation,
  toLocation,
  onClose
}: MoveProductModalProps) {
  const [kg, setKg] = useState<string>(String(product.quantityKg))
  const maxKg = product.quantityKg

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(kg.replace(',', '.'))
    if (isNaN(value) || value <= 0) return
    const kgToMove = Math.min(value, maxKg)
    moveProduct(fromLocation, toLocation, product.id, kgToMove)
    onClose()
  }

  const formatLoc = (l: Location) => `(${l.zoneName}, ${l.row}, ${l.column})`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Mover producto</h2>
        <p className="move-info">
          <strong>{product.name}</strong> de {formatLoc(fromLocation)} → {formatLoc(toLocation)}
        </p>
        <p className="move-max">Disponible: {maxKg} kg</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Kilogramos a mover</label>
            <input
              type="text"
              inputMode="decimal"
              value={kg}
              onChange={e => setKg(e.target.value)}
              placeholder={`Máx: ${maxKg}`}
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Mover
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
