import { useState } from 'react'
import { addProductToLocation } from '../store'
import type { ProductType, Location } from '../types'
import './Modal.css'

interface AddProductFromTypeModalProps {
  productType: ProductType
  location: Location
  onClose: () => void
}

export function AddProductFromTypeModal({
  productType,
  location,
  onClose
}: AddProductFromTypeModalProps) {
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [quantityKg, setQuantityKg] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedId = id.trim()
    const trimmedName = name.trim()
    const qty = parseFloat(quantityKg.replace(',', '.'))
    if (!trimmedName || isNaN(qty) || qty <= 0) return
    addProductToLocation(
      {
        id: trimmedId || undefined,
        name: trimmedName,
        productTypeId: productType.id,
        quantityKg: qty
      },
      location
    )
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Nuevo producto</h2>
        <p className="form-hint">
          Tipo: <strong>{productType.name}</strong> en ({location.zoneName}, {location.row}, {location.column})
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID</label>
            <input
              type="text"
              value={id}
              onChange={e => setId(e.target.value)}
              placeholder="Ej: CAJA-001 (opcional)"
            />
          </div>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Acero inoxidable"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Cantidad (kg)</label>
            <input
              type="text"
              inputMode="decimal"
              value={quantityKg}
              onChange={e => setQuantityKg(e.target.value)}
              placeholder="500"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Añadir
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
