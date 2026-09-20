/* =========================================================================
   SHARED.JS — constants, storage layer, icons, and helpers used by both
   index.html (public page) and admin.html (admin panel).
   Load this file BEFORE site.js / admin.js on each page.

   >>> CUSTOMIZE HERE <<<
   - LOGO_DATA_URI: your logo, embedded as base64 (see the comment right
     above it below). Keep it inline (no external image URL) so the page
     still works once published/hosted.
   - DEFAULT_LINKS / DEFAULT_ABOUT: starting content shown before any
     admin edits are made.

   STORAGE
   - Everything (links, order, visibility, about text) persists to
     localStorage on this browser/device, so both index.html and
     admin.html read/write the same STORE_KEY and stay in sync as long as
     they're opened on the same device.
   - For real multi-device use (edit from your phone, see it live on your
     public URL from any device), swap the three functions under
     "STORAGE LAYER" for Firestore reads/writes. A `links` collection +
     a `settings/site` doc mirrors this shape almost exactly.

   SECURITY NOTE
   - admin.html has no login screen — it opens straight into the
     dashboard. That means anyone who has (or guesses) the admin.html URL
     can edit your links and about text. Keep that URL private, and don't
     link to it from the public page. If you need real access control,
     that's exactly what Firebase Authentication is for — worth adding
     once you move storage to Firebase (see STORAGE above).
   ========================================================================= */

// The HCode Studio logo, embedded as a base64 data URI so the page stays
// a single self-contained file (no external image request needed).
// To swap in a different logo: replace the base64 string in LOGO_DATA_URI
// below with your own (any PNG/JPG/SVG, base64-encoded), or point
// LOGO_DATA_URI at an external URL if you don't need offline/self-contained
// hosting.

// The logo is now uploaded from the admin panel (saved in the browser).
// Optional: you can still put a default logo here (a data URI or file name like "logo.png").
const LOGO_DATA_URI = "";

// Shows the uploaded logo, or a simple placeholder circle if none is set yet.
// "size" (optional, in px) is used for the small preview in the admin panel.
function renderLogo(logo, size){
  const src = logo || LOGO_DATA_URI;
  const sizeStyle = size ? `width:${size}px; height:${size}px; filter:none;` : '';
  if(src){
    return `<img src="${esc(src)}" alt="HCode Studio logo" class="brand-logo-img" style="${sizeStyle}" />`;
  }
  return `<div class="brand-logo-img" style="${sizeStyle} display:flex; align-items:center; justify-content:center; background:var(--bg-raised); color:var(--cyan);">
    <svg viewBox="0 0 24 24" width="${size ? 32 : 56}" height="${size ? 32 : 56}" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg>
  </div>`;
}

const DEFAULT_ABOUT = {
  en: "I'm Hanar — a software engineering student and founder of HCode Studio, building websites and business management systems in Kurdistan Region, Iraq.",
  ku: "من هەنارم — قوتابی ئەندازیاری نەرمەکاڵا و دامەزرێنەری HCode Studio، دروستکەری ماڵپەڕ و سیستەمی بەڕێوەبردنی بازرگانی لە هەرێمی کوردستان."
};

function cryptoId(){
  return 'id-' + Math.random().toString(36).slice(2,10) + Date.now().toString(36);
}

const DEFAULT_LINKS = [
  { id: cryptoId(), platform: "instagram", title: "Instagram",  url: "https://instagram.com/hcodestudio", visible: true },
  { id: cryptoId(), platform: "facebook",  title: "Facebook",   url: "https://facebook.com/hcodestudio",  visible: true },
  { id: cryptoId(), platform: "tiktok",    title: "TikTok",     url: "https://tiktok.com/@hcodestudio",   visible: true },
  { id: cryptoId(), platform: "whatsapp",  title: "WhatsApp",   url: "https://wa.me/9647500000000",       visible: true },
];

/* ---------------------------------------------------------------------
   STORAGE LAYER — swap these three functions for Firebase later.
--------------------------------------------------------------------- */
const STORE_KEY = "hcode_linkinbio_v1";

function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) throw new Error("empty");
    const parsed = JSON.parse(raw);
    if(!parsed.links || !Array.isArray(parsed.links)) throw new Error("bad shape");
    return parsed;
  }catch(e){
    return {
      links: DEFAULT_LINKS,
      about: DEFAULT_ABOUT,
      siteTitle: "HCode Studio",
      tagline: "Web development & business systems",
      logo: "",
    };
  }
}

function saveState(state){
  try{
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }catch(e){
    console.warn("Could not save to localStorage:", e);
  }
  pushToServer(state);
}

