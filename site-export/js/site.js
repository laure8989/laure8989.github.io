(function () {
  var cursor = document.getElementById('cursor-dot');
  if (cursor) {
    var mx = -100, my = -100, scale = 1;
    function update() { cursor.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%) scale(' + scale + ')'; }
    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; update(); });
    document.addEventListener('mouseover', function (e) { if (e.target.closest('a, button, .reveal, image-slot, .hover-target')) { scale = 2.8; update(); } });
    document.addEventListener('mouseout', function (e) { if (e.target.closest('a, button, .reveal, image-slot, .hover-target')) { scale = 1; update(); } });
  }

  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('is-visible'); }); }, 1800);
  }

  document.querySelectorAll('[data-menu-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.menu-panel').forEach(function (panel) { panel.classList.toggle('is-open'); });
    });
  });

  document.querySelectorAll('[data-toggle-target]').forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute('data-toggle-target'));
    if (!target) return;
    btn.addEventListener('click', function () {
      var open = target.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
      var openLabel = btn.getAttribute('data-open-label');
      var closedLabel = btn.getAttribute('data-closed-label');
      var labelEl = btn.querySelector('[data-toggle-label]');
      if (labelEl && openLabel && closedLabel) labelEl.textContent = open ? openLabel : closedLabel;
      var sym = btn.querySelector('[data-toggle-symbol]');
      if (sym) sym.textContent = open ? '\u2013' : '+';
    });
  });

  var loader = document.getElementById('loader');
  if (loader) {
    var pct = 0;
    var pctText = loader.querySelector('[data-pct]');
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      loader.classList.add('is-loaded');
    } else {
      var timer = setInterval(function () {
        pct = Math.min(100, pct + 4);
        if (pctText) pctText.textContent = String(pct).padStart(2, '0');
        if (pct >= 100) { clearInterval(timer); setTimeout(function () { loader.classList.add('is-loaded'); }, 220); }
      }, 32);
    }
  }

  var countdown = document.querySelector('[data-countdown]');
  if (countdown) {
    var secondsLeft = 1200;
    function fmt(t) {
      var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
      function p(n) { return String(n).padStart(2, '0'); }
      return p(h) + ':' + p(m) + ':' + p(s);
    }
    countdown.textContent = fmt(secondsLeft);
    setInterval(function () { secondsLeft = secondsLeft <= 0 ? 1200 : secondsLeft - 1; countdown.textContent = fmt(secondsLeft); }, 1000);
  }

  document.querySelectorAll('[data-swipe-row]').forEach(function (row) {
    var dur = (20 + Math.random() * 18).toFixed(2);
    var delay = (-(Math.random() * 36)).toFixed(2);
    row.style.animation = 'swipeRow ' + dur + 's cubic-bezier(.65,0,.35,1) infinite';
    row.style.animationDelay = delay + 's';
  });
})();
