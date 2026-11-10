/* The Spirit Tree — motion (native JS, no framework) */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    /[?&]static=1/.test(window.location.search);

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 12); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  if (reduce) return;

  /* arm entrance animations only after two confirmed rAF ticks in a visible tab,
     re-armed on visibilitychange, with a setTimeout watchdog that fires even if
     the rAF/animation clock itself is frozen (previews, headless, backgrounded tabs) */
  var armed = false;
  var arm = function () {
    if (armed || document.visibilityState !== 'visible') return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (armed || document.visibilityState !== 'visible') return;
        armed = true;
        document.documentElement.classList.add('anim');
        startReveal();
        var settled = false;
        document.addEventListener('transitionend', function once() {
          settled = true;
          document.removeEventListener('transitionend', once);
        }, { once: true });
        setTimeout(function () {
          if (!settled) document.documentElement.classList.remove('anim');
        }, 3500);
      });
    });
  };
  arm();
  document.addEventListener('visibilitychange', arm);

  function startReveal() {
    var targets = document.querySelectorAll('.anim-target');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }
})();
