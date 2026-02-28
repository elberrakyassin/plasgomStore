import { useState, useCallback, useEffect } from 'react'
import { Zone } from '../types'
import { reorderZones } from '../store'
import { ZoneGrid } from './ZoneGrid'
import { ProductTypePalette } from './ProductTypePalette'
import './WarehouseView.css'

const ZONE_REORDER_TYPE = 'application/x-zone-reorder'

interface WarehouseViewProps {
  zones: Zone[]
  onShowCreateZone?: () => void
}

export function WarehouseView({ zones, onShowCreateZone }: WarehouseViewProps) {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null)
  const [draggedZoneId, setDraggedZoneId] = useState<string | null>(null)
  const [dropTargetZoneId, setDropTargetZoneId] = useState<string | null>(null)

  useEffect(() => {
    if (zones.length > 0 && (!activeZoneId || !zones.some(z => z.id === activeZoneId))) {
      setActiveZoneId(zones[0].id)
    }
  }, [zones, activeZoneId])

  const activeZone = activeZoneId
    ? zones.find(z => z.id === activeZoneId)
    : zones[0]
  const effectiveActiveZone = activeZone ?? zones[0] ?? null

  const isZoneReorder = useCallback((e: React.DragEvent) => {
    return e.dataTransfer.types.includes(ZONE_REORDER_TYPE)
  }, [])

  const handleZoneTabDragStart = useCallback((e: React.DragEvent, zoneId: string) => {
    e.dataTransfer.setData(ZONE_REORDER_TYPE, zoneId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedZoneId(zoneId)
    ;(e.target as HTMLElement).classList.add('dragging')
  }, [])

  const handleZoneTabDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedZoneId(null)
    setDropTargetZoneId(null)
    ;(e.target as HTMLElement).classList.remove('dragging')
  }, [])

  const handleZoneTabDragOver = useCallback((e: React.DragEvent, zoneId: string) => {
    if (isZoneReorder(e)) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDropTargetZoneId(zoneId)
      return
    }
    e.preventDefault()
    e.stopPropagation()
    setActiveZoneId(zoneId)
  }, [isZoneReorder])

  const handleZoneTabDragLeave = useCallback((e: React.DragEvent) => {
    if (isZoneReorder(e)) setDropTargetZoneId(null)
  }, [isZoneReorder])

  const handleZoneTabDrop = useCallback((e: React.DragEvent, targetZoneId: string) => {
    setDropTargetZoneId(null)
    if (!isZoneReorder(e)) return
    e.preventDefault()
    const sourceZoneId = e.dataTransfer.getData(ZONE_REORDER_TYPE)
    if (!sourceZoneId || sourceZoneId === targetZoneId) return

    const currentOrder = zones.map(z => z.id)
    const newOrder = currentOrder.filter(id => id !== sourceZoneId)
    const targetIndex = newOrder.indexOf(targetZoneId)
    const insertIndex = targetIndex >= 0 ? targetIndex : newOrder.length
    newOrder.splice(insertIndex, 0, sourceZoneId)
    reorderZones(newOrder)
  }, [isZoneReorder, zones])

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
              className={`zone-tab ${effectiveActiveZone?.id === zone.id ? 'active' : ''} ${draggedZoneId === zone.id ? 'dragging' : ''} ${dropTargetZoneId === zone.id ? 'drop-target' : ''}`}
              draggable
              onClick={() => setActiveZoneId(zone.id)}
              onDragStart={e => handleZoneTabDragStart(e, zone.id)}
              onDragEnd={handleZoneTabDragEnd}
              onDragOver={e => handleZoneTabDragOver(e, zone.id)}
              onDragEnter={e => handleZoneTabDragOver(e, zone.id)}
              onDragLeave={handleZoneTabDragLeave}
              onDrop={e => handleZoneTabDrop(e, zone.id)}
              title="Arrastra para cambiar el orden"
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
