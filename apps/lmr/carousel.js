export function nextPosition(index, direction, total, visible) {
  const last = Math.max(0, total - visible);
  if (!last) return 0;
  const next = index + direction;
  return next > last ? 0 : next < 0 ? last : next;
}
export function canAutoPlay(s) {
  return s.autoplay && s.movable && s.visible && !s.hidden && !s.paused && !s.reduced && !s.hovered && !s.focused && !s.completed;
}

export function createCarousel(root) {
  const track = root.querySelector('[data-carousel-track]');
  const items = [...track.querySelectorAll('[data-carousel-item]')];
  if (!items.length) return { destroy() {} };
  const controls = root.querySelector('.carousel-controls');
  const previous = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  const status = root.querySelector('[data-carousel-status]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const state = { autoplay: root.dataset.autoplay === 'true', completed: false, paused: false, reduced: reduced.matches, hovered: false, focused: false, visible: !('IntersectionObserver' in window), hidden: document.hidden, movable: false };
  let index = 0, visible = 1, timer, settle;
  const start = item => item.offsetLeft - items[0].offsetLeft;

  function sync() {
    clearTimeout(timer);
    root.dataset.playing = String(canAutoPlay(state));
    controls.hidden = !state.movable;
    // One short tour, then manual arrows/swipe. Interaction ends the tour.
    if (canAutoPlay(state)) timer = setTimeout(() => {
      state.completed = true;
      index = Math.max(0, items.length - visible);
      track.scrollTo({ left: start(items[index]), behavior: state.reduced ? 'instant' : 'smooth' });
      sync();
    }, 2200);
  }
  function go(direction, manual = true, keyboard = false) {
    if (manual) { state.paused = true; state.completed = true; }
    index = nextPosition(index, direction, items.length, visible);
    track.scrollTo({ left: start(items[index]), behavior: state.reduced || keyboard ? 'instant' : 'smooth' });
    if (manual) {
      status.textContent = root.dataset.position.replace('{start}', index + 1).replace('{end}', Math.min(items.length, index + visible)).replace('{total}', items.length);
    }
    sync();
  }
  function resize() {
    visible = Math.max(1, parseInt(getComputedStyle(track).getPropertyValue('--visible'), 10) || 1);
    state.movable = items.length > visible;
    index = Math.min(index, Math.max(0, items.length - visible));
    track.scrollTo({ left: start(items[index]), behavior: 'instant' });
    sync();
  }
  previous.addEventListener('click', e => go(-1, true, e.detail === 0), options);
  next.addEventListener('click', e => go(1, true, e.detail === 0), options);
  root.addEventListener('mouseenter', () => { state.hovered = true; state.completed = true; sync(); }, options);
  root.addEventListener('mouseleave', () => { state.hovered = false; if (!state.focused) state.paused = false; sync(); }, options);
  root.addEventListener('focusin', e => {
    state.focused = true;
    state.completed = true;
    if (state.focused) state.paused = true;
    sync();
  }, options);
  root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) { state.focused = false; state.paused = false; sync(); } }, options);
  const manual = () => { state.paused = true; state.completed = true; sync(); };
  track.addEventListener('pointerdown', manual, options);
  track.addEventListener('wheel', manual, { ...options, passive: true });
  track.tabIndex = 0;
  track.addEventListener('keydown', e => {
    if (e.target === track && ['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); go(e.key === 'ArrowLeft' ? -1 : 1, true, true); }
  }, options);
  track.addEventListener('scroll', () => {
    clearTimeout(settle);
    settle = setTimeout(() => {
      let distance = Infinity;
      items.forEach((item, i) => { const diff = Math.abs(start(item) - track.scrollLeft); if (diff < distance) { distance = diff; index = Math.min(i, Math.max(0, items.length - visible)); } });
    }, 160);
  }, { ...options, passive: true });
  reduced.addEventListener('change', () => {
    state.reduced = reduced.matches;
    if (state.reduced) track.scrollTo({ left: start(items[index]), behavior: 'instant' });
    sync();
  }, options);
  document.addEventListener('visibilitychange', () => { state.hidden = document.hidden; sync(); }, options);
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => { state.visible = entries[0].isIntersecting; if (!state.visible) state.paused = false; sync(); }, { threshold: .15 }) : null;
  observer?.observe(root);
  const sizeObserver = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  sizeObserver?.observe(track);
  if (!sizeObserver) window.addEventListener('resize', resize, options);
  resize();
  root.dataset.enhanced = 'true';
  return { destroy() { clearTimeout(timer); clearTimeout(settle); observer?.disconnect(); sizeObserver?.disconnect(); controller.abort(); } };
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-carousel]').forEach(createCarousel);
