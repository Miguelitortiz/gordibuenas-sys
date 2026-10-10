# Las Gordibuenas SYS

Aplicación local para gestionar comandas en un pequeño negocio.

## Stack

- **Astro** (modo server) para una app web simple de desplegar
- **LowDB** como base de datos local NoSQL (archivo JSON)
- UI minimalista con vistas por rol: **host**, **mesero** y **cocina**

## Funcionalidad implementada

- Selección de guisados del día desde el host
- Catálogo fijo:
  - Guisado: $35 c/u o **3 x $100**
  - Agua fresca chica: $25
  - Agua fresca 1 L: $45
  - Café: $35
- Mesero:
  - Crear comanda
  - Modificar pedido
  - Cancelar pedido
- Cocina:
  - Ver cola de pedidos
  - Ver próximo pedido
  - Marcar en preparación / terminado
- Host:
  - Recuento del día (totales, terminados, cancelados, activos)
  - Ingreso estimado vendido y en proceso
- Conexión LAN:
  - Ejecutar en una computadora host con `--host`
  - Dos o más dispositivos pueden abrir la IP del host y trabajar por rol

## Ejecutar

```bash
npm install
npm run dev
```

Luego abrir en la red local: `http://<IP_DEL_HOST>:4321`

## Build

```bash
npm run build
npm run preview
```

## Rutas

- `/` selector de panel
- `/host`
- `/mesero`
- `/cocina`

## API

- `GET/PUT /api/config`
- `GET/POST /api/orders`
- `PATCH /api/orders/:id`
- `GET /api/summary`
