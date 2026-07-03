/* ============================================================
   BEK TOUR — Main JavaScript
   ============================================================ */

'use strict';

// ── CONFIG ─────────────────────────────────────────────────
const BT_CONFIG = {
  whatsapp: '+998901234567',
  telegram: 'bektop',
  lang: getCookie('bt_lang') || 'ru',
  imgkit: 'https://ik.imagekit.io/snjz6grxm',
};

// ── Utilities ───────────────────────────────────────────────
function getCookie(name) {
  return document.cookie.split(';').reduce((acc, c) => {
    const [k,v] = c.trim().split('=');
    return k === name ? decodeURIComponent(v) : acc;
  }, null);
}
function setCookie(name, val, days=365) {
  document.cookie = `${name}=${encodeURIComponent(val)};path=/;max-age=${days*86400}`;
}
function qs(sel, ctx=document)  { return ctx.querySelector(sel); }
function qsa(sel, ctx=document) { return [...ctx.querySelectorAll(sel)]; }

// ── Language ────────────────────────────────────────────────
window.setLang = function(lang) {
  setCookie('bt_lang', lang);
  location.reload();
};
// Mark active lang
qsa('.nav-lang a').forEach(a => {
  if (a.getAttribute('href') === '#' && a.textContent.trim().toLowerCase() === BT_CONFIG.lang) {
    a.classList.add('on');
  }
});
qsa('[data-lang]').forEach(el => {
  if (el.dataset.lang !== BT_CONFIG.lang) el.classList.add('hidden');
  else el.classList.remove('hidden');
});

// ── Cinematic Loader ─────────────────────────────────────────
(function () {
  const L = document.getElementById('bt-loader');
  if (!L) return;
  if (sessionStorage.getItem('bt_seen')) { L.remove(); return; }

  const logo    = L.querySelector('.loader-logo');
  const sub     = L.querySelector('.loader-sub');
  const bar     = L.querySelector('.loader-bar-fill');
  const pct     = L.querySelector('.loader-pct');
  const status  = L.querySelector('.loader-status');
  const curtain = L.querySelector('.loader-curtain');
  const statuses = ['Открываем карту...', 'Шёлковый путь ждёт...', 'Готовим маршруты...', 'Почти готово'];

  document.documentElement.style.overflow = 'hidden';

  setTimeout(() => {
    logo.style.transition = 'clip-path 1.1s cubic-bezier(.76,0,.24,1), opacity .5s';
    logo.style.clipPath = 'inset(0 0 0 0)';
    logo.style.opacity = '1';
  }, 150);
  setTimeout(() => {
    sub.style.transition = 'opacity .8s, transform .8s cubic-bezier(.22,1,.36,1)';
    sub.style.opacity = '1';
    sub.style.transform = 'none';
  }, 700);

  const t0 = performance.now(), DUR = 2200;
  let done = false;

  function reveal() {
    if (done) return; done = true;
    sessionStorage.setItem('bt_seen', '1');
    document.documentElement.style.overflow = '';
    Array.from(curtain.children).forEach((s, i) => {
      s.style.transition = `transform .75s cubic-bezier(.76,0,.24,1) ${i * 0.07}s`;
      s.style.transform = 'translateY(-101%)';
    });
    setTimeout(() => { L.style.transition = 'opacity .3s'; L.style.opacity = '0'; }, 300);
    setTimeout(() => L.remove(), 1150);
  }

  function tick(now) {
    const p = Math.min((now - t0) / DUR, 1);
    const e = 1 - Math.pow(1 - p, 3);
    const v = Math.round(e * 100);
    if (bar)    bar.style.width = v + '%';
    if (pct)    pct.textContent = v;
    if (status) status.textContent = statuses[Math.min(3, Math.floor(e * 4))];
    if (p < 1)  requestAnimationFrame(tick);
    else        setTimeout(reveal, 260);
  }
  requestAnimationFrame(tick);
  setTimeout(reveal, DUR + 1500);
  window.addEventListener('load', reveal, { once: true });
})();

// ── Scroll progress ──────────────────────────────────────────
(function () {
  const bar = qs('.scroll-progress');
  if (!bar) return;
  function update() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? window.scrollY / h * 100 : 0) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
})();

