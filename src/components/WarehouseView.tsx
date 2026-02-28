import { useState, useCallback, useEffect } from 'react'
import { Zone } from '../types'
import { ZoneGrid } from './ZoneGrid'
import { ProductTypePalette } from './ProductTypePalette'
import './WarehouseView.css'

interface WarehouseViewProps {
  zones: Zone[]
  onShowCreateZone?: () => void
}

export function WarehouseView({ zones, onShowCreateZone }: WarehouseViewProps) {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null)

  useEffect(() => {
    if (zones.length > 0 && (!activeZoneId || !zones.some(z => z.id === activeZoneId))) {
      setActiveZoneId(zones[0].id)
    }
  }, [zones, activeZoneId])

  const activeZone = activeZoneId
    ? zones.find(z => z.id === activeZoneId)
    : zones[0]
  const effectiveActiveZone = activeZone ?? zones[0] ?? null

  const handleZoneTabDragOver = useCallback((e: React.DragEvent, zoneId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveZoneId(zoneId)
  }, [])

  if (zones.length === 0) {
    return (
      <div className="warehouse-empty">
        <p>No hay zonas. Haz clic en "Crear zona" para añadir la primera.</p>
      </div>
    )
  }

  return (
    <div className="warehouse-dashboard">
      <ProductTypePalette />

      <div className="warehouse-main">
        <div className="zone-tabs">
          {onShowCreateZone && (
            <div className="zone-tab zone-tab-add" onClick={onShowCreateZone} title="Crear zona">
              +
            </div>
          )}
          {zones.map(zone => (
            <div
              key={zone.id}
              className={`zone-tab ${effectiveActiveZone?.id === zone.id ? 'active' : ''}`}
              onClick={() => setActiveZoneId(zone.id)}
              onDragOver={e => handleZoneTabDragOver(e, zone.id)}
              onDragEnter={e => handleZoneTabDragOver(e, zone.id)}
            >
              {zone.name}
            </div>
          ))}
        </div>

        {effectiveActiveZone && (
          <div
            className="zone-content"
            onDragOver={e => e.preventDefault()}
          >
            <ZoneGrid zone={effectiveActiveZone} />
          </div>
        )}
      </div>
    </div>
  )
}
