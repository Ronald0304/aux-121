// Datos iniciales del portfolio.
// Los PROYECTOS, fechas y descripciones son EJEMPLOS: cámbialos por los tuyos
// y ejecuta `npm run seed` (vuelve a crear perfil, proyectos, experiencia y habilidades).
// Para la imagen de cada proyecto pon una URL (https://...) o una ruta como /img/proyectos/mi-captura.png.
const { db, init } = require('./db');

const profile = {
  surname: 'Gutiérrez Mamani',
  given_name: 'Ronald',
  born_year: null,
  role: 'Estudiante de Informática · Desarrollo web',
  location: 'La Paz, Bolivia',
  summary:
    'Estudio la Licenciatura en Informática en la Universidad Mayor de San Andrés (UMSA) y construyo aplicaciones web de punta a punta: interfaces, APIs y bases de datos.',
  note: 'Me interesan el frontend con buena interacción, el backend en Node.js y modelar bien los datos. Busco prácticas, pasantías o proyectos freelance.',
  email: 'hola@ejemplo.dev',
  github: 'https://github.com/Ronald0304',
  linkedin: '',
  available: 1,
  since_year: 2022,
};

const projects = [
  {
    code: 'PRT WBGL', slug: 'portfolio-webgl', title: 'Este portfolio', subtitle: 'galería WebGL con API propia', year: 2026, category: 'Web',
    summary: 'El sitio que estás viendo: una galería curva en WebGL con lente de vidrio, conectada a una API en Express y una base SQLite.',
    details: 'Shaders propios para la curva, el revelado por bloques y la refracción del borde. Panel de administración para editar los proyectos sin tocar código.',
    stack: 'three.js, GLSL, JavaScript, Node.js, Express, SQLite', url: '/', repo: 'https://github.com/Ronald0304/aux-121',
  },
  {
    code: 'SIS INS', slug: 'sistema-inscripciones', title: 'Sistema de inscripciones', subtitle: 'proyecto de materia (ejemplo)', year: 2025, category: 'Web',
    summary: 'Inscripción a materias con control de cupos, prerrequisitos y horarios que no se cruzan.',
    details: 'Modelo relacional normalizado, validaciones en el servidor y reportes en PDF por estudiante.',
    stack: 'PHP, MySQL, Bootstrap',
  },
  {
    code: 'TLF RTS', slug: 'rutas-teleferico', title: 'Rutas en teleférico', subtitle: 'planificador de viajes (ejemplo)', year: 2025, category: 'Mapas',
    summary: 'Calcula la mejor combinación de líneas de teleférico entre dos puntos de La Paz y El Alto.',
    details: 'Grafo de estaciones con Dijkstra; el mapa se dibuja con Leaflet y la ruta se anima tramo a tramo.',
    stack: 'JavaScript, Leaflet, Algoritmos de grafos',
  },
  {
    code: 'CHT RT', slug: 'chat-tiempo-real', title: 'Chat en tiempo real', subtitle: 'salas y mensajes (ejemplo)', year: 2025, category: 'Tiempo real',
    summary: 'Chat con salas, usuarios conectados y aviso de "está escribiendo".',
    details: 'WebSockets con Socket.IO, mensajes guardados en SQLite y autenticación por sesión.',
    stack: 'Node.js, Socket.IO, SQLite',
  },
  {
    code: 'API NTS', slug: 'api-notas', title: 'API de notas', subtitle: 'REST con autenticación (ejemplo)', year: 2024, category: 'API',
    summary: 'API REST para registrar notas y calcular promedios por gestión.',
    details: 'Rutas documentadas con OpenAPI, tokens JWT y pruebas automáticas de los endpoints.',
    stack: 'Express, JWT, PostgreSQL, Jest',
  },
  {
    code: 'GRF ALG', slug: 'visualizador-algoritmos', title: 'Visualizador de algoritmos', subtitle: 'estructuras de datos (ejemplo)', year: 2024, category: 'Educativo',
    summary: 'Muestra paso a paso BFS, DFS, Dijkstra y algoritmos de ordenamiento.',
    details: 'Canvas 2D con controles de velocidad y pausa para estudiar cada iteración.',
    stack: 'JavaScript, Canvas, HTML, CSS',
  },
  {
    code: 'CLM LPZ', slug: 'clima-la-paz', title: 'Clima La Paz', subtitle: 'tablero con API pública (ejemplo)', year: 2024, category: 'Datos',
    summary: 'Tablero del clima con pronóstico por horas y gráficos de temperatura y lluvia.',
    details: 'Consumo de una API pública con caché en el navegador y gráficos con Chart.js.',
    stack: 'JavaScript, Fetch API, Chart.js',
  },
  {
    code: 'TND BRR', slug: 'tienda-barrio', title: 'Tienda de barrio', subtitle: 'catálogo y pedidos (ejemplo)', year: 2024, category: 'Web',
    summary: 'Catálogo con carrito y pedidos por WhatsApp para un negocio pequeño.',
    details: 'Sitio estático rápido con panel sencillo para actualizar precios.',
    stack: 'HTML, CSS, JavaScript, Netlify',
  },
  {
    code: 'AGD MED', slug: 'agenda-citas', title: 'Agenda de citas', subtitle: 'consultorio médico (ejemplo)', year: 2023, category: 'Web',
    summary: 'Reserva de citas con horarios disponibles y recordatorios.',
    details: 'Calendario propio, roles de recepción y médico, y base de datos relacional.',
    stack: 'Laravel, MySQL, JavaScript',
  },
  {
    code: 'BIB UMSA', slug: 'catalogo-biblioteca', title: 'Catálogo de biblioteca', subtitle: 'búsqueda y préstamos (ejemplo)', year: 2023, category: 'Datos',
    summary: 'Búsqueda de libros por autor, materia y título, con control de préstamos.',
    details: 'Búsqueda de texto completo en SQLite (FTS5) y paginación en el servidor.',
    stack: 'Python, Flask, SQLite',
  },
].map((p, i) => ({
  accession: `${p.year}.${String(i + 1).padStart(2, '0')}`,
  call_number: p.code,
  url: '',
  repo: '',
  image: '',
  sort: i + 1,
  ...p,
}));

