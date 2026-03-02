import { useState, useEffect, useMemo } from 'react'
import {
  searchTransactions,
  getTransactionById,
  subscribe,
  type TransactionSearchFilters
} from '../store'
import { printTransaction } from '../utils/printTransaction'
import { exportTransactionAsJson, exportTransactionsAsCsv } from '../utils/exportData'
import type { Transaction } from '../types'
import './Modal.css'
import './TransactionsModal.css'

interface TransactionsModalProps {
  onClose: () => void
}

const PAGE_SIZE = 50

export function TransactionsModal({ onClose }: TransactionsModalProps) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [productIdQuery, setProductIdQuery] = useState('')
  const [productNameQuery, setProductNameQuery] = useState('')
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<TransactionSearchFilters>({})
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    setTransactions(searchTransactions(filters))
  }, [filters])

  useEffect(() => {
    return subscribe(() => {
      setTransactions(searchTransactions(filters))
    })
  }, [filters])

  const handleSearch = () => {
    setFilters({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      productId: productIdQuery.trim() || undefined,
      productName: productNameQuery.trim() || undefined
    })
    setPage(0)
  }

  const handleClearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setProductIdQuery('')
    setProductNameQuery('')
    setFilters({})
    setPage(0)
  }

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE
    return transactions.slice(start, start + PAGE_SIZE)
  }, [transactions, page])

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE)
  const selectedTx = selectedTxId ? getTransactionById(selectedTxId) : null

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })

  const formatLocation = (loc: { zoneName: string; row: number; column: number }) =>
    loc.zoneName === 'PALETA' ? 'Paleta' : `${loc.zoneName},${loc.row},${loc.column}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide modal-tall" onClick={e => e.stopPropagation()}>
        <div className="modal-header-row">
          <h2>Transacciones</h2>
          <button
            type="button"
            className="modal-close-x"
            onClick={onClose}
            title="Cerrar"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <p className="form-hint">
          Historial de entradas y movimientos. Se registra al añadir desde la paleta o al mover entre celdas. Busca por fecha o ID de producto.
        </p>

        <div className="tx-filters">
          <div className="tx-filter-row">
            <div className="form-group">
              <label>Fecha desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Fecha hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>ID producto</label>
              <input
                type="text"
                value={productIdQuery}
                onChange={e => setProductIdQuery(e.target.value)}
                placeholder="Ej: P001"
              />
            </div>
            <div className="form-group">
              <label>Nombre producto</label>
              <input
                type="text"
                value={productNameQuery}
                onChange={e => setProductNameQuery(e.target.value)}
                placeholder="Ej: Material X"
              />
            </div>
          </div>
          <button onClick={handleSearch} className="btn btn-primary">
            Buscar
          </button>
          <button onClick={handleClearFilters} className="btn btn-secondary">
            Limpiar
          </button>
        </div>

        <div className="tx-actions-row">
          <span className="tx-count">
            {transactions.length} transacción{transactions.length !== 1 ? 'es' : ''}
          </span>
          <button
            onClick={() => exportTransactionsAsCsv(transactions)}
            className="btn btn-secondary"
            disabled={transactions.length === 0}
          >
            Exportar CSV
          </button>
        </div>

        <div className="tx-content">
          <div className="tx-list">
            {paginated.length === 0 ? (
              <p className="tx-empty">No hay transacciones que coincidan con los filtros.</p>
            ) : (
              <ul className="tx-list-ul">
                {paginated.map(tx => (
                  <li
                    key={tx.id}
                    className={`tx-list-item ${selectedTxId === tx.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTxId(tx.id)}
                  >
                    <span className="tx-list-date">{formatDate(tx.timestamp)}</span>
                    <span className="tx-list-product">{tx.productName}</span>
                    <span className="tx-list-qty">{tx.quantityKg} kg</span>
                    <span className="tx-list-route">
                      {formatLocation(tx.fromLocation)} → {formatLocation(tx.toLocation)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {totalPages > 1 && (
              <div className="tx-pagination">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn btn-small btn-secondary"
                >
                  Anterior
                </button>
                <span>
                  Página {page + 1} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn btn-small btn-secondary"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>

          <div className="tx-detail">
            {selectedTx ? (
              <>
                <h3>Detalle de transacción</h3>
                <div className="tx-detail-body">
                  <div className="tx-detail-row">
                    <span className="tx-detail-label">ID:</span>
                    <span className="tx-detail-value mono">{selectedTx.id}</span>
                  </div>
                  <div className="tx-detail-row">
                    <span className="tx-detail-label">Fecha:</span>
                    <span>{formatDate(selectedTx.timestamp)}</span>
                  </div>
                  <div className="tx-detail-row">
                    <span className="tx-detail-label">Producto:</span>
                    <span>{selectedTx.productName}</span>
                  </div>
                  <div className="tx-detail-row">
                    <span className="tx-detail-label">ID producto:</span>
                    <span>{selectedTx.productId}</span>
                  </div>
                  <div className="tx-detail-row">
                    <span className="tx-detail-label">Cantidad:</span>
                    <span>{selectedTx.quantityKg} kg</span>
                  </div>
                  <div className="tx-detail-row">
                    <span className="tx-detail-label">Origen:</span>
                    <span>{formatLocation(selectedTx.fromLocation)}</span>
                  </div>
                  <div className="tx-detail-row">
                    <span className="tx-detail-label">Destino:</span>
                    <span>{formatLocation(selectedTx.toLocation)}</span>
                  </div>
                </div>
                <div className="tx-detail-actions">
                  <button
                    onClick={() => printTransaction(selectedTx)}
                    className="btn btn-primary"
                  >
                    Imprimir / PDF (con código de barras)
                  </button>
                  <button
                    onClick={() => exportTransactionAsJson(selectedTx)}
                    className="btn btn-secondary"
                  >
                    Exportar JSON
                  </button>
                </div>
              </>
            ) : (
              <p className="tx-detail-empty">Selecciona una transacción para ver el detalle.</p>
            )}
          </div>
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
