import { useState } from 'react'
import { getZones, getProductTypes } from '../store'
import { printZones } from '../utils/printWarehouse'
import { exportAsJson, exportAsCsv } from '../utils/exportData'
import type { Zone } from '../types'
import './Modal.css'

interface ExportPdfModalProps {
  onClose: () => void
}

type ExportFormat = 'pdf' | 'csv' | 'json'

export function ExportPdfModal({ onClose }: ExportPdfModalProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [mode, setMode] = useState<'all' | 'single'>('all')
  const [selectedZoneId, setSelectedZoneId] = useState<string>('')

  const zones = getZones()
  const types = getProductTypes()

  const handleExport = () => {
    if (zones.length === 0) return
    const zone = mode === 'single' && selectedZoneId
      ? zones.find(z => z.id === selectedZoneId)
      : undefined

    if (format === 'pdf') {
      printZones(zones, types, zone)
    } else if (format === 'json') {
      exportAsJson(zones, types, zone)
    } else if (format === 'csv') {
      exportAsCsv(zones, types, zone)
    }
    onClose()
  }

  const formatHint: Record<ExportFormat, string> = {
    pdf: 'Se abrirá la ventana de impresión. Elige "Guardar como PDF" como destino.',
    csv: 'Descarga un archivo CSV compatible con Excel e importaciones masivas.',
    json: 'Descarga un archivo JSON con zonas, tipos de producto y ubicaciones.'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Exportar datos</h2>
        <p className="form-hint">{formatHint[format]}</p>

        <div className="form-group">
          <label>Formato</label>
          <div className="form-radio-group">
            <label className="form-radio">
              <input
                type="radio"
                name="format"
                checked={format === 'pdf'}
                onChange={() => setFormat('pdf')}
              />
              PDF
            </label>
            <label className="form-radio">
              <input
                type="radio"
                name="format"
                checked={format === 'csv'}
                onChange={() => setFormat('csv')}
              />
              CSV
            </label>
            <label className="form-radio">
              <input
                type="radio"
                name="format"
                checked={format === 'json'}
                onChange={() => setFormat('json')}
              />
              JSON
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Ámbito</label>
          <div className="form-radio-group">
            <label className="form-radio">
              <input
                type="radio"
                name="mode"
                checked={mode === 'all'}
                onChange={() => setMode('all')}
              />
              Todas las zonas
            </label>
            <label className="form-radio">
              <input
                type="radio"
                name="mode"
                checked={mode === 'single'}
                onChange={() => setMode('single')}
              />
              Una zona
            </label>
          </div>
        </div>

        {mode === 'single' && (
          <div className="form-group">
            <label>Zona</label>
            <select
              value={selectedZoneId}
              onChange={e => setSelectedZoneId(e.target.value)}
              required
            >
              <option value="">Seleccionar zona...</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.rows}×{z.columns})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button
            onClick={handleExport}
            className="btn btn-primary"
            disabled={(mode === 'single' && !selectedZoneId) || zones.length === 0}
          >
            Exportar
          </button>
        </div>
      </div>
    </div>
  )
}
