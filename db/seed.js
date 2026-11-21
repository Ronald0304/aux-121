// Datos de ejemplo. Todo lo de aquí es SINTÉTICO: cámbialo por tu información real
// y ejecuta `npm run seed` (borra y vuelve a crear las tablas de contenido).
const { db, init } = require('./db');

const profile = {
  surname: 'Ortega Salinas',
  given_name: 'Adrián',
  born_year: 1997,
  role: 'Desarrollador full-stack',
  location: 'Lima, Perú',
  summary:
    'Construyo productos web de punta a punta: interfaces que se sienten rápidas, APIs que no se caen y bases de datos que siguen ordenadas cuando el proyecto crece.',
  note: 'Trabajo sobre todo con JavaScript en el navegador y en Node, SQL en serio y la menor cantidad de dependencias posible.',
  email: 'hola@ejemplo.dev',
  github: 'https://github.com/',
  linkedin: 'https://www.linkedin.com/',
  available: 1,
  since_year: 2019,
};

const projects = [
  {
    slug: 'este-fichero',
    accession: '2026.01',
    call_number: '005.276 ORT',
    title: 'Este fichero',
    subtitle: 'el portfolio que estás usando',
    year: 2026,
    category: 'Web',
    summary:
      'Portfolio con API propia: los proyectos, «me gusta», comentarios y mensajes viven en SQLite y se administran desde un panel protegido.',
    details:
      'Express sirve la API y los archivos estáticos. Sin frameworks de frontend: HTML semántico, CSS con variables y JavaScript propio. Los «me gusta» se limitan a uno por visitante, por proyecto y por día.',
    stack: 'Node.js, Express, SQLite, JavaScript, CSS',
    url: '/',
    repo: 'https://github.com/',
    sort: 1,
  },
  {
    slug: 'kardex',
    accession: '2025.04',
    call_number: '005.74 KAR',
    title: 'Kardex',
    subtitle: 'inventario para ferreterías de barrio',
    year: 2025,
    category: 'Datos',
    summary:
      'Control de stock con lector de códigos de barras desde el celular, alertas de reposición y reportes de rotación por producto.',
    details:
      'Modelo de movimientos en vez de saldos para auditar cada unidad. Consultas de rotación con ventanas SQL; la vista de caja funciona sin conexión y sincroniza al volver.',
    stack: 'PostgreSQL, Node.js, Fastify, Vue, PWA',
    url: '',
    repo: '',
    sort: 2,
  },
  {
    slug: 'ruta-34',
    accession: '2025.02',
    call_number: '004.6 RUT',
    title: 'Ruta 34',
    subtitle: 'buses en tiempo real',
    year: 2025,
    category: 'Tiempo real',
    summary:
      'Mapa con la posición de cada bus de una ruta urbana y tiempo estimado de llegada a cada paradero.',
    details:
      'Los GPS publican cada 5 s; un servicio en Node agrega posiciones en Redis y las emite por WebSocket. El ETA se calcula con la mediana de los últimos recorridos por tramo.',
    stack: 'Node.js, WebSocket, Redis, Leaflet',
    url: '',
    repo: '',
    sort: 3,
  },
  {
    slug: 'factura-ya',
    accession: '2024.07',
    call_number: '005.1 FAC',
    title: 'Factura Ya',
    subtitle: 'API de facturación electrónica',
    year: 2024,
    category: 'API',
    summary:
      'API REST para emitir boletas y facturas: valida, firma, genera el PDF y guarda la constancia de envío.',
    details:
      'Colas de reintento con backoff para el servicio tributario, idempotencia por clave de cliente y documentación OpenAPI generada desde los esquemas de validación.',
    stack: 'Express, SQLite, Zod, OpenAPI, Docker',
    url: '',
    repo: '',
    sort: 4,
  },
  {
    slug: 'cuaderno',
    accession: '2024.03',
    call_number: '005.43 CUA',
    title: 'Cuaderno',
    subtitle: 'notas colaborativas sin conexión',
    year: 2024,
    category: 'Web',
    summary:
      'Editor de notas que funciona offline y fusiona cambios de varias personas sin conflictos cuando vuelve la red.',
    details:
      'CRDT para el texto, IndexedDB como almacén local y un Service Worker que hace de puente. El servidor solo reenvía operaciones.',
    stack: 'TypeScript, CRDT, IndexedDB, Service Worker',
    url: '',
    repo: '',
    sort: 5,
  },
  {
    slug: 'huerto',
    accession: '2023.09',
    call_number: '629.8 HUE',
    title: 'Huerto',
    subtitle: 'riego automático con sensores',
    year: 2023,
    category: 'Herramientas',
    summary:
      'Panel para un huerto comunitario: humedad del suelo, programación de riego y alertas cuando un sensor deja de reportar.',
    details:
      'Sensores ESP32 publican por MQTT; un worker en Python guarda series de tiempo y el panel las dibuja en el navegador.',
    stack: 'Python, MQTT, ESP32, SQLite, Chart.js',
    url: '',
    repo: '',
    sort: 6,
  },
];

