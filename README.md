# Agenda PWA

Web app progresiva (PWA) que se conecta al mismo backend de Appwrite que la versión
Android. Se puede abrir en cualquier navegador y se puede "instalar" en el celular
para que se vea como una app nativa.

## Estructura

```
web/
├── index.html                # Pagina principal (shell de la PWA)
├── manifest.json             # Configuracion PWA
├── sw.js                     # Service worker (offline + cache)
├── css/
│   └── styles.css            # Estilos con variables para tema/paleta
├── js/
│   ├── config.js             # EDITAR: endpoint, project, DB, collection IDs
│   ├── api.js                # Wrapper de Appwrite (Auth, DB, Realtime)
│   ├── auth.js               # Helpers de sesion
│   ├── app.js                # Router, bootstrap, helpers
│   ├── screens-auth.js       # Login / Registro
│   ├── screens-agenda.js     # Pantalla principal
│   ├── screens-editor.js     # Crear / editar tareas
│   ├── screens-calendar.js   # Vista mensual
│   └── screens-settings.js   # Tema, paleta, densidad, logout
└── icons/
    └── icon.svg              # Icono SVG (la mayoria de los navegadores lo soportan)
```

## Como usarla localmente

### 1. Configurar las credenciales

Edita `js/config.js` y reemplaza los IDs:

```js
APPWRITE_DB_ID:            'agenda',           // tu database ID
APPWRITE_TASKS_COLLECTION: 'TASKS_ID_AQUI',    // ID de la collection tasks
APPWRITE_NOTIFS_COLLECTION:'NOTIFS_ID_AQUI',   // ID de la collection notifications
```

(El endpoint, project ID y los nombres de teams ya estan configurados.)

### 2. Servir la carpeta

Por seguridad los service workers solo funcionan sobre HTTP/HTTPS (no `file://`).
La forma mas simple es con Python:

```bash
cd web
python -m http.server 8000
```

O con Node:

```bash
npx serve web -l 8000
```

O con PowerShell (sin instalaciones extras, abre en LAN):

```powershell
cd "C:\Users\fabri\Downloads\Projcts\Galileo pj\to-do androd\web"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8000/')
$listener.Start()
# ... (no recomendado, mejor usar Python o Node)
```

### 3. Abrir en el navegador

- Celular: `http://IP_DE_TU_PC:8000` (tiene que estar en la misma red Wi-Fi)
- PC: `http://localhost:8000`

### 4. Instalar como app

- **Chrome/Edge (celular)**: menu -> "Instalar app" o "Agregar a pantalla principal"
- **Safari (iPhone)**: boton compartir -> "Agregar a pantalla de inicio"
- **Chrome (PC)**: boton de instalar en la barra de direcciones

## Caracteristicas implementadas

- [x] Login / Registro con email + password (Appwrite)
- [x] Lista de tareas con filtros (Todas / Pendientes / Hechas / Proximas / Vencidas)
- [x] Filtro por categoria
- [x] Crear / editar tareas (titulo, descripcion, categoria, prioridad, fecha+hora, recordatorio, puntos)
- [x] Marcar como hecha / borrar
- [x] Vista calendario mensual
- [x] Pantalla de ajustes: tema claro/oscuro/sistema, 5 paletas, densidad
- [x] Realtime: cambios en tareas se reflejan automaticamente
- [x] Responsive (mobile-first)
- [x] Service worker: cache para offline
- [x] PWA instalable

## Lo que NO esta (vs la app Android)

- Notificaciones push (requiere VAPID keys + service worker push API, mas complejo)
- Calendario con drag & drop
- Widget de escritorio

## Requisitos de la DB en Appwrite

Las dos collections deben tener los permisos a nivel de coleccion configurados
con `Role: Any` para `create`, `read`, `update` y `delete`. Si no, la primera
creacion de tarea fallara con error 401 igual que en la app Android.

El schema correcto esta en `appwrite_setup/tasks_schema.csv` y
`appwrite_setup/notifications_schema.csv`.
