import { useState, useEffect } from 'react'
import { subscribe, getZones, getProductTypes } from './store'
import { WarehouseView } from './components/WarehouseView'
import { CreateZoneForm } from './components/CreateZoneForm'
import { ProductTypesAdmin } from './components/ProductTypesAdmin'
import { AddProductModal } from './components/AddProductModal'
import { SearchProducts } from './components/SearchProducts'
import { ExportPdfModal } from './components/ExportPdfModal'
import { TransactionsModal } from './components/TransactionsModal'
import type { Zone, ProductType } from './types'
import './App.css'

function App() {
  const [zones, setZones] = useState<Zone[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [showCreateZone, setShowCreateZone] = useState(false)
  const [showProductTypes, setShowProductTypes] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showExportPdf, setShowExportPdf] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)

  useEffect(() => {
    const refresh = () => {
      setZones([...getZones()])
      setProductTypes([...getProductTypes()])
    }
    refresh()
    return subscribe(refresh)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Almacén Industrial</h1>
        <div className="header-actions">
          <button onClick={() => setShowCreateZone(true)} className="btn btn-primary">
            + Crear zona
          </button>
          <button onClick={() => setShowProductTypes(true)} className="btn btn-secondary">
            Tipos de producto
          </button>
          <button onClick={() => setShowAddProduct(true)} className="btn btn-secondary">
            + Añadir producto
          </button>
          <button onClick={() => setShowSearch(true)} className="btn btn-secondary">
            Buscar productos
          </button>
          <button onClick={() => setShowExportPdf(true)} className="btn btn-secondary">
            Exportar datos
          </button>
          <button onClick={() => setShowTransactions(true)} className="btn btn-secondary">
            Transacciones
          </button>
        </div>
      </header>

      <main className="app-main">
        <WarehouseView zones={zones} onShowCreateZone={() => setShowCreateZone(true)} />
      </main>

      {showCreateZone && (
        <CreateZoneForm onClose={() => setShowCreateZone(false)} />
      )}
      {showProductTypes && (
        <ProductTypesAdmin onClose={() => setShowProductTypes(false)} />
      )}
      {showAddProduct && (
        <AddProductModal onClose={() => setShowAddProduct(false)} zones={zones} />
      )}
      {showSearch && (
        <SearchProducts onClose={() => setShowSearch(false)} />
      )}
      {showExportPdf && (
        <ExportPdfModal onClose={() => setShowExportPdf(false)} />
      )}
      {showTransactions && (
        <TransactionsModal onClose={() => setShowTransactions(false)} />
      )}
    </div>
  )
}

export default App
