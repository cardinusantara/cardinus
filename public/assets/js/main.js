(function () {
  'use strict';

  // --- Sticky Header on Scroll ---
  var header = document.getElementById('siteHeader');
  var toggle = document.getElementById('navToggle');
  var drawer = document.getElementById('mobileDrawer');
  var body = document.body;

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile Drawer & Accordion ---
  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.style.overflow = open ? 'hidden' : '';
    });

    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
      });
    });

    var mobLayananBtn = document.getElementById('mobileLayananBtn');
    var mobLayananGroup = document.getElementById('mobileLayananGroup');
    if (mobLayananBtn && mobLayananGroup) {
      mobLayananBtn.addEventListener('click', function () {
        mobLayananGroup.classList.toggle('open');
      });
    }
  }

  // --- Dropdown Desktop ---
  document.querySelectorAll('.menu-item.has-dropdown').forEach(function (item) {
    var trigger = item.querySelector('.dropdown-trigger');
    if (trigger) {
      trigger.addEventListener('click', function (e) {
        if (window.innerWidth <= 980) {
          e.preventDefault();
          item.classList.toggle('open');
        }
      });
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.has-dropdown.open').forEach(function (el) {
        el.classList.remove('open');
      });
    }
  });

  // --- YouTube Click-To-Load ---
  function ytCommand(iframe, func) {
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: func, args: [] }),
        '*'
      );
    } catch (err) {}
  }

  function setToggleUI(btn, playing) {
    if (!btn) return;
    btn.setAttribute('data-playing', playing ? '1' : '0');
    btn.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
    btn.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M6 5h4v14H6V5zm8 0h4v14h-4V5z"/></svg>'
      : '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
  }

  function loadYoutube(screen) {
    if (!screen || screen.getAttribute('data-yt-loaded') === '1') return;
    var id = screen.getAttribute('data-yt-id');
    if (!id) return;

    var title = screen.getAttribute('data-yt-title') || 'YouTube video';
    var origin = encodeURIComponent(window.location.origin || '');
    var src =
      'https://www.youtube.com/embed/' +
      encodeURIComponent(id) +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=1&enablejsapi=1&origin=' +
      origin;

    var iframe = document.createElement('iframe');
    iframe.className = 'eco-yt-iframe';
    iframe.src = src;
    iframe.title = title;
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    );
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('playsinline', '1');
    iframe.setAttribute('webkit-playsinline', '1');

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'eco-yt-toggle';
    setToggleUI(toggle, true);

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var playing = toggle.getAttribute('data-playing') === '1';
      var cmd = playing ? 'pauseVideo' : 'playVideo';
      ytCommand(iframe, cmd);
      setTimeout(function () { ytCommand(iframe, cmd); }, 120);
      setTimeout(function () { ytCommand(iframe, cmd); }, 400);
      if (playing) {
        setToggleUI(toggle, false);
        screen.classList.add('is-paused');
        screen.classList.remove('is-playing');
      } else {
        setToggleUI(toggle, true);
        screen.classList.add('is-playing');
        screen.classList.remove('is-paused');
      }
    });

    var tapLayer = document.createElement('button');
    tapLayer.type = 'button';
    tapLayer.className = 'eco-yt-tap';
    tapLayer.setAttribute('aria-label', 'Toggle play pause');
    tapLayer.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle.click();
    });

    screen.innerHTML = '';
    screen.appendChild(iframe);
    screen.appendChild(tapLayer);
    screen.appendChild(toggle);
    screen.setAttribute('data-yt-loaded', '1');
    screen.classList.add('is-playing');
    screen.classList.remove('is-paused');

    iframe.addEventListener('load', function () {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'listening', id: id }),
          '*'
        );
      } catch (err) {}
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.eco-yt-play');
    if (!btn) return;
    e.preventDefault();
    var screen = btn.closest('.eco-yt');
    loadYoutube(screen);
  });

  // --- Ecosystem Scroll Parallax ---
  var ecoSec = document.getElementById('ecosystem');
  var panels = ecoSec ? ecoSec.querySelectorAll('.eco-panel') : [];
  var dots = ecoSec ? ecoSec.querySelectorAll('.eco-nav-dot') : [];
  var ticking = false;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function updateEco() {
    ticking = false;
    if (!ecoSec || !panels.length) return;
    var vh = window.innerHeight || 800;
    var active = 0;
    var bestDist = Infinity;

    panels.forEach(function (panel, i) {
      var rect = panel.getBoundingClientRect();
      var mid = rect.top + rect.height / 2;
      var dist = Math.abs(vh / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        active = i;
      }

      var bg = panel.querySelector('[data-eco-parallax]');
      if (bg) {
        var progressY = (vh / 2 - mid) / (vh + rect.height);
        var y = clamp(progressY * 80, -60, 60);
        bg.style.transform = 'translate3d(0, ' + y.toFixed(2) + 'px, 0)';
      }
    });

    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === active);
    });
  }

  if (ecoSec) {
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateEco);
      }
    }, { passive: true });
    updateEco();
  }

  // --- Brand Level Checker ---
  var tabsEl = document.getElementById('lvlTabs');
  var panelEl = document.getElementById('lvlPanel');
  if (tabsEl && panelEl) {
    var CHANNELS = [
      { name: 'Konten organik, media sosial, SEO & GBP', unlock: 1 },
      { name: 'Iklan marketplace (Shopee / Tokopedia)', unlock: 1 },
      { name: 'Meta Ads (Facebook & Instagram)', unlock: 1 },
      { name: 'TikTok Ads & Affiliate', unlock: 1 },
      { name: 'KOL nano-micro', unlock: 1 },
      { name: 'Google Search Ads & SEM', unlock: 2 },
      { name: 'YouTube Ads', unlock: 3 },
      { name: 'KOL macro', unlock: 3 },
      { name: 'Distribusi retail offline (GT/MT)', unlock: 3 },
      { name: 'Artis / mega endorsement (Rp200 jt+)', unlock: 4 },
      { name: 'OOH / billboard (lokasi ikonik)', unlock: 5 },
      { name: 'TV & sponsorship besar', unlock: 6, selective: true },
    ];

    var LEVELS = [
      { n: 1, name: 'Validasi', range: '< Rp 1 M/thn', desc: 'Buktikan produk laku & gunakan marketing organic.' },
      { n: 2, name: 'Growth', range: 'Rp 1–5 M/thn', desc: 'Gunakan ads & scale channel digital yang terbukti profit.' },
      { n: 3, name: 'Ekspansi', range: 'Rp 5–10 M/thn', desc: 'Multi-channel & mulai masuk distribusi offline.' },
      { n: 4, name: 'Brand Building', range: 'Rp 20–100 M/thn', desc: 'Awareness nasional: artis, KOL & OOH selektif.' },
      { n: 5, name: 'Market Leader', range: 'Rp 100+ M/thn', desc: 'Top of mind: TV, YouTube & premium spot OOH.' },
    ];

    function esc(str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function renderTabs(active) {
      tabsEl.innerHTML = LEVELS.map(function (l) {
        return (
          '<div class="lvl-tab' + (l.n === active ? ' active' : '') + '" data-n="' + l.n + '">' +
          '<div class="num">' + l.n + '</div>' +
          '<div class="rng">' + esc(l.range) + '</div>' +
          '</div>'
        );
      }).join('');

      tabsEl.querySelectorAll('.lvl-tab').forEach(function (t) {
        t.addEventListener('click', function () {
          var n = Number(t.getAttribute('data-n'));
          renderTabs(n);
          renderPanel(n);
        });
      });
    }

    function renderPanel(active) {
      var lvl = LEVELS.find(function (l) { return l.n === active; }) || LEVELS[0];
      var chHtml = CHANNELS.map(function (c) {
        var unlocked = active >= c.unlock && !c.selective;
        var cls = unlocked ? 'ch-item unlocked' : (c.selective ? 'ch-item selective' : 'ch-item');
        return (
          '<div class="' + cls + '"><span class="ch-dot"></span><span class="label">' +
          esc(c.name) + (c.selective ? ' (selektif)' : '') + '</span></div>'
        );
      }).join('');

      panelEl.innerHTML =
        '<div class="lvl-panel-top">' +
        '<div>' +
        '<div class="lvl-name">Level ' + lvl.n + ' — <span>' + esc(lvl.name) + '</span></div>' +
        '<div class="lvl-desc">' + esc(lvl.desc) + '</div>' +
        '</div>' +
        '<div class="lvl-range-badge">' + esc(lvl.range) + '</div>' +
        '</div>' +
        '<div class="channel-list">' + chHtml + '</div>' +
        '<div class="lvl-foot"><b>Syarat naik level:</b> ROAS stable + omzet terus naik.</div>';
    }

    renderTabs(1);
    renderPanel(1);
  }

  // --- Smooth Reveal on Scroll ---
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(function (r) { obs.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('visible'); });
  }

})();

