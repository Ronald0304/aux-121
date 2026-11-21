# Fichero: portfolio full-stack

Portfolio personal organizado como un **fichero de biblioteca que funciona**. Cada proyecto es una ficha que sacas del cajón por su pestaña. Los aplausos son sellos de fecha, el libro de visitas es una tarjeta de circulación y el contacto es una papeleta de solicitud. Todo se guarda en SQLite.

**Stack:** HTML + CSS + JavaScript sin frameworks · Node.js + Express · SQLite (better-sqlite3).

## Arrancar

```bash
npm install
ADMIN_PASSWORD="una-contraseña-larga" npm start
# http://localhost:3000        → portfolio
# http://localhost:3000/admin  → Mostrador (panel admin)
```

Sin `ADMIN_PASSWORD` la contraseña del panel es `fichero`. **Cámbiala antes de publicar.**

La base `db/portfolio.sqlite` se crea y se llena con datos de ejemplo en el primer arranque.

## Poner tus datos

Todo el contenido inicial es **de ejemplo** (nombre, proyectos, experiencia, empresas).

1. Edita `db/seed.js` con tu perfil, proyectos, experiencia y habilidades.
2. Ejecuta `npm run seed`. Vuelve a crear el perfil, las fichas, la experiencia, las habilidades y el libro de visitas (también reinicia los sellos). Los mensajes recibidos se conservan.
3. Desde `/admin` puedes crear, editar y borrar fichas sin tocar código.

## Funciones

| Función | Dónde | Tabla |
|---|---|---|
| Proyectos, experiencia, habilidades | API pública `GET /api/*` | `projects`, `experience`, `skills`, `profile` |
| Sellos (aplausos), 1 por visitante, ficha y día | `POST /api/projects/:id/stamp` | `stamps` |
| Libro de visitas | `GET/POST /api/guestbook` | `guestbook` |
| Formulario de contacto | `POST /api/messages` | `messages` |
| Panel admin: papeletas, moderar firmas, CRUD de fichas | `/admin` · `/api/admin/*` | todas |

Seguridad incluida: sesión con cookie `HttpOnly` + `SameSite=Strict`, comparación de contraseña en tiempo constante, límite de peticiones por visitante, campo trampa contra bots y validación en servidor.

Variables opcionales: `PORT`, `DB_PATH`, `VISITOR_SALT`, `GUESTBOOK_MODERATION=1` (las firmas quedan ocultas hasta aprobarlas).

## Estructura

```
server.js            API + estáticos
db/schema.sql        tablas
db/seed.js           datos de ejemplo
public/index.html    portfolio
public/admin.html    Mostrador
public/css/          styles.css, admin.css
public/js/           app.js, admin.js
public/fonts/        Archivo y Courier Prime (autoalojadas, licencia OFL)
DESIGN.md            sistema visual
```
