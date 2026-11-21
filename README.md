# Portafolio web · Ronald Gutiérrez Mamani

Portafolio de estudiante de **Informática (UMSA, La Paz)** con una galería **WebGL** curva:
- tarjetas en forma de «sonrisa» que se mueven con la rueda, arrastrando o con las flechas;
- una lente de vidrio en los bordes con dispersión RGB y luces de color;
- un título que se mezcla mientras la tira se mueve;
- detalle de cada proyecto, «Sobre mí» y formulario de contacto.

**Stack:** HTML + CSS + JavaScript (three.js r128, shaders GLSL) · Node.js + Express · SQLite (better-sqlite3).

## Arrancar en tu computadora

```bash
npm install
ADMIN_PASSWORD="una-clave-larga" npm start
# http://localhost:3000        → portafolio
# http://localhost:3000/admin  → panel para editar proyectos y leer mensajes
```

En Windows (PowerShell): `$env:ADMIN_PASSWORD="una-clave-larga"; npm start`.
Sin `ADMIN_PASSWORD` la contraseña del panel es `fichero`. **Cámbiala antes de publicar.**

## Poner tus proyectos reales

Los 10 proyectos que trae son **ejemplos**. Tienes dos formas de cambiarlos:

1. **Desde el panel `/admin`** (recomendado): pestaña *Proyectos* → *Editar* o *Nuevo proyecto*. En cada proyecto puedes poner:
   - **Código de la tarjeta:** el texto corto que aparece gigante, por ejemplo `SIS INS`.
   - **Demo (URL):** el enlace donde se ve funcionando.
   - **Código (URL):** el repositorio en GitHub.
   - **Imagen:** una captura vertical. Guárdala en `public/img/proyectos/` y escribe `/img/proyectos/nombre.png`. Si no pones imagen, se genera un póster automáticamente.
2. **Desde el código:** edita `db/seed.js` y ejecuta `npm run seed`. Ojo: esto borra y vuelve a crear los proyectos, la experiencia, las habilidades y los «me gusta»; los mensajes recibidos se conservan.

## ¿Dónde subo cada cosa?

| Qué | Dónde | Por qué |
|---|---|---|
| **El código de cada proyecto** | Un repositorio por proyecto en **GitHub** (github.com/Ronald0304) | Es lo primero que revisan reclutadores y docentes. Agrega un README con capturas, cómo ejecutarlo y qué aprendiste. |
| **Proyectos solo de frontend** (HTML/CSS/JS, React, Vue) | **GitHub Pages**, **Netlify** o **Vercel** (gratis) | Se conectan a tu repositorio y publican cada vez que haces `git push`. |
| **Proyectos con backend Node.js / Python** | **Render** o **Railway** | Tienen plan gratuito o barato para servidores. |
| **Proyectos PHP + MySQL** (típicos de materias) | **InfinityFree** o **000webhost** (gratis), o un VPS | Soportan PHP y MySQL sin configurar servidores. |
| **Bases de datos en la nube** | **Neon** (PostgreSQL) o **Turso** (SQLite), ambos con plan gratis | Para que tus demos no pierdan datos al reiniciarse. |
| **Este portafolio completo** (con panel y mensajes) | **Render**: *New → Web Service* → conecta este repositorio → Build: `npm install` → Start: `npm start` → agrega la variable `ADMIN_PASSWORD` | Para que SQLite no se borre en cada despliegue, añade un *Disk* en Render y define `DB_PATH=/var/data/portfolio.sqlite`. |
| **Solo la página, sin servidor** | **GitHub Pages** con `public/index.html` | Funciona sola: usa los datos que vienen dentro del archivo, y el formulario abre tu correo. |

Después de publicar, pon el enlace del portafolio en tu **perfil de GitHub**, en **LinkedIn** y en tu **CV**.

## Funciones y base de datos

| Función | API | Tabla |
|---|---|---|
| Perfil, proyectos, experiencia y habilidades | `GET /api/profile`, `/api/projects`, `/api/experience`, `/api/skills` | `profile`, `projects`, `experience`, `skills` |
| «Me gusta» (1 por visitante, proyecto y día) | `POST /api/projects/:id/stamp` | `stamps` |
| Formulario de contacto | `POST /api/messages` | `messages` |
| Panel: mensajes, comentarios y CRUD de proyectos | `/admin`, `/api/admin/*` | todas |

**Seguridad:**
- sesión con cookie `HttpOnly` y `SameSite=Strict`;
- contraseña comparada en tiempo constante;
- límite de peticiones por visitante;
- campo trampa contra bots;
- validación en el servidor.

## Estructura

```
server.js              API + archivos estáticos
db/schema.sql          tablas
db/seed.js             tus datos (perfil y proyectos de ejemplo)
public/index.html      portafolio WebGL (un solo archivo)
public/admin.html      panel de administración
public/img/proyectos/  capturas de tus proyectos
```

## Controles

- **Rueda, arrastrar o ← →:** mover la tira.
- **Clic en una tarjeta:** ver el detalle.
- **Esc:** cerrar.
- **Cruz giratoria:** saltar varios proyectos.
- **LISTA/GRILLA:** ver todos a la vez.
- **SFX:** activar el sonido.
- **Colores** (abajo a la derecha): cambiar el fondo.