const experience = [
  { org: 'Universidad Mayor de San Andrés (UMSA)', role: 'Licenciatura en Informática', start_date: '2022-03', end_date: null,
    description: 'Carrera de Informática, Facultad de Ciencias Puras y Naturales. Énfasis en desarrollo web, bases de datos y algoritmos.', sort: 1 },
  { org: 'Proyectos académicos y personales', role: 'Desarrollo web full-stack', start_date: '2023-01', end_date: null,
    description: 'Aplicaciones con frontend en JavaScript, APIs en Node.js y bases de datos SQL. (Edita este texto con tu experiencia real.)', sort: 2 },
];

const skills = [
  { heading: 'Frontend', subheading: 'Interfaces', level: 85, items: 'HTML, CSS, JavaScript, three.js, WebGL, responsive', see_also: null, sort: 1 },
  { heading: 'Backend', subheading: 'Servidor', level: 78, items: 'Node.js, Express, PHP, APIs REST', see_also: null, sort: 2 },
  { heading: 'Datos', subheading: 'Bases de datos', level: 75, items: 'SQL, SQLite, MySQL, PostgreSQL', see_also: null, sort: 3 },
  { heading: 'Herramientas', subheading: 'Flujo de trabajo', level: 72, items: 'Git, GitHub, Linux, VS Code', see_also: null, sort: 4 },
];

const guestbook = [];

function seed() {
  init();
  const tx = db.transaction(() => {
    db.exec('DELETE FROM stamps; DELETE FROM projects; DELETE FROM experience; DELETE FROM skills; DELETE FROM guestbook; DELETE FROM profile;');
    db.prepare(`INSERT INTO profile (id, surname, given_name, born_year, role, location, summary, note, email, github, linkedin, available, since_year)
      VALUES (1, @surname, @given_name, @born_year, @role, @location, @summary, @note, @email, @github, @linkedin, @available, @since_year)`).run(profile);
    const p = db.prepare(`INSERT INTO projects (slug, accession, call_number, title, subtitle, year, category, summary, details, stack, url, repo, sort, code, image)
      VALUES (@slug, @accession, @call_number, @title, @subtitle, @year, @category, @summary, @details, @stack, @url, @repo, @sort, @code, @image)`);
    projects.forEach((r) => p.run(r));
    const e = db.prepare(`INSERT INTO experience (org, role, start_date, end_date, description, sort)
      VALUES (@org, @role, @start_date, @end_date, @description, @sort)`);
    experience.forEach((r) => e.run(r));
    const s = db.prepare(`INSERT INTO skills (heading, subheading, items, see_also, level, sort)
      VALUES (@heading, @subheading, @items, @see_also, @level, @sort)`);
    skills.forEach((r) => s.run(r));
    const g = db.prepare('INSERT INTO guestbook (name, note) VALUES (@name, @note)');
    guestbook.forEach((r) => g.run(r));
  });
  tx();
}

if (require.main === module) {
  seed();
  console.log('Base de datos sembrada con los datos iniciales.');
}

module.exports = { seed, profile, projects, experience, skills };
