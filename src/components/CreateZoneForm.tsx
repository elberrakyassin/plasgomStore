import { useState } from 'react'
import './Modal.css'
import { addZone } from '../store'

interface CreateZoneFormProps {
  onClose: () => void
}

export function CreateZoneForm({ onClose }: CreateZoneFormProps) {
  const [name, setName] = useState('')
  const [rows, setRows] = useState(4)
  const [columns, setColumns] = useState(10)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (rows < 1 || columns < 1) return
    addZone(trimmed, rows, columns)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Crear zona</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: A, B, C, F..."
              autoFocus
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Filas</label>
              <input
                type="number"
                min={1}
                max={50}
                value={rows}
                onChange={e => setRows(parseInt(e.target.value, 10) || 1)}
              />
            </div>
            <div className="form-group">
              <label>Columnas</label>
              <input
                type="number"
                min={1}
                max={50}
                value={columns}
                onChange={e => setColumns(parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>
          <p className="form-hint">
            Ubicaciones 1-based: (A, 1, 1) abajo, (A, {rows || 'N'}, 1) arriba. Sin (0,0).
          </p>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
