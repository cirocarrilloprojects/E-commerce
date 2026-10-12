# E-commerce — Tienda en línea full-stack

![Node](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)

Aplicación de comercio electrónico con **catálogo de productos, carrito (invitado y con sesión), checkout con Mercado Pago, historial de órdenes y panel de administración**. El repositorio contiene dos aplicaciones independientes:

| Carpeta                   | Descripción                                          | Puerto por defecto |
| ------------------------- | ---------------------------------------------------- | ------------------ |
| [`backend/`](./backend)   | API REST con Node.js, Express 5 y MongoDB (Mongoose) | `3000`             |
| [`frontend/`](./frontend) | SPA con React 19, Vite, Tailwind CSS 4 y DaisyUI 5   | `5173`             |

---

## Tabla de contenido

1. [Características](#1-características)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura](#3-arquitectura)
4. [Estructura del repositorio](#4-estructura-del-repositorio)
5. [Requisitos previos](#5-requisitos-previos)
6. [Instalación](#6-instalación)
7. [Configuración (variables de entorno)](#7-configuración-variables-de-entorno)
8. [Base de datos](#8-base-de-datos)
9. [Mercado Pago y webhook](#9-mercado-pago-y-webhook)
10. [Cómo ejecutar el proyecto](#10-cómo-ejecutar-el-proyecto)
11. [Scripts disponibles](#11-scripts-disponibles)
12. [API REST](#12-api-rest)
13. [Rutas del frontend](#13-rutas-del-frontend)
14. [Autenticación y seguridad](#14-autenticación-y-seguridad)
15. [Pruebas](#15-pruebas)
16. [Despliegue en producción](#16-despliegue-en-producción)
17. [Solución de problemas](#17-solución-de-problemas)
18. [Funcionalidades sugeridas (roadmap)](#18-funcionalidades-sugeridas-roadmap)
19. [Contribuir](#19-contribuir)
20. [Licencia](#20-licencia)

---

## 1. Características

**Clientes**

- Catálogo paginado, detalle de producto y control de stock visible.
- Carrito de **invitado** (`localStorage`) y carrito de **usuario** (servidor). Al iniciar sesión ambos se fusionan.
- Registro e inicio de sesión con cookie `httpOnly` (el token nunca es accesible desde JavaScript).
- Checkout con datos de envío y pago mediante **Mercado Pago**.
- Confirmación de pago **verificada contra el servidor** (no basta con visitar la URL de éxito).
- Historial de órdenes con su estado.

**Administradores**

- Alta, edición y baja de productos desde `/admin/dashboard/products`.
- Cuenta de administrador creada por script (no existe registro público de administradores).

**Backend**

- Arquitectura por capas: rutas → controladores → servicios → modelos.
- Validación de entrada con **Zod** en todas las rutas.
- Precios y stock **siempre calculados en el servidor** (el cliente no decide cuánto paga).
- Webhook de Mercado Pago con **firma HMAC verificada**, **idempotente** y con **transacción** para el descuento de stock.
- Manejo centralizado de errores con formato único.
- Rate limiting, `helmet`, CORS restringido y defensa CSRF por cabecera `Origin`.

**Frontend**

- Estado de servidor mediante hooks propios con cancelación de peticiones (`AbortController`).
- Formularios accesibles (`<label>`, `aria-invalid`, mensajes `role="alert"`).
- Carga diferida (`React.lazy`) de checkout, pagos, órdenes y panel de administración.
- Cliente HTTP centralizado que conserva el mensaje y el código de error del backend.

---

## 2. Stack tecnológico

| Capa          | Tecnologías                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| Frontend      | React 19, Vite 8, React Router 8, React Hook Form, Axios, Tailwind CSS 4, DaisyUI 5, React Hot Toast, React Icons  |
| Backend       | Node.js ≥ 20, Express 5, Mongoose 9, Zod 4, JWT (`jsonwebtoken`), `bcryptjs`, Helmet, `express-rate-limit`, Morgan |
| Base de datos | MongoDB (MongoDB Atlas recomendado)                                                                                |
| Pagos         | Mercado Pago (Checkout Pro + Webhooks)                                                                             |
| Calidad       | `oxlint`, `node:test` (backend), Vitest + Testing Library (frontend, opcional)                                     |

---

## 3. Arquitectura

```text
┌────────────────────────┐        /api (proxy de Vite en desarrollo)        ┌────────────────────────────┐
│  Frontend (React SPA)  │ ───────────────────────────────────────────────► │   Backend (Express 5)      │
│  localhost:5173        │ ◄───────────────────────────────────────────────  │   localhost:3000           │
└────────────────────────┘          cookie httpOnly "accessToken"            └──────────────┬─────────────┘
                                                                                            │ Mongoose
        ┌───────────────────────┐   webhook (servidor a servidor)             ┌─────────────▼─────────────┐
        │     Mercado Pago      │ ──────────────────────────────────────────► │      MongoDB Atlas        │
        └───────────────────────┘          POST /api/webhook                  └───────────────────────────┘
```

### Capas del backend

```text
Petición → helmet → cors → express.json → cookieParser → morgan
        → /api → [verifyOrigin] → [apiLimiter] → routes → middleware (authenticate, validate…)
        → controllers → services → models → MongoDB
        → (cualquier error) → errorHandler → { "error": "...", "details"?: [...] }
```

| Capa                | Responsabilidad                                                              |
| ------------------- | ---------------------------------------------------------------------------- |
| `routes/`           | Mapa URL → cadena de middlewares → controlador. Sin lógica.                  |
| `middleware/`       | Autenticación, validación Zod, CSRF, rate limit, firma del webhook, errores. |
| `controllers/`      | Traducen HTTP ↔ servicio. Sin acceso a base de datos.                        |
| `services/`         | Reglas de negocio. No conocen `req`/`res`; lanzan `AppError`.                |
| `models/`           | Esquemas e índices de Mongoose.                                              |
| `schema/`           | Esquemas Zod de entrada.                                                     |
| `config/`, `utils/` | Variables de entorno, conexión, cliente de Mercado Pago y utilidades puras.  |

### Capas del frontend

```text
pages → components / hooks / context → services → lib/http (axios) → backend
```

---

## 4. Estructura del repositorio

```text
E-commerce/
├── README.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── requests.http                 # Pruebas manuales (extensión REST Client de VS Code)
│   ├── scripts/
│   │   └── createAdmin.js            # Crea o promueve al administrador
│   ├── src/
│   │   ├── app.js                    # Configuración de Express (sin abrir el puerto)
│   │   ├── server.js                 # Punto de entrada: conexión a BD + listen + apagado ordenado
│   │   ├── config/
│   │   │   ├── db.js                 # Conexión a MongoDB (pool, health)
│   │   │   ├── env.js                # Carga y validación de variables de entorno
│   │   │   └── mercadopago.js        # Cliente del SDK de Mercado Pago
│   │   ├── controllers/              # authController, cartController, orderController,
│   │   │                             # productController, webhookController
│   │   ├── middleware/               # authenticate, errorHandler, rateLimiters,
│   │   │                             # validate, verifyMpWebhook, verifyOrigin
│   │   ├── models/                   # UserModel, ProductModel, CartModel, OrderModel
│   │   ├── routes/                   # index, authRoutes, productRoutes, cartRoutes,
│   │   │                             # orderRoutes, webhookRoutes
│   │   ├── schema/                   # common, authSchema, productSchema, cartSchema, orderSchema
│   │   ├── services/                 # authService, productService, cartService,
│   │   │                             # orderService, paymentService
│   │   └── utils/                    # AppError, authCookie, mercadoPagoSignature
│   └── test/                         # schemas.test.js, signature.test.js
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js                # Proxy /api → http://localhost:3000
    └── src/
        ├── main.jsx                  # Entrada (StrictMode + BrowserRouter)
        ├── App.jsx                   # Proveedores globales (UserProvider → CartProvider)
        ├── AppRoutes.jsx             # Mapa de rutas con lazy loading
        ├── index.css                 # Tailwind + DaisyUI
        ├── lib/                      # http.js, validation.js, format.js, config.js
        ├── services/                 # authServices, productServices, cartServices, orderServices
        ├── hooks/                    # useFetch, useProducts, useOrderStatus
        ├── context/                  # UserContext, CartContext
        ├── layout/                   # Layout, DashboardLayout
        ├── pages/                    # Home, DetailProduct, Login, Register, Checkout,
        │   │                         # PaymentResult, Orders, NotFound
        │   └── admin/                # AdminProducts, CreateProduct, UpdateProduct
        └── components/
            ├── ProtectedRoute.jsx
            ├── ui/                   # TextField, PasswordField, Spinner, Pagination
            ├── navbar/               # Navbar, AuthButtons, CartButton, CartModal, UserDropDown
            ├── auth/                 # LoginForm, RegisterForm
            ├── products/             # ProductCard, AddToCartButton, ProductForm
            └── admin/                # ProductsTable
```

---

## 5. Requisitos previos

| Herramienta                                                                                                                 | Versión                | Uso                                         |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------- |
| [Node.js](https://nodejs.org/)                                                                                              | ≥ 20 (LTS recomendado) | Backend y frontend                          |
| npm                                                                                                                         | ≥ 10                   | Gestor de paquetes                          |
| Git                                                                                                                         | cualquiera             | Control de versiones                        |
| Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)                                                                    | gratuita (M0)          | Base de datos                               |
| Cuenta de desarrollador en [Mercado Pago](https://www.mercadopago.com/developers)                                           | —                      | Pagos (credenciales de **prueba**)          |
| [ngrok](https://ngrok.com/) o [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) | —                      | Exponer el backend para el webhook en local |
| Extensión _REST Client_ de VS Code                                                                                          | opcional               | Usar `backend/requests.http`                |

Comprueba las versiones:

```bash
node -v   # v20.x o superior
npm -v
```

---

## 6. Instalación

```bash
# 1. Clonar el repositorio
git clone <URL-DEL-REPOSITORIO> E-commerce
cd E-commerce

# 2. Dependencias del backend
cd backend
npm install
cp .env.example .env        # Windows (PowerShell): Copy-Item .env.example .env

# 3. Dependencias del frontend
cd ../frontend
npm install
cp .env.example .env
```

### Paquetes del backend (`backend/package.json`)

| Paquete              | Versión | Para qué se usa                                     |
| -------------------- | ------- | --------------------------------------------------- |
| `express`            | ^5.3.0  | Servidor HTTP y enrutado                            |
| `mongoose`           | ^9.11.1 | ODM de MongoDB                                      |
| `zod`                | ^4.6.5  | Validación de entrada y de variables de entorno     |
| `jsonwebtoken`       | ^9.0.3  | Firma y verificación del JWT                        |
| `bcryptjs`           | ^3.0.3  | Hash de contraseñas                                 |
| `cookie-parser`      | ^1.4.7  | Lectura de la cookie de sesión                      |
| `cors`               | ^2.8.6  | Control de orígenes permitidos                      |
| `helmet`             | ^8.3.0  | Cabeceras de seguridad HTTP                         |
| `express-rate-limit` | ^8.7.1  | Límite de peticiones por IP                         |
| `morgan`             | ^1.12.1 | Registro de peticiones HTTP                         |
| `mercadopago`        | ^3.6.1  | SDK oficial de Mercado Pago                         |
| `dotenv`             | ^18.0.7 | Carga del archivo `.env`                            |
| `cross-env` _(dev)_  | ^10.1.0 | Variables de entorno multiplataforma en `npm start` |

### Paquetes del frontend (`frontend/package.json`)

| Paquete                                               | Versión                   | Para qué se usa                  |
| ----------------------------------------------------- | ------------------------- | -------------------------------- |
| `react`, `react-dom`                                  | ^19.2.8                   | Interfaz                         |
| `react-router`                                        | ^8.4.0                    | Enrutado del lado del cliente    |
| `axios`                                               | ^1.20.0                   | Cliente HTTP                     |
| `react-hook-form`                                     | ^7.89.0                   | Formularios y validación         |
| `react-hot-toast`                                     | ^2.6.1                    | Notificaciones                   |
| `react-icons`                                         | ^5.7.0                    | Iconos                           |
| `vite`, `@vitejs/plugin-react` _(dev)_                | ^8.3.0 / ^6.1.1           | Bundler y servidor de desarrollo |
| `tailwindcss`, `@tailwindcss/vite`, `daisyui` _(dev)_ | ^4.3.3 / ^4.3.3 / ^5.7.47 | Estilos                          |
| `oxlint` _(dev)_                                      | ^1.81.0                   | Linter                           |

> `autoprefixer`, `postcss`, `@types/react` y `@types/react-dom` no son necesarios con Tailwind 4 + Vite y sin TypeScript; puedes eliminarlos (comprueba antes que no exista un `postcss.config.*`).

---

## 7. Configuración (variables de entorno)

> **Nunca subas archivos `.env` al repositorio.** Solo `.env.example`, con valores de ejemplo, nunca secretos reales.

### Backend — `backend/.env`

Todas se validan al arrancar (`src/config/env.js`): si falta alguna o es inválida, el servidor **no inicia** y muestra qué corregir.

| Variable                     | Obligatoria | Ejemplo                                                                             | Descripción                                                                            |
| ---------------------------- | ----------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `NODE_ENV`                   | no          | `development`                                                                       | `development` \| `production` \| `test`                                                |
| `PORT`                       | no          | `3000`                                                                              | Puerto del servidor                                                                    |
| `TRUST_PROXY`                | no          | `0`                                                                                 | Nº de proxies de confianza (`1` en Render/Railway/Nginx)                               |
| `MONGO_URI`                  | **sí**      | `mongodb+srv://USUARIO:CLAVE@cluster0.xxxxx.mongodb.net/ecommerce?appName=Cluster0` | URI de MongoDB **con el nombre de la base antes del `?`**                              |
| `JWT_SECRET`                 | **sí**      | _(≥ 32 caracteres)_                                                                 | Secreto de firma. Genera uno: `openssl rand -base64 48`                                |
| `FRONTEND_URL`               | **sí**      | `http://localhost:5173`                                                             | Origen **exacto** del frontend (sin `/` final). Lo usan CORS, CSRF y las `back_urls`   |
| `BACKEND_URL`                | **sí**      | `https://abc123.ngrok-free.app`                                                     | URL **pública** del backend (Mercado Pago llama a `BACKEND_URL/api/webhook`)           |
| `COOKIE_SAMESITE`            | no          | `lax`                                                                               | `lax` \| `strict` \| `none` (`none` solo en producción con HTTPS y dominios distintos) |
| `MP_ACCESS_TOKEN`            | **sí**      | `TEST-xxxxxxxx…`                                                                    | Access token de Mercado Pago                                                           |
| `MERCADOPAGO_WEBHOOK_SECRET` | **sí**      | _(clave del panel)_                                                                 | Clave secreta para validar la firma del webhook                                        |
| `MP_CURRENCY_ID`             | **sí**      | `COP`                                                                               | Moneda de tu cuenta de Mercado Pago (ISO 4217)                                         |
| `ADMIN_EMAIL`                | solo seed   | `admin@tudominio.com`                                                               | Usado por `npm run seed:admin`                                                         |
| `ADMIN_USERNAME`             | solo seed   | `admin`                                                                             | Ídem                                                                                   |
| `ADMIN_PASSWORD`             | solo seed   | _(8–72 caracteres, robusta)_                                                        | Ídem. **No uses contraseñas de ejemplo**                                               |

### Frontend — `frontend/.env`

| Variable           | Valor por defecto | Descripción                                                          |
| ------------------ | ----------------- | -------------------------------------------------------------------- |
| `VITE_BACKEND_URL` | `/api`            | Ruta base de la API. Con el proxy de Vite no hace falta cambiarla    |
| `VITE_CURRENCY`    | `COP`             | Moneda para mostrar precios. **Debe coincidir con `MP_CURRENCY_ID`** |
| `VITE_LOCALE`      | `es-CO`           | Formato de números y fechas                                          |

> Todo lo que empieza por `VITE_` queda **incluido en el bundle público**. Jamás pongas secretos ahí.

---

## 8. Base de datos

El proyecto usa **MongoDB**. Las colecciones y sus índices se crean automáticamente la primera vez que se usan los modelos.

### Opción A — MongoDB Atlas (recomendada)

1. Crea un clúster gratuito (M0) en Atlas.
2. **Database Access** → crea un usuario con contraseña (rol _Read and write to any database_).
3. **Network Access** → añade tu IP actual (o `0.0.0.0/0` solo para pruebas).
4. **Connect → Drivers** → copia la URI y pégala en `MONGO_URI`:
   - sustituye `<usuario>` y `<contraseña>` (si la contraseña tiene caracteres especiales como `@ : / ?`, **codifícala** con URL-encoding);
   - **añade el nombre de la base** entre el host y el `?`:
     `...mongodb.net/ecommerce?appName=Cluster0`.
     Si lo omites, Atlas usará la base `test` y el catálogo aparecerá vacío.

Atlas ya funciona como _replica set_, requisito de las **transacciones** que usa el webhook para descontar stock.

### Opción B — MongoDB local con Docker

Las transacciones requieren _replica set_, también en local:

```bash
docker run -d --name mongo -p 27017:27017 mongo:7 --replSet rs0
docker exec mongo mongosh --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"localhost:27017"}]})'
```

```dotenv
MONGO_URI=mongodb://localhost:27017/ecommerce?replicaSet=rs0
```

### Modelo de datos

| Colección  | Campos principales                                                                                                                                                                                                                                                                                                                                                | Índices                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `users`    | `email` (minúsculas), `password` (hash bcrypt, oculto por defecto), `username`, `isAdmin`, `createdAt/updatedAt`                                                                                                                                                                                                                                                  | `email` único                                        |
| `products` | `name`, `description`, `price`, `stock`, `imageUrl`, timestamps                                                                                                                                                                                                                                                                                                   | `createdAt` descendente                              |
| `carts`    | `userId`, `products[{ productId, quantity }]`, timestamps                                                                                                                                                                                                                                                                                                         | `userId` único (un carrito por usuario)              |
| `orders`   | `userId`, `products[{ productId, name, price, quantity, imageUrl }]` _(foto del momento de la compra)_, `totalAmount`, `status`, `statusNote`, `mercadoPagoData{ preferenceId, payerEmail, paymentId, paymentStatus, transactionAmount, paymentMethodId, paidAt }`, `shippingInfo{ firstName, lastName, phone, address{ street, number, city, state, zipCode } }` | `userId`; `mercadoPagoData.paymentId` único _sparse_ |

**Estados de una orden (`status`)**

```text
pending ──pago aprobado────────────► approved       (final)
pending ──pago en proceso──────────► in_process ──► approved | rejected
pending ──rechazado / cancelado────► rejected | cancelled
pending ──aprobado SIN stock o con monto distinto──► needs_review   (final: requiere reembolso/revisión manual)
```

### Crear el administrador

Los administradores **no se crean desde el registro público**. Define `ADMIN_EMAIL`, `ADMIN_USERNAME` y `ADMIN_PASSWORD` en `backend/.env` y ejecuta:

```bash
cd backend
npm run seed:admin
```

Si el correo ya existe, ese usuario es promovido a administrador.

---

## 9. Mercado Pago y webhook

1. En [Mercado Pago Developers](https://www.mercadopago.com/developers) crea una **aplicación** y copia las **credenciales de prueba** → `MP_ACCESS_TOKEN`.
2. Mercado Pago **no puede llamar a `localhost`**. Expón el backend con un túnel:

   ```bash
   ngrok http 3000
   # Copia la URL https://xxxx.ngrok-free.app → BACKEND_URL en backend/.env
   ```

3. En el panel de la aplicación → **Webhooks**, configura la URL `https://xxxx.ngrok-free.app/api/webhook`, activa el evento **Pagos** y copia la **clave secreta** → `MERCADOPAGO_WEBHOOK_SECRET`.
4. Reinicia el backend y prueba con **usuarios y tarjetas de prueba** de Mercado Pago.

### Flujo de compra

```text
Frontend                         Backend                                   Mercado Pago
   │ POST /api/orders              │                                              │
   │ {items:[{id,quantity}],       │ 1. lee precios y stock REALES de la BD       │
   │  shippingInfo} ─────────────► │ 2. guarda la orden "pending"                 │
   │                               │ 3. crea la preferencia ────────────────────► │
   │ ◄── { paymentUrl } ────────── │ ◄───────────── init_point ────────────────── │
   │ redirige a paymentUrl ──────────────────────────────────────────────────────► │ el cliente paga
   │                               │ ◄── POST /api/webhook?data.id=… ──────────── │
   │                               │ valida la firma HMAC                         │
   │                               │ consulta el pago real a Mercado Pago ───────► │
   │                               │ transacción: estado de la orden + stock      │
   │ vuelve a /payment/success     │                                              │
   │ GET /api/orders/:id (cada 3 s)│ → muestra "Pago exitoso" solo si approved    │
```

Puntos clave:

- La URL de retorno (`/payment/success?status=approved`) **no prueba el pago**: el frontend consulta el estado real de la orden.
- El webhook es **idempotente**: Mercado Pago puede reenviarlo sin descontar el stock dos veces.
- El botón _Simular notificación_ del panel de Mercado Pago envía un id inexistente: el backend lo ignora y responde `200`.

---

## 10. Cómo ejecutar el proyecto

Necesitas **tres procesos**: base de datos (Atlas, siempre activa), backend y frontend.

```bash
# Terminal 1 — túnel para el webhook (solo si pruebas pagos)
ngrok http 3000

# Terminal 2 — Backend  → http://localhost:3000
cd backend
npm run dev

# Terminal 3 — Frontend → http://localhost:5173
cd frontend
npm run dev
```

**Comprobaciones rápidas**

| Qué           | Cómo                                                | Resultado esperado                   |
| ------------- | --------------------------------------------------- | ------------------------------------ |
| Backend y BD  | abrir `http://localhost:3000/health`                | `{"status":"ok","db":"connected"}`   |
| Frontend      | abrir `http://localhost:5173`                       | Portada con el catálogo              |
| Administrador | `npm run seed:admin` → iniciar sesión → _Dashboard_ | Acceso a `/admin/dashboard/products` |

**Primer uso:** crea el administrador → inicia sesión → crea productos desde _Dashboard_ → compra como cliente.

> En desarrollo el frontend llama a `/api` y Vite reenvía las peticiones a `http://localhost:3000` (ver `frontend/vite.config.js`). Por eso `FRONTEND_URL` debe ser exactamente `http://localhost:5173`; si Vite arranca en otro puerto, el backend responderá `403 Origen no permitido`.

---

## 11. Scripts disponibles

### Backend (`cd backend`)

| Comando              | Descripción                                                    |
| -------------------- | -------------------------------------------------------------- |
| `npm run dev`        | Servidor con recarga automática (`node --watch`)               |
| `npm start`          | Producción (`NODE_ENV=production`)                             |
| `npm run seed:admin` | Crea o promueve al administrador                               |
| `npm test`           | Pruebas unitarias con el runner nativo de Node (`node --test`) |

### Frontend (`cd frontend`)

| Comando           | Descripción                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo de Vite                                                     |
| `npm run build`   | Compilación de producción en `dist/`                                               |
| `npm run preview` | Sirve localmente la compilación de producción                                      |
| `npm run lint`    | Análisis estático con `oxlint`                                                     |
| `npm test`        | Pruebas de comportamiento (requiere configurar Vitest, ver [Pruebas](#15-pruebas)) |

---

## 12. API REST

**URL base:** `http://localhost:3000/api` · **Formato:** JSON · **Sesión:** cookie `httpOnly` `accessToken` (enviar `credentials: 'include'` / `withCredentials: true`).

### Convenciones

- Los errores siempre tienen la forma `{ "error": "mensaje", "details"?: [{ "field": "...", "message": "..." }] }`.
- Códigos usados: `200` OK · `201` creado · `400` datos inválidos · `401` no autenticado · `403` sin permiso / origen no permitido · `404` no encontrado · `409` conflicto (duplicado o stock) · `429` demasiadas peticiones · `502` fallo de Mercado Pago · `500` error interno.
- Los `:id` deben ser ObjectId válidos (24 caracteres hexadecimales).
- Límites: cuerpo máx. **100 kb**; **300** peticiones / 15 min por IP; **10** inicios de sesión fallidos / 15 min; **10** registros / hora.

### Salud

| Método | Ruta                          | Auth | Descripción                                                 |
| ------ | ----------------------------- | ---- | ----------------------------------------------------------- |
| GET    | `/health` _(fuera de `/api`)_ | —    | `200 {status, db:"connected"}` o `503` si la BD no responde |

### Autenticación

| Método | Ruta                 | Auth   | Cuerpo                                        | Respuesta                                                                     |
| ------ | -------------------- | ------ | --------------------------------------------- | ----------------------------------------------------------------------------- |
| POST   | `/api/auth/register` | —      | `{ username (3–20), email, password (8–72) }` | `201 { message, user }` + cookie. `409` si el correo existe                   |
| POST   | `/api/auth/login`    | —      | `{ email, password }`                         | `200 { id, username, email, isAdmin }` + cookie. `401` credenciales inválidas |
| POST   | `/api/auth/logout`   | —      | —                                             | `200 { message }` y borra la cookie                                           |
| GET    | `/api/auth/profile`  | Sesión | —                                             | `200 { id, username, email, isAdmin }`                                        |

### Productos

| Método | Ruta                            | Auth      | Cuerpo / Query                                                                                  | Respuesta                                    |
| ------ | ------------------------------- | --------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------- |
| GET    | `/api/products?page=1&limit=20` | —         | `limit` máx. 100                                                                                | `200 [productos]` + cabecera `X-Total-Count` |
| GET    | `/api/products/:id`             | —         | —                                                                                               | `200 producto` · `404`                       |
| POST   | `/api/products`                 | **Admin** | `{ name (3–50), description (10–500), price (> 0), stock (entero ≥ 0), imageUrl (http/https) }` | `201 { message, product }`                   |
| PUT    | `/api/products/:id`             | **Admin** | Cualquier subconjunto (≥ 1 campo) de los campos anteriores                                      | `200 { message, product }` · `404`           |
| DELETE | `/api/products/:id`             | **Admin** | —                                                                                               | `200 { message, product }` · `404`           |

### Carrito (requiere sesión; el dueño es siempre el usuario del token)

| Método | Ruta                         | Cuerpo                                   | Respuesta                                                           |
| ------ | ---------------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/api/cart`                  | —                                        | `200 { message, cart }` (carrito vacío si no existe)                |
| GET    | `/api/cart/total`            | —                                        | `200 { message, total }`                                            |
| POST   | `/api/cart/items`            | `{ productId, quantity (1–99, def. 1) }` | `200 { message, cart }` · `404` producto · `409` stock insuficiente |
| PUT    | `/api/cart/items/:productId` | `{ quantity (1–99) }`                    | `200 { message, cart }` · `404` · `409`                             |
| DELETE | `/api/cart/items/:productId` | —                                        | `200 { message, cart }` · `404`                                     |
| DELETE | `/api/cart`                  | —                                        | `200 { message, cart }` (idempotente)                               |

Forma de `cart`:

```json
{
  "userId": "…",
  "products": [
    {
      "productId": {
        "_id": "…",
        "name": "Taza",
        "price": 7000,
        "stock": 5,
        "imageUrl": "https://…"
      },
      "quantity": 2
    }
  ]
}
```

### Órdenes (requiere sesión)

| Método | Ruta              | Cuerpo                                                                                                                                         | Respuesta                                                                                 |
| ------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| POST   | `/api/orders`     | `{ items: [{ id, quantity }] (1–50), shippingInfo: { firstName, lastName, phone (7–20), address: { street, number, city, state, zipCode } } }` | `201 { message, paymentUrl, preferenceId, orderId }` · `404` · `409` stock · `502`        |
| GET    | `/api/orders`     | —                                                                                                                                              | `200 { orders }` (últimas 50)                                                             |
| GET    | `/api/orders/:id` | —                                                                                                                                              | `200 { order }` · `404` si no existe o es de otro usuario (un admin puede ver cualquiera) |

> El cliente **no envía precios ni nombres**: se leen de la base de datos.

### Webhook (lo llama Mercado Pago)

| Método | Ruta                          | Auth                                       | Descripción                                            |
| ------ | ----------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| POST   | `/api/webhook?data.id=<pago>` | Firma HMAC (`x-signature`, `x-request-id`) | `200` si se procesó o se ignoró · `401` firma inválida |

### Ejemplo con `curl`

```bash
# Iniciar sesión guardando la cookie
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"email":"admin@tudominio.com","password":"TuClaveSegura"}' \
  http://localhost:3000/api/auth/login

# Crear un producto (admin)
curl -b cookies.txt -H "Content-Type: application/json" \
  -d '{"name":"Taza Deku","description":"Taza edición especial","price":7000,"stock":20,"imageUrl":"https://ejemplo.com/taza.png"}' \
  http://localhost:3000/api/products

# Ver el carrito (cualquier usuario con sesión)
curl -b cookies.txt http://localhost:3000/api/cart
```

El archivo `backend/requests.http` contiene la colección completa para la extensión _REST Client_.

---

## 13. Rutas del frontend

| Ruta                                          | Acceso  | Descripción                                                                       |
| --------------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `/`                                           | Público | Catálogo paginado (`/?page=2`)                                                    |
| `/detailProduct/:id`                          | Público | Detalle de producto                                                               |
| `/register`, `/login`                         | Público | Redirigen al inicio si ya hay sesión                                              |
| `/checkout`                                   | Sesión  | Datos de envío y pago                                                             |
| `/orders`                                     | Sesión  | Historial de órdenes                                                              |
| `/payment/:status`                            | Sesión  | Resultado del pago: `success`, `failure` o `pending` (destino de las `back_urls`) |
| `/admin/dashboard/products`                   | Admin   | Listado de productos                                                              |
| `/admin/dashboard/products/createProduct`     | Admin   | Crear producto                                                                    |
| `/admin/dashboard/products/updateProduct/:id` | Admin   | Editar producto                                                                   |
| `*`                                           | Público | Página 404                                                                        |

> Proteger rutas en React es solo experiencia de usuario. La autorización real la imponen los middlewares `authenticate` y `requireAdmin` del backend.

---

## 14. Autenticación y seguridad

| Medida                                                                                                     | Dónde                                       |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| JWT firmado con HS256 (1 h) en **cookie `httpOnly`**, `secure` en producción y `sameSite` configurable     | `authService`, `authCookie`                 |
| Contraseñas con **bcrypt** (coste 12) y comparación de tiempo constante también para usuarios inexistentes | `authService`                               |
| El hash de la contraseña **nunca** se devuelve (`select: false`)                                           | `UserModel`                                 |
| Roles: `authenticate` (¿quién eres?) y `requireAdmin` (¿puedes?)                                           | `middleware/authenticate.js`                |
| El `userId` sale del **token**, nunca del cliente (sin IDOR)                                               | controladores de carrito y órdenes          |
| Precio, nombre y stock leídos **siempre** de la base de datos                                              | `orderService`                              |
| Validación Zod de body, params y query; los campos desconocidos se descartan                               | `middleware/validate.js`, `schema/`         |
| Defensa **CSRF** por cabecera `Origin` en métodos que modifican datos                                      | `middleware/verifyOrigin.js`                |
| `helmet`, CORS restringido a `FRONTEND_URL`, límite de cuerpo y rate limiting                              | `app.js`, `rateLimiters.js`                 |
| Firma HMAC del webhook, idempotencia, verificación del monto y transacción para el stock                   | `mercadoPagoSignature.js`, `paymentService` |
| Los errores 5xx nunca exponen detalles internos (el _stack_ solo en desarrollo)                            | `errorHandler.js`                           |
| Variables de entorno validadas al arrancar                                                                 | `config/env.js`                             |

**Buenas prácticas para quien despliega**

- Genera un `JWT_SECRET` aleatorio de ≥ 32 caracteres y **rótalo** si alguna vez se publicó.
- Usa contraseñas robustas para la base de datos y el administrador.
- Restringe _Network Access_ en Atlas a las IP del servidor cuando sea posible.
- En producción usa **HTTPS** y revisa `COOKIE_SAMESITE`, `TRUST_PROXY` y `FRONTEND_URL`.

**Limitaciones conocidas:** `isAdmin` viaja dentro del JWT (un cambio de rol tarda hasta 1 h en reflejarse) y el cierre de sesión no invalida el token en el servidor (expira solo). Ver el [roadmap](#18-funcionalidades-sugeridas-roadmap).

---

## 15. Pruebas

### Backend

```bash
cd backend
npm test
```

Cubre la verificación de firma del webhook y los esquemas de validación (runner nativo `node:test`).

### Frontend (opcional)

La carpeta `frontend/tests/` contiene pruebas de comportamiento con Vitest + Testing Library y una API simulada (carrito, checkout, pago, rutas protegidas, formularios). Para ejecutarlas:

```bash
cd frontend
npm install -D vitest jsdom @testing-library/react @testing-library/user-event
```

Añade el script en `frontend/package.json`:

```json
"scripts": { "test": "vitest run" }
```

Y crea `frontend/vitest.config.js`:

```js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.jsx"],
  },
});
```

```bash
npm test
```

> Pendiente: pruebas de integración del backend con una base de datos temporal (servicios con Mongoose y Mercado Pago).

---

## 16. Despliegue en producción

1. **Base de datos:** Atlas con usuario dedicado y _Network Access_ restringido.
2. **Backend** (Render, Railway, Fly.io, VPS…):
   - `NODE_ENV=production`, `TRUST_PROXY=1` (si hay proxy), `FRONTEND_URL` y `BACKEND_URL` con los dominios reales (HTTPS).
   - Credenciales de Mercado Pago de **producción** y `MERCADOPAGO_WEBHOOK_SECRET` correspondiente.
   - Comando de inicio: `npm start`. Comprobación de salud: `GET /health`.
3. **Frontend:** `npm run build` y servir `frontend/dist/` (Netlify, Vercel, Nginx…).
4. **Mismo dominio para web y API (recomendado):** así la cookie es _same-site_ y puedes dejar `COOKIE_SAMESITE=lax`. Ejemplo con Nginx:

   ```nginx
   server {
     server_name tienda.ejemplo.com;

     root /var/www/ecommerce/dist;
     location / { try_files $uri /index.html; }      # SPA: todas las rutas a index.html

     location /api/ {
       proxy_pass http://127.0.0.1:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

5. **Dominios distintos** para web y API: usa `COOKIE_SAMESITE=none` (exige HTTPS), `FRONTEND_URL` exacto y, en el frontend, `VITE_BACKEND_URL` con la URL absoluta de la API.
6. Actualiza las URL del webhook y de retorno en el panel de Mercado Pago.

---

## 17. Solución de problemas

| Síntoma                                                                     | Causa probable                                                         | Solución                                                                                                                          |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| El backend se cierra al arrancar con `Variables de entorno inválidas`       | Falta o es inválida alguna variable                                    | Revisa `backend/.env` contra la tabla de la sección 7 (p. ej. `JWT_SECRET` < 32 caracteres)                                       |
| `No se pudo conectar a MongoDB` / `Server selection timed out`              | IP no permitida en Atlas, DNS lento o URI incorrecta                   | Atlas → _Network Access_; revisa usuario/clave (codificación URL)                                                                 |
| La API responde pero el catálogo está vacío                                 | La URI no incluye el nombre de la base y Atlas usó `test`              | Añade `/nombre_db` antes del `?` en `MONGO_URI`                                                                                   |
| `403 Origen no permitido`                                                   | `FRONTEND_URL` no coincide con el origen del navegador                 | Debe ser exactamente `http://localhost:5173` (sin `/` final)                                                                      |
| La sesión no se mantiene (cookie no se guarda)                              | `credentials` desactivado, `sameSite`/HTTPS incorrectos                | El cliente HTTP ya envía credenciales; en producción revisa `COOKIE_SAMESITE`, HTTPS y `TRUST_PROXY`                              |
| `401 No autenticado` en carrito/órdenes                                     | No hay sesión o expiró (1 h)                                           | Inicia sesión de nuevo                                                                                                            |
| `403 Acceso denegado` al crear productos                                    | El usuario no es administrador                                         | Ejecuta `npm run seed:admin` e inicia sesión con esa cuenta                                                                       |
| El pago se realiza pero la orden queda `pending`                            | El webhook no llega o la firma es inválida                             | Verifica `BACKEND_URL` (túnel activo), la URL configurada en el panel y `MERCADOPAGO_WEBHOOK_SECRET`. Revisa los logs del backend |
| `Transaction numbers are only allowed on a replica set member`              | MongoDB local sin _replica set_                                        | Usa Atlas o inicia `mongod` con `--replSet` (sección 8, opción B)                                                                 |
| `429 Demasiadas solicitudes`                                                | Rate limit alcanzado                                                   | Espera la ventana indicada en las cabeceras `RateLimit-*`                                                                         |
| El build falla en Linux/CI con `Could not resolve` pero funciona en Windows | Diferencias de mayúsculas/minúsculas en nombres de archivos o carpetas | Usa exactamente el mismo nombre en el archivo y en el `import`                                                                    |

---

## 18. Funcionalidades sugeridas (roadmap)

**Alta prioridad**

- **Reserva de stock** al crear la orden (con expiración) para no vender el mismo producto a varios compradores a la vez.
- **Panel de órdenes para administradores:** listado, filtros, detalle y gestión de las órdenes en `needs_review` (reembolsos mediante la API de Mercado Pago).
- **Recuperación de contraseña y verificación de correo** (envío de emails transaccionales).
- **Sesiones más robustas:** _refresh tokens_ con rotación y revocación de tokens al cerrar sesión.

**Catálogo y experiencia**

- Categorías, **búsqueda, filtros y ordenamiento** en el backend (`GET /api/products?search=&category=&sort=`).
- **Subida de imágenes** (Cloudinary/S3) en lugar de pegar URL, con múltiples imágenes por producto.
- Reseñas y valoraciones, lista de deseos, productos relacionados.
- Cupones de descuento y cálculo de **costos de envío**.
- Notificaciones por email del estado de la orden y página de seguimiento.

**Ingeniería**

- Documentación **OpenAPI/Swagger** de la API.
- **Docker Compose** (API + MongoDB con replica set) y **CI/CD** con GitHub Actions (lint, build, tests).
- Tests de integración del backend y **E2E** con Playwright.
- Logging estructurado (`pino`), métricas y _tracing_.
- Rate limiting con **Redis** para varias instancias.
- Migrar la capa de datos del frontend a **TanStack Query** y evaluar **TypeScript**.
- Internacionalización (i18n) y auditoría de accesibilidad (Lighthouse/axe).

---

## 19. Contribuir

1. Haz un _fork_ y crea una rama: `git checkout -b feature/mi-mejora`.
2. Mantén el estilo del proyecto (capas, nombres, comentarios explicativos) y ejecuta `npm run lint` y `npm test` antes de commitear.
3. Usa mensajes de commit descriptivos (por ejemplo, [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`).
4. Abre un _Pull Request_ explicando **qué** cambia y **por qué**.

**Reglas del proyecto**

- No subas `.env`, credenciales ni `node_modules`.
- No cambies contratos de la API sin documentarlo en este README y avisar al equipo del frontend.
- Los precios y el stock nunca deben calcularse con datos enviados por el cliente.

---

## 20. Licencia

Distribuido bajo la licencia **ISC**. Consulta el archivo `LICENSE` (añádelo al repositorio si aún no existe).
