import { useCallback, useState } from 'react'
import { Location, Product, ProductType } from '../types'
import { getProductTypes } from '../store'
import { ProductBox } from './ProductBox'
import { AddProductFromTypeModal } from './AddProductFromTypeModal'

interface LocationCellProps {
  location: Location
  products: Product[]
  onProductDrop: (product: Product, from: Location, to: Location) => void
}

export function LocationCell({ location, products, onProductDrop }: LocationCellProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [addFromType, setAddFromType] = useState<ProductType | null>(null)
  const types = getProductTypes()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const isProductType = e.dataTransfer.types.includes('application/x-product-type')
    e.dataTransfer.dropEffect = isProductType ? 'copy' : 'move'
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      const data = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain')
      if (!data) return
      try {
        const parsed = JSON.parse(data)
        if (parsed.productType) {
          setAddFromType(parsed.productType as ProductType)
        } else if (parsed.product && parsed.fromLocation) {
          onProductDrop(parsed.product as Product, parsed.fromLocation as Location, location)
        }
      } catch (_) {}
    },
    [location, onProductDrop]
  )

  const getColor = (productTypeId: string) => {
    const t = types.find(x => x.id === productTypeId)
    return t?.color ?? '#64748b'
  }

  return (
    <>
      <div
        className={`location-cell ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="location-label">
          {location.zoneName}, {location.row}, {location.column}
        </div>
        <div className="location-products">
          {products.map(p => (
            <ProductBox
              key={p.id}
              product={p}
              location={location}
              color={getColor(p.productTypeId)}
            />
          ))}
        </div>
      </div>

      {addFromType && (
        <AddProductFromTypeModal
          productType={addFromType}
          location={location}
          onClose={() => setAddFromType(null)}
        />
      )}
    </>
  )
}
