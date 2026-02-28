import { v4 as uuidv4 } from 'uuid'
import type { Product, ProductType, Zone, Location, ProductAtLocation } from './types'

const STORAGE_KEYS = {
  ZONES: 'almacen_zones',
  SHELVES: 'almacen_shelves', // legacy
  PRODUCTS: 'almacen_products',
  PRODUCT_TYPES: 'almacen_product_types'
}

// Tipos de producto predefinidos
const DEFAULT_PRODUCT_TYPES: ProductType[] = [
  { id: 'mp-activa', name: 'MP Activa', color: '#2563eb', isDefault: true },
  { id: 'mp-bloqueada', name: 'MP Bloqueada', color: '#ea580c', isDefault: true },
  { id: 'pa-conforme', name: 'PA Conforme', color: '#16a34a', isDefault: true },
  { id: 'pa-no-conforme', name: 'PA No Conforme', color: '#dc2626', isDefault: true },
  { id: 'desperdicio', name: 'Desperdicio', color: '#78350f', isDefault: true }
]

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored) as T
  } catch (_) {}
  return defaultValue
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// Estado reactivo simple
type Listener = () => void
const listeners: Listener[] = []

function notify() {
  listeners.forEach(fn => fn())
}

export function subscribe(listener: Listener) {
  listeners.push(listener)
  return () => {
    const i = listeners.indexOf(listener)
    if (i >= 0) listeners.splice(i, 1)
  }
}

// Zones (1-based row/column: fila 1 abajo, fila N arriba)
export function getZones(): Zone[] {
  let zones = loadFromStorage<Zone[]>(STORAGE_KEYS.ZONES, [])
  if (zones.length === 0) {
    const legacy = loadFromStorage<{ id: string; name: string; rows: number; columns: number }[]>(
      STORAGE_KEYS.SHELVES,
      []
    )
    if (legacy.length > 0) {
      zones = legacy.map((s, i) => ({
        id: s.id,
        name: s.name,
        rows: s.rows,
        columns: s.columns,
        order: i
      }))
      saveToStorage(STORAGE_KEYS.ZONES, zones)
      localStorage.removeItem(STORAGE_KEYS.SHELVES)
    }
  }
  return [...zones].sort((a, b) => a.order - b.order)
}

export function addZone(name: string, rows: number, columns: number): Zone {
  const zones = getZones()
  const maxOrder = zones.length === 0 ? 0 : Math.max(...zones.map(z => z.order))
  const zone: Zone = {
    id: uuidv4(),
    name,
    rows,
    columns,
    order: maxOrder + 1
  }
  zones.push(zone)
  saveToStorage(STORAGE_KEYS.ZONES, zones)
  notify()
  return zone
}

export function removeZone(id: string): void {
  const zones = getZones().filter(z => z.id !== id)
  const products = getProductsAtLocations().filter(
    p => !zones.some(z => z.name === p.location.zoneName)
  )
  saveToStorage(STORAGE_KEYS.ZONES, zones)
  saveToStorage(STORAGE_KEYS.PRODUCTS, products)
  notify()
}

export function reorderZones(zoneIds: string[]): void {
  const zones = getZones()
  const byId = new Map(zones.map(z => [z.id, z]))
  zoneIds.forEach((id, i) => {
    const z = byId.get(id)
    if (z) z.order = i
  })
  saveToStorage(STORAGE_KEYS.ZONES, zones)
  notify()
}

// Product types
export function getProductTypes(): ProductType[] {
  const stored = loadFromStorage<ProductType[]>(STORAGE_KEYS.PRODUCT_TYPES, [])
  if (stored.length === 0) {
    saveToStorage(STORAGE_KEYS.PRODUCT_TYPES, DEFAULT_PRODUCT_TYPES)
    return DEFAULT_PRODUCT_TYPES
  }
  return stored
}

export function addProductType(name: string, color: string): ProductType {
  const types = getProductTypes()
  const newType: ProductType = {
    id: uuidv4(),
    name,
    color,
    isDefault: false
  }
  types.push(newType)
  saveToStorage(STORAGE_KEYS.PRODUCT_TYPES, types)
  notify()
  return newType
}

