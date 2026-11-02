export function readingProgress(top, height, viewport) {
  const range = height - viewport;
  return range <= 0 ? 0 : Math.min(1, Math.max(0, top / range));
}
export const backTopOffset = (footerBottom, viewport) => Math.max(24, viewport - footerBottom + 16);
export function initScrollUI() {
  const bar = document.querySelector('[data-scroll-progress]');
  const button = document.querySelector('[data-back-top]');
  const footer = document.querySelector('.site-footer');
  if (!bar || !button) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame;
  const update = () => {
    frame = null;
    const top = window.scrollY;
    bar.style.transform = `scaleX(${readingProgress(top, document.documentElement.scrollHeight, innerHeight)})`;
    button.hidden = top < Math.max(500, innerHeight * .6);
    if (footer) button.style.bottom = `${backTopOffset(footer.getBoundingClientRect().bottom, innerHeight)}px`;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('toggle', schedule, true);
  document.addEventListener('load', schedule, true);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
  button.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
    document.querySelector('.site-header .logo')?.focus({ preventScroll: true });
  });
  update();
}
if (typeof document !== 'undefined') initScrollUI();
