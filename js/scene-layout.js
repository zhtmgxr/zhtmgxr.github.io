(() => {
  const host = document.querySelector('#tree-scene');
  const stage = document.querySelector('.hero-visual');
  const hero = document.querySelector('#tree-hero');
  const root = document.body;
  const nav = [...document.querySelectorAll('.site-header nav a')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let reading = false, animation = null, settleTimer = 0;

  // At home the canvas belongs to the stage. Normal layout, scrolling and font
  // loading position it, without caching a document or viewport scroll offset.
  function attachHome() {
    stage.prepend(host);
    host.style.cssText = '';
    host.dataset.layout = 'home';
    host.removeAttribute('aria-hidden');
    const canvas = host.querySelector('canvas');
    if (canvas) canvas.tabIndex = 0;
  }
  function dockFrame() {
    const rect = stage.getBoundingClientRect();
    const width = rect.width, height = rect.height - 45, scale = 1.18;
    return {width, height, x:innerWidth - width * .57,
      y:Math.max(95, (innerHeight - height) / 2) - height * .09, scale};
  }
  function placeFixed(frame, opacity) {
    root.appendChild(host);
    Object.assign(host.style, {position:'fixed',left:'0px',top:'0px',right:'auto',bottom:'auto',
      width:`${frame.width}px`,height:`${frame.height}px`,transformOrigin:'0 0',
      transform:`translate3d(${frame.x}px,${frame.y}px,0) scale(${frame.scale})`,opacity:String(opacity)});
  }
  function dockOpacity() { return innerWidth <= 600 ? .09 : innerWidth <= 900 ? .12 : .38; }
  function setReading(next, animate = true, toTop = false) {
    if (next === reading) return;
    const from = host.getBoundingClientRect();
    const fromOpacity = Number(getComputedStyle(host).opacity);
    if (animation) { animation.cancel(); animation = null; }
    reading = next;
    root.classList.toggle('is-reading', reading);
    host.dataset.layout = reading ? 'docked' : 'returning';
    const canvas = host.querySelector('canvas');
    if (canvas) canvas.tabIndex = reading ? -1 : 0;
    host.setAttribute('aria-hidden', String(reading));
    const rect = stage.getBoundingClientRect();
    const end = reading ? dockFrame() : {width:rect.width,height:rect.height - 45,
      x:rect.left,y:rect.top + (toTop ? scrollY : 0),scale:1};
    const opacity = reading ? dockOpacity() : 1;
    placeFixed(end, opacity);
    if (!animate || reducedMotion.matches) { if (!reading) attachHome(); return; }
    const transition = host.animate([
      {transform:`translate3d(${from.left}px,${from.top}px,0) scale(${from.width / end.width},${from.height / end.height})`,opacity:fromOpacity},
      {transform:host.style.transform,opacity}
    ], {duration:1050,easing:'cubic-bezier(.22,.8,.2,1)'});
    animation = transition;
    transition.onfinish = () => {
      if (animation !== transition) return;
      animation = null;
      if (!reading) attachHome();
      scheduleSync();
    };
  }
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
    setReading(!home, true, home);
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
  // Every completed or interrupted scroll must reconcile the scene with the
  // visible section, even if its last event arrived during the tree animation.
  function syncVisibleSection() {
    if (animation) { scheduleSync(); return; }
    const below = scrollY > hero.offsetHeight * .55;
    setReading(below);
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
  function resizeScene() {
    if (animation) { animation.cancel(); animation = null; }
    if (reading) placeFixed(dockFrame(), dockOpacity());
    else attachHome();
    scheduleSync();
  }
  addEventListener('resize', resizeScene);
  new ResizeObserver(() => { if (reading) resizeScene(); }).observe(stage);
  addEventListener('popstate', () => navigate(location.hash || '#page-top', false));
  attachHome();
  if (location.hash && location.hash !== '#page-top') requestAnimationFrame(() => navigate(location.hash, false));
})();
