/* Fichero — lógica del portfolio público. Sin dependencias. */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const COLORS = ['salmon', 'mustard', 'cobalt', 'lilac', 'sage'];
  const categoryColor = new Map();
  const colorFor = (cat) => {
    if (!categoryColor.has(cat)) categoryColor.set(cat, COLORS[categoryColor.size % COLORS.length]);
    return categoryColor.get(cat);
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const parseDay = (s) => {
    if (!s) return new Date();
    const [y, m, d] = s.slice(0, 10).split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  const stampDate = (d) => `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const monthStamp = (ym) => { const [y, m] = ym.split('-').map(Number); return `${MONTHS[(m || 1) - 1]} ${y}`; };
  // rotación estable por texto: el mismo sello cae siempre igual
  const tilt = (seed, i = 0) => {
    let h = 2166136261;
    for (const ch of `${seed}${i}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return ((h >>> 0) % 1000) / 1000;
  };

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'No se pudo completar la petición.'), { data, status: res.status });
    return data;
  }

  const today = stampDate(new Date());
  $$('[data-today]').forEach((el) => (el.textContent = today));

  /* =================== el cajón =================== */

  const stage = $('[data-stage]');
  const tabsEl = $('[data-tabs]');
  const posEl = $('[data-pos]');
  let cards = []; // { id, kind, data, color, el, tab }
  let active = 0;

  function mainEntryHTML(p, projects) {
    const born = p.born_year ? `, ${p.born_year}–` : '';
    const cats = [...new Set(projects.map((x) => x.category))];
    return `
      <div class="entry">
        <div class="entry__call">005.276\n${esc(p.surname.slice(0, 3).toUpperCase())}</div>
        <div class="entry__main">
          <p class="entry__heading">${esc(p.surname)}, ${esc(p.given_name)}${born}</p>
          <h2 class="entry__title">${esc(p.given_name)} ${esc(p.surname)}<small>${esc(p.role)}${p.location ? ` · ${esc(p.location)}` : ''}${p.since_year ? ` · desde ${p.since_year}` : ''}</small></h2>
          <p class="indent">${projects.length} fichas : con API y base de datos propia.</p>
          <p class="entry__summary indent">${esc(p.summary)}</p>
          ${p.note ? `<p class="indent entry__notes">${esc(p.note)}</p>` : ''}
          <p class="entry__trace indent">${cats.map((c, i) => `${i + 1}. ${esc(c)}.`).join(' ')} I. Título.</p>
        </div>
      </div>
      <div class="card__foot">
        <p class="entry__links">
          <a href="#solicitud">Escribirme</a>
          ${p.github ? `<a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub <svg aria-hidden="true"><use href="#i-out"/></svg></a>` : ''}
          ${p.linkedin ? `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn <svg aria-hidden="true"><use href="#i-out"/></svg></a>` : ''}
        </p>
        <div class="stamps">
          <div class="stamps__pad">
            ${p.available ? `<span class="stamp stamp--big" style="--r:-7deg; right:6px; top:18px">DISPONIBLE</span>` : `<span class="stamp" style="--r:-4deg; right:6px; top:24px">Agenda llena</span>`}
          </div>
        </div>
      </div>`;
  }

  function stampsHTML(pr) {
    const days = pr.recent || [];
    return days
      .slice(0, 5)
      .map((d, i) => {
        const r = (tilt(pr.slug + d, i) * 16 - 8).toFixed(1);
        const x = Math.round(tilt(pr.slug, i + 9) * 46);
        const y = Math.round(8 + tilt(d, i + 3) * 44);
        return `<span class="stamp" style="--r:${r}deg; right:${x}%; top:${y}px">${stampDate(parseDay(d))}</span>`;
      })
      .reverse()
      .join('');
  }

  function projectHTML(pr) {
    const links = [
      pr.url ? `<a href="${esc(pr.url)}"${pr.url.startsWith('/') ? '' : ' target="_blank" rel="noopener"'}>Ver en vivo <svg aria-hidden="true"><use href="#i-out"/></svg></a>` : '',
      pr.repo ? `<a href="${esc(pr.repo)}" target="_blank" rel="noopener">Código <svg aria-hidden="true"><use href="#i-out"/></svg></a>` : '',
    ].join('');
    const count = pr.stamps === 1 ? '1 sello' : `${pr.stamps} sellos`;
    return `
      <div class="entry">
        <div class="entry__call">${esc(pr.call_number).replace(' ', '\n')}\n${esc(pr.year)}</div>
        <div class="entry__main">
          <p class="entry__heading">${esc(pr.category)} — ${esc(pr.title)}</p>
          <h2 class="entry__title">${esc(pr.title)}${pr.subtitle ? `<small>${esc(pr.subtitle)}</small>` : ''}</h2>
          <p class="entry__summary indent">${esc(pr.summary)}</p>
          ${pr.details ? `<p class="indent">${esc(pr.details)}</p>` : ''}
          <p class="entry__trace indent">Notas: ${pr.stack.map(esc).join(' — ')}.</p>
          <p class="indent entry__notes">Nº de adquisición ${esc(pr.accession)}.</p>
        </div>
      </div>
      <div class="card__foot">
        <p class="entry__links">${links || '<span class="entry__notes">Privado · demo bajo solicitud</span>'}</p>
        <div class="stamps">
          <div class="stamps__pad" data-pad>${stampsHTML(pr)}</div>
          <div class="stamps__row">
            <span class="stamps__count" data-count-for="${pr.id}">${count}</span>
            <button class="btn btn--stamp${pr.stamped_today ? ' is-done' : ''}" type="button" data-stamp="${pr.id}" ${pr.stamped_today ? 'disabled' : ''}>
              <svg aria-hidden="true"><use href="#i-stamp"/></svg>${pr.stamped_today ? 'Sellada hoy' : 'Sellar ficha'}
            </button>
          </div>
        </div>
      </div>`;
  }

  function buildDrawer(profile, projects) {
    cards = [
      { id: 'principal', kind: 'main', data: profile, color: 'brass', label: 'Ficha principal', no: 'Autor' },
      ...projects.map((p) => ({ id: p.slug, kind: 'project', data: p, color: colorFor(p.category), label: p.title, no: p.accession })),
    ];
    stage.innerHTML = '';
    tabsEl.innerHTML = '';
    cards.forEach((c, i) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'tab';
      tab.id = `tab-${c.id}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `ficha-${c.id}`);
      if (c.color !== 'brass') tab.dataset.c = c.color;
      tab.innerHTML = `<span class="tab__no">${esc(c.no)}</span><span class="tab__t">${esc(c.label)}</span>`;
      tab.addEventListener('click', () => show(i));
      tab.addEventListener('keydown', onTabKey);

      const el = document.createElement('article');
      el.className = 'card';
      el.id = `ficha-${c.id}`;
      el.setAttribute('role', 'tabpanel');
      el.setAttribute('aria-labelledby', tab.id);
      if (c.color !== 'brass') el.dataset.c = c.color;
      el.innerHTML = `<div class="card__body">${c.kind === 'main' ? mainEntryHTML(profile, projects) : projectHTML(c.data)}</div>`;

      c.el = el;
      c.tab = tab;
      tabsEl.appendChild(tab);
      stage.appendChild(el);
    });
    const fromHash = cards.findIndex((c) => `#ficha-${c.id}` === location.hash);
    layout(fromHash > 0 ? fromHash : 0);
  }

  function layout(idx) {
    active = idx;
    const n = cards.length;
    cards.forEach((c, i) => {
      const depth = (i - idx + n) % n;
      c.el.style.setProperty('--depth', depth);
      c.el.dataset.depth = depth;
      c.tab.style.setProperty('--depth', depth);
      const front = depth === 0;
      c.tab.setAttribute('aria-selected', String(front));
      c.tab.tabIndex = front ? 0 : -1;
      c.el.inert = !front;
      c.el.toggleAttribute('hidden', false);
    });
    posEl.textContent = `Ficha ${idx + 1} de ${n}`;
  }

  function show(idx, { focusTab = false } = {}) {
    const n = cards.length;
    if (!n) return;
    idx = (idx + n) % n;
    if (idx === active) return;
    const target = cards[idx];
    const from = (idx - active + n) % n;
    layout(idx);
    if (!reduceMotion) {
      target.el.style.setProperty('--from', from);
      target.el.classList.remove('is-pulling');
      void target.el.offsetWidth;
      target.el.classList.add('is-pulling');
      target.el.addEventListener('animationend', () => target.el.classList.remove('is-pulling'), { once: true });
    }
    if (focusTab) target.tab.focus();
    target.tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', idx === 0 ? location.pathname : `#ficha-${target.id}`);
  }

  function onTabKey(e) {
    const map = { ArrowRight: 1, ArrowLeft: -1 };
    if (e.key in map) { e.preventDefault(); show(active + map[e.key], { focusTab: true }); }
    if (e.key === 'Home') { e.preventDefault(); show(0, { focusTab: true }); }
    if (e.key === 'End') { e.preventDefault(); show(cards.length - 1, { focusTab: true }); }
  }

  $('[data-prev]').addEventListener('click', () => show(active - 1));
  $('[data-next]').addEventListener('click', () => show(active + 1));
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select, [role="tab"]') || e.metaKey || e.ctrlKey || e.altKey) return;
    const r = $('#cajon').getBoundingClientRect();
    if (r.bottom < 80 || r.top > innerHeight * 0.6) return;
    if (e.key === 'ArrowRight') show(active + 1);
    if (e.key === 'ArrowLeft') show(active - 1);
  });

  // gesto: deslizar la ficha a los lados en pantallas táctiles
  let touchX = null;
  stage.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 60) show(active + (dx < 0 ? 1 : -1));
  });

  /* sellar */
  stage.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-stamp]');
    if (!btn || btn.disabled) return;
    const id = btn.dataset.stamp;
    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    try {
      const { project, already } = await api(`/api/projects/${id}/stamp`, { method: 'POST' });
      const card = btn.closest('.card');
      const pad = $('[data-pad]', card);
      if (!already) {
        const r = (tilt(project.slug + Date.now()) * 18 - 9).toFixed(1);
        const s = document.createElement('span');
        s.className = 'stamp is-new';
        s.style.cssText = `--r:${r}deg; right:${Math.round(tilt(id, 2) * 30)}%; top:${Math.round(12 + tilt(id, 5) * 30)}px`;
        s.textContent = today;
        pad.appendChild(s);
        $$('.stamp:not(.is-new)', pad).slice(0, -4).forEach((x) => x.remove());
      }
      $(`[data-count-for="${id}"]`).textContent = project.stamps === 1 ? '1 sello' : `${project.stamps} sellos`;
      btn.classList.add('is-done');
      btn.innerHTML = '<svg aria-hidden="true"><use href="#i-stamp"/></svg>Sellada hoy';
      const row = $(`[data-ledger-id="${id}"] [data-ledger-stamps]`);
      if (row) row.textContent = project.stamps;
    } catch (err) {
      btn.disabled = false;
      $(`[data-count-for="${id}"]`).textContent = err.message;
    } finally {
      btn.removeAttribute('aria-busy');
    }
  });

  /* =================== registro =================== */

  function buildLedger(projects) {
    const body = $('[data-ledger]');
    if (!projects.length) { body.innerHTML = '<tr><td colspan="6" class="ledger__empty">Todavía no hay fichas en el registro.</td></tr>'; return; }
    const sorted = [...projects].sort((a, b) => b.accession.localeCompare(a.accession));
    body.innerHTML = sorted.map((p) => `
      <tr data-ledger-id="${p.id}" data-slug="${esc(p.slug)}">
        <td>${esc(p.accession)}</td>
        <td>${esc(p.call_number)}</td>
        <td class="ledger__title"><button type="button">${esc(p.title)}</button>${p.subtitle ? `<br><span class="ledger__sub">${esc(p.subtitle)}</span>` : ''}</td>
        <td><span class="swatch" style="--c: var(--${colorFor(p.category)})"></span>${esc(p.category)}</td>
        <td class="num">${p.year}</td>
        <td class="num" data-ledger-stamps>${p.stamps}</td>
      </tr>`).join('');
    body.addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-slug]');
      if (!tr) return;
      const idx = cards.findIndex((c) => c.id === tr.dataset.slug);
      if (idx < 0) return;
      $('#cajon').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      setTimeout(() => show(idx), reduceMotion ? 0 : 380);
    });
  }

  /* =================== préstamos =================== */

  async function loadExperience() {
    const list = $('[data-experience]');
    try {
      const rows = await api('/api/experience');
      if (!rows.length) { list.innerHTML = '<li class="slip__row slip__row--empty">Sin préstamos registrados.</li>'; return; }
      list.innerHTML = rows.map((r, i) => `
        <li class="slip__row">
          <div class="slip__dates">
            <span class="stamp" style="--r:${(tilt(r.org, i) * 8 - 5).toFixed(1)}deg">${monthStamp(r.start_date)}</span>
            ${r.end_date
              ? `<span class="stamp" style="--r:${(tilt(r.role, i) * 8 - 3).toFixed(1)}deg">${monthStamp(r.end_date)}</span>`
              : `<span class="stamp" style="--r:3deg">EN CURSO</span>`}
          </div>
          <div>
            <h3 class="slip__role">${esc(r.role)}</h3>
            <p class="slip__org">${esc(r.org)}</p>
            <p class="slip__desc">${esc(r.description)}</p>
          </div>
        </li>`).join('');
    } catch {
      list.innerHTML = '<li class="slip__row slip__row--empty">No se pudo cargar la experiencia. Recarga la página.</li>';
    }
  }

  /* =================== materias =================== */

  async function loadSkills() {
    const box = $('[data-skills]');
    try {
      const rows = await api('/api/skills');
      const slug = (s) => 'materia-' + s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
      const bySub = new Map(rows.map((r) => [r.subheading.toLowerCase(), r]));
      const byHead = new Map(rows.map((r) => [r.heading.toLowerCase(), r]));
      box.innerHTML = rows.map((r) => {
        const target = r.see_also && (bySub.get(r.see_also.toLowerCase()) || byHead.get(r.see_also.toLowerCase()));
        return `
        <div class="drawerface" id="${slug(r.heading + '-' + r.subheading)}">
          <span class="holder"><span class="holder__label">${esc(r.heading.toUpperCase())} — ${esc(r.subheading)}</span></span>
          <ul class="drawerface__items">${r.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          ${target ? `<p class="drawerface__see">Véase también: <a href="#${slug(target.heading + '-' + target.subheading)}" data-see>${esc(r.see_also)}</a></p>` : ''}
          <div class="drawerface__pull" aria-hidden="true"></div>
        </div>`;
      }).join('');
      box.addEventListener('click', (e) => {
        const a = e.target.closest('[data-see]');
        if (!a) return;
        const t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        t.classList.remove('is-flash'); void t.offsetWidth; t.classList.add('is-flash');
        setTimeout(() => t.classList.remove('is-flash'), 1400);
      });
    } catch {
      box.innerHTML = '<p class="drawerface">No se pudieron cargar las materias.</p>';
    }
  }

  /* =================== libro de visitas =================== */

  const gbBody = $('[data-guestbook]');
  const gbRow = (g, isNew = false) => `
    <tr${isNew ? ' class="is-new"' : ''}><td>${stampDate(parseDay(g.created_at))}</td><td>${esc(g.name)}</td><td>${esc(g.note)}</td></tr>`;

  async function loadGuestbook() {
    try {
      const rows = await api('/api/guestbook');
      gbBody.innerHTML = rows.length ? rows.map((g) => gbRow(g)).join('') : '<tr><td colspan="3">Nadie ha firmado todavía. Estrena la tarjeta.</td></tr>';
    } catch {
      gbBody.innerHTML = '<tr><td colspan="3">No se pudieron cargar las firmas.</td></tr>';
    }
  }

  function wireForm(form, msgEl, submit) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = $('button[type="submit"]', form);
      $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
      msgEl.classList.remove('is-error');
      msgEl.textContent = 'Enviando…';
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      try {
        await submit(Object.fromEntries(new FormData(form)));
      } catch (err) {
        msgEl.textContent = err.message;
        msgEl.classList.add('is-error');
        const f = err.data?.field && form.elements[err.data.field];
        if (f) { f.setAttribute('aria-invalid', 'true'); f.focus(); }
      } finally {
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
      }
    });
  }

  const gbForm = $('[data-guest-form]');
  const gbMsg = $('[data-guest-msg]');
  wireForm(gbForm, gbMsg, async (body) => {
    const res = await api('/api/guestbook', { method: 'POST', body });
    if (res.pending) {
      gbMsg.textContent = 'Gracias. Tu firma aparecerá cuando la revise.';
    } else if (res.entry) {
      if (!gbBody.querySelector('tr td + td')) gbBody.innerHTML = '';
      gbBody.insertAdjacentHTML('afterbegin', gbRow(res.entry, true));
      gbMsg.textContent = 'Firmado. Gracias por pasar.';
    }
    gbForm.reset();
  });

  /* =================== solicitud =================== */

  const ctForm = $('[data-contact-form]');
  const ctMsg = $('[data-contact-msg]');
  wireForm(ctForm, ctMsg, async (body) => {
    const res = await api('/api/messages', { method: 'POST', body });
    $('[data-folio]').textContent = res.folio;
    const rec = $('[data-received]');
    rec.innerHTML = `<span class="stamp stamp--big is-new" style="--r:-9deg">RECIBIDO · ${today}</span>`;
    ctMsg.textContent = `Papeleta ${res.folio} entregada. Te respondo al correo que dejaste.`;
    ctForm.reset();
  });

  /* =================== arranque =================== */

  async function boot() {
    try {
      const [profile, projects] = await Promise.all([api('/api/profile'), api('/api/projects')]);
      if (!profile) throw new Error('Falta el perfil en la base de datos.');
      $('[data-bind="label"]').innerHTML = `${esc(profile.surname.toUpperCase())}, ${esc(profile.given_name[0])}.<span class="holder__role"> — ${esc(profile.role)}</span>`;
      $('[data-bind="h1"]').textContent = `${profile.given_name} ${profile.surname}, ${profile.role}`;
      document.title = `${profile.given_name} ${profile.surname} · ${profile.role}`;
      $('[data-count]').textContent = projects.length + 1;
      $('[data-direct]').innerHTML = [
        profile.email && `<li><span>Correo</span><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></li>`,
        profile.github && `<li><span>GitHub</span><a href="${esc(profile.github)}" target="_blank" rel="noopener">${esc(profile.github.replace(/^https?:\/\/(www\.)?/, ''))}</a></li>`,
        profile.linkedin && `<li><span>LinkedIn</span><a href="${esc(profile.linkedin)}" target="_blank" rel="noopener">${esc(profile.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a></li>`,
      ].filter(Boolean).join('');
      buildDrawer(profile, projects);
      buildLedger(projects);
    } catch (err) {
      stage.innerHTML = `<article class="card" data-depth="0"><div class="card__body"><p class="typed loading-line">No pude abrir el cajón: ${esc(err.message)}</p><p class="typed"><button class="btn btn--ink" type="button" onclick="location.reload()">Intentar de nuevo</button></p></div></article>`;
      $('[data-ledger]').innerHTML = '<tr><td colspan="6" class="ledger__empty">El registro no está disponible ahora.</td></tr>';
    }
  }

  boot();
  loadExperience();
  loadSkills();
  loadGuestbook();
})();
