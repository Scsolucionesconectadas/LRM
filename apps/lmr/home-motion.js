export const canRunAmbient = state => state.visible && !state.hidden && !state.reduced;

export function createAmbientMotion(root) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const state = { visible: !('IntersectionObserver' in window), hidden: document.hidden, reduced: reduced.matches };
  function sync() {
    root.dataset.motionActive = String(canRunAmbient(state));
  }
  reduced.addEventListener('change', () => { state.reduced = reduced.matches; sync(); }, options);
  document.addEventListener('visibilitychange', () => { state.hidden = document.hidden; sync(); }, options);
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => { state.visible = entries[0].isIntersecting; sync(); }, { threshold: .2 }) : null;
  observer?.observe(root);
  sync();
  return { destroy() { controller.abort(); observer?.disconnect(); root.dataset.motionActive = 'false'; } };
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-ambient-motion]').forEach(createAmbientMotion);
