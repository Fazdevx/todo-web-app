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
- [x] Planificador diario con las 5 secciones de la hoja impresa del colegio
      (FECHA, 3 PRIORIDADES, METAS DEL DÍA, ¿CUÁL ES TU HORARIO HOY?, IDEAS / PENDIENTES / PREOCUPACIONES)
- [x] Pantalla de ajustes: tema claro/oscuro/sistema, 5 paletas, densidad
- [x] Realtime: cambios en tareas se reflejan automaticamente
- [x] Responsive (mobile-first)
- [x] Service worker: cache para offline
- [x] PWA instalable

## Lo que NO esta (vs la app Android)

- Notificaciones push (requiere VAPID keys + service worker push API, mas complejo)
- Calendario con drag & drop
- Widget de escritorio

## Planificador diario (secciones derivadas de la hoja impresa)

La hoja escaneada del colegio (`Documento escaneado 13.pdf`) divide el día en cinco
bloques: **FECHA**, **3 PRIORIDADES**, **METAS DEL DÍA**, **¿CUÁL ES TU HORARIO HOY?**
(05:00 → 22:00) e **IDEAS / PENDIENTES / PREOCUPACIONES**.

La pestaña **Planificador** del frontend muestra esos mismos bloques y clasifica las
tareas que ya existen **sin cambiar la base de datos**: no se agregan atributos ni
collections, la vista solo lee los campos que ya hay en Appwrite.

| Sección de la hoja | De dónde sale |
| --- | --- |
| FECHA | El día elegido en el navegador de días + avance de tareas cumplidas |
| 3 PRIORIDADES | Las 3 tareas pendientes del día con `priority` más alta (a igual prioridad, la hora más temprana) |
| METAS DEL DÍA | El resto de tareas programadas para ese día (primero pendientes, luego cumplidas) |
| ¿CUÁL ES TU HORARIO HOY? | Cada tarea ubicada en la fila de la hora de su `dueAt` (05:00–22:00) |
| IDEAS / PENDIENTES / PREOCUPACIONES | Notas escritas en la hoja (localStorage, por día y por usuario) + tareas pendientes sin `dueAt` |

Reglas de clasificación:

- Una tarea con `dueAt` del día aparece en **3 PRIORIDADES** si está entre las 3 de
  mayor `priority`; si no, aparece en **METAS DEL DÍA**.
- Las tareas con hora fuera de 05:00–22:00 se listan aparte dentro del horario
  ("Fuera del horario impreso").
- Las tareas sin `dueAt` viven en **IDEAS / PENDIENTES / PREOCUPACIONES** hasta que se
  les asigne fecha (o se conviertan con un clic desde una nota de la hoja).
- Las pendientes de días anteriores se avisan arriba, con acceso directo al filtro
  **Vencidas** de la Agenda: no se mezclan con el día que se está planificando.

Código:

- `src/utils/planner.js` — `buildDayPlan()` hace toda la clasificación (función pura).
- `src/utils/plannerNotes.js` — notas del bloque IDEAS en `localStorage`.
- `src/pages/PlannerPage.jsx` — la pantalla del Planificador.

## Requisitos de la DB en Appwrite

Las dos collections deben tener los permisos a nivel de coleccion configurados
con `Role: Any` para `create`, `read`, `update` y `delete`. Si no, la primera
creacion de tarea fallara con error 401 igual que en la app Android.

El schema correcto esta en `appwrite_setup/tasks_schema.csv` y
`appwrite_setup/notifications_schema.csv`.