export function removeProductType(id: string): void {
  const types = getProductTypes().filter(t => !t.isDefault && t.id !== id)
  saveToStorage(STORAGE_KEYS.PRODUCT_TYPES, types)
  notify()
}

// Products at locations
export function getProductsAtLocations(): ProductAtLocation[] {
  return loadFromStorage<ProductAtLocation[]>(STORAGE_KEYS.PRODUCTS, [])
}

function setProductsAtLocations(data: ProductAtLocation[]): void {
  saveToStorage(STORAGE_KEYS.PRODUCTS, data)
  notify()
}

function isSameProduct(a: Product, b: Product): boolean {
  return a.name === b.name && a.productTypeId === b.productTypeId
}

export function addProductToLocation(
  product: Omit<Product, 'id'> & { id?: string },
  location: Location
): Product {
  const newProduct: Product = {
    ...product,
    id: product.id?.trim() || uuidv4()
  }
  const data = getProductsAtLocations()
  const existingIdx = data.findIndex(
    p =>
      p.location.zoneName === location.zoneName &&
      p.location.row === location.row &&
      p.location.column === location.column &&
      isSameProduct(p.product, newProduct)
  )
  if (existingIdx >= 0) {
    data[existingIdx] = {
      ...data[existingIdx],
      product: {
        ...data[existingIdx].product,
        quantityKg: data[existingIdx].product.quantityKg + newProduct.quantityKg
      }
    }
  } else {
    data.push({ product: newProduct, location })
  }
  setProductsAtLocations(data)
  return existingIdx >= 0 ? data[existingIdx].product : newProduct
}

export function moveProduct(
  fromLocation: Location,
  toLocation: Location,
  productId: string,
  kgToMove: number
): void {
  const data = getProductsAtLocations()
  const fromIdx = data.findIndex(
    p =>
      p.location.zoneName === fromLocation.zoneName &&
      p.location.row === fromLocation.row &&
      p.location.column === fromLocation.column &&
      p.product.id === productId
  )
  if (fromIdx < 0) return

  const item = data[fromIdx]
  const { product } = item

  if (kgToMove >= product.quantityKg) {
    data.splice(fromIdx, 1)
  } else {
    data[fromIdx] = {
      ...item,
      product: { ...product, quantityKg: product.quantityKg - kgToMove }
    }
  }
  const productToAdd = { ...product, quantityKg: kgToMove }
  const existingIdx = data.findIndex(
    p =>
      p.location.zoneName === toLocation.zoneName &&
      p.location.row === toLocation.row &&
      p.location.column === toLocation.column &&
      isSameProduct(p.product, productToAdd)
  )
  if (existingIdx >= 0) {
    data[existingIdx] = {
      ...data[existingIdx],
      product: {
        ...data[existingIdx].product,
        quantityKg: data[existingIdx].product.quantityKg + kgToMove
      }
    }
  } else {
    data.push({
      product: { ...product, id: uuidv4(), quantityKg: kgToMove },
      location: toLocation
    })
  }
  setProductsAtLocations(data)
}

export function getProductsAtLocation(location: Location): Product[] {
  return getProductsAtLocations()
    .filter(
      p =>
        p.location.zoneName === location.zoneName &&
        p.location.row === location.row &&
        p.location.column === location.column
    )
    .map(p => p.product)
}

export interface ProductSearchResult {
  name: string
  productTypeId: string
  totalKg: number
  locations: { location: Location; quantityKg: number }[]
}

export function searchProductsByName(query: string): ProductSearchResult[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return []
  const data = getProductsAtLocations()
  const byKey = new Map<string, ProductSearchResult>()
  for (const { product, location } of data) {
    if (!product.name.toLowerCase().includes(trimmed)) continue
    const key = `${product.name}|${product.productTypeId}`
    const existing = byKey.get(key)
    if (existing) {
      existing.totalKg += product.quantityKg
      existing.locations.push({ location, quantityKg: product.quantityKg })
    } else {
      byKey.set(key, {
        name: product.name,
        productTypeId: product.productTypeId,
        totalKg: product.quantityKg,
        locations: [{ location, quantityKg: product.quantityKg }]
      })
    }
  }
  return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name))
}
