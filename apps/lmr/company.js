// Company has a single site header; section IDs remain valid without a submenu.
export function methodStepAtPosition(tops, offset) {
  if (!tops.length) return -1;
  let current = 0;
  tops.forEach((top, index) => { if (top <= offset) current = index; });
  return current;
}

export function revealCompanyMethod(track) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return { destroy() {} };
  let observer;
  const show = () => { track.dataset.methodVisible = 'true'; observer?.disconnect(); };
  track.dataset.methodEnhanced = 'true';
  observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) show(); }, { threshold: .1 });
  const changed = () => { if (reduced.matches) show(); };
  reduced.addEventListener('change', changed);
  observer.observe(track);
  return { destroy() { show(); reduced.removeEventListener('change', changed); } };
}

export function enhanceCompanyLayout(header) {
  const steps = [...document.querySelectorAll('[data-company-step]')];
  let frame = 0;
  const update = () => {
    frame = 0;
    const headerHeight = header.getBoundingClientRect().height;
    document.body.style.setProperty('--company-header-offset', `${headerHeight}px`);
    const active = methodStepAtPosition(steps.map(step => step.getBoundingClientRect().top), headerHeight + 70);
    steps.forEach((step, index) => step.toggleAttribute('data-step-current', index === active));
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const beforeNavigate = event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (!event.target.closest?.('a[href^="#"]')) return;
    const menu = header.querySelector('.menu-toggle');
    if (menu?.getAttribute('aria-expanded') === 'true') menu.click();
    if (frame) cancelAnimationFrame(frame);
    update();
  };
  const observer = 'ResizeObserver' in window ? new ResizeObserver(schedule) : null;
  observer?.observe(header);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('hashchange', update);
  document.addEventListener('click', beforeNavigate);
  update();
  return { destroy() { if (frame) cancelAnimationFrame(frame); observer?.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); window.removeEventListener('hashchange', update); document.removeEventListener('click', beforeNavigate); } };
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-method-track]').forEach(revealCompanyMethod);
  const header = document.querySelector('.site-header');
  if (header) enhanceCompanyLayout(header);
}