// ── Navbar scroll & transparent ─────────────────────────────
(function () {
  const nav = qs('.navbar');
  if (!nav) return;
  function sync() { nav.classList.toggle('scrolled', window.scrollY > 50); }
  window.addEventListener('scroll', sync, { passive: true });
  sync();
})();

// ── Mobile nav ───────────────────────────────────────────────
(function () {
  const burger  = qs('.nav-burger');
  const mNav    = qs('.mobile-nav');
  const overlay = qs('.menu-overlay');
  const closeBtn= qs('.mobile-nav-close');
  if (!burger || !mNav) return;
  const open_  = () => { mNav.classList.add('open'); overlay?.classList.add('open'); document.body.style.overflow='hidden'; };
  const close_ = () => { mNav.classList.remove('open'); overlay?.classList.remove('open'); document.body.style.overflow=''; };
  burger.addEventListener('click', open_);
  closeBtn?.addEventListener('click', close_);
  overlay?.addEventListener('click', close_);
})();

// ── Reveal on scroll ─────────────────────────────────────────
(function () {
  const els = qsa('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
})();

// ── Hero Slider ──────────────────────────────────────────────
(function () {
  const slides = qsa('.hero-slide');
  if (!slides.length) return;
  let cur = 0, timer;

  function goTo(n) {
    slides[cur].classList.remove('active');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('active');
    qsa('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === cur));
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(cur + 1), 5500);
  }

  // Dots
  const dotsWrap = qs('.slider-dots');
  if (dotsWrap) {
    dotsWrap.innerHTML = slides.map((_, i) =>
      `<div class="slider-dot${i===0?' active':''}" onclick="heroGoTo(${i})"></div>`
    ).join('');
  }
  window.heroGoTo = goTo;

  // Arrows
  qs('.slider-prev')?.addEventListener('click', () => goTo(cur - 1));
  qs('.slider-next')?.addEventListener('click', () => goTo(cur + 1));

  // Touch swipe
  let tx = 0;
  const slider = qs('.hero-slider');
  slider?.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  slider?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) goTo(cur + (dx < 0 ? 1 : -1));
  });

  resetTimer();
})();

// ── FAQ ──────────────────────────────────────────────────────
(function () {
  qsa('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const ans  = item.querySelector('.faq-a');
      const open = item.classList.contains('open');
      qsa('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-a').style.maxHeight = '0';
      });
      if (!open) {
        item.classList.add('open');
        ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    });
  });
})();

// ── Tabbar active ─────────────────────────────────────────────
(function () {
  const path = location.pathname.replace(/\/$/, '') || '/';
  qsa('.tab[data-page]').forEach(t => t.classList.toggle('active', t.dataset.page === path));
})();

// ── Favourites ───────────────────────────────────────────────
const favs = JSON.parse(localStorage.getItem('bt_favs') || '[]');
function saveFavs() { localStorage.setItem('bt_favs', JSON.stringify(favs)); }

window.toggleFav = function(id, btn) {
  const i = favs.indexOf(id);
  if (i === -1) { favs.push(id); btn?.classList.add('active'); showToast('❤️ Добавлено в избранное'); }
  else           { favs.splice(i, 1); btn?.classList.remove('active'); showToast('Убрано из избранного'); }
  saveFavs();
};
// Init fav buttons
qsa('[data-fav-id]').forEach(btn => {
  if (favs.includes(btn.dataset.favId)) btn.classList.add('active');
  btn.addEventListener('click', e => { e.preventDefault(); toggleFav(btn.dataset.favId, btn); });
});

