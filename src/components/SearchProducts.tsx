import { useState, useEffect } from 'react'
import { searchProductsByName, getProductTypes } from '../store'
import type { ProductSearchResult } from '../store'
import './Modal.css'
import './SearchProducts.css'

interface SearchProductsProps {
  onClose: () => void
}

export function SearchProducts({ onClose }: SearchProductsProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductSearchResult[]>([])

  useEffect(() => {
    setResults(searchProductsByName(query))
  }, [query])

  const types = getProductTypes()

  const getTypeName = (id: string) => types.find(t => t.id === id)?.name ?? id

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <h2>Buscar productos</h2>
        <div className="form-group">
          <label>Nombre del producto</label>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ej: Acero, X..."
            autoFocus
          />
        </div>

        <div className="search-results">
          {query.trim() === '' ? (
            <p className="search-hint">Escribe un nombre para buscar</p>
          ) : results.length === 0 ? (
            <p className="search-empty">No se encontraron productos</p>
          ) : (
            results.map((r, i) => (
              <div key={`${r.name}-${r.productTypeId}-${i}`} className="search-result-item">
                <div className="search-result-header">
                  <strong>{r.name}</strong>
                  <span className="search-result-type">{getTypeName(r.productTypeId)}</span>
                  <span className="search-result-total">{r.totalKg} kg total</span>
                </div>
                <ul className="search-result-locations">
                  {r.locations.map((loc, j) => (
                    <li key={j}>
                      ({loc.location.zoneName}, {loc.location.row}, {loc.location.column}): {loc.quantityKg} kg
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
