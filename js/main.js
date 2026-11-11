(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var desktop = function () { return w.matchMedia('(min-width:1024px)').matches; };
  var hasG = !!w.gsap;
  var lenis = null;

  if (hasG && w.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (w.history && 'scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------- helpers ---------- */
  function splitWords(el) {
    if (el.dataset.done) return $$('.wi', el);
    var txt = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = txt.map(function (t) {
      return '<span class="w" aria-hidden="true"><span class="wi">' + t + '</span></span>';
    }).join(' ');
    el.dataset.done = '1';
    return $$('.wi', el);
  }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }

  /* ---------- logos de marquesinas ---------- */
  var LOGOS = {
    aliados: ['beta-san-miguel', 'gam', 'grupo-azucarero-tropico', 'grupo-machado', 'grupo-porres', 'ingenio-el-molino', 'ingenios-santos', 'pantaleon', 'zucarmex'],
    transporte: ['alsa', 'auto-express-landa', 'grl', 'ilhuilcamina', 'tiusa', 'transorge', 'transportes-renteria', 'transportes-urgentes', 'tresguerras-logistics'],
    clientes: ['alpezzi', 'alvisar', 'city-club', 'de-la-rosa', 'dicsa', 'distribuidora-coloso', 'flor-de-tabasco', 'garis', 'grupo-la-gran-bodega', 'grupo-luisfer', 'grupo-merza', 'michel', 'procoimex', 'propack', 'sam-s-club']
  };
  function pretty(s) { return s.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
  $$('[data-mq]').forEach(function (mq) {
    var k = mq.getAttribute('data-mq'), list = LOGOS[k] || [], tr = $('.mq-track', mq);
    var html = list.map(function (n, i) {
      return '<div class="lgo"><img src="assets/logos/' + (k === 'aliados' ? 'aliados' : k) + '/' + n + '.png" alt="' + pretty(n) + '" loading="lazy" decoding="async"></div>';
    }).join('');
    tr.innerHTML = html + html.replace(/alt="[^"]*"/g, 'alt=""').replace(/<div class="lgo">/g, '<div class="lgo" aria-hidden="true">');
  });

  /* ---------- línea de tiempo ---------- */
  var TL = [
    { y: '1998', s: 'Volcanes', t: 'Comercial Los Volcanes de Colima', p: 'Nació como una pequeña comercializadora local y, con más de 35 años de experiencia, hoy opera con la mayoría de los ingenios del país. Atiende el Centro y Pacífico.', l: 'logo-volcanes.png' },
    { y: '2001', s: 'Impulsora', t: 'Impulsora de Servicios y Azúcar', p: 'Extiende la cobertura del grupo hacia el Bajío con la misma atención personalizada, inventarios bien ubicados y entrega en tiempo.', l: 'logo-impulsora.png' },
    { y: '2002', s: 'Azúcares Selectos', t: 'Azúcares Selectos de México', p: 'Lleva el servicio del grupo al Centro y Sureste del país, con precios competitivos y garantía de suministro.', l: 'logo-azucares.png' },
    { y: '2021', s: 'Cereazúcar', t: 'Cereazúcar', p: 'Se suma al grupo en 2021 para la distribución regional de azúcar y granos en Colima, la Costa Alegre, el sur de Jalisco y la frontera con Michoacán.', l: 'cereazucar.png' },
    { y: '2022', s: 'TOCA', t: 'TOCA', p: 'Es la empresa del grupo que cuenta con las bodegas para almacenar, envasar y cribar el producto.', l: 'toca.png' }
  ];
  var tlY = $('#tlYears'), tlI = 0, tlTimer = null, tlPaused = false;
  if (tlY) {
    tlY.innerHTML = TL.map(function (x, i) {
      return '<button class="tl-y" role="tab" aria-selected="' + (i === 0) + '" data-i="' + i + '"><b>' + x.y + '</b><span>' + x.s + '</span></button>';
    }).join('');
    var setTL = function (i, user) {
      tlI = i;
      $$('.tl-y', tlY).forEach(function (b, j) { b.setAttribute('aria-selected', j === i); });
      var x = TL[i], card = $('.tl-card');
      $('#tlLogo').innerHTML = '<img src="assets/logos/' + x.l + '" alt="' + x.t + '" loading="lazy">';
      $('#tlTitle').textContent = x.t; $('#tlText').textContent = x.p;
      if (hasG && !reduce) {
        gsap.fromTo(card, { opacity: .3, y: 12 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' });
        gsap.fromTo('#tlProg', { scaleX: 0 }, { scaleX: 1, duration: 6, ease: 'none', transformOrigin: 'left' });
      }
      if (user) { clearInterval(tlTimer); }
    };
    tlY.addEventListener('click', function (e) { var b = e.target.closest('.tl-y'); if (b) { setTL(+b.dataset.i, true); tlPaused = true; } });
    setTL(0);
    tlTimer = setInterval(function () { if (!tlPaused && !d.hidden) setTL((tlI + 1) % TL.length); }, 6500);
  }

  /* ---------- tabs ---------- */
  var tabs = $$('.tab');
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { activate(t); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (n) { n.focus(); activate(n); }
    });
  });
  function activate(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
      $('#' + x.getAttribute('aria-controls')).hidden = !on;
    });
    if (w.ScrollTrigger) ScrollTrigger.refresh();
  }

  /* ---------- menú ---------- */
  var burger = $('#burger'), menu = $('#menu');
  function toggleMenu(open) {
    burger.setAttribute('aria-expanded', open);
    menu.classList.toggle('open', open);
    root.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  burger.addEventListener('click', function () { toggleMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) toggleMenu(false); });

  /* ---------- scroll suave + transición de página ---------- */
  var wipe = $('#wipe');
  function goTo(hash) {
    var el = $(hash); if (!el) return;
    var y = hash === '#inicio' ? 0 : el.getBoundingClientRect().top + w.pageYOffset - 10;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else w.scrollTo(0, y);
    if (w.ScrollTrigger) ScrollTrigger.update();
  }
  $$('[data-go]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var h = a.getAttribute('href'); if (!h || h.charAt(0) !== '#') return;
      e.preventDefault();
      var wasOpen = menu.classList.contains('open');
      if (wasOpen) toggleMenu(false);
      if (!hasG || reduce) { goTo(h); return; }
      gsap.timeline()
        .set(wipe, { yPercent: 0, y: '101%' })
        .to(wipe, { y: '0%', duration: .5, ease: 'power3.inOut' })
        .add(function () { goTo(h); if (history.replaceState) history.replaceState(null, '', h); })
        .to(wipe, { y: '-101%', duration: .6, ease: 'power3.inOut', delay: .05 });
    });
  });

  /* ---------- nav / progreso ---------- */
  var nav = $('#nav'), bar = $('#progress'), lastY = 0, links = $$('.nav-links a');
  function onScroll() {
    var y = w.pageYOffset, h = root.scrollHeight - w.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hide', y > lastY && y > 500 && !menu.classList.contains('open'));
    lastY = y;
  }
  w.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var secs = $$('main > section[id]');
  if ('IntersectionObserver' in w) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { so.observe(s); });
  }

  /* ---------- mapa ---------- */
  var map = $('#map'), svg = $('#routes');
  var NS = 'http://www.w3.org/2000/svg';
  var HUB = { n: 'Colima', x: 664, y: 684 };
  var NODES = [
    { n: 'Tijuana', x: 120, y: 96 }, { n: 'Chihuahua', x: 560, y: 322 }, { n: 'Monterrey', x: 790, y: 300 },
    { n: 'Guadalajara', x: 640, y: 592 }, { n: 'Bajío', x: 760, y: 590 }, { n: 'CDMX', x: 800, y: 676 },
    { n: 'Veracruz', x: 915, y: 690 }, { n: 'Oaxaca', x: 860, y: 790 }, { n: 'Mérida', x: 1480, y: 668 }
  ];
  function mk(t, a) { var e = d.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
  var routes = [];
  if (svg) {
    NODES.forEach(function (nd, i) {
      var mx = (HUB.x + nd.x) / 2, my = Math.min(HUB.y, nd.y) - 70 - Math.abs(nd.x - HUB.x) * .08;
      var dstr = 'M' + HUB.x + ' ' + HUB.y + ' Q' + mx + ' ' + my + ' ' + nd.x + ' ' + nd.y;
      var p = mk('path', { d: dstr, class: 'rt' });
      svg.appendChild(p);
      var len = Math.ceil(p.getTotalLength ? p.getTotalLength() : 600);
      p.style.setProperty('--len', len); p.style.setProperty('--d', (i * .18) + 's');
      var g = mk('g', { class: 'nd', transform: 'translate(' + nd.x + ' ' + nd.y + ')' });
      g.style.transitionDelay = (.6 + i * .18) + 's';
      g.appendChild(mk('circle', { class: 'p', r: 9, style: '--d:' + (i * .3) + 's' }));
      g.appendChild(mk('circle', { class: 'c', r: 6 }));
      var tx = mk('text', { x: 14, y: 7 }); tx.textContent = nd.n; g.appendChild(tx);
      svg.appendChild(g);
      routes.push(p);
    });
    var hg = mk('g', { class: 'nd hub', transform: 'translate(' + HUB.x + ' ' + HUB.y + ')' });
    hg.appendChild(mk('circle', { class: 'p', r: 14 })); hg.appendChild(mk('circle', { class: 'c', r: 9 }));
    var ht = mk('text', { x: -16, y: 44, 'text-anchor': 'end' }); ht.textContent = 'Colima · Centro logístico'; hg.appendChild(ht);
    svg.appendChild(hg);
    routes.forEach(function (p) {
      var m = mk('circle', { class: 'mover', r: 4.5, opacity: 0 }); svg.appendChild(m); p._m = m;
    });
    if (hasG && !reduce) {
      routes.forEach(function (p, i) {
        var len = p.getTotalLength(), o = { t: 0 };
        gsap.to(o, {
          t: 1, duration: 3.4 + (i % 3) * .6, repeat: -1, ease: 'none', delay: 2.4 + i * .35,
          onUpdate: function () {
            var pt = p.getPointAtLength(len * o.t); p._m.setAttribute('cx', pt.x); p._m.setAttribute('cy', pt.y);
            p._m.setAttribute('opacity', Math.sin(o.t * Math.PI));
          }
        });
      });
    }
    // leyenda
    var cur = null;
    $$('.lg').forEach(function (b) {
      var set = function (on) { b.classList.toggle('on', on); if (on) { map.dataset.r = b.dataset.r; } else if (map.dataset.r === b.dataset.r) { delete map.dataset.r; } };
      b.addEventListener('mouseenter', function () { if (fine) { $$('.lg').forEach(function (x) { x.classList.remove('on'); }); set(true); } });
      b.addEventListener('mouseleave', function () { if (fine && cur !== b) set(false); });
      b.addEventListener('focus', function () { $$('.lg').forEach(function (x) { x.classList.remove('on'); }); set(true); });
      b.addEventListener('click', function () {
        if (cur === b) { cur = null; set(false); return; }
        $$('.lg').forEach(function (x) { x.classList.remove('on'); }); delete map.dataset.r;
        cur = b; set(true);
      });
    });
    if (fine) {
      var st = $('#mapStage');
      st.addEventListener('mousemove', function (e) {
        var r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        map.style.transform = 'rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg)';
      });
      st.addEventListener('mouseleave', function () { map.style.transform = ''; });
    }
    if ('IntersectionObserver' in w) {
      var mo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { map.classList.add('drawn'); mo.disconnect(); } }, { threshold: .25 });
      mo.observe(map);
    } else map.classList.add('drawn');
  }

  /* ---------- contador ---------- */
  function countUp(el) {
    var to = +el.dataset.count, o = { v: 0 };
    if (!hasG || reduce) { el.textContent = fmt(to); return; }
    gsap.to(o, { v: to, duration: 2.2, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(o.v); } });
  }

  /* ---------- tilt / spotlight / magnético ---------- */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (x * 100) + '%'); el.style.setProperty('--my', (y * 100) + '%');
        el.style.transform = 'perspective(900px) rotateY(' + ((x - .5) * 7) + 'deg) rotateX(' + ((.5 - y) * 7) + 'deg) translateY(-4px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
    $$('[data-mag]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .22) + 'px,' + ((e.clientY - r.top - r.height / 2) * .35) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
    var hero = $('#inicio'), glow = $('#heroGlow');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      glow.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%');
      glow.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  /* ---------- modal de video ---------- */
  var dlg = $('#vidDlg'), vp = $('#vidPlayer'), heroV = $('#heroVideo');
  $('#openVideo').addEventListener('click', function () {
    if (!vp.src) vp.src = vp.dataset.src;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    if (heroV) heroV.pause();
    vp.play().catch(function () {});
  });
  function closeV() { vp.pause(); if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); if (heroV && !reduce) heroV.play().catch(function () {}); }
  $('#vidClose').addEventListener('click', closeV);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeV(); });
  dlg.addEventListener('close', function () { vp.pause(); });

  /* ---------- casos ---------- */
  var row = $('#csRow');
  function step(dir) { var c = $('.case', row); row.scrollBy({ left: dir * (c.offsetWidth + 18), behavior: reduce ? 'auto' : 'smooth' }); }
  $('#csPrev').addEventListener('click', function () { step(-1); });
  $('#csNext').addEventListener('click', function () { step(1); });
  row.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });

  /* ---------- formulario ---------- */
  var form = $('#form'), status = $('#fStatus');
  var CO = {
    volcanes: { n: 'Comercial Los Volcanes de Colima', wa: '523121073971', m: 'lupita.mejia@volcanesdecolima.com' },
    impulsora: { n: 'Impulsora de Servicios', wa: '523121076045', m: 'elvia.soriano@impulsoradeservicios.com' },
    azucares: { n: 'Azúcares Selectos de México', wa: '523121393663', m: 'aida.gonzalez@azucaresselectos.com' },
    auto: { n: 'Grupo Volcanes', wa: '523121073971', m: 'lupita.mejia@volcanesdecolima.com' }
  };
  $$('select', form).forEach(function (s) {
    s.classList.add('has');
  });
  function validate() {
    var ok = true;
    var n = $('#f-nombre'), c = $('#f-correo');
    var bad = function (el, b) { el.parentNode.classList.toggle('bad', b); if (b) ok = false; };
    bad(n, !n.value.trim());
    bad(c, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value.trim()));
    return ok;
  }
  function body() {
    var v = function (id) { return $(id).value.trim(); }, co = CO[v('#f-co')] || CO.auto;
    var t = 'Hola, soy ' + v('#f-nombre') + (v('#f-empresa') ? ' de ' + v('#f-empresa') : '') + '.\n';
    if (v('#f-vol')) t += 'Volumen estimado: ' + v('#f-vol') + '.\n';
    if (v('#f-msg')) t += v('#f-msg') + '\n';
    t += 'Correo: ' + v('#f-correo') + (v('#f-tel') ? ' · Tel: ' + v('#f-tel') : '');
    return { co: co, text: t };
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) { status.textContent = 'Revisa los campos marcados.'; return; }
    var b = body();
    status.textContent = 'Abriendo WhatsApp con tu mensaje para ' + b.co.n + '…';
    w.open('https://wa.me/' + b.co.wa + '?text=' + encodeURIComponent(b.text), '_blank', 'noopener');
  });
  $('#sendMail').addEventListener('click', function () {
    if (!validate()) { status.textContent = 'Revisa los campos marcados.'; return; }
    var b = body();
    status.textContent = 'Abriendo tu correo para ' + b.co.n + '…';
    w.location.href = 'mailto:' + b.co.m + '?subject=' + encodeURIComponent('Cotización de azúcar · ' + $('#f-nombre').value.trim()) + '&body=' + encodeURIComponent(b.text);
  });
  $$('input', form).forEach(function (i) { i.addEventListener('input', function () { i.parentNode.classList.remove('bad'); }); });

  /* ---------- Three.js (diferido) ---------- */
  var fx = null;
  function loadFX() {
    if (reduce || fx !== null) return; fx = false;
    var s = d.createElement('script'); s.src = 'js/three-fx.js'; s.async = true;
    s.onload = function () {
      try { if (w.VolcanesFX) fx = w.VolcanesFX.init($('#fx'), { count: desktop() ? 480 : 220 }); } catch (e) { fx = null; }
    };
    d.head.appendChild(s);
  }
  if (!reduce) {
    var idle = w.requestIdleCallback || function (f) { return setTimeout(f, 1800); };
    w.addEventListener('load', function () { idle(loadFX, { timeout: 4000 }); });
  }

  /* ---------- GSAP: animaciones ---------- */
  function initMotion() {
    if (!hasG) { $$('[data-reveal]').forEach(function (e) { e.style.opacity = 1; }); $$('[data-count]').forEach(countUp); return; }
    if (!reduce && w.Lenis) {
      lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    if (reduce) {
      $$('[data-split]').forEach(splitWords);
      $$('[data-count]').forEach(function (e) { e.textContent = fmt(+e.dataset.count); });
      $('#shield') && $('#shield').classList.add('in');
      return;
    }

    // títulos por palabra
    $$('[data-split]').forEach(function (h) {
      var ws = splitWords(h);
      gsap.set(ws, { yPercent: 110 });
      ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () {
        gsap.to(ws, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: .045 });
      } });
    });
    // reveals
    gsap.set('[data-reveal]', { opacity: 0, y: 36 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%', once: true,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .09, overwrite: true }); }
    });
    // contadores
    $$('[data-count]').forEach(function (el) {
      if (el.closest('.hero')) return;
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { countUp(el); } });
    });
    // parallax
    $$('[data-parallax]').forEach(function (im) {
      gsap.fromTo(im, { yPercent: -8, scale: 1.12 }, { yPercent: 8, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.to('#heroMedia', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-body', { yPercent: -10, opacity: .2, ease: 'none', scrollTrigger: { trigger: '#inicio', start: '55% top', end: 'bottom top', scrub: true } });
    // formas flotantes
    $$('.shape').forEach(function (s, i) {
      gsap.to(s, { yPercent: (i % 2 ? -1 : 1) * 40, rotate: (i % 2 ? -1 : 1) * 45, ease: 'none',
        scrollTrigger: { trigger: '#metricas', start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
    });
    // métricas: tarjetas
    ScrollTrigger.batch('.m', { start: 'top 90%', once: true,
      onEnter: function (b) { gsap.fromTo(b, { opacity: 0, y: 40, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .9, ease: 'power3.out', stagger: .1 }); } });
    gsap.set('.m', { opacity: 0 });
    // escudo
    var sh = $('#shield');
    if (sh) ScrollTrigger.create({ trigger: sh, start: 'top 80%', once: true, onEnter: function () { sh.classList.add('in'); } });
    // marquesinas rev
    // secciones tipo hoja: leve escala de la anterior
    $$('.sheet').forEach(function (s) {
      gsap.fromTo(s, { '--lift': 0 }, { '--lift': 1, scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 40%', scrub: true } });
    });
    // ops horizontal (desktop)
    var mm = gsap.matchMedia();
    mm.add('(min-width:1024px)', function () {
      var tr = $('#opsTrack'), wr = $('#opsWrap');
      tr.classList.add('h');
      var dist = function () { return Math.max(0, tr.scrollWidth - w.innerWidth + 40); };
      gsap.to(tr, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: wr, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (st) { var b = $('#opsBar'); if (b) b.style.transform = 'scaleX(' + st.progress + ')'; } } });
      return function () { tr.classList.remove('h'); tr.style.transform = ''; };
    });
    w.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ---------- preloader + entrada del hero ---------- */
  var heroWords = splitWords($('#heroTitle'));
  var loader = $('#loader'), lb = $('#loaderBar'), ln = $('#loaderNum');
  var pageReady = d.readyState === 'complete', done = false;
  w.addEventListener('load', function () { pageReady = true; });
  function start() {
    if (done) return; done = true;
    root.style.overflow = '';
    initMotion();
    if (!hasG || reduce) { loader.style.display = 'none'; heroV && heroV.play && heroV.play().catch(function () {}); hashJump(); return; }
    var tl = gsap.timeline({ onComplete: function () { loader.style.display = 'none'; hashJump(); if (w.ScrollTrigger) ScrollTrigger.refresh(); } });
    tl.to('.loader-in', { opacity: 0, y: -20, duration: .5, ease: 'power2.in' })
      .to(loader, { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '-=.1')
      .fromTo('#heroMedia', { scale: 1.18 }, { scale: 1, duration: 2.2, ease: 'power3.out' }, '-=.8')
      .fromTo(heroWords, { yPercent: 115 }, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: .07 }, '-=1.6')
      .fromTo('[data-hero="in"]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .12 }, '-=.9')
      .fromTo('.nav', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out' }, '-=1.1')
      .add(function () { $$('.hero [data-count]').forEach(countUp); }, '-=.8');
  }
  function hashJump() { if (location.hash && $(location.hash)) setTimeout(function () { goTo(location.hash); }, 60); }
  root.style.overflow = 'hidden';
  if (!hasG || reduce) { setTimeout(start, 0); }
  else {
    gsap.set(heroWords, { yPercent: 115 }); gsap.set('[data-hero="in"]', { opacity: 0 });
    var p = { v: 0 }, t0 = Date.now();
    gsap.to(p, { v: 100, duration: 2.2, ease: 'power2.inOut', onUpdate: function () {
      var v = p.v; if (!pageReady && v > 90) { v = 90; }
      lb.style.transform = 'scaleX(' + v / 100 + ')'; ln.textContent = Math.round(v) + '%';
    } });
    (function chk() {
      var el = Date.now() - t0;
      if ((pageReady && el > 1800) || el > 5000) { lb.style.transform = 'scaleX(1)'; ln.textContent = '100%'; setTimeout(start, 250); }
      else setTimeout(chk, 80);
    })();
  }
  // seguridad: siempre quitar el preloader
  setTimeout(function () { if (!done) start(); }, 7000);

  // video del hero: pausa fuera de vista
  if (heroV && 'IntersectionObserver' in w && !reduce) {
    new IntersectionObserver(function (es) {
      es[0].isIntersecting ? heroV.play().catch(function () {}) : heroV.pause();
    }, { threshold: .05 }).observe(heroV);
  }
  if (heroV && reduce) { heroV.removeAttribute('autoplay'); heroV.pause(); }

  // fx scroll
  w.addEventListener('scroll', function () {
    if (fx && fx.setScroll) fx.setScroll(Math.min(1, w.pageYOffset / w.innerHeight));
  }, { passive: true });
})();
