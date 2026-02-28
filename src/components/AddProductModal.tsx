import { useState } from 'react'
import './Modal.css'
import { addProductToLocation, getProductTypes } from '../store'
import type { Zone, Location } from '../types'

interface AddProductModalProps {
  onClose: () => void
  zones: Zone[]
}

export function AddProductModal({ onClose, zones }: AddProductModalProps) {
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [quantityKg, setQuantityKg] = useState('')
  const [productTypeId, setProductTypeId] = useState('')
  const [zoneName, setZoneName] = useState('')
  const [row, setRow] = useState(1)
  const [column, setColumn] = useState(1)

  const types = getProductTypes()
  const selectedZone = zones.find(z => z.name === zoneName)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    const qty = parseFloat(quantityKg.replace(',', '.'))
    if (!trimmed || isNaN(qty) || qty <= 0 || !productTypeId || !zoneName) return
    if (!selectedZone) return
    if (row < 1 || row > selectedZone.rows || column < 1 || column > selectedZone.columns) {
      alert('Fila o columna fuera de rango (1-based)')
      return
    }
    const location: Location = { zoneName, row, column }
    addProductToLocation(
      { id: id.trim() || undefined, name: trimmed, productTypeId, quantityKg: qty },
      location
    )
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <h2>Añadir producto</h2>
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
              required
            />
          </div>
          <div className="form-row">
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
            <div className="form-group">
              <label>Tipo de producto</label>
              <select
                value={productTypeId}
                onChange={e => setProductTypeId(e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {types.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Zona</label>
            <select
              value={zoneName}
              onChange={e => {
                setZoneName(e.target.value)
                setRow(1)
                setColumn(1)
              }}
              required
            >
              <option value="">Seleccionar...</option>
              {zones.map(z => (
                <option key={z.id} value={z.name}>
                  {z.name} ({z.rows}×{z.columns})
                </option>
              ))}
            </select>
          </div>
          {selectedZone && (
            <div className="form-row">
              <div className="form-group">
                <label>Fila (1-{selectedZone.rows}, 1=abajo)</label>
                <input
                  type="number"
                  min={1}
                  max={selectedZone.rows}
                  value={row}
                  onChange={e => setRow(parseInt(e.target.value, 10) || 1)}
                />
              </div>
              <div className="form-group">
                <label>Columna (1-{selectedZone.columns})</label>
                <input
                  type="number"
                  min={1}
                  max={selectedZone.columns}
                  value={column}
                  onChange={e => setColumn(parseInt(e.target.value, 10) || 1)}
                />
              </div>
            </div>
          )}
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
