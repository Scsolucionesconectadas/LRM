(() => {
  const doc = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const activeAnimations = new Map();
  const motionOff = () => reduced.matches;
  const ease = getComputedStyle(doc).getPropertyValue('--ease-out').trim() || 'cubic-bezier(0.23,1,0.32,1)';
  function syncMotion() {
    doc.dataset.reducedMotion = String(motionOff());
    if (motionOff()) { for (const animation of activeAnimations.values()) animation.cancel(); activeAnimations.clear(); }
  }
  reduced.addEventListener('change', syncMotion);
  syncMotion();
  function play(element, frames, options) {
    if (motionOff() || !element.animate) return;
    activeAnimations.get(element)?.cancel();
    const animation = element.animate(frames, { easing: ease, ...options });
    activeAnimations.set(element, animation);
    animation.finished.catch(() => {}).finally(() => { if (activeAnimations.get(element) === animation) activeAnimations.delete(element); });
  }
  function enter(element, options = {}) {
    const media = element.dataset.reveal === 'media';
    const distance = options.distance ?? (media ? 8 : 10);
    play(element, [{ opacity: .82, transform: `translateY(${distance}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration: media ? 550 : 450, ...options });
  }
  function diagram(element) {
    element.querySelectorAll('[data-diagram-part]').forEach((part, i) => {
      play(part, [{ opacity: .15 }, { opacity: 1 }], { duration: 500, delay: i * 100 });
    });
  }
  // Content is visible by default; observers only add a brief entry on first view.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        if (entry.target.dataset.motionDiagram !== undefined) diagram(entry.target);
        else if (entry.target.dataset.catalogInteracted !== 'true') enter(entry.target);
        observer.unobserve(entry.target);
      }
    }, { threshold: .1 });
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    document.querySelectorAll('[data-motion-diagram]').forEach(el => observer.observe(el));
  }

  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const mobile = matchMedia('(max-width: 760px)');
  const navigation = document.querySelector('#navigation');
  const setMenu = (open, animate = false) => {
    header.toggleAttribute('data-menu-open', open);
    menu.setAttribute('aria-expanded', String(open));
    if (open && animate && mobile.matches) enter(navigation, { duration: 180, distance: -6 });
    if (!open) activeAnimations.get(navigation)?.cancel();
  };
  header.dataset.enhanced = '';
  menu.hidden = false;
  menu.addEventListener('click', event => setMenu(menu.getAttribute('aria-expanded') !== 'true', event.detail > 0));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
  });
  document.addEventListener('click', event => { if (mobile.matches && !header.contains(event.target)) setMenu(false); });
  mobile.addEventListener('change', () => {
    const focusWasInNav = navigation.contains(document.activeElement);
    setMenu(false);
    if (mobile.matches && focusWasInNav) menu.focus();
  });

  const serviceIndex = document.querySelector('.services-index');
  if (serviceIndex) {
    const compactIndex = matchMedia('(max-width: 860px)');
    const syncIndex = () => { serviceIndex.open = !compactIndex.matches; };
    compactIndex.addEventListener('change', syncIndex);
    syncIndex();
  }

  function revealAnchor(focus = false) {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (target instanceof HTMLDetailsElement) {
      target.open = true;
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
      if (focus === true) target.querySelector('summary').focus({ preventScroll: true });
    }
  }
  revealAnchor();
  addEventListener('hashchange', revealAnchor);
  document.querySelectorAll('[data-service-link]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    if (serviceIndex && matchMedia('(max-width: 860px)').matches) serviceIndex.open = false;
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    revealAnchor(true);
  }));
  document.querySelectorAll('.service-detail,.service-faq').forEach(detail => {
    let pointerOpening = false;
    detail.querySelector('summary').addEventListener('click', event => { pointerOpening = event.detail > 0 && !detail.open; });
    detail.addEventListener('toggle', () => {
      const body = detail.querySelector('.service-body,.faq-answer');
      if (detail.open && pointerOpening && body) enter(body, { duration: 200, distance: 4 });
      if (!detail.open && body) activeAnimations.get(body)?.cancel();
      pointerOpening = false;
    });
  });

  const filters = document.querySelector('.project-filter');
  if (filters) {
    filters.hidden = false;
    const cards = [...document.querySelectorAll('.project-card')];
    filters.addEventListener('click', event => {
      const button = event.target.closest('[data-project-filter]');
      if (!button) return;
      filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      const value = button.dataset.projectFilter;
      let count = 0;
      for (const card of cards) {
        const show = value === 'Todos' || card.dataset.sector === value;
        activeAnimations.get(card)?.cancel();
        card.hidden = !show;
        if (show) { count++; if (event.detail > 0) enter(card, { duration: 200, distance: 4 }); }
      }
      document.querySelector('.filter-status').textContent = (filters.dataset.statusTemplate || '{count} proyectos en {sector}.').replace('{count}', count).replace('{sector}', value === 'Todos' ? filters.dataset.allSectors : value);
    });
  }

})();
