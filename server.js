const path = require('path');
const crypto = require('crypto');
const express = require('express');
const { db, init, isEmpty } = require('./db/db');
const { seed } = require('./db/seed');

init();
if (isEmpty()) seed();

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fichero';
const SALT = process.env.VISITOR_SALT || crypto.randomBytes(16).toString('hex');
if (!process.env.ADMIN_PASSWORD) {
  console.warn('[aviso] ADMIN_PASSWORD no está definida: la contraseña del panel es "fichero". Cámbiala antes de publicar.');
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
  });
  next();
});

/* ---------- utilidades ---------- */

const visitorId = (req) =>
  crypto.createHash('sha256').update(`${req.ip}|${req.get('user-agent') || ''}|${SALT}`).digest('hex').slice(0, 32);

const clean = (v, max) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');
const cleanBlock = (v, max) => (typeof v === 'string' ? v.trim().replace(/\r\n/g, '\n').slice(0, max) : '');

// Límite simple en memoria: N peticiones por ventana por visitante y ruta.
const buckets = new Map();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const key = `${req.path}|${visitorId(req)}`;
    const now = Date.now();
    const b = buckets.get(key) || { n: 0, reset: now + windowMs };
    if (now > b.reset) { b.n = 0; b.reset = now + windowMs; }
    b.n += 1;
    buckets.set(key, b);
    if (b.n > max) return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos y vuelve a probar.' });
    next();
  };
}
setInterval(() => { const now = Date.now(); for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k); }, 60_000).unref();

/* ---------- sesión del panel ---------- */

const sessions = new Map(); // token -> expira
const SESSION_MS = 1000 * 60 * 60 * 8;