// ── Toast ─────────────────────────────────────────────────────
window.showToast = function(msg, type = '') {
  let wrap = qs('.toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3200);
};

// ── Calculator ────────────────────────────────────────────────
(function () {
  const totalEl = document.getElementById('calcTotal');
  if (!totalEl) return;

  const TOUR_BASE = { silk: 130, city: 85, nature: 95, luxury: 300 };
  const HOTEL_ADD = { '3': 0, '4': 45, '5': 110 };
  const GUEST_MUL = { '1': 1, '2': 1.75, '4': 3.1, '6': 4.4 };
  const SVC_PRICE = { transfer: 40, guide: 85, visa: 50, meals: 48, photo: 95, car: 55 };
  const CURRENCY  = { usd: 1, eur: 0.92, rub: 89, uzs: 12500 };
  const SYMBOLS   = { usd: '$', eur: '€', rub: '₽', uzs: 'сум' };

  function calc() {
    const tour     = qs('[data-key="tour"]')?.value || 'silk';
    const days     = parseInt(qs('[data-key="days"]')?.value || '5');
    const guests   = qs('[data-key="guests"]')?.value || '2';
    const hotel    = qs('[data-key="hotel"]')?.value || '4';
    const currency = qs('[data-key="currency"]')?.value || 'usd';

    let base = (TOUR_BASE[tour] + (HOTEL_ADD[hotel] || 0)) * days * (GUEST_MUL[guests] || 1);

    qsa('.calc-svc.on').forEach(s => { base += (SVC_PRICE[s.dataset.svc] || 0) * days; });

    const sym = SYMBOLS[currency] || '$';
    const val = Math.round(base * (CURRENCY[currency] || 1));
    totalEl.textContent = sym + val.toLocaleString('ru-RU');
  }

  qsa('.calc-svc').forEach(s => { s.addEventListener('click', () => { s.classList.toggle('on'); calc(); }); });
  qsa('.calc-select').forEach(s => { s.addEventListener('change', calc); });
  calc();
})();

// ── Gallery lightbox ─────────────────────────────────────────
window.openLightbox = function(src, alt) {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(6,24,38,.94);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;cursor:zoom-out;backdrop-filter:blur(10px)';
  const img = document.createElement('img');
  img.src = src; img.alt = alt || '';
  img.style.cssText = 'max-width:92vw;max-height:90vh;object-fit:contain;border-radius:14px;box-shadow:0 28px 80px rgba(0,0,0,.6)';
  ov.appendChild(img);
  ov.addEventListener('click', () => ov.remove());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') ov.remove(); }, { once: true });
  document.body.appendChild(ov);
};

// ── Product gallery (detail page) ────────────────────────────
(function () {
  const main = qs('#galleryMain');
  if (!main) return;
  let cur = 0;
  const thumbs = qsa('.gallery-thumb');
  function show(n) {
    cur = n;
    const src = thumbs[n]?.dataset.src;
    if (src) main.src = src;
    thumbs.forEach((t, i) => t.classList.toggle('active', i === n));
  }
  thumbs.forEach((t, i) => t.addEventListener('click', () => show(i)));
  qs('#galleryPrev')?.addEventListener('click', () => show((cur - 1 + thumbs.length) % thumbs.length));
  qs('#galleryNext')?.addEventListener('click', () => show((cur + 1) % thumbs.length));
  if (thumbs.length) show(0);
})();

// ── Catalog filters ───────────────────────────────────────────
window.CatalogFilter = (function () {
  let filters = { category: '', city: '', priceMax: 9999, sort: 'popular' };

  function apply() {
    const cards = qsa('[data-card]');
    let count = 0;
    cards.forEach(c => {
      const cat   = c.dataset.cat || '';
      const city  = c.dataset.city || '';
      const price = parseFloat(c.dataset.price || '0');
      const show  = (!filters.category || cat.includes(filters.category))
                 && (!filters.city || city === filters.city)
                 && price <= filters.priceMax;
      c.closest('.product-card, .tour-card-wide, [data-card-wrap]')?.style.setProperty('display', show ? '' : 'none');
      if (show) count++;
    });
    const countEl = qs('#catalog-count');
    if (countEl) countEl.textContent = count + ' ' + (count === 1 ? 'объект' : count < 5 ? 'объекта' : 'объектов');
  }

  return {
    set(key, val) { filters[key] = val; apply(); },
    apply,
    reset() { filters = { category: '', city: '', priceMax: 9999, sort: 'popular' }; apply(); },
  };
})();

// Chip filters
qsa('.chip[data-cat]').forEach(c => {
  c.addEventListener('click', () => {
    qsa('.chip[data-cat]').forEach(x => x.classList.remove('on'));
    c.classList.add('on');
    CatalogFilter.set('category', c.dataset.cat);
  });
});
qs('#sortSelect')?.addEventListener('change', e => CatalogFilter.set('sort', e.target.value));
qs('#filterToggleBtn')?.addEventListener('click', () => {
  qs('.filter-panel')?.classList.toggle('open');
  qs('.filter-overlay')?.classList.toggle('open');
  document.body.style.overflow = qs('.filter-panel.open') ? 'hidden' : '';
});
qs('.filter-overlay')?.addEventListener('click', () => {
  qs('.filter-panel')?.classList.remove('open');
  qs('.filter-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
});
qs('.filter-apply-btn')?.addEventListener('click', () => {
  qs('.filter-panel')?.classList.remove('open');
  qs('.filter-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
});

// ── Flash auto-dismiss ────────────────────────────────────────
qsa('.flash-close').forEach(b => b.addEventListener('click', () => b.closest('.flash-msg')?.remove()));
setTimeout(() => qsa('.flash-msg').forEach(m => m.remove()), 5000);

// ── B2B Sidebar mobile ────────────────────────────────────────
(function () {
  const toggle  = qs('[data-b2b-toggle]');
  const sidebar = qs('.b2b-sidebar');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!sidebar.contains(e.target) && !toggle.contains(e.target)) sidebar.classList.remove('open');
  });
})();

