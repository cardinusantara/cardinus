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

  // --- Brand Level Checker with i18n support ---
  var tabsEl = document.getElementById('lvlTabs');
  var panelEl = document.getElementById('lvlPanel');
  if (tabsEl && panelEl) {
    var curLang = document.documentElement.lang || 'id';

    var I18N_DATA = {
      id: {
        selectiveLabel: ' (selektif)',
        footNote: '<b>Syarat naik level:</b> ROAS stable + omzet terus naik.',
        levels: [
          { n: 1, name: 'Validasi', range: '< Rp 1 M/thn', desc: 'Buktikan produk laku & gunakan marketing organic.' },
          { n: 2, name: 'Growth', range: 'Rp 1–5 M/thn', desc: 'Gunakan ads & scale channel digital yang terbukti profit.' },
          { n: 3, name: 'Ekspansi', range: 'Rp 5–10 M/thn', desc: 'Multi-channel & mulai masuk distribusi offline.' },
          { n: 4, name: 'Brand Building', range: 'Rp 20–100 M/thn', desc: 'Awareness nasional: artis, KOL & OOH selektif.' },
          { n: 5, name: 'Market Leader', range: 'Rp 100+ M/thn', desc: 'Top of mind: TV, YouTube & premium spot OOH.' },
        ],
        channels: [
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
        ]
      },
      en: {
        selectiveLabel: ' (selective)',
        footNote: '<b>Requirement to level up:</b> Stable ROAS + sustained revenue growth.',
        levels: [
          { n: 1, name: 'Validation', range: '< $65K / yr', desc: 'Prove product-market fit & leverage organic marketing.' },
          { n: 2, name: 'Growth', range: '$65K–$320K / yr', desc: 'Deploy paid ads & scale profitable digital channels.' },
          { n: 3, name: 'Expansion', range: '$320K–$650K / yr', desc: 'Multi-channel operations & begin offline retail distribution.' },
          { n: 4, name: 'Brand Building', range: '$1.3M–$6.5M / yr', desc: 'National brand awareness: top creators, tier-1 influencers & selective OOH.' },
          { n: 5, name: 'Market Leader', range: '$6.5M+ / yr', desc: 'Top-of-mind category leader: TV, YouTube & prime OOH billboards.' },
        ],
        channels: [
          { name: 'Organic content, social media, SEO & GBP', unlock: 1 },
          { name: 'Marketplace ads (Shopee / TikTok / Tokopedia)', unlock: 1 },
          { name: 'Meta Ads (Facebook & Instagram)', unlock: 1 },
          { name: 'TikTok Ads & Affiliate Network', unlock: 1 },
          { name: 'Nano & micro KOL creator network', unlock: 1 },
          { name: 'Google Search Ads & SEM', unlock: 2 },
          { name: 'YouTube Ads & Video campaigns', unlock: 3 },
          { name: 'Macro KOL partnerships', unlock: 3 },
          { name: 'Offline retail distribution (GT/MT)', unlock: 3 },
          { name: 'Celebrity & mega endorsements', unlock: 4 },
          { name: 'OOH / Iconic billboard placements', unlock: 5 },
          { name: 'TV commercials & major sponsorships', unlock: 6, selective: true },
        ]
      },
      zh: {
        selectiveLabel: ' (精选)',
        footNote: '<b>晋级标准：</b>稳定 ROAS + 营收持续增长。',
        levels: [
          { n: 1, name: '验证期', range: '< 50万人民币/年', desc: '验证产品市场需求，发力有机内容营销。' },
          { n: 2, name: '成长期', range: '50万–250万人民币/年', desc: '启动效果广告，规模化拓展盈利数字渠道。' },
          { n: 3, name: '扩张期', range: '250万–500万人民币/年', desc: '全渠道运营，拓展线下分销网络。' },
          { n: 4, name: '品牌期', range: '1000万–5000万人民币/年', desc: '全国级知名度：顶级博主、明星代言与精选户外大屏。' },
          { n: 5, name: '领导期', range: '5000万以上人民币/年', desc: '品类心智占领：电视、YouTube 与核心地标广告。' },
        ],
        channels: [
          { name: '有机内容运营、社媒、SEO 与本地搜索', unlock: 1 },
          { name: '电商平台广告 (Shopee / TikTok / Tokopedia)', unlock: 1 },
          { name: 'Meta Ads 效果广告 (Facebook 与 Instagram)', unlock: 1 },
          { name: 'TikTok 广告与达人分销网络', unlock: 1 },
          { name: 'Nano 与 Micro 达人种草', unlock: 1 },
          { name: 'Google 搜索广告与搜索营销 (SEM)', unlock: 2 },
          { name: 'YouTube 品牌视频广告', unlock: 3 },
          { name: 'Macro 头部达人深度合作', unlock: 3 },
          { name: '线下渠道分销 (传统与现代零售网络)', unlock: 3 },
          { name: '明星代言与超头部合作', unlock: 4 },
          { name: '地标户外广告 (OOH)', unlock: 5 },
          { name: '电视媒体与重大战略赞助', unlock: 6, selective: true },
        ]
      }
    };

    var activeLangData = I18N_DATA[curLang] || I18N_DATA.id;
    var LEVELS = activeLangData.levels;
    var CHANNELS = activeLangData.channels;

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
          esc(c.name) + (c.selective ? activeLangData.selectiveLabel : '') + '</span></div>'
        );
      }).join('');

      panelEl.innerHTML =
        '<div class="lvl-panel-top">' +
        '<div>' +
        '<div class="lvl-name">Level ' + lvl.n + ': <span>' + esc(lvl.name) + '</span></div>' +
        '<div class="lvl-desc">' + esc(lvl.desc) + '</div>' +
        '</div>' +
        '<div class="lvl-range-badge">' + esc(lvl.range) + '</div>' +
        '</div>' +
        '<div class="channel-list">' + chHtml + '</div>' +
        '<div class="lvl-foot">' + activeLangData.footNote + '</div>';
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