function readCookie(req, name) {
  const raw = req.get('cookie') || '';
  const hit = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

function requireAdmin(req, res, next) {
  const token = readCookie(req, 'fichero_sid');
  const exp = token && sessions.get(token);
  if (!exp || exp < Date.now()) {
    if (token) sessions.delete(token);
    return res.status(401).json({ error: 'Sesión no válida. Vuelve a entrar.' });
  }
  next();
}

const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

/* ---------- API pública ---------- */

const projectsQuery = db.prepare(`
  SELECT p.*, COUNT(s.id) AS stamps, MAX(s.created_at) AS last_stamp
  FROM projects p LEFT JOIN stamps s ON s.project_id = p.id
  GROUP BY p.id ORDER BY p.sort, p.year DESC`);

const recentStamps = db.prepare(`
  SELECT project_id, day FROM stamps WHERE project_id = ? ORDER BY created_at DESC LIMIT 6`);

function shapeProject(p, visitor) {
  return {
    ...p,
    stack: p.stack ? p.stack.split(',').map((s) => s.trim()).filter(Boolean) : [],
    recent: recentStamps.all(p.id).map((r) => r.day),
    stamped_today: visitor
      ? !!db.prepare("SELECT 1 FROM stamps WHERE project_id = ? AND visitor = ? AND day = date('now')").get(p.id, visitor)
      : false,
  };
}

app.get('/api/profile', (req, res) => {
  res.json(db.prepare('SELECT * FROM profile WHERE id = 1').get() || null);
});

app.get('/api/projects', (req, res) => {
  const v = visitorId(req);
  res.json(projectsQuery.all().map((p) => shapeProject(p, v)));
});

app.post('/api/projects/:id/stamp', rateLimit(30, 60_000), (req, res) => {
  const id = Number(req.params.id);
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
  if (!project) return res.status(404).json({ error: 'Ese proyecto no existe.' });
  const v = visitorId(req);
  const info = db.prepare('INSERT OR IGNORE INTO stamps (project_id, visitor) VALUES (?, ?)').run(id, v);
  const p = projectsQuery.all().find((r) => r.id === id);
  res.status(info.changes ? 201 : 200).json({ already: !info.changes, project: shapeProject(p, v) });
});

app.get('/api/experience', (req, res) => {
  res.json(db.prepare('SELECT * FROM experience ORDER BY sort, start_date DESC').all());
});

app.get('/api/skills', (req, res) => {
  res.json(
    db.prepare('SELECT * FROM skills ORDER BY sort').all().map((s) => ({
      ...s,
      items: s.items.split(',').map((x) => x.trim()).filter(Boolean),
    })),
  );
});

app.get('/api/guestbook', (req, res) => {
  res.json(db.prepare('SELECT id, name, note, created_at FROM guestbook WHERE approved = 1 ORDER BY created_at DESC, id DESC LIMIT 40').all());
});

app.post('/api/guestbook', rateLimit(3, 10 * 60_000), (req, res) => {
  const name = clean(req.body?.name, 40);
  const note = clean(req.body?.note, 140);
  if (req.body?.website) return res.status(201).json({ ok: true }); // trampa para bots
  if (name.length < 2) return res.status(400).json({ error: 'Escribe tu nombre (mínimo 2 letras).', field: 'name' });
  if (note.length < 2) return res.status(400).json({ error: 'La nota está vacía.', field: 'note' });
  const approved = process.env.GUESTBOOK_MODERATION === '1' ? 0 : 1;
  const info = db.prepare('INSERT INTO guestbook (name, note, approved) VALUES (?, ?, ?)').run(name, note, approved);
  const row = db.prepare('SELECT id, name, note, created_at FROM guestbook WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ ok: true, pending: !approved, entry: row });
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
app.post('/api/messages', rateLimit(5, 10 * 60_000), (req, res) => {
  const name = clean(req.body?.name, 80);
  const email = clean(req.body?.email, 120);
  const subject = clean(req.body?.subject, 120) || 'Sin asunto';
  const body = cleanBlock(req.body?.body, 4000);
  if (req.body?.website) return res.status(201).json({ ok: true });
  if (name.length < 2) return res.status(400).json({ error: 'Falta tu nombre.', field: 'name' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Ese correo no parece válido. Revisa que tenga @ y dominio.', field: 'email' });
  if (body.length < 10) return res.status(400).json({ error: 'Cuéntame un poco más (mínimo 10 caracteres).', field: 'body' });
  const info = db.prepare('INSERT INTO messages (name, email, subject, body) VALUES (?, ?, ?, ?)').run(name, email, subject, body);
  res.status(201).json({ ok: true, folio: String(info.lastInsertRowid).padStart(4, '0') });
});

/* ---------- API del panel ---------- */

app.post('/api/admin/login', rateLimit(8, 15 * 60_000), (req, res) => {
  if (!safeEqual(req.body?.password || '', ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_MS);
  res.set('Set-Cookie', `fichero_sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${req.secure ? '; Secure' : ''}`);
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  const token = readCookie(req, 'fichero_sid');
  if (token) sessions.delete(token);
  res.set('Set-Cookie', 'fichero_sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ ok: true });
});

const admin = express.Router();
admin.use(requireAdmin);

admin.get('/me', (req, res) => res.json({ ok: true }));

admin.get('/summary', (req, res) => {
  res.json({
    unread: db.prepare('SELECT COUNT(*) n FROM messages WHERE is_read = 0').get().n,
    messages: db.prepare('SELECT COUNT(*) n FROM messages').get().n,
    stamps: db.prepare('SELECT COUNT(*) n FROM stamps').get().n,
    guestbook: db.prepare('SELECT COUNT(*) n FROM guestbook').get().n,
    pending: db.prepare('SELECT COUNT(*) n FROM guestbook WHERE approved = 0').get().n,
  });
});

admin.get('/messages', (req, res) => res.json(db.prepare('SELECT * FROM messages ORDER BY created_at DESC, id DESC').all()));
admin.patch('/messages/:id', (req, res) => {
  db.prepare('UPDATE messages SET is_read = ? WHERE id = ?').run(req.body?.is_read ? 1 : 0, Number(req.params.id));
  res.json({ ok: true });
});
admin.delete('/messages/:id', (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

admin.get('/guestbook', (req, res) => res.json(db.prepare('SELECT * FROM guestbook ORDER BY created_at DESC, id DESC').all()));
admin.patch('/guestbook/:id', (req, res) => {
  db.prepare('UPDATE guestbook SET approved = ? WHERE id = ?').run(req.body?.approved ? 1 : 0, Number(req.params.id));
  res.json({ ok: true });
});
admin.delete('/guestbook/:id', (req, res) => {
  db.prepare('DELETE FROM guestbook WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

const PROJECT_FIELDS = ['slug', 'accession', 'call_number', 'title', 'subtitle', 'year', 'category', 'summary', 'details', 'stack', 'url', 'repo', 'sort', 'code', 'image'];
function projectInput(body) {
  const p = {};
  for (const f of PROJECT_FIELDS) p[f] = body?.[f];
  p.title = clean(p.title, 80);
  p.slug = clean(p.slug || p.title, 60).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  p.accession = clean(p.accession, 12) || `${new Date().getFullYear()}.00`;
  p.call_number = clean(p.call_number, 24) || '005 ---';
  p.subtitle = clean(p.subtitle, 100);
  p.year = Number(p.year) || new Date().getFullYear();
  p.category = clean(p.category, 24) || 'Web';
  p.summary = cleanBlock(p.summary, 400);
  p.details = cleanBlock(p.details, 1200);
  p.stack = clean(p.stack, 200);
  p.url = clean(p.url, 300);
  p.repo = clean(p.repo, 300);
  p.image = clean(p.image, 400);
  const STOP = new Set(['DE', 'DEL', 'LA', 'EL', 'LOS', 'LAS', 'Y', 'EN', 'CON', 'PARA', 'UN', 'UNA', 'POR']);
  const shortWord = (w) => { const c = w[0] + w.slice(1).replace(/[AEIOU]/g, ''); return (c.length >= 3 ? c : w).slice(0, 4); };
  p.code = clean(p.code, 10).toUpperCase() || p.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').split(/\s+/).filter((w) => w && !STOP.has(w)).slice(0, 2).map(shortWord).join(' ').slice(0, 10);
  p.sort = Number(p.sort) || 0;
  const errors = {};
  if (!p.title) errors.title = 'El título es obligatorio.';
  if (!p.slug) errors.slug = 'No se pudo generar el identificador.';
  if (p.summary.length < 10) errors.summary = 'El resumen necesita al menos 10 caracteres.';
  for (const k of ['url', 'repo', 'image']) if (p[k] && !/^(https?:\/\/|\/)/.test(p[k])) errors[k] = 'Debe empezar por https:// o /';
  return { p, errors };
}

admin.post('/projects', (req, res) => {
  const { p, errors } = projectInput(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Revisa los campos marcados.', errors });
  try {
    const info = db.prepare(`INSERT INTO projects (${PROJECT_FIELDS.join(',')}) VALUES (${PROJECT_FIELDS.map((f) => '@' + f).join(',')})`).run(p);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'Ya hay un proyecto con ese identificador.', errors: { slug: 'Ya existe.' } });
    throw e;
  }
});

admin.put('/projects/:id', (req, res) => {
  const { p, errors } = projectInput(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Revisa los campos marcados.', errors });
  try {
    const info = db.prepare(`UPDATE projects SET ${PROJECT_FIELDS.map((f) => `${f} = @${f}`).join(', ')} WHERE id = @id`).run({ ...p, id: Number(req.params.id) });
    if (!info.changes) return res.status(404).json({ error: 'Ese proyecto ya no existe.' });
    res.json({ ok: true });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'Ya hay un proyecto con ese identificador.', errors: { slug: 'Ya existe.' } });
    throw e;
  }
});

admin.delete('/projects/:id', (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

app.use('/api/admin', admin);

app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido.' });
  res.status(500).json({ error: 'Algo falló en el servidor. Inténtalo de nuevo.' });
});

/* ---------- estáticos ---------- */

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: '1h' }));

app.listen(PORT, () => console.log(`Portfolio en http://localhost:${PORT}`));
