import { useState, useEffect } from 'react'
import './Modal.css'
import { getProductTypes, addProductType, removeProductType, subscribe } from '../store'
import type { ProductType } from '../types'

interface ProductTypesAdminProps {
  onClose: () => void
}

export function ProductTypesAdmin({ onClose }: ProductTypesAdminProps) {
  const [types, setTypes] = useState<ProductType[]>([])
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#64748b')

  useEffect(() => {
    const refresh = () => setTypes([...getProductTypes()])
    refresh()
    return subscribe(refresh)
  }, [])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    addProductType(trimmed, newColor)
    setNewName('')
    setNewColor('#64748b')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <h2>Tipos de producto</h2>
        <p className="form-hint">
          Los tipos predefinidos (MP Activa, MP Bloqueada, etc.) no se pueden eliminar.
        </p>

        <div className="product-types-list">
          {types.map(t => (
            <div key={t.id} className="product-type-item">
              <span
                className="product-type-color"
                style={{ backgroundColor: t.color }}
              />
              <span className="product-type-name">{t.name}</span>
              {!t.isDefault && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeProductType(t.id)}
                  title="Eliminar tipo"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleAdd} className="add-type-form">
          <h3>Añadir nuevo tipo</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ej: Semielaborado"
              />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input
                type="color"
                value={newColor}
                onChange={e => setNewColor(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Añadir tipo
          </button>
        </form>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
