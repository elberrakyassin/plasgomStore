import { useState, useEffect } from 'react'
import { subscribe, getZones, getProductTypes } from './store'
import { WarehouseView } from './components/WarehouseView'
import { CreateZoneForm } from './components/CreateZoneForm'
import { ProductTypesAdmin } from './components/ProductTypesAdmin'
import { AddProductModal } from './components/AddProductModal'
import { SearchProducts } from './components/SearchProducts'
import { ExportPdfModal } from './components/ExportPdfModal'
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
    </div>
  )
}

export default App
