import { useState, useEffect } from 'react'
import './Modal.css'
import {
  getProductTypes,
  addProductType,
  updateProductType,
  removeProductType,
  subscribe
} from '../store'
import type { ProductType } from '../types'

interface ProductTypesAdminProps {
  onClose: () => void
}

export function ProductTypesAdmin({ onClose }: ProductTypesAdminProps) {
  const [types, setTypes] = useState<ProductType[]>([])
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#64748b')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

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

  const startEdit = (t: ProductType) => {
    setEditingId(t.id)
    setEditName(t.name)
    setEditColor(t.color)
  }

  const saveEdit = () => {
    if (!editingId) return
    const trimmed = editName.trim()
    if (!trimmed) return
    updateProductType(editingId, { name: trimmed, color: editColor })
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleRemove = (t: ProductType) => {
    if (window.confirm(`¿Eliminar "${t.name}"? Los productos con este tipo también se eliminarán.`)) {
      removeProductType(t.id)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <h2>Tipos de producto</h2>
        <p className="form-hint">
          Puedes crear, editar y eliminar todos los tipos. Al eliminar, se borran también los productos de ese tipo.
        </p>

        <div className="product-types-list">
          {types.map(t => (
            <div key={t.id} className="product-type-item">
              <span
                className="product-type-color"
                style={{ backgroundColor: t.color }}
              />
              {editingId === t.id ? (
                <>
                  <input
                    type="text"
                    className="product-type-edit-input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Nombre"
                  />
                  <input
                    type="color"
                    className="product-type-edit-color"
                    value={editColor}
                    onChange={e => setEditColor(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-small btn-primary"
                    onClick={saveEdit}
                    title="Guardar"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    className="btn btn-small btn-secondary"
                    onClick={cancelEdit}
                    title="Cancelar"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="product-type-name product-type-name-clickable"
                    onClick={() => startEdit(t)}
                    title="Clic para editar"
                  >
                    {t.name}
                  </span>
                  <button
                    type="button"
                    className="btn-edit"
                    onClick={() => startEdit(t)}
                    title="Editar"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemove(t)}
                    title="Eliminar tipo"
                  >
                    ×
                  </button>
                </>
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
