# 🛒 MarketCali - Frontend Web Application

**MarketCali Frontend** es la aplicación de interfaz de usuario de punto de venta (POS) y administración comercial para supermercados. Diseñada bajo una arquitectura moderna de **React 18**, empaquetada con **Vite**, y estructurada según las mejores prácticas de **Domain-Driven Component Design** y co-localización de estilos.

---

## 🚀 Tecnologías Clave

*   **React 18**: Biblioteca principal para la construcción de interfaces de usuario.
*   **Vite**: Herramienta de compilación ultrarrápida y servidor de desarrollo.
*   **React Router Dom v6**: Enrutamiento declarativo del lado del cliente con rutas protegidas (`ProtectedRoute`).
*   **Axios**: Cliente HTTP centralizado con interceptores automáticos para Bearer JWT y manejo de sesiones.
*   **Html5-QRCode**: Motor de escaneo óptico por cámara web/móvil con control dinámico de cámaras y guía de escaneo.
*   **JsBarcode**: Generador e impresor de etiquetas de códigos de barras (CODE128).
*   **Web Audio API**: Feedback acústico sintetizado (beep pos) al confirmar lecturas de códigos de barras.
*   **CSS Nativo Moderno**: Tokens de diseño (`variables.css`), reseteo global (`base.css`) y estilos co-localizados por vista.
*   **Nginx & Docker**: Contenedor de producción con proxy reverso hacia el backend.

---

## 📂 Estructura del Repositorio (Best Practices)

El proyecto organiza el código fuente bajo un esquema modular, desacoplado y predecible:

```
marketcali-react/
├── index.html                      # Entry point HTML de la aplicación Vite
├── vite.config.js                  # Configuración de Vite y proxy local para desarrollo (/api, /auth)
├── nginx.conf                      # Configuración de Nginx para producción y proxy inverso al monolito
├── Dockerfile                      # Empaquetado multietapa (Node Alpine build -> Nginx Alpine runtime)
├── package.json                    # Dependencias y scripts de ejecución
│
└── src/
    ├── Main.jsx                    # Punto de entrada de React (montaje en DOM y estilos base)
    ├── App.jsx                     # Configuración central de rutas y AuthProvider
    │
    ├── api/                        # Capa de consumo HTTP y servicios API
    │   └── client.js               # Cliente Axios centralizado con interceptores JWT
    │
    ├── assets/                     # Recursos estáticos locales (logos, marcas gráficas)
    │
    ├── context/                    # Estado global de la aplicación
    │   └── AuthContext.jsx         # Contexto de autenticación, sesión, permisos y roles
    │
    ├── hooks/                      # Custom React Hooks reutilizables
    │   └── useHardwareScanner.js   # Detección de lectores físicos de código de barras (USB/Bluetooth HID)
    │
    ├── utils/                      # Utilidades y funciones auxiliares
    │   └── audio.js                # Emisor de beep sonoro POS usando Web Audio API
    │
    ├── styles/                     # Sistema de diseño global
    │   ├── variables.css           # Tokens de diseño (paleta esmeralda, tipografía, sombras, bordes)
    │   ├── base.css                # Reseteo CSS, tipografía Inter y animaciones globales
    │   └── App.css                 # Clases utilitarias globales de la aplicación
    │
    ├── components/                 # Componentes de UI reutilizables
    │   ├── auth/                   # Componentes de seguridad
    │   │   └── ProtectedRoute.jsx  # Guardián de rutas por token y roles (ADMIN, USER)
    │   ├── common/                 # Componentes atómicos transversales
    │   │   ├── BarcodeScanner.jsx  # Escáner de cámara flotante con visor y cambio de cámara
    │   │   ├── BarcodeScanner.css  # Estilos del modal y visor óptico
    │   │   ├── BarcodeLabelModal.jsx # Modal de render e impresión de etiquetas con código de barras
    │   │   └── BarcodeLabelModal.css # Estilos optimizados para impresión física (@media print)
    │   └── layout/                 # Estructura visual envolvente (Shell)
    │       ├── Layout.jsx          # Shell contenedor (Sidebar colapsable + Topbar + Contenido)
    │       ├── Layout.css          # Grid y disposición del layout
    │       ├── Sidebar.jsx         # Menú de navegación lateral con filtro de roles
    │       ├── Sidebar.css         # Estilos del sidebar y estados activos
    │       ├── Topbar.jsx          # Barra superior con datos del usuario, rol y cierre de sesión
    │       └── Topbar.css          # Estilos del topbar
    │
    └── pages/                      # Páginas y vistas del sistema (Co-localizadas con sus estilos)
        ├── auth/                   # Pantalla de inicio de sesión
        │   ├── Login.jsx           # Formulario con validación y manejo de credenciales
        │   └── Login.css           # Estilos de la vista de autenticación
        ├── home/                   # Tablero principal de bienvenida
        │   ├── HomePage.jsx        # Dashboard de bienvenida y acceso rápido
        │   └── HomePage.css        # Estilos del dashboard
        ├── productos/              # Gestión de catálogo e inventario
        │   ├── ProductoCRUD.jsx    # Mantenimiento de productos (Crear, Editar, Listar, Eliminar)
        │   ├── ProductoCRUD.css    # Estilos de la tabla de productos y modales CRUD
        │   ├── Producto.jsx        # Formulario especializado de registro
        │   ├── Producto.css        # Estilos del formulario de producto
        │   ├── ProductoVisualizador.jsx # Catálogo visual de solo lectura
        │   └── ProductoVisualizador.css # Estilos del catálogo
        ├── sales/                  # Punto de Venta (POS) y Caja Registradora
        │   ├── SalesPage.jsx       # Terminal POS: soporte escáner USB, cámara, vista dual (Grid/List)
        │   └── SalesPage.css       # Estilos de terminal de venta y panel de cobro
        ├── reports/                # Reportes y métricas de ventas
        │   ├── ReportsPage.jsx     # Visualizador de métricas de ventas e ingresos
        │   └── ReportsPage.css     # Estilos de tarjetas y reportes
        └── users/                  # Administración de usuarios y accesos (Solo Administrador)
            ├── UsersPage.jsx       # Gestión de cuentas y asignación de roles
            └── UsersPage.css       # Estilos de la tabla de usuarios
```

