/* Panel de administración. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const fmt = (s) => {
    const d = new Date(s.replace(' ', 'T') + 'Z');
    return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  const now = new Date();
  $$('[data-today]').forEach((el) => (el.textContent = `${String(now.getDate()).padStart(2, '0')} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`));

  async function api(path, opts = {}) {
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && !path.endsWith('/login')) { showLogin(); throw new Error(data.error); }
    if (!res.ok) throw Object.assign(new Error(data.error || 'No se pudo completar la acción.'), { data });
    return data;
  }

  const toastEl = Object.assign(document.createElement('div'), { className: 'toast', role: 'status' });
  document.body.appendChild(toastEl);
  let toastT;
  const toast = (msg) => { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600); };

  /* ---------- sesión ---------- */
  const loginEl = $('[data-login]');
  const panelEl = $('[data-panel]');
  const logoutBtn = $('[data-logout]');

  function showLogin() { loginEl.hidden = false; panelEl.hidden = true; logoutBtn.hidden = true; $('input[name="password"]').focus(); }
  function showPanel() { loginEl.hidden = true; panelEl.hidden = false; logoutBtn.hidden = false; refreshAll(); }

  $('[data-login-form]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('[data-login-msg]');
    const input = e.target.elements.password;
    msg.classList.remove('is-error'); msg.textContent = 'Comprobando…';
    try {
      await api('/api/admin/login', { method: 'POST', body: { password: input.value } });
      msg.textContent = ''; input.value = '';
      showPanel();
    } catch (err) {
      msg.textContent = err.message; msg.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true'); input.select();
    }
  });
  logoutBtn.addEventListener('click', async () => { await api('/api/admin/logout', { method: 'POST' }).catch(() => {}); showLogin(); });

  /* ---------- pestañas ---------- */
  const tabs = $$('[data-view]');
  function view(name) {
    tabs.forEach((t) => { const on = t.dataset.view === name; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $$('[data-pane]').forEach((p) => (p.hidden = p.dataset.pane !== name));
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => view(t.dataset.view));
    t.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      const n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); view(n.dataset.view);
    });
  });
  view('msg');

  async function refreshAll() { await Promise.all([loadSummary(), loadInbox(), loadGuestbook(), loadProjects()]); }

  async function loadSummary() {
    const s = await api('/api/admin/summary');
    $('[data-summary]').textContent = `${s.unread} mensajes sin leer de ${s.messages} · ${s.guestbook} comentarios${s.pending ? ` (${s.pending} ocultos)` : ''} · ${s.stamps} «me gusta» en total`;
    $('[data-badge]').textContent = s.unread || '';
  }

  /* ---------- papeletas ---------- */
  async function loadInbox() {
    const box = $('[data-inbox]');
    const rows = await api('/api/admin/messages');
    if (!rows.length) { box.innerHTML = '<li class="empty">No hay mensajes. Cuando alguien escriba desde el formulario de contacto, aparecerá aquí.</li>'; return; }
    box.innerHTML = rows.map((m) => `
      <li class="${m.is_read ? 'is-read' : ''}" data-id="${m.id}">
        <details>
          <summary>
            <span class="dot" aria-label="${m.is_read ? 'Leída' : 'Sin leer'}"></span>
            <span class="unread-name">${esc(m.name)}</span>
            <span class="inbox__subject">${esc(m.subject)}</span>
            <time datetime="${esc(m.created_at)}">${fmt(m.created_at)}</time>
          </summary>
          <div class="inbox__body">
            <p class="inbox__meta">Mensaje nº ${String(m.id).padStart(4, '0')} · <a href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: ' + m.subject)}">${esc(m.email)}</a></p>
            <p>${esc(m.body)}</p>
            <div class="actions">
              <a class="btn btn--ink" href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: ' + m.subject)}">Responder por correo</a>
              <button class="btn btn--ghost" type="button" data-toggle-read>${m.is_read ? 'Marcar sin leer' : 'Marcar leída'}</button>
              <button class="btn btn--danger" type="button" data-del-msg>Borrar</button>
            </div>
          </div>
        </details>
      </li>`).join('');
  }
  $('[data-inbox]').addEventListener('toggle', async (e) => {
    const li = e.target.closest('li[data-id]');
    if (!e.target.open || !li || li.classList.contains('is-read')) return;
    await api(`/api/admin/messages/${li.dataset.id}`, { method: 'PATCH', body: { is_read: true } });
    li.classList.add('is-read');
    $('[data-toggle-read]', li).textContent = 'Marcar sin leer';
    loadSummary();
  }, true);
  $('[data-inbox]').addEventListener('click', async (e) => {
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    if (e.target.closest('[data-toggle-read]')) {
      const read = !li.classList.contains('is-read');
      await api(`/api/admin/messages/${li.dataset.id}`, { method: 'PATCH', body: { is_read: read } });
      li.classList.toggle('is-read', read);
      e.target.textContent = read ? 'Marcar sin leer' : 'Marcar leída';
      loadSummary();
    }
    if (e.target.closest('[data-del-msg]')) {
      if (!confirm('¿Borrar este mensaje? No se puede deshacer.')) return;
      await api(`/api/admin/messages/${li.dataset.id}`, { method: 'DELETE' });
      toast('Mensaje borrado.');
      loadInbox(); loadSummary();
    }
  });

  /* ---------- firmas ---------- */
  async function loadGuestbook() {
    const body = $('[data-gb]');
    const rows = await api('/api/admin/guestbook');
    body.innerHTML = rows.length ? rows.map((g) => `
      <tr data-id="${g.id}">
        <td>${fmt(g.created_at)}</td>
        <td>${esc(g.name)}</td>
        <td>${esc(g.note)}</td>
        <td><span class="pill ${g.approved ? 'pill--ok' : 'pill--hidden'}">${g.approved ? 'Visible' : 'Oculto'}</span></td>
        <td><div class="actions">
          <button class="btn btn--ghost" type="button" data-approve="${g.approved ? 0 : 1}">${g.approved ? 'Ocultar' : 'Publicar'}</button>
          <button class="btn btn--danger" type="button" data-del-gb>Borrar</button>
        </div></td>
      </tr>`).join('') : '<tr><td colspan="5" class="empty">Todavía no hay comentarios.</td></tr>';
  }
  $('[data-gb]').addEventListener('click', async (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (!tr) return;
    const ap = e.target.closest('[data-approve]');
    if (ap) {
      await api(`/api/admin/guestbook/${tr.dataset.id}`, { method: 'PATCH', body: { approved: ap.dataset.approve === '1' } });
      toast(ap.dataset.approve === '1' ? 'Comentario publicado.' : 'Comentario oculto.');
      loadGuestbook(); loadSummary();
    }
    if (e.target.closest('[data-del-gb]')) {
      if (!confirm('¿Borrar este comentario?')) return;
      await api(`/api/admin/guestbook/${tr.dataset.id}`, { method: 'DELETE' });
      toast('Comentario borrado.');
      loadGuestbook(); loadSummary();
    }
  });

  /* ---------- fichas ---------- */
  let projects = [];
  const editor = $('[data-editor]');
  async function loadProjects() {
    projects = await api('/api/projects');
    $('#cats').innerHTML = [...new Set(projects.map((p) => p.category))].map((c) => `<option value="${esc(c)}">`).join('');
    $('[data-projects]').innerHTML = projects.length ? projects.map((p) => `
      <tr data-id="${p.id}">
        <td>${p.sort}</td>
        <td>${esc(p.accession)}</td>
        <td><b>${esc(p.title)}</b>${p.subtitle ? `<br><span style="color:var(--ink-2)">${esc(p.subtitle)}</span>` : ''}</td>
        <td>${esc(p.category)}</td>
        <td class="num">${p.stamps}</td>
        <td><div class="actions">
          <a class="btn btn--ghost" href="/#p-${esc(p.slug)}" target="_blank" rel="noopener">Ver</a>
          <button class="btn btn--ghost" type="button" data-edit>Editar</button>
          <button class="btn btn--danger" type="button" data-del-pr>Borrar</button>
        </div></td>
      </tr>`).join('') : '<tr><td colspan="6" class="empty">No hay proyectos. Crea el primero.</td></tr>';
  }

  function openEditor(p) {
    editor.reset();
    $$('.field-error', editor).forEach((x) => x.remove());
    $$('[aria-invalid]', editor).forEach((x) => x.removeAttribute('aria-invalid'));
    $('[data-editor-msg]').textContent = '';
    $('[data-editor-title]').textContent = p ? `Editar «${p.title}»` : 'Nuevo proyecto';
    const v = p ? { ...p, stack: p.stack.join(', ') } : { year: new Date().getFullYear(), sort: projects.length + 1 };
    for (const el of editor.elements) if (el.name && v[el.name] != null) el.value = v[el.name];
    editor.elements.id.value = p ? p.id : '';
    editor.hidden = false;
    editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    editor.elements.title.focus({ preventScroll: true });
  }
  $('[data-new]').addEventListener('click', () => openEditor(null));
  $('[data-cancel]').addEventListener('click', () => { editor.hidden = true; });
  $('[data-projects]').addEventListener('click', async (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (!tr) return;
    const p = projects.find((x) => String(x.id) === tr.dataset.id);
    if (e.target.closest('[data-edit]')) openEditor(p);
    if (e.target.closest('[data-del-pr]')) {
      if (!confirm(`¿Borrar el proyecto «${p.title}» y sus «me gusta»? No se puede deshacer.`)) return;
      await api(`/api/admin/projects/${p.id}`, { method: 'DELETE' });
      toast('Proyecto borrado.');
      editor.hidden = true;
      loadProjects();
    }
  });

  editor.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('[data-editor-msg]');
    $$('.field-error', editor).forEach((x) => x.remove());
    $$('[aria-invalid]', editor).forEach((x) => x.removeAttribute('aria-invalid'));
    msg.classList.remove('is-error'); msg.textContent = 'Guardando…';
    const body = Object.fromEntries(new FormData(editor));
    const id = body.id; delete body.id;
    try {
      await api(id ? `/api/admin/projects/${id}` : '/api/admin/projects', { method: id ? 'PUT' : 'POST', body });
      editor.hidden = true;
      toast(id ? 'Proyecto actualizado.' : 'Proyecto creado. Ya aparece en el portfolio.');
      loadProjects();
    } catch (err) {
      msg.textContent = err.message; msg.classList.add('is-error');
      const errs = err.data?.errors || {};
      let first;
      for (const [name, text] of Object.entries(errs)) {
        const f = editor.elements[name];
        if (!f) continue;
        f.setAttribute('aria-invalid', 'true');
        f.closest('label').insertAdjacentHTML('beforeend', `<p class="field-error">${esc(text)}</p>`);
        first ||= f;
      }
      first?.focus();
    }
  });

  /* ---------- arranque ---------- */
  api('/api/admin/me').then(showPanel).catch(() => showLogin());
})();
