/* Project-image lightbox. Runs on any page with a #story section (project pages).
   Finds images by delegation, so new/future project images work without configuration. */
(function () {
  if (window.__projectLightbox) return;
  window.__projectLightbox = true;

  var EXCLUDE = 'header, nav, footer, a, button, .menu-panel, [aria-label="Next project"], [data-no-lightbox]';
  var MIN = 80;

  function isProjectPage() { return !!document.getElementById('story'); }

  function urlFrom(el) {
    if (el.tagName === 'IMG') return el.currentSrc || el.src;
    if (el.tagName === 'IMAGE-SLOT') {
      var img = el.shadowRoot && el.shadowRoot.querySelector('.frame img');
      if (img && img.src && img.naturalWidth) return img.src;
      if (el.getAttribute('src')) return el.getAttribute('src');
    }
    if (el.hasAttribute && el.hasAttribute('data-bg')) return el.getAttribute('data-bg');
    var bg = getComputedStyle(el).backgroundImage;
    var m = bg && bg.match(/url\(["']?([^"')]+)["']?\)/);
    return m ? m[1] : null;
  }

  function findImage(target) {
    if (!target || !target.closest || target.closest(EXCLUDE)) return null;
    var el = target, depth = 0;
    while (el && el !== document.body && depth < 4) {
      if (el.nodeType === 1) {
        var url = urlFrom(el);
        if (url) {
          var r = el.getBoundingClientRect();
          return (r.width >= MIN && r.height >= MIN) ? { el: el, url: url } : null;
        }
      }
      el = el.parentElement; depth++;
    }
    return null;
  }

  var overlay, imgEl, lastFocus, open = false;
  function build() {
    if (overlay) return;
    var css = document.createElement('style');
    css.textContent =
      '.plb{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:clamp(16px,4vw,48px);background:rgba(15,12,8,.9);opacity:0;visibility:hidden;transition:opacity .32s cubic-bezier(.16,1,.3,1),visibility 0s linear .32s}' +
      '.plb.is-open{opacity:1;visibility:visible;transition:opacity .32s cubic-bezier(.16,1,.3,1),visibility 0s}' +
      '.plb img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;transform:scale(.96);transition:transform .42s cubic-bezier(.16,1,.3,1);box-shadow:0 24px 80px rgba(0,0,0,.45)}' +
      '.plb.is-open img{transform:none}' +
      '.plb button{position:absolute;top:clamp(12px,2vw,24px);right:clamp(12px,2vw,24px);width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:none;border-radius:50%;background:#FEF5E6;color:#241F1C;transition:transform .3s ease}' +
      '.plb button:hover{transform:rotate(90deg)}' +
      '@media (prefers-reduced-motion: reduce){.plb,.plb img{transition:none}}';
    document.head.appendChild(css);
    overlay = document.createElement('div');
    overlay.className = 'plb';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Expanded image');
    overlay.innerHTML = '<img alt=""><button type="button" aria-label="Close image"><svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" fill="none"><line x1="4" y1="4" x2="20" y2="20"></line><line x1="20" y1="4" x2="4" y2="20"></line></svg></button>';
    imgEl = overlay.querySelector('img');
    overlay.addEventListener('click', function (e) { if (e.target !== imgEl) close(); });
    document.body.appendChild(overlay);
  }

  var prevOverflow = '', prevPad = '';
  function show(url) {
    build();
    lastFocus = document.activeElement;
    imgEl.src = url;
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    prevOverflow = document.documentElement.style.overflow; prevPad = document.body.style.paddingRight;
    document.documentElement.style.overflow = 'hidden';
    if (sbw > 0) document.body.style.paddingRight = sbw + 'px';
    open = true;
    setCursor('close');
    requestAnimationFrame(function () { overlay.classList.add('is-open'); overlay.querySelector('button').focus({ preventScroll: true }); });
  }
  function close() {
    if (!open) return;
    open = false;
    overlay.classList.remove('is-open');
    setCursor(null);
    document.documentElement.style.overflow = prevOverflow;
    document.body.style.paddingRight = prevPad;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('keydown', function (e) { if (open && e.key === 'Escape') close(); });

  // Custom-cursor states: "+" over expandable images, "×" while the lightbox is open.
  var CURSOR_SCALE = 2.8;
  function dot() { return document.getElementById('cursor-dot'); }
  function setCursor(state, grow) {
    var d = dot(); if (!d) return;
    d.classList.toggle('is-expand', state === 'expand');
    d.classList.toggle('is-close', state === 'close');
    if (!state && !grow) { d.style.scale = ''; return; }
    var m = (d.style.transform || '').match(/scale\(([\d.]+)\)/);
    var base = m ? parseFloat(m[1]) : 1;
    d.style.scale = String(+(CURSOR_SCALE / (base || 1)).toFixed(3));
  }
  function shieldShadow(el) {
    if (el && el.shadowRoot && !el.shadowRoot.__noCursor) {
      var s = document.createElement('style'); s.textContent = '@media (hover:hover) and (pointer:fine){*,*::before,*::after{cursor:none !important}}';
      el.shadowRoot.appendChild(s); el.shadowRoot.__noCursor = true;
    }
  }
  document.addEventListener('mouseover', function (e) {
    var t = e.target;
    for (var p = t; p && p !== document; p = p.parentNode || p.host) { if (p.shadowRoot) shieldShadow(p); if (!p.parentNode && p.host) p = p.host; }
    var linked = !!(t && t.closest && t.closest('a[href], button, [role="button"], label, summary, select, [data-menu-toggle]'));
    var dd = dot(); if (dd) dd.classList.toggle('is-solid', !!(t && t.closest && t.closest('[data-cursor-solid]')));
    if (open) { setCursor(t === imgEl ? null : 'close', linked); return; }
    setCursor(isProjectPage() && findImage(t) ? 'expand' : null, linked);
  });
  document.addEventListener('mouseleave', function () { setCursor(null); });

  document.addEventListener('click', function (e) {
    if (!isProjectPage() || open || e.button !== 0) return;
    var hit = findImage(e.target);
    if (!hit) return;
    e.preventDefault();
    e.stopPropagation();
    show(hit.url);
  }, true);
})();
