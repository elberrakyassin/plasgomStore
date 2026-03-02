import { v4 as uuidv4 } from 'uuid'
import type { Product, ProductType, Zone, Location, ProductAtLocation, Transaction } from './types'

const STORAGE_KEYS = {
  ZONES: 'almacen_zones',
  SHELVES: 'almacen_shelves', // legacy
  PRODUCTS: 'almacen_products',
  PRODUCT_TYPES: 'almacen_product_types',
  TRANSACTIONS: 'almacen_transactions'
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

export function isZoneEmpty(zoneName: string): boolean {
  return !getProductsAtLocations().some(p => p.location.zoneName === zoneName)
}

function isRowEmpty(zoneName: string, row: number, columns: number): boolean {
  const products = getProductsAtLocations()
  for (let col = 1; col <= columns; col++) {
    if (products.some(p => p.location.zoneName === zoneName && p.location.row === row && p.location.column === col)) {
      return false
    }
  }
  return true
}

function isColumnEmpty(zoneName: string, column: number, rows: number): boolean {
  const products = getProductsAtLocations()
  for (let row = 1; row <= rows; row++) {
    if (products.some(p => p.location.zoneName === zoneName && p.location.row === row && p.location.column === column)) {
      return false
    }
  }
  return true
}

export function canRemoveLastRow(zoneId: string): boolean {
  const z = getZones().find(x => x.id === zoneId)
  if (!z || z.rows <= 1) return false
  // Solo se puede quitar la fila superior si está vacía
  return isRowEmpty(z.name, z.rows, z.columns)
}

export function canRemoveLastColumn(zoneId: string): boolean {
  const z = getZones().find(x => x.id === zoneId)
  if (!z || z.columns <= 1) return false
  // Solo se puede quitar la columna derecha (última) si está vacía
  return isColumnEmpty(z.name, z.columns, z.rows)
}

export function addZoneRow(zoneId: string): boolean {
  const zones = getZones()
  const z = zones.find(x => x.id === zoneId)
  if (!z) return false
  z.rows += 1
  saveToStorage(STORAGE_KEYS.ZONES, zones)
  notify()
  return true
}

export function addZoneColumn(zoneId: string): boolean {
  const zones = getZones()
  const z = zones.find(x => x.id === zoneId)
  if (!z) return false
  z.columns += 1
  saveToStorage(STORAGE_KEYS.ZONES, zones)
  notify()
  return true
}

export function removeZoneRow(zoneId: string): boolean {
  const zones = getZones()
  const z = zones.find(x => x.id === zoneId)
  if (!z || z.rows <= 1) return false
  if (!canRemoveLastRow(zoneId)) return false

  // Quitar fila superior: solo reducir filas, sin renumerar
  z.rows -= 1
  saveToStorage(STORAGE_KEYS.ZONES, zones)
  notify()
  return true
}

export function removeZoneColumn(zoneId: string): boolean {
  const zones = getZones()
  const z = zones.find(x => x.id === zoneId)
  if (!z || z.columns <= 1) return false
  if (!canRemoveLastColumn(zoneId)) return false

  // Quitar columna derecha (última): solo reducir columnas, sin renumerar
  z.columns -= 1
  saveToStorage(STORAGE_KEYS.ZONES, zones)
  notify()
  return true
}

// Product types
export function getProductTypes(): ProductType[] {
  if (localStorage.getItem(STORAGE_KEYS.PRODUCT_TYPES) === null) {
    saveToStorage(STORAGE_KEYS.PRODUCT_TYPES, DEFAULT_PRODUCT_TYPES)
    return DEFAULT_PRODUCT_TYPES
  }
  return loadFromStorage<ProductType[]>(STORAGE_KEYS.PRODUCT_TYPES, [])
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

export function updateProductType(
  id: string,
  updates: { name?: string; color?: string }
): ProductType | null {
  const types = getProductTypes()
  const idx = types.findIndex(t => t.id === id)
  if (idx < 0) return null
  if (updates.name !== undefined) types[idx] = { ...types[idx], name: updates.name.trim() }
  if (updates.color !== undefined) types[idx] = { ...types[idx], color: updates.color }
  saveToStorage(STORAGE_KEYS.PRODUCT_TYPES, types)
  notify()
  return types[idx]
}

export function removeProductType(id: string): void {
  const types = getProductTypes().filter(t => t.id !== id)
  const products = getProductsAtLocations().filter(p => p.product.productTypeId !== id)
  saveToStorage(STORAGE_KEYS.PRODUCT_TYPES, types)
  setProductsAtLocations(products)
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

  const tx: Transaction = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    fromLocation: { zoneName: 'PALETA', row: 0, column: 0 },
    toLocation: { ...location },
    productId: newProduct.id,
    productName: newProduct.name,
    productTypeId: newProduct.productTypeId,
    quantityKg: newProduct.quantityKg
  }
  addTransaction(tx)

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

  const tx: Transaction = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    fromLocation: { ...fromLocation },
    toLocation: { ...toLocation },
    productId: product.id,
    productName: product.name,
    productTypeId: product.productTypeId,
    quantityKg: kgToMove
  }
  addTransaction(tx)
}

function getTransactionsRaw(): Transaction[] {
  return loadFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, [])
}

function saveTransactions(data: Transaction[]): void {
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, data)
}

function addTransaction(tx: Transaction): void {
  const data = getTransactionsRaw()
  data.unshift(tx)
  saveTransactions(data)
  notify()
}

export function getTransactions(): Transaction[] {
  return [...getTransactionsRaw()]
}

export interface TransactionSearchFilters {
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string
  productId?: string
  productName?: string
}

export function searchTransactions(filters: TransactionSearchFilters): Transaction[] {
  let result = getTransactionsRaw()
  if (filters.dateFrom) {
    const from = filters.dateFrom
    result = result.filter(t => t.timestamp.slice(0, 10) >= from)
  }
  if (filters.dateTo) {
    const to = filters.dateTo
    result = result.filter(t => t.timestamp.slice(0, 10) <= to)
  }
  if (filters.productId?.trim()) {
    const q = filters.productId.trim().toLowerCase()
    result = result.filter(t => t.productId.toLowerCase().includes(q))
  }
  if (filters.productName?.trim()) {
    const q = filters.productName.trim().toLowerCase()
    result = result.filter(t => t.productName.toLowerCase().includes(q))
  }
  return result
}

export function getTransactionById(id: string): Transaction | null {
  return getTransactionsRaw().find(t => t.id === id) ?? null
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
