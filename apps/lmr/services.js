import { createCatalogFilter } from './catalog-filter.js';

// The same brief is a native inline disclosure when JavaScript is unavailable.
const sheet = document.querySelector('#service-sheet');
const cards = [...document.querySelectorAll('[data-service-card]')];
const filters = document.querySelector('.service-filters');
const count = document.querySelector('[data-service-count]');
const guidance = document.querySelector('[data-service-guidance]');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const cardById = new Map(cards.map(card => [card.id, card]));
let activeId = null, invoker = null, savedPosition = null;
let previousOverflow = '', closing = false, entryAnimation;
let catalog;

function hashId() {
  try { return decodeURIComponent(location.hash.slice(1)); } catch { return ''; }
}

function closeSheet() {
  if (!sheet.open) return;
  entryAnimation?.cancel();
  sheet.close();
  invoker?.setAttribute('aria-expanded', 'false');
  activeId = null;
  document.documentElement.style.overflow = previousOverflow;
  if (invoker?.isConnected && !invoker.closest('[hidden]')) invoker.focus({ preventScroll: true });
  if (savedPosition) window.scrollTo({ ...savedPosition, behavior: 'instant' });
  savedPosition = null;
}

function openSheet(id, trigger = null, animate = false) {
  const card = cardById.get(id);
  if (!card || activeId === id && sheet.open) return;
  if (card.hidden) catalog.select(card.dataset.serviceGroup, { persist: true });
  if (!sheet.open) {
    invoker = trigger || card.querySelector('[data-service-open]');
    savedPosition = { left: window.scrollX, top: window.scrollY };
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  }
  sheet.querySelector('[data-sheet-art]').replaceChildren(card.querySelector('.service-art').cloneNode(true));
  sheet.querySelector('[data-sheet-art] img').loading = 'eager';
  sheet.querySelector('[data-sheet-category]').textContent = card.querySelector('.service-card-category').textContent;
  sheet.querySelector('#service-sheet-title').textContent = card.querySelector('[data-service-title]').textContent;
  const brief = card.querySelector('.service-brief').cloneNode(true);
  brief.querySelector('.service-description').id = 'service-sheet-description';
  sheet.querySelector('[data-sheet-brief]').replaceChildren(brief);
  activeId = id;
  invoker?.setAttribute('aria-expanded', 'true');
  if (!sheet.open) sheet.showModal();
  sheet.scrollTop = 0;
  sheet.querySelector('#service-sheet-title').focus({ preventScroll: true });
  entryAnimation?.cancel();
  if (animate && !reduced.matches) entryAnimation = sheet.animate([
    { opacity: .7, transform: 'translateY(10px) scale(.99)' },
    { opacity: 1, transform: 'none' }
  ], { duration: 220, easing: 'cubic-bezier(.23,1,.32,1)' });
}

function syncLocation() {
  closing = false;
  const id = hashId();
  if (cardById.has(id)) openSheet(id);
  else closeSheet();
}

function requestClose() {
  if (closing || !sheet.open) return;
  if (history.state?.lmrServiceModal === activeId) {
    closing = true;
    history.back();
  } else {
    history.replaceState(history.state, '', location.pathname + location.search);
    closeSheet();
  }
}

if (sheet && typeof sheet.showModal === 'function') {
  catalog = createCatalogFilter({ cards, filters, count, itemKey: 'serviceGroup', buttonKey: 'serviceFilter', param: 'area', single: count.dataset.singleLabel, plural: count.dataset.countLabel, onChange: group => { guidance.hidden = group !== 'all'; } });
  for (const card of cards) {
    const trigger = card.querySelector('[data-service-open]');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', sheet.id);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', event => {
      event.preventDefault();
      if (closing) return;
      if (hashId() !== card.id) history.pushState({ ...history.state, lmrServiceModal: card.id }, '', `#${card.id}`);
      openSheet(card.id, trigger, event.detail > 0);
    });
  }
  sheet.querySelectorAll('[data-service-close]').forEach(button => button.addEventListener('click', requestClose));
  sheet.addEventListener('cancel', event => { event.preventDefault(); requestClose(); });
  // Keep the cycle within the sheet; Chromium can otherwise focus the document
  // between its last and first controls even while the background is inert.
  sheet.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...sheet.querySelectorAll('button,a[href]')].filter(control => control.getClientRects().length && !control.disabled);
    const first = controls[0], last = controls.at(-1);
    if (!first || !last) return;
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  });
  let startedOutside = false;
  const outside = event => {
    const rect = sheet.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  sheet.addEventListener('pointerdown', event => { startedOutside = outside(event); });
  sheet.addEventListener('click', event => { if (event.detail > 0 && startedOutside && outside(event)) requestClose(); startedOutside = false; });
  reduced.addEventListener('change', () => { if (reduced.matches) entryAnimation?.cancel(); });
  addEventListener('popstate', syncLocation);
  addEventListener('hashchange', syncLocation);
  addEventListener('pageshow', event => { if (event.persisted) syncLocation(); });
  addEventListener('pagehide', () => { closeSheet(); });
  syncLocation();
}
