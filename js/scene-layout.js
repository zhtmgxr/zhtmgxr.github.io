(() => {
  const host = document.querySelector('#tree-scene');
  const hero = document.querySelector('#tree-hero');
  const nav = [...document.querySelectorAll('.site-header nav a')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let settleTimer = 0;

  // The scene stays in the hero and scrolls away with the introduction.
  host.dataset.layout = 'home';
  host.removeAttribute('aria-hidden');
  function highlight(id) {
    nav.forEach(link => {
      if (link.hash === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function navigate(hash, updateHistory = true) {
    const target = document.querySelector(hash);
    if (!target) return;
    const home = hash === '#page-top';
    highlight(home ? '' : hash);
    if (updateHistory && location.hash !== hash) history.pushState(null, '', hash);
    const header = document.querySelector('.site-header').offsetHeight;
    window.scrollTo({top:home ? 0 : target.getBoundingClientRect().top + scrollY - header - 24,
      behavior:reducedMotion.matches ? 'instant' : 'smooth'});
    scheduleSync();
  }
  document.addEventListener('click', e => {
    const link = e.target.closest('.site-header a, #story-link');
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !link.hash || link.origin !== location.origin) return;
    e.preventDefault();
    navigate(link.hash);
  });
  // Keep the navigation highlight in sync with scrolling and browser history.
  function syncVisibleSection() {
    const below = scrollY > hero.offsetHeight * .55;
    const current = [...document.querySelectorAll('.resume-section')].filter(s => s.getBoundingClientRect().top < 220).at(-1);
    if (below && current) highlight(current.id === 'honors' ? '#about' : current.id === 'publications' ? '#research' : `#${current.id}`);
    else if (!below) {
      highlight('');
      if (scrollY < 2 && location.hash !== '#page-top') history.replaceState(null, '', '#page-top');
    }
  }
  function scheduleSync() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(syncVisibleSection, 160);
  }
  addEventListener('scroll', scheduleSync, {passive:true});
  addEventListener('scrollend', scheduleSync, {passive:true});
  addEventListener('pageshow', scheduleSync);
  addEventListener('resize', scheduleSync);
  addEventListener('popstate', () => navigate(location.hash || '#page-top', false));
  if (location.hash && location.hash !== '#page-top') requestAnimationFrame(() => navigate(location.hash, false));
})();
