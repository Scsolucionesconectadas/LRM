export function readFilter(url, key, allowed) {
  const value = new URL(url).searchParams.get(key);
  return allowed.includes(value) ? value : 'all';
}

export function filterUrl(url, key, value) {
  const next = new URL(url);
  if (value === 'all') next.searchParams.delete(key);
  else next.searchParams.set(key, value);
  return next;
}

export function createCatalogFilter({ cards, filters, count, itemKey, buttonKey, param, single, plural, onChange = () => {} }) {
  const buttons = [...filters.querySelectorAll('button')];
  const allowed = buttons.map(button => button.dataset[buttonKey]);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map();
  const cancel = () => { for (const animation of animations.values()) animation.cancel(); animations.clear(); };
  const ease = getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim();

  function select(value, { persist = false, animate = false } = {}) {
    cancel();
    if (persist) for (const card of cards) {
      card.dataset.catalogInteracted = 'true';
      for (const animation of card.getAnimations?.() ?? []) animation.cancel();
    }
    const active = allowed.includes(value) ? value : 'all';
    const visible = cards.filter(card => {
      card.hidden = active !== 'all' && card.dataset[itemKey] !== active;
      return !card.hidden;
    });
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset[buttonKey] === active));
    count.textContent = `${visible.length} ${visible.length === 1 ? single : plural}`;
    onChange(active);
    if (persist) {
      const url = filterUrl(location.href, param, active);
      let target;
      try { target = cards.find(card => card.id === decodeURIComponent(url.hash.slice(1))); } catch { /* Ignore malformed anchors. */ }
      if (target?.hidden) url.hash = '';
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    }
    if (animate && !reduced.matches) for (const card of visible) {
      if (!card.animate) continue;
      const animation = card.animate([{ opacity: .6, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: ease });
      animations.set(card, animation);
      animation.finished.then(() => { if (animations.get(card) === animation) animations.delete(card); }, () => {});
    }
  }
  function sync() {
    let value = readFilter(location.href, param, allowed);
    let target;
    try { target = cards.find(card => card.id === decodeURIComponent(location.hash.slice(1))); } catch { /* Ignore malformed anchors. */ }
    if (target && value !== 'all' && target.dataset[itemKey] !== value) value = target.dataset[itemKey];
    select(value, { persist: new URL(location.href).searchParams.has(param) });
  }
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button && buttons.includes(button)) select(button.dataset[buttonKey], { persist: true, animate: event.detail > 0 });
  });
  reduced.addEventListener('change', () => { if (reduced.matches) cancel(); });
  addEventListener('popstate', sync);
  addEventListener('pageshow', event => { if (event.persisted) sync(); });
  addEventListener('pagehide', cancel);
  sync();
  return { select };
}