/* ---------------------------------------------------------------------
   SERVER — saves/loads the data through server.js (/api/data)
--------------------------------------------------------------------- */
function pushToServer(state){
  const data = {
    links: state.links, about: state.about,
    siteTitle: state.siteTitle, tagline: state.tagline, logo: state.logo || ''
  };
  return fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => { if(!r.ok) throw new Error('save failed'); })
    .catch(() => alert('Could not save to the server. Is server.js running?'));
}

async function fetchFromServer(){
  try{
    const r = await fetch('/api/data', { cache: 'no-store' });
    if(!r.ok) return null;
    const d = await r.json();
    if(d && Array.isArray(d.links)){
      try{ localStorage.setItem(STORE_KEY, JSON.stringify(d)); }catch(e){}
      return d;
    }
  }catch(e){}
  return null;
}

/* ---------------------------------------------------------------------
   ICONS — one inline SVG per platform, colored via currentColor so the
   cyan icon-wrap tint applies automatically. Add a new platform by
   adding a case here and to PLATFORM_OPTIONS below.
--------------------------------------------------------------------- */
const ICONS = {
  instagram: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>`,
  facebook:  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 8h2V4h-2a4 4 0 0 0-4 4v2H8v4h2v6h4v-6h2.5l.5-4H14V8a1 1 0 0 1 1-1z"/></svg>`,
  tiktok:    `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.5 2.5 2.3 4.2 4.5 4.5"/></svg>`,
  whatsapp:  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 18l-1.2 3.6L8.6 20A8.5 8.5 0 1 0 4.5 15.5"/><path d="M9 9.5c0 3.5 2.8 6 6 6 .4 0 .9-.3.9-.7l.3-1.4a.7.7 0 0 0-.4-.8L14 11.9a.7.7 0 0 0-.8.2l-.5.6a5 5 0 0 1-2.4-2.4l.6-.5a.7.7 0 0 0 .2-.8L10.4 7.2a.7.7 0 0 0-.8-.4L8.2 7a.8.8 0 0 0-.7.9c0 .5.1 1 .3 1.6z"/></svg>`,
  telegram:  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 4L3 11.5l6 2M21 4l-3.5 16-8.5-6.5M21 4L9 13.5v5"/></svg>`,
  website:   `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9z"/></svg>`,
  linkedin:  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4.5a2.5 2.5 0 0 1 5 0V17"/></svg>`,
  other:     `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.5-1.5"/></svg>`,
};

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook",  label: "Facebook" },
  { value: "tiktok",    label: "TikTok" },
  { value: "whatsapp",  label: "WhatsApp" },
  { value: "telegram",  label: "Telegram" },
  { value: "linkedin",  label: "LinkedIn" },
  { value: "website",   label: "Website" },
  { value: "other",     label: "Other" },
];

