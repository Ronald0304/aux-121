/* Portfolio — lógica pública. Sin dependencias. */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { keyArt, paletteFor, kanaFor, PALETTES } = window.KeyArt;

  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const monthYear = (ym) => { const [y, m] = String(ym).split('-').map(Number); return `${MONTHS[(m || 1) - 1]} ${y}`; };
  const ago = (s) => {
    const d = new Date(String(s).replace(' ', 'T') + 'Z');
    const sec = (Date.now() - d) / 1000;
    if (sec < 60) return 'ahora mismo';
    if (sec < 3600) return `hace ${Math.floor(sec / 60)} min`;
    if (sec < 86400) return `hace ${Math.floor(sec / 3600)} h`;
    if (sec < 86400 * 30) return `hace ${Math.floor(sec / 86400)} d`;
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };
  const AVATAR = ['var(--sun)', 'var(--pink)', 'var(--sky)', 'var(--mint)', '#b39dff'];
  const avatarColor = (name) => AVATAR[window.KeyArt.hash(name) % AVATAR.length];
  const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

  async function api(path, opts = {}) {
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'No se pudo completar la petición.'), { data, status: res.status });
    return data;
  }

  const toastEl = $('[data-toast]');
  let toastT;
  const toast = (msg) => { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600); };

  let profile = null;
  let projects = [];
  const palIndex = new Map(); // slug -> paleta estable
  const pal = (p) => PALETTES[palIndex.get(p.slug) ?? 0];
  const likesLabel = (n) => (n === 1 ? '1 me gusta' : `${n} me gusta`);

  const art = (p, layout) => keyArt(p.slug, { palette: pal(p), kana: kanaFor(p.category), layout });

  /* =================== HERO =================== */

  const slidesEl = $('[data-slides]');
  const thumbsEl = $('[data-thumbs]');
  const hero = $('.hero');
  const DUR = 7000;
  let slides = [];
  let current = 0;
  let timer = null;

  function likeButton(p, extra = '') {
    return `<button class="btn btn--ghost btn--like${p.stamped_today ? ' is-liked' : ''}${extra}" type="button" data-like="${p.id}" aria-pressed="${p.stamped_today}">
      <svg aria-hidden="true"><use href="#${p.stamped_today ? 'i-heart-f' : 'i-heart'}"/></svg><span>${p.stamped_today ? 'Te gusta' : 'Me gusta'}</span><span class="like-count" data-like-count="${p.id}">· ${p.stamps}</span>
    </button>`;
  }

  function introSlide() {
    const first = profile.given_name;
    return `
      <div class="slide__art">${keyArt('intro-' + profile.surname, { palette: PALETTES[0], kana: 'ポートフォリオ', sunX: 0.7 })}</div>
      <div class="slide__content">
        <div class="badges">
          <span class="badge badge--pink">NUEVA TEMPORADA</span>
          ${profile.available ? '<span class="badge">Disponible para proyectos</span>' : '<span class="badge badge--line">Agenda llena</span>'}
        </div>
        <h1 class="slide__title">${esc(first)} <span class="hl">${esc(profile.surname.split(' ')[0])}</span></h1>
        <p class="slide__sub">${esc(profile.role)}</p>
        <p class="slide__meta"><span>${projects.length} proyectos</span>${profile.since_year ? `<span>Desde ${profile.since_year}</span>` : ''}${profile.location ? `<span>${esc(profile.location)}</span>` : ''}</p>
        <p class="slide__syn">${esc(profile.summary)}</p>
        <div class="slide__actions">
          <a class="btn btn--pink btn--lg" href="#proyectos"><svg aria-hidden="true"><use href="#i-play"/></svg>Ver proyectos</a>
          <a class="btn btn--ghost btn--lg" href="#contacto">Contrátame</a>
        </div>
      </div>`;
  }

  function projectSlide(p, i) {
    return `
      <div class="slide__art">${art(p, 'wide')}</div>
      <div class="slide__content">
        <div class="badges">
          <span class="badge">EP ${String(i).padStart(2, '0')}</span>
          <span class="badge badge--line">${esc(p.category)}</span>
          ${p.year >= new Date().getFullYear() ? '<span class="badge badge--pink">ESTRENO</span>' : ''}
        </div>
        <h2 class="slide__title">${esc(p.title)}</h2>
        ${p.subtitle ? `<p class="slide__sub">${esc(p.subtitle)}</p>` : ''}
        <p class="slide__meta"><span>${p.year}</span><span>${p.stack.slice(0, 3).map(esc).join(', ')}</span></p>
        <p class="slide__syn">${esc(p.summary)}</p>
        <div class="slide__actions">
          <button class="btn btn--pink btn--lg" type="button" data-open="${esc(p.slug)}"><svg aria-hidden="true"><use href="#i-play"/></svg>Ver proyecto</button>
          ${likeButton(p, ' btn--lg')}
        </div>
      </div>`;
  }

  function buildHero() {
    const featured = projects.slice(0, 4);
    slides = [{ id: 'intro', html: introSlide(), thumb: keyArt('intro-' + profile.surname, { palette: PALETTES[0], layout: 'poster' }), label: `${profile.given_name}: presentación` },
      ...featured.map((p, i) => ({ id: p.slug, html: projectSlide(p, i + 1), thumb: art(p, 'poster'), label: p.title }))];
    slidesEl.innerHTML = slides.map((s, i) => `<div class="slide${i === 0 ? ' is-active' : ''}" id="slide-${esc(s.id)}" role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${slides.length}: ${esc(s.label)}">${s.html}</div>`).join('');
    thumbsEl.innerHTML = slides.map((s, i) => `<button class="thumb" type="button" role="tab" aria-selected="${i === 0}" aria-controls="slide-${esc(s.id)}" aria-label="${esc(s.label)}" style="--dur:${DUR}ms">${s.thumb}<span class="thumb__bar"><i></i></span></button>`).join('');
    $$('.thumb', thumbsEl).forEach((t, i) => t.addEventListener('click', () => { go(i); restart(); }));
    $$('.slide', slidesEl).forEach((s, i) => { if (i) s.inert = true; });
    restart();
  }

  function go(i) {
    const n = slides.length;
    i = (i + n) % n;
    if (i === current) return;
    const els = $$('.slide', slidesEl);
    const prev = els[current];
    const next = els[i];
    els.forEach((el) => el.classList.remove('is-leaving', 'is-entering'));
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    prev.inert = true;
    next.classList.add('is-active');
    next.inert = false;
    if (!reduceMotion) next.classList.add('is-entering');
    setTimeout(() => prev.classList.remove('is-leaving'), 900);
    $$('.thumb', thumbsEl).forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
    current = i;
  }

  function restart() {
    clearInterval(timer);
    if (reduceMotion) return;
    // reinicia la barra de progreso
    const t = $$('.thumb', thumbsEl)[current];
    if (t) { const bar = $('i', t); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    timer = setInterval(() => { if (!hero.classList.contains('is-paused')) { go(current + 1); restart(); } }, DUR);
  }

  hero.addEventListener('mouseenter', () => hero.classList.add('is-paused'));
  hero.addEventListener('mouseleave', () => hero.classList.remove('is-paused'));
  hero.addEventListener('focusin', () => hero.classList.add('is-paused'));
  hero.addEventListener('focusout', (e) => { if (!hero.contains(e.relatedTarget)) hero.classList.remove('is-paused'); });
  document.addEventListener('visibilitychange', () => hero.classList.toggle('is-paused', document.hidden));
  $('[data-prev]').addEventListener('click', () => { go(current - 1); restart(); });
  $('[data-next]').addEventListener('click', () => { go(current + 1); restart(); });
  let tx = null;
  slidesEl.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  slidesEl.addEventListener('touchend', (e) => {
    if (tx == null) return;
    const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) { go(current + (dx < 0 ? 1 : -1)); restart(); }
  });

  /* =================== TOP + CATÁLOGO =================== */

  function posterHTML(p, { rank } = {}) {
    const isNew = p.year >= new Date().getFullYear();
    return `
      <button class="poster" type="button" data-open="${esc(p.slug)}" aria-label="${esc(p.title)}: ver detalle">
        ${art(p, 'poster')}
        ${isNew && !rank ? '<span class="badge badge--pink poster__new">ESTRENO</span>' : ''}
        <span class="poster__likes"><svg aria-hidden="true"><use href="#i-heart-f"/></svg><span data-like-count-plain="${p.id}">${p.stamps}</span></span>
        <span class="poster__info">
          <span class="poster__title">${esc(p.title)}</span>
          <span class="poster__meta">${p.year} · ${esc(p.category)}</span>
        </span>
        <span class="poster__hover" aria-hidden="true">
          <span class="poster__title">${esc(p.title)}</span>
          <p>${esc(p.summary)}</p>
          <span class="poster__play"><svg><use href="#i-play"/></svg>Ver proyecto</span>
        </span>
      </button>`;
  }

  function buildTop() {
    const top = [...projects].sort((a, b) => b.stamps - a.stamps || b.year - a.year).slice(0, 5);
    $('[data-top]').innerHTML = top.map((p, i) => `<li><span class="rank" aria-hidden="true">${i + 1}</span>${posterHTML(p, { rank: true })}</li>`).join('');
  }

  let filter = 'Todos';
  function buildFilters() {
    const cats = ['Todos', ...new Set(projects.map((p) => p.category))];
    $('[data-filters]').innerHTML = cats.map((c) => `<button class="chip" type="button" aria-pressed="${c === filter}" data-filter="${esc(c)}">${esc(c)}</button>`).join('');
  }
  function buildGrid() {
    const list = filter === 'Todos' ? projects : projects.filter((p) => p.category === filter);
    $('[data-grid]').innerHTML = list.length
      ? list.map((p, i) => `<li style="animation-delay:${i * 40}ms">${posterHTML(p)}</li>`).join('')
      : '<li class="grid__empty">No hay proyectos en este género todavía.</li>';
  }
  $('[data-filters]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filter = b.dataset.filter;
    $$('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    buildGrid();
  });

  /* =================== DETALLE =================== */

  const dialog = $('[data-detail]');
  function openDetail(slug) {
    const p = projects.find((x) => x.slug === slug);
    if (!p) return;
    const idx = projects.indexOf(p) + 1;
    $('[data-detail-art]').innerHTML = art(p, 'wide');
    $('[data-detail-body]').innerHTML = `
      <div class="badges"><span class="badge">EP ${String(idx).padStart(2, '0')}</span><span class="badge badge--line">${esc(p.category)}</span><span class="badge badge--line">${p.year}</span></div>
      <h2 id="detail-t">${esc(p.title)}</h2>
      ${p.subtitle ? `<p class="slide__sub">${esc(p.subtitle)}</p>` : ''}
      <div class="slide__actions">
        ${p.url ? `<a class="btn btn--pink" href="${esc(p.url)}"${p.url.startsWith('/') ? '' : ' target="_blank" rel="noopener"'}><svg aria-hidden="true"><use href="#i-play"/></svg>Ver demo</a>` : ''}
        ${p.repo ? `<a class="btn btn--ghost" href="${esc(p.repo)}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-code"/></svg>Código</a>` : ''}
        ${likeButton(p)}
      </div>
      <div class="detail__cols">
        <div>
          <p>${esc(p.summary)}</p>
          ${p.details ? `<p>${esc(p.details)}</p>` : ''}
          ${!p.url && !p.repo ? '<p style="color:var(--muted)">Proyecto privado. Te muestro una demo si me escribes.</p>' : ''}
        </div>
        <dl class="detail__side">
          <dt>Tecnologías</dt><dd><ul class="chips">${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></dd>
          <dt>Nº de episodio</dt><dd>${esc(p.accession)}</dd>
          <dt>Popularidad</dt><dd data-like-count-text="${p.id}">${likesLabel(p.stamps)}</dd>
        </dl>
      </div>`;
    dialog.showModal();
    history.replaceState(null, '', `#p-${p.slug}`);
  }
  dialog.addEventListener('close', () => history.replaceState(null, '', location.pathname));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  $('[data-close]').addEventListener('click', () => dialog.close());

  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]');
    if (o) { openDetail(o.dataset.open); }
  });

  /* =================== ME GUSTA =================== */

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-like]');
    if (!btn) return;
    const id = btn.dataset.like;
    const p = projects.find((x) => String(x.id) === id);
    if (p?.stamped_today) { toast('Ya le diste me gusta hoy. ¡Gracias!'); return; }
    btn.setAttribute('aria-busy', 'true');
    try {
      const { project } = await api(`/api/projects/${id}/stamp`, { method: 'POST' });
      Object.assign(p, { stamps: project.stamps, stamped_today: true });
      $$(`[data-like="${id}"]`).forEach((b) => {
        b.classList.add('is-liked');
        b.setAttribute('aria-pressed', 'true');
        $('use', b).setAttribute('href', '#i-heart-f');
        b.children[1].textContent = 'Te gusta';
      });
      $$(`[data-like-count="${id}"]`).forEach((el) => (el.textContent = `· ${project.stamps}`));
      $$(`[data-like-count-plain="${id}"]`).forEach((el) => (el.textContent = project.stamps));
      $$(`[data-like-count-text="${id}"]`).forEach((el) => (el.textContent = likesLabel(project.stamps)));
      toast('¡Gracias por el me gusta!');
    } catch (err) {
      toast(err.message);
    } finally {
      btn.removeAttribute('aria-busy');
    }
  });

  /* =================== PERSONAJE =================== */

  async function buildCharacter() {
    const ini = initials(`${profile.given_name} ${profile.surname}`);
    $('[data-character-art]').innerHTML = `${keyArt('pj-' + profile.surname, { palette: PALETTES[3], kana: 'キャラクター', layout: 'poster' })}
      <div class="emblem"><div class="emblem__ring"><span class="emblem__initials">${esc(ini[0])}<span>${esc(ini[1] || '')}</span></span></div></div>
      <span class="emblem__tag">${esc(profile.role)}</span>`;
    const years = profile.since_year ? new Date().getFullYear() - profile.since_year : null;
    $('[data-specs]').innerHTML = [
      ['Nombre', `${profile.given_name} ${profile.surname}`],
      ['Clase', profile.role],
      profile.location && ['Base', profile.location],
      years != null && ['Nivel', `${years} años de experiencia`],
      ['Estado', profile.available ? 'Disponible' : 'Agenda llena', profile.available ? 'is-on' : ''],
    ].filter(Boolean).map(([k, v, c]) => `<div><dt>${k}</dt><dd class="${c || ''}">${esc(v)}</dd></div>`).join('');
    $('[data-bio]').textContent = profile.note || profile.summary;

    try {
      const skills = await api('/api/skills');
      const colors = [['#ff3d8b', '#ff6aa8'], ['#ffcc29', '#ffd95c'], ['#23d5e6', '#5ee6f0'], ['#7a5cff', '#9d86ff'], ['#3ee8b5', '#7af0cf']];
      $('[data-stats]').innerHTML = skills.map((s, i) => `
        <li class="stat"><span>${esc(s.subheading === s.heading ? s.heading : s.subheading)}</span>
          <span class="stat__track" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.level}" aria-label="${esc(s.subheading)}"><span class="stat__fill" style="--v:${s.level};--c1:${colors[i % 5][0]};--c2:${colors[i % 5][1]}"></span></span>
          <span class="stat__num">${s.level}</span></li>`).join('');
      $('[data-abilities]').innerHTML = [...new Set(skills.flatMap((s) => s.items))].map((x) => `<li>${esc(x)}</li>`).join('');
      const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.disconnect(); } }), { threshold: 0.3 });
      io.observe($('[data-stats]'));
    } catch {
      $('[data-stats]').innerHTML = '<li>No se pudieron cargar las habilidades.</li>';
    }
  }

  /* =================== TEMPORADAS =================== */

  async function loadSeasons() {
    const box = $('[data-seasons]');
    try {
      const rows = await api('/api/experience');
      box.innerHTML = rows.length ? rows.map((r, i) => `
        <li class="season">
          <p class="season__no">Temporada <b>${rows.length - i}</b></p>
          <div>
            <h3 class="season__role">${esc(r.role)}</h3>
            <p class="season__org">${esc(r.org)}</p>
            <p class="season__desc">${esc(r.description)}</p>
          </div>
          <p class="season__dates">${monthYear(r.start_date)} – ${r.end_date ? monthYear(r.end_date) : 'hoy'}<br>${r.end_date ? '' : '<span class="badge badge--pink">EN EMISIÓN</span>'}</p>
        </li>`).join('') : '<li class="thread__empty">Sin temporadas registradas.</li>';
    } catch {
      box.innerHTML = '<li class="thread__empty">No se pudo cargar la experiencia. Recarga la página.</li>';
    }
  }

  /* =================== COMENTARIOS =================== */

  const thread = $('[data-guestbook]');
  const commentHTML = (g, isNew) => `
    <li class="comment${isNew ? ' is-new' : ''}">
      <span class="avatar" style="--c:${avatarColor(g.name)}" aria-hidden="true">${esc(initials(g.name))}</span>
      <div class="bubble"><div class="bubble__head"><span class="bubble__name">${esc(g.name)}</span><time class="bubble__time" datetime="${esc(g.created_at)}">${ago(g.created_at)}</time></div><p>${esc(g.note)}</p></div>
    </li>`;
  async function loadComments() {
    try {
      const rows = await api('/api/guestbook');
      thread.innerHTML = rows.length ? rows.map((g) => commentHTML(g)).join('') : '<li class="thread__empty">Todavía no hay comentarios. ¡Sé el primero!</li>';
    } catch {
      thread.innerHTML = '<li class="thread__empty">No se pudieron cargar los comentarios.</li>';
    }
  }
  const composerAvatar = $('[data-composer-avatar]');
  $('[data-guest-form] [name="name"]').addEventListener('input', (e) => {
    const v = e.target.value.trim();
    composerAvatar.textContent = v ? initials(v) : '?';
    composerAvatar.style.setProperty('--c', v ? avatarColor(v) : 'var(--sun)');
  });

  function wireForm(form, msgEl, submit) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = $('button[type="submit"]', form);
      $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
      msgEl.classList.remove('is-error');
      msgEl.textContent = 'Enviando…';
      btn.disabled = true; btn.setAttribute('aria-busy', 'true');
      try {
        await submit(Object.fromEntries(new FormData(form)));
      } catch (err) {
        msgEl.textContent = err.message; msgEl.classList.add('is-error');
        const f = err.data?.field && form.elements[err.data.field];
        if (f) { f.setAttribute('aria-invalid', 'true'); f.focus(); }
      } finally {
        btn.disabled = false; btn.removeAttribute('aria-busy');
      }
    });
  }

  wireForm($('[data-guest-form]'), $('[data-guest-msg]'), async (body) => {
    const res = await api('/api/guestbook', { method: 'POST', body });
    const msg = $('[data-guest-msg]');
    if (res.pending) msg.textContent = 'Gracias. Tu comentario aparecerá cuando lo revise.';
    else if (res.entry) {
      if (!thread.querySelector('.comment')) thread.innerHTML = '';
      thread.insertAdjacentHTML('afterbegin', commentHTML(res.entry, true));
      msg.textContent = '¡Publicado!';
    }
    $('[data-guest-form]').reset();
    composerAvatar.textContent = '?';
  });

  /* =================== CONTACTO =================== */

  wireForm($('[data-contact-form]'), $('[data-contact-msg]'), async (body) => {
    const res = await api('/api/messages', { method: 'POST', body });
    $('[data-contact-msg]').textContent = `¡Mensaje nº ${res.folio} enviado! Te respondo al correo que dejaste.`;
    toast('¡Mensaje enviado!');
    $('[data-contact-form]').reset();
  });

  /* =================== ARRANQUE =================== */

  async function boot() {
    try {
      [profile, projects] = await Promise.all([api('/api/profile'), api('/api/projects')]);
      if (!profile) throw new Error('Falta el perfil en la base de datos.');
      projects.forEach((p, i) => palIndex.set(p.slug, (i + 1) % PALETTES.length));
      const full = `${profile.given_name} ${profile.surname}`;
      document.title = `${full} · ${profile.role}`;
      $('[data-bind="initials"]').textContent = initials(full);
      $('[data-bind="brand"]').textContent = profile.given_name;
      $('[data-count]').textContent = projects.length;
      $('[data-contact-art]').innerHTML = keyArt('contacto', { palette: PALETTES[2], kana: 'つづく' });
      $('[data-direct]').innerHTML = [
        profile.email && `<li><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></li>`,
        profile.github && `<li><a href="${esc(profile.github)}" target="_blank" rel="noopener">GitHub</a></li>`,
        profile.linkedin && `<li><a href="${esc(profile.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></li>`,
      ].filter(Boolean).join('');
      buildHero();
      buildTop();
      buildFilters();
      buildGrid();
      buildCharacter();
      const m = location.hash.match(/^#p-(.+)$/);
      if (m) openDetail(decodeURIComponent(m[1]));
    } catch (err) {
      slidesEl.innerHTML = `<div class="slide is-active"><div class="slide__content"><h1 class="slide__title">Ups.</h1><p class="slide__syn">No se pudo cargar el portfolio: ${esc(err.message)}</p><div class="slide__actions"><button class="btn btn--pink" type="button" onclick="location.reload()">Reintentar</button></div></div></div>`;
    }
  }

  boot();
  loadSeasons();
  loadComments();
})();
