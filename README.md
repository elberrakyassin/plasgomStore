# Almacén Industrial

Aplicación de escritorio/híbrida para gestionar un almacén industrial con zonas, estanterías y productos.

## Características

- **Zonas/Estanterías**: Crea estanterías con nombre, filas y columnas. Cada celda es una ubicación (ej: A, 2, 4).
- **Productos**: Añade productos con nombre, cantidad (kg) y tipo. Cada producto se muestra como un cuadrado con color según su tipo.
- **Tipos de producto** (colores):
  - MP Activa (azul)
  - MP Bloqueada (naranja)
  - PA Conforme (verde)
  - PA No Conforme (rojo)
  - Desperdicio (marrón)
  - El admin puede añadir más tipos personalizados.
- **Drag & Drop**: Arrastra productos entre ubicaciones. Al soltar, la app pregunta cuántos kg mover.
  - Si mueves todo el stock, el producto se elimina del origen.
  - Si mueves parte, se crea un nuevo producto en destino y se resta en origen.

## Ejecución

### Modo web (desarrollo rápido)
```bash
npm run web
```
Abre http://localhost:5173 en el navegador.

### Modo Electron (app de escritorio)
```bash
npm run dev
```

### Compilar para producción
```bash
npm run build
npm run start
```

## Tecnologías

- React + TypeScript
- Vite
- Electron (para app de escritorio)
- LocalStorage (persistencia)