function esc(str){
  return String(str ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}


/* =========================================================================
   SITE.JS — public landing page only (index.html).
   Requires shared.js to be loaded first.
   ========================================================================= */

let state = loadState();
let aboutOpen = false;

function render(){
  const app = document.getElementById('app');
  app.innerHTML = renderLanding() + (aboutOpen ? renderAboutModal() : '');
  lucide.createIcons();
  attachEvents();
}

function renderLanding(){
  const visibleLinks = state.links.filter(l => l.visible);
  return `
  <div class="min-h-screen flex flex-col items-center px-5 py-14 sm:py-20 fade-up">
    <div class="w-full max-w-sm flex flex-col items-center text-center">

      ${renderLogo(state.logo)}
      <h1 class="sr-only">${esc(state.siteTitle)}</h1>
      <p class="muted mt-1 text-sm">${esc(state.tagline)}</p>

      <div class="w-full flex flex-col gap-3 mt-9">
        ${visibleLinks.map(l => `
          <a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" class="link-btn glow-border">
            <span class="link-icon-wrap">${ICONS[l.platform] || ICONS.other}</span>
            <span class="font-medium">${esc(l.title)}</span>
          </a>
        `).join('')}

        ${visibleLinks.length === 0 ? `
          <div class="glow-border rounded-2xl p-6 text-sm muted" style="border-style:dashed;">
            No links to show yet. Add some from the admin panel.
          </div>
        ` : ''}

        <button data-action="open-about" class="link-btn glow-border" style="border-color: rgba(197,160,89,0.35);">
          <span class="link-icon-wrap" style="color:var(--gold); background:rgba(197,160,89,0.1); border-color:rgba(197,160,89,0.3);">
            <i data-lucide="user-round" width="20" height="20"></i>
          </span>
          <span class="font-medium gold-text">About Me · دەربارەی من</span>
        </button>
      </div>
    </div>
  </div>`;
}

function renderAboutModal(){
  return `
  <div class="modal-backdrop" data-action="close-about">
    <div class="modal-card fade-up" data-stop>
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-lg">About Me · دەربارەی من</h2>
        <button data-action="close-about" class="muted hover:text-white"><i data-lucide="x" width="20" height="20"></i></button>
      </div>
      <p class="text-sm leading-relaxed mb-4">${esc(state.about.en)}</p>
      <p class="text-sm leading-relaxed muted" dir="rtl" lang="ckb">${esc(state.about.ku)}</p>
    </div>
  </div>`;
}

function attachEvents(){
  const app = document.getElementById('app');
  app.addEventListener('click', onClick);
}

function onClick(e){
  // clicking backdrop closes; clicking inside card (data-stop) should not bubble-close
  if(e.target.closest('[data-stop]') && !e.target.closest('[data-action]')) return;

  const actionEl = e.target.closest('[data-action]');
  if(!actionEl) return;
  const action = actionEl.dataset.action;

  switch(action){
    case 'open-about': aboutOpen = true; if (document.body.dataset.page === 'site') { render(); } break;
    case 'close-about': aboutOpen = false; if (document.body.dataset.page === 'site') { render(); } break;
  }
}

if (document.body.dataset.page === 'site') { render(); }
if (document.body.dataset.page === 'site') {
  fetchFromServer().then(d => { if(d){ state = d; render(); } });
}


/* =========================================================================
   ADMIN.JS — admin panel only (admin.html).
   Requires shared.js to be loaded first.
   ========================================================================= */

let stateAdmin = loadState();
let dragFromIndexAdmin = null;

// No login gate: admin.html opens straight into the dashboard. Anyone who
// knows/visits this file's URL can edit the site — see the note at the top
// of this file about keeping that URL private (or swapping in real auth
// if you move this to Firebase).
function renderAdmin(){
  const app = document.getElementById('app');
  app.innerHTML = renderAdminDashboardAdmin();
  lucide.createIcons();
  attachEventsAdmin();
}

function renderAdminDashboardAdmin(){
  const links = stateAdmin.links;
  return `
  <div class="min-h-screen px-4 py-8 sm:py-12 fade-up flex justify-center">
    <div class="w-full max-w-xl">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-semibold text-lg flex items-center gap-2"><i data-lucide="layout-dashboard" width="18" height="18" style="color:var(--cyan)"></i> Dashboard</h2>
        <a href="index.html" class="muted hover:text-white flex items-center gap-1 text-xs"><i data-lucide="external-link" width="14" height="14"></i> View site</a>
      </div>

      <!-- Logo upload -->
      <div class="admin-card p-4 mb-4">
        <p class="text-xs muted mb-3 uppercase tracking-wide" style="letter-spacing:0.04em;">Logo</p>
        <div class="flex items-center gap-4">
          <div style="width:80px; height:80px; min-width:80px;">
            ${renderLogo(stateAdmin.logo, 80)}
          </div>
          <div class="flex flex-col gap-2">
            <label class="btn-primary text-sm" style="cursor:pointer; display:inline-block; text-align:center;">
              Choose photo from gallery
              <input type="file" accept="image/*" data-logo-input class="sr-only" />
            </label>
            ${stateAdmin.logo ? `<button type="button" data-action="remove-logo" class="btn-danger text-xs self-start">Remove logo</button>` : ''}
          </div>
        </div>
        <p class="text-xs muted mt-3">Square photos look best. It's resized automatically.</p>
      </div>

      <!-- Site header fields -->
      <div class="admin-card p-4 mb-4">
        <p class="text-xs muted mb-3 uppercase tracking-wide" style="letter-spacing:0.04em;">Page header</p>
        <form data-form="site-header" class="flex flex-col gap-3">
          <div>
            <label class="text-xs muted mb-1 block">Title</label>
            <input type="text" name="siteTitle" value="${esc(stateAdmin.siteTitle)}" />
          </div>
          <div>
            <label class="text-xs muted mb-1 block">Tagline</label>
            <input type="text" name="tagline" value="${esc(stateAdmin.tagline)}" />
          </div>
          <button type="submit" class="btn-ghost self-start text-sm">Save header</button>
        </form>
      </div>

      <!-- Links list -->
      <div class="admin-card p-4 mb-4">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs muted uppercase tracking-wide" style="letter-spacing:0.04em;">Links</p>
          <span class="text-xs muted">${links.length} total · drag to reorder</span>
        </div>
        <div class="flex flex-col gap-2" data-links-list>
          ${links.map((l, i) => `
            <div class="flex items-center gap-2 p-2 rounded-lg" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);" draggable="true" data-link-row="${i}">
              <span class="drag-handle" title="Drag to reorder"><i data-lucide="grip-vertical" width="16" height="16"></i></span>
              <span class="link-icon-wrap" style="width:32px; height:32px; min-width:32px;">${ICONS[l.platform] || ICONS.other}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">${esc(l.title)}</p>
                <p class="text-xs muted truncate">${esc(l.url)}</p>
              </div>
              <button data-action="toggle-visible" data-id="${l.id}" class="toggle-track ${l.visible ? 'on' : ''}" title="${l.visible ? 'Visible' : 'Hidden'}">
                <span class="toggle-dot"></span>
              </button>
              <button data-action="edit-link" data-id="${l.id}" class="btn-ghost text-xs" style="padding:6px 8px;"><i data-lucide="pencil" width="14" height="14"></i></button>
              <button data-action="delete-link" data-id="${l.id}" class="btn-danger text-xs"><i data-lucide="trash-2" width="14" height="14"></i></button>
            </div>
          `).join('') || `<p class="text-sm muted">No links yet — add one below.</p>`}
        </div>
      </div>

      <!-- Add / Edit link form -->
      <div class="admin-card p-4 mb-4">
        <p class="text-xs muted mb-3 uppercase tracking-wide" style="letter-spacing:0.04em;">${stateAdmin.editingId ? 'Edit link' : 'Add a link'}</p>
        <form data-form="link" class="flex flex-col gap-3">
          <input type="hidden" name="id" value="${stateAdmin.editingId || ''}" />
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs muted mb-1 block">Platform</label>
              <select name="platform" class="w-full" style="background:rgba(255,255,255,0.03); border:1px solid rgba(160,174,192,0.25); color:#fff; border-radius:10px; padding:10px 12px;">
                ${PLATFORM_OPTIONS.map(p => `<option value="${p.value}" ${stateAdmin.editingLink?.platform === p.value ? 'selected' : ''}>${p.label}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="text-xs muted mb-1 block">Title</label>
              <input type="text" name="title" placeholder="e.g. Instagram" value="${esc(stateAdmin.editingLink?.title || '')}" required />
            </div>
          </div>
          <div>
            <label class="text-xs muted mb-1 block">URL</label>
            <input type="url" name="url" placeholder="https://..." value="${esc(stateAdmin.editingLink?.url || '')}" required />
          </div>
          <div class="flex gap-2">
            <button type="submit" class="btn-primary text-sm">${stateAdmin.editingId ? 'Save changes' : 'Add link'}</button>
            ${stateAdmin.editingId ? `<button type="button" data-action="cancel-edit" class="btn-ghost text-sm">Cancel</button>` : ''}
          </div>
        </form>
      </div>

      <!-- About text -->
      <div class="admin-card p-4 mb-4">
        <p class="text-xs muted mb-3 uppercase tracking-wide" style="letter-spacing:0.04em;">About Me modal</p>
        <form data-form="about" class="flex flex-col gap-3">
          <div>
            <label class="text-xs muted mb-1 block">English</label>
            <textarea name="en" rows="3" placeholder="Bio in English">${esc(stateAdmin.about.en)}</textarea>
          </div>
          <div>
            <label class="text-xs muted mb-1 block">کوردیی سۆرانی (Kurdish Sorani)</label>
            <textarea name="ku" rows="3" dir="rtl" lang="ckb" placeholder="ژیاننامە بە کوردی">${esc(stateAdmin.about.ku)}</textarea>
          </div>
          <button type="submit" class="btn-ghost self-start text-sm">Save about text</button>
        </form>
      </div>

    </div>
  </div>`;
}

/* ---------------------------------------------------------------------
   EVENTS
--------------------------------------------------------------------- */
function attachEventsAdmin(){
  const app = document.getElementById('app');

  app.addEventListener('click', onClickAdmin);
  app.addEventListener('submit', onSubmitAdmin);

  // logo picker (the input is re-created on every render, so this never stacks)
  const logoInput = app.querySelector('[data-logo-input]');
  if(logoInput) logoInput.addEventListener('change', handleLogoFile);

  // drag reorder
  app.querySelectorAll('[data-link-row]').forEach(row => {
    row.addEventListener('dragstart', () => {
      dragFromIndexAdmin = Number(row.dataset.linkRow);
      row.classList.add('dragging');
    });
    row.addEventListener('dragend', () => row.classList.remove('dragging'));
    row.addEventListener('dragover', e => e.preventDefault());
    row.addEventListener('drop', e => {
      e.preventDefault();
      const toIndex = Number(row.dataset.linkRow);
      if(dragFromIndexAdmin === null || dragFromIndexAdmin === toIndex) return;
      const links = [...stateAdmin.links];
      const [moved] = links.splice(dragFromIndexAdmin, 1);
      links.splice(toIndex, 0, moved);
      stateAdmin.links = links;
      saveState(stateAdmin);
      dragFromIndexAdmin = null;
      if (document.body.dataset.page === 'admin') { renderAdmin(); }
    });
  });
}

function onClickAdmin(e){
  const actionEl = e.target.closest('[data-action]');
  if(!actionEl) return;
  const action = actionEl.dataset.action;

  switch(action){
    case 'toggle-visible': {
      const id = actionEl.dataset.id;
      stateAdmin.links = stateAdmin.links.map(l => l.id === id ? { ...l, visible: !l.visible } : l);
      saveState(stateAdmin);
      if (document.body.dataset.page === 'admin') { renderAdmin(); }
      break;
    }
    case 'delete-link': {
      const id = actionEl.dataset.id;
      stateAdmin.links = stateAdmin.links.filter(l => l.id !== id);
      saveState(stateAdmin);
      if (document.body.dataset.page === 'admin') { renderAdmin(); }
      break;
    }
    case 'edit-link': {
      const id = actionEl.dataset.id;
      stateAdmin.editingId = id;
      stateAdmin.editingLink = stateAdmin.links.find(l => l.id === id);
      if (document.body.dataset.page === 'admin') { renderAdmin(); }
      break;
    }
    case 'remove-logo':
      stateAdmin.logo = '';
      saveState(stateAdmin);
      if (document.body.dataset.page === 'admin') { renderAdmin(); }
      break;
    case 'cancel-edit':
      stateAdmin.editingId = null; stateAdmin.editingLink = null;
      if (document.body.dataset.page === 'admin') { renderAdmin(); }
      break;
  }
}

// Reads the chosen photo, crops it to a square, shrinks it to 400x400, and saves it.
function handleLogoFile(e){
  const file = e.target.files && e.target.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')){ alert('Please choose an image file.'); return; }

  const reader = new FileReader();
  reader.onerror = () => alert('Could not read that file.');
  reader.onload = () => {
    const img = new Image();
    img.onerror = () => alert('That image could not be opened.');
    img.onload = () => {
      const SIZE = 400;
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE; canvas.height = SIZE;
      canvas.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);

      const dataUrl = canvas.toDataURL('image/webp', 0.9);
      const previous = stateAdmin.logo;
      stateAdmin.logo = dataUrl;
      try{
        localStorage.setItem(STORE_KEY, JSON.stringify(stateAdmin));
      }catch(err){
        stateAdmin.logo = previous;
        alert('Could not save the logo (browser storage is full or blocked).');
        return;
      }
      pushToServer(stateAdmin);
      if (document.body.dataset.page === 'admin') { renderAdmin(); }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function onSubmitAdmin(e){
  e.preventDefault();
  const form = e.target;
  const formType = form.dataset.form;
  const data = Object.fromEntries(new FormData(form).entries());

  if(formType === 'site-header'){
    stateAdmin.siteTitle = data.siteTitle || stateAdmin.siteTitle;
    stateAdmin.tagline = data.tagline || '';
    saveState(stateAdmin);
    if (document.body.dataset.page === 'admin') { renderAdmin(); }
    return;
  }

  if(formType === 'link'){
    if(data.id){
      stateAdmin.links = stateAdmin.links.map(l => l.id === data.id ? { ...l, platform: data.platform, title: data.title, url: data.url } : l);
    }else{
      stateAdmin.links.push({ id: cryptoId(), platform: data.platform, title: data.title, url: data.url, visible: true });
    }
    stateAdmin.editingId = null; stateAdmin.editingLink = null;
    saveState(stateAdmin);
    if (document.body.dataset.page === 'admin') { renderAdmin(); }
    return;
  }

  if(formType === 'about'){
    stateAdmin.about = { en: data.en || '', ku: data.ku || '' };
    saveState(stateAdmin);
    if (document.body.dataset.page === 'admin') { renderAdmin(); }
    return;
  }
}

if (document.body.dataset.page === 'admin') {
  fetchFromServer().then(d => { if(d){ stateAdmin = d; } renderAdmin(); });
}