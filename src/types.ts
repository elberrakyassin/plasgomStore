// Tipos de producto predefinidos
export type ProductTypeId = 
  | 'mp-activa'      // MP activa - azul
  | 'mp-bloqueada'   // MP bloqueada - naranja
  | 'pa-conforme'    // PA conforme - verde
  | 'pa-no-conforme' // PA no conforme - rojo
  | 'desperdicio'    // Desperdicio - marrón

export interface ProductType {
  id: string
  name: string
  color: string
  isDefault: boolean // Los predefinidos no se pueden eliminar
}

export interface Product {
  id: string
  name: string
  productTypeId: string
  quantityKg: number
}

export interface Location {
  zoneName: string
  row: number
  column: number
}

export interface Zone {
  id: string
  name: string
  rows: number
  columns: number
  order: number
}

export interface ProductAtLocation {
  product: Product
  location: Location
}