---

## ⚡ Características Principales del Frontend

1. **Terminal POS Inteligente con Vista Dual**:
   - **Vista Cuadrícula (Grid)**: Tarjetas visuales de productos con fotos y badges de stock para interacción táctil o visual.
   - **Vista Lista (Table)**: Tabla de alta densidad pensada para cajeros veloces.
2. **Soporte de Escaneo Híbrido**:
   - **Lector Físico de Códigos de Barras (Hardware HID)**: Intercepta ráfagas de teclado vía USB/Bluetooth con umbral de milisegundos sin requerir enfocar el campo de texto.
   - **Cámara Óptica**: Modal con viewport de escaneo y selección entre múltiples lentes de cámara.
   - **Feedback Sonoro**: Beep de confirmación sintetizado al escanear con éxito.
3. **Generación e Impresión de Etiquetas**:
   - Renderizado en vivo de código de barras CODE128 en modal emergente.
   - Hoja de impresión optimizada (`@media print`) para imprimir directamente en impresoras térmicas de etiquetas adhesivas.
4. **Control de Acceso Basado en Roles (RBAC)**:
   - Rutas privadas controladas con redirección automática al login si expira la sesión.
   - `ADMIN`: Acceso total (Gestión de usuarios, inventario, reportes, POS).
   - `USER / EMPLEADO`: Acceso restringido al Punto de Venta (POS) y consulta de inventario.

---

## 🛠️ Ejecución Local

### Prerrequisitos
- Node.js 18+ y npm instalados.
- Backend en ejecución (localmente en `:8088` o mediante Docker Compose).

### Pasos de Inicio
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo con Hot Reload
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`. Las solicitudes a `/api/*` y `/auth/*` se redirigen automáticamente hacia `http://localhost:8088` mediante el proxy configurado en `vite.config.js`.

### Compilación para Producción
```bash
npm run build
```
Genera los artefactos optimizados en la carpeta `dist/`.

---

## 🐳 Despliegue con Docker
El frontend cuenta con un `Dockerfile` de dos etapas que genera los estáticos con Node y los sirve con un servidor de alto rendimiento **Nginx**:
```bash
docker build -t marketcali-frontend .
docker run -p 80:80 marketcali-frontend
```
O preferiblemente mediante el orquestador general `docker-compose up -d` ubicado en el repositorio `marketcali-backend`.