const experience = [
  {
    org: 'Estudio independiente',
    role: 'Desarrollador full-stack freelance',
    start_date: '2024-02',
    end_date: null,
    description:
      'Productos a medida para pymes: diseño de la base de datos, API y frontend, despliegue y mantenimiento.',
    sort: 1,
  },
  {
    org: 'Empresa de logística (ejemplo)',
    role: 'Desarrollador backend',
    start_date: '2021-06',
    end_date: '2024-01',
    description:
      'Servicios de rastreo de envíos en Node y PostgreSQL. Bajé el tiempo de respuesta del endpoint principal de 900 ms a 120 ms rediseñando índices.',
    sort: 2,
  },
  {
    org: 'Agencia digital (ejemplo)',
    role: 'Desarrollador frontend',
    start_date: '2019-08',
    end_date: '2021-05',
    description:
      'Sitios y tiendas para clientes de retail. Primer contacto con accesibilidad y rendimiento en serio.',
    sort: 3,
  },
];

const skills = [
  {
    heading: 'Desarrollo web',
    subheading: 'Interfaces',
    level: 92,
    items: 'HTML semántico, CSS moderno, JavaScript, TypeScript, Vue, React, accesibilidad',
    see_also: 'Rendimiento',
    sort: 1,
  },
  {
    heading: 'Desarrollo web',
    subheading: 'Servidor',
    level: 88,
    items: 'Node.js, Express, Fastify, REST, WebSocket, autenticación, colas de trabajo',
    see_also: 'Bases de datos',
    sort: 2,
  },
  {
    heading: 'Bases de datos',
    subheading: 'Relacionales',
    level: 84,
    items: 'PostgreSQL, SQLite, modelado, índices, migraciones, consultas con ventanas',
    see_also: 'Servidor',
    sort: 3,
  },
  {
    heading: 'Rendimiento',
    subheading: 'Medición',
    level: 72,
    items: 'Lighthouse, perfiles de CPU, caché HTTP, carga diferida',
    see_also: 'Interfaces',
    sort: 4,
  },
  {
    heading: 'Infraestructura',
    subheading: 'Despliegue',
    level: 66,
    items: 'Docker, Linux, Nginx, CI con GitHub Actions, copias de seguridad',
    see_also: null,
    sort: 5,
  },
];

const guestbook = [
  { name: 'Lucía P.', note: 'El banner de Ruta 34 está buenísimo. Muy buena idea.' },
  { name: 'Marco', note: 'Pasé por Ruta 34. ¿Tienen la ruta 73 también?' },
];

function seed() {
  init();
  const tx = db.transaction(() => {
    db.exec('DELETE FROM stamps; DELETE FROM projects; DELETE FROM experience; DELETE FROM skills; DELETE FROM guestbook; DELETE FROM profile;');
    db.prepare(`INSERT INTO profile (id, surname, given_name, born_year, role, location, summary, note, email, github, linkedin, available, since_year)
      VALUES (1, @surname, @given_name, @born_year, @role, @location, @summary, @note, @email, @github, @linkedin, @available, @since_year)`).run(profile);
    const p = db.prepare(`INSERT INTO projects (slug, accession, call_number, title, subtitle, year, category, summary, details, stack, url, repo, sort)
      VALUES (@slug, @accession, @call_number, @title, @subtitle, @year, @category, @summary, @details, @stack, @url, @repo, @sort)`);
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
  console.log('Base de datos sembrada con datos de ejemplo.');
}

module.exports = { seed };
