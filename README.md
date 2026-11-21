# Portfolio full-stack · estilo anime

Portfolio personal con estética de **plataforma de streaming de anime**:
- un carrusel de estrenos con arte a pantalla completa;
- un «Top de la semana» con números gigantes;
- un catálogo de pósters con filtros por género;
- ficha de personaje con stats, temporadas (experiencia), comentarios y contacto.

El arte de cada proyecto se genera en SVG a partir de su identificador (`public/js/art.js`): no hace falta subir imágenes. Todo el contenido se guarda en SQLite.

**Stack:** HTML + CSS + JavaScript sin frameworks · Node.js + Express · SQLite (better-sqlite3).

## Arrancar

```bash
npm install
ADMIN_PASSWORD="una-contraseña-larga" npm start
# http://localhost:3000        → portfolio
# http://localhost:3000/admin  → panel admin
```

Sin `ADMIN_PASSWORD` la contraseña del panel es `fichero`. **Cámbiala antes de publicar.**

La base `db/portfolio.sqlite` se crea y se llena con datos de ejemplo en el primer arranque.

## Poner tus datos

Todo el contenido inicial es **de ejemplo** (nombre, proyectos, experiencia, empresas).

1. Edita `db/seed.js` con tu perfil, proyectos, experiencia y habilidades.
2. Ejecuta `npm run seed`. Vuelve a crear el perfil, las fichas, la experiencia, las habilidades y el libro de visitas (también reinicia los «me gusta»). Los mensajes recibidos se conservan.
3. Desde `/admin` puedes crear, editar y borrar proyectos sin tocar código. Los 4 primeros (por orden) salen en el carrusel.

## Funciones

| Función | Dónde | Tabla |
|---|---|---|
| Proyectos, experiencia, habilidades | API pública `GET /api/*` | `projects`, `experience`, `skills`, `profile` |
| «Me gusta», 1 por visitante, proyecto y día | `POST /api/projects/:id/stamp` | `stamps` |
| Comentarios | `GET/POST /api/guestbook` | `guestbook` |
| Formulario de contacto | `POST /api/messages` | `messages` |
| Panel admin: mensajes, moderar comentarios, CRUD de proyectos | `/admin` · `/api/admin/*` | todas |

Seguridad incluida: sesión con cookie `HttpOnly` + `SameSite=Strict`, comparación de contraseña en tiempo constante, límite de peticiones por visitante, campo trampa contra bots y validación en servidor.

Variables opcionales: `PORT`, `DB_PATH`, `VISITOR_SALT`, `GUESTBOOK_MODERATION=1` (las firmas quedan ocultas hasta aprobarlas).

## Estructura

```
server.js            API + estáticos
db/schema.sql        tablas
db/seed.js           datos de ejemplo
public/index.html    portfolio
public/admin.html    panel admin
public/css/          styles.css, admin.css
public/js/           app.js, admin.js, art.js (arte SVG procedural)
public/fonts/        Dela Gothic One y Zen Kaku Gothic New (autoalojadas, licencia OFL)
DESIGN.md            sistema visual
```
