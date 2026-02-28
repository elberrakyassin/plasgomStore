# Almacén Industrial

Aplicación para la gestión de un almacén industrial con zonas, ubicaciones y productos.

## Requisitos previos

- **Node.js** 18 o superior ([descargar](https://nodejs.org/))
- **npm** (incluido con Node.js)

## Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/elberrakyassin/plasgomStore.git
   cd plasgomStore
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

## Levantar la aplicación

### Modo web (recomendado)

Ejecuta:

```bash
npm run web
```

Se abrirá el navegador en `http://localhost:5173/`. Mantén la terminal abierta mientras usas la app.

### Modo Electron (escritorio)

```bash
npm run dev
```

Se iniciará la aplicación en una ventana de escritorio. Asegúrate de tener Electron instalado correctamente.

## Funcionalidades principales

- **Zonas**: Crear zonas con filas y columnas (pestañas)
- **Tipos de producto**: MP Activa, PA Conforme, etc. (colores distintos)
- **Productos**: Arrastrar tipos a celdas, editar ID, nombre y kg
- **Búsqueda**: Localizar productos por nombre
- **Exportar datos**: PDF (impresión), CSV y JSON
- **Persistencia**: Datos guardados en el navegador (localStorage)

## Estructura de exportación

- **PDF**: Ventana de impresión → elegir "Guardar como PDF"
- **CSV**: Columnas `zona`, `fila`, `columna`, `producto_id`, `producto_nombre`, `tipo_producto`, `cantidad_kg`
- **JSON**: Estructura con zonas, tipos de producto y productos en ubicaciones

## Tecnologías

- React + TypeScript
- Vite
- Electron (opcional)
- localStorage para persistencia

## Scripts disponibles

| Comando    | Descripción                     |
| ---------- | ------------------------------- |
| `npm run web` | App en el navegador (Vite)   |
| `npm run dev` | App con Electron              |
| `npm run build` | Build para producción        |
| `npm run start` | Vista previa del build      |