// ── B2B Property manager (localStorage) ──────────────────────
window.BT = (function () {
  function getProps()     { return JSON.parse(localStorage.getItem('bt_props') || '[]'); }
  function saveProps(arr) { localStorage.setItem('bt_props', JSON.stringify(arr)); }
  function getBookings()  { return JSON.parse(localStorage.getItem('bt_bookings') || '[]'); }
  function getUser()      { return JSON.parse(localStorage.getItem('bt_user') || '{}'); }
  function saveUser(u)    { localStorage.setItem('bt_user', JSON.stringify(u)); }

  function addProp(data) {
    const props = getProps();
    const id = Date.now().toString();
    props.unshift({ id, ...data, active: false, views: 0, bookings: 0, created: new Date().toISOString() });
    saveProps(props);
    return id;
  }

  function updateProp(id, data) {
    const props = getProps();
    const i = props.findIndex(p => p.id === id);
    if (i !== -1) { props[i] = { ...props[i], ...data }; saveProps(props); }
  }

  function deleteProp(id) {
    saveProps(getProps().filter(p => p.id !== id));
  }

  function toggleActive(id) {
    const props = getProps();
    const p = props.find(x => x.id === id);
    if (p) { p.active = !p.active; saveProps(props); return p.active; }
    return false;
  }

  return { getProps, saveProps, getBookings, getUser, saveUser, addProp, updateProp, deleteProp, toggleActive };
})();

// ── ImageKit upload helper ────────────────────────────────────
window.uploadToImageKit = async function(file, folder = '/bektour') {
  // Requires IMAGEKIT_PUBLIC_KEY and auth endpoint
  // For now uses direct upload with public key
  const PK = window.IK_PUBLIC_KEY || 'public_YVRaqDDWuTnlmiiy';
  const EP = window.IK_URL_ENDPOINT || 'https://ik.imagekit.io/snjz6grxm';

  try {
    const token = await fetch('/api/ik-auth').then(r => r.json());
    const form = new FormData();
    form.append('file', file);
    form.append('fileName', file.name);
    form.append('folder', folder);
    form.append('token', token.token);
    form.append('expire', token.expire);
    form.append('signature', token.signature);
    form.append('publicKey', PK);

    const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: form });
    return await res.json();
  } catch (e) {
    console.error('ImageKit upload error:', e);
    return null;
  }
};

// ── Date/time utils ───────────────────────────────────────────
window.formatDate = function(d) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

// ── WhatsApp booking ──────────────────────────────────────────
window.bookWhatsApp = function(name, price) {
  const msg = encodeURIComponent(`Здравствуйте! Хочу забронировать "${name}". Стоимость: ${price}`);
  window.open(`https://wa.me/${BT_CONFIG.whatsapp.replace(/\D/g,'')}?text=${msg}`, '_blank');
};

// ── Search ────────────────────────────────────────────────────
(function () {
  const btn   = qs('#searchToggle');
  const bar   = qs('#searchBar');
  const input = qs('#searchInput');
  if (!btn || !bar) return;
  btn.addEventListener('click', () => {
    bar.classList.toggle('hidden');
    if (!bar.classList.contains('hidden')) input?.focus();
  });
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      location.href = `destinations.html?q=${encodeURIComponent(input.value.trim())}`;
    }
    if (e.key === 'Escape') bar.classList.add('hidden');
  });
})();

console.log('✈ Bek Tour — JS loaded');
