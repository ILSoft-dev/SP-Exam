(function () {
  'use strict';
  var root = document.documentElement;

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  // Drawer (table of contents)
  var drawer = document.getElementById('drawer');
  var menuBtn = document.getElementById('menu-btn');
  var scrim = document.querySelector('.scrim');
  function setDrawer(open) {
    drawer.hidden = !open; scrim.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    if (open) {
      var cur = drawer.querySelector('[aria-current]');
      if (cur) cur.scrollIntoView({ block: 'center' });
    } else {
      menuBtn.focus();
    }
  }
  menuBtn.addEventListener('click', function () { setDrawer(drawer.hidden); });
  document.querySelectorAll('[data-close-drawer]').forEach(function (el) {
    el.addEventListener('click', function () { setDrawer(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !drawer.hidden) setDrawer(false);
  });

  // Theme: auto -> dark -> light -> auto
  document.getElementById('theme-btn').addEventListener('click', function () {
    var cur = root.dataset.theme;
    var dark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    root.dataset.theme = next; store('sp-theme', next);
  });

  // Font size cycle
  var sizes = [15, 17, 19, 21];
  document.getElementById('font-btn').addEventListener('click', function () {
    var cur = parseInt(getComputedStyle(root).getPropertyValue('--fs'), 10) || 17;
    var i = sizes.indexOf(cur);
    var next = sizes[(i + 1) % sizes.length];
    root.style.setProperty('--fs', next + 'px'); store('sp-font', String(next));
    markWideTables();
  });

  // Reading progress and "to top" button
  var bar = document.getElementById('read-progress');
  var toTop = document.getElementById('to-top');
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    var p = h > 0 ? Math.min(1, scrollY / h) : 0;
    bar.style.width = (p * 100) + '%';
    toTop.hidden = scrollY < 800;
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }); });

  // Learned questions
  function learned() {
    try { return JSON.parse(store('sp-learned') || '[]'); } catch (e) { return []; }
  }
  function setLearned(n, on) {
    var list = learned().filter(function (x) { return x !== n; });
    if (on) list.push(n);
    store('sp-learned', JSON.stringify(list));
  }
  document.querySelectorAll('[data-learned]').forEach(function (cb) {
    var n = Number(cb.dataset.learned);
    cb.checked = learned().indexOf(n) !== -1;
    cb.addEventListener('change', function () { setLearned(n, cb.checked); });
  });
  var toc = document.querySelectorAll('[data-toc-n]');
  if (toc.length) {
    var done = learned();
    toc.forEach(function (li) {
      if (done.indexOf(Number(li.dataset.tocN)) !== -1) li.classList.add('is-done');
    });
    var count = document.getElementById('learned-count');
    var fill = document.getElementById('learned-bar');
    if (count) count.textContent = done.length + ' / ' + toc.length;
    if (fill) fill.style.width = (done.length / toc.length * 100) + '%';
  }


  // Hint for tables wider than the screen
  function markWideTables() {
    document.querySelectorAll('.page table').forEach(function (t) {
      if (getComputedStyle(t).display !== 'block' || t.closest('.stack, #glossary')) return;
      var wide = t.scrollWidth > t.clientWidth + 4;
      var prev = t.previousElementSibling;
      var has = prev && prev.classList.contains('scroll-hint');
      if (wide && !has) {
        var p = document.createElement('p');
        p.className = 'scroll-hint'; p.textContent = '↔ Таблицу можно прокрутить вбок';
        t.parentNode.insertBefore(p, t);
      } else if (!wide && has) { prev.remove(); }
    });
  }
  markWideTables();
  addEventListener('resize', markWideTables);

  // Search over the question list
  var search = document.getElementById('q-search');
  if (search) {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-toc-n]'));
    var empty = document.getElementById('q-empty');
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase().replace(/ё/g, 'е');
      var shown = 0;
      items.forEach(function (li) {
        var hay = (li.dataset.tocN + ' ' + li.textContent + ' ' + (li.dataset.keys || '')).toLowerCase().replace(/ё/g, 'е');
        var ok = !q || hay.indexOf(q) !== -1;
        li.hidden = !ok; if (ok) shown++;
      });
      document.querySelectorAll('.toc-sec').forEach(function (sec) {
        sec.hidden = !sec.querySelector('[data-toc-n]:not([hidden])');
      });
      if (empty) empty.style.display = shown ? 'none' : 'block';
    });
  }
})();
