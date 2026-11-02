import { galleryIndex } from './projects-model.js';
import { createCatalogFilter } from './catalog-filter.js';

const cards = [...document.querySelectorAll('[data-portfolio-project]')];
const filters = document.querySelector('.portfolio-filters');
const count = document.querySelector('[data-project-count]');
const sheet = document.querySelector('#project-sheet');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const ease = getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim();
const detailCards = new Map(cards.filter(card => card.querySelector('[data-project-open]')).map(card => [card.id, card]));
let activeId = null, invoker = null, savedPosition = null, previousOverflow = '', closing = false;
let entryAnimation, photoAnimation;
const catalog = filters ? createCatalogFilter({ cards, filters, count, itemKey: 'portfolioSector', buttonKey: 'portfolioFilter', param: 'sector', single: count.dataset.one, plural: count.dataset.many }) : null;

function prepareGallery(dossier) {
  const gallery = dossier.querySelector('.project-photo-gallery');
  if (!gallery) return;
  dossier.classList.add('has-project-photos');
  const photos = [...gallery.querySelectorAll('[data-project-photo]')];
  const thumbs = [...gallery.querySelectorAll('[data-photo-select]')];
  const previous = gallery.querySelector('[data-photo-prev]');
  const next = gallery.querySelector('[data-photo-next]');
  const status = gallery.querySelector('[data-photo-status]');
  let index = 0;
  function select(value, animate = false) {
    if (!Number.isInteger(value) || value < 0 || value >= photos.length) return;
    index = value;
    photos.forEach((photo,i) => { photo.hidden = i !== index; });
    thumbs.forEach((thumb,i) => thumb.setAttribute('aria-pressed', String(i === index)));
    previous.disabled = index === 0;
    next.disabled = index === photos.length - 1;
    if (document.activeElement === previous && previous.disabled || document.activeElement === next && next.disabled) thumbs[index]?.focus({preventScroll:true});
    const counter = status.dataset.counterTemplate.replace('{current}', index + 1).replace('{total}', photos.length);
    gallery.querySelector('[data-photo-count]').textContent = counter;
    status.textContent = `${counter}. ${photos[index].querySelector('figcaption').textContent}`;
    photoAnimation?.cancel();
    if (animate && !reduced.matches) photoAnimation = photos[index].animate([{opacity:.75},{opacity:1}], {duration:160,easing:ease});
  }
  gallery.querySelector('.project-photo-controls').hidden = false;
  gallery.querySelector('.project-photo-thumbs').hidden = false;
  for (const image of gallery.querySelectorAll('img')) image.loading = 'eager';
  previous.addEventListener('click', event => select(galleryIndex(index,-1,photos.length),event.detail>0));
  next.addEventListener('click', event => select(galleryIndex(index,1,photos.length),event.detail>0));
  thumbs.forEach(thumb => thumb.addEventListener('click',event => select(Number(thumb.dataset.photoSelect),event.detail>0)));
  gallery.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const value = event.key === 'Home' ? 0 : event.key === 'End' ? photos.length - 1 : galleryIndex(index,event.key==='ArrowLeft'?-1:1,photos.length);
    select(value);
    thumbs[index]?.focus({preventScroll:true});
  });
  select(0);
}

function hashId() { try { return decodeURIComponent(location.hash.slice(1)); } catch { return ''; } }

function closeSheet() {
  if (!sheet?.open) return;
  entryAnimation?.cancel(); photoAnimation?.cancel();
  sheet.close();
  invoker?.setAttribute('aria-expanded','false');
  activeId = null;
  document.documentElement.style.overflow = previousOverflow;
  // History may restore focus to the hero's anchor after popstate; restore the
  // invoking control and reading position once that native navigation finishes.
  const returnTarget = invoker, returnPosition = savedPosition;
  requestAnimationFrame(() => {
    if (sheet.open) return;
    if (returnTarget?.isConnected && !returnTarget.closest('[hidden]')) returnTarget.focus({preventScroll:true});
    if (returnPosition) window.scrollTo({...returnPosition,behavior:'instant'});
  });
  savedPosition = null;
}

function openSheet(id, trigger = null, animate = false) {
  const card = detailCards.get(id);
  if (!card || activeId === id && sheet.open) return;
  const menu = document.querySelector('.menu-toggle');
  if (menu?.getAttribute('aria-expanded') === 'true') menu.click();
  if (card.hidden) catalog.select(card.dataset.portfolioSector, { persist: true });
  if (!sheet.open) {
    savedPosition = {left:window.scrollX,top:window.scrollY};
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  }
  invoker?.setAttribute('aria-expanded','false');
  invoker = trigger || card.querySelector('[data-project-open]');
  invoker.setAttribute('aria-expanded','true');
  sheet.querySelector('#project-sheet-title').textContent = card.querySelector('[data-project-title]').textContent;
  sheet.querySelector('[data-sheet-sector]').textContent = card.dataset.portfolioSector;
  sheet.querySelector('[data-sheet-work]').textContent = card.querySelector('.project-entry-work').textContent;
  const badge = card.querySelector('.project-entry-state');
  sheet.querySelector('[data-sheet-state]').replaceChildren(...(badge ? [badge.cloneNode(true)] : []));
  const dossier = card.querySelector('.project-dossier').cloneNode(true);
  prepareGallery(dossier);
  sheet.querySelector('[data-sheet-dossier]').replaceChildren(dossier);
  activeId = id;
  if (!sheet.open) sheet.showModal();
  sheet.querySelector('.project-sheet-frame').scrollTop = 0;
  sheet.querySelector('#project-sheet-title').focus({preventScroll:true});
  entryAnimation?.cancel();
  if (animate && !reduced.matches) entryAnimation = sheet.animate([{opacity:.75,transform:'translateY(10px) scale(.99)'},{opacity:1,transform:'none'}],{duration:220,easing:ease});
}

function syncLocation() {
  closing = false;
  const id = hashId();
  if (detailCards.has(id)) openSheet(id);
  else closeSheet();
}

function requestClose() {
  if (closing || !sheet.open) return;
  if (history.state?.lmrProjectSheet === activeId) { closing=true; history.back(); }
  else { history.replaceState(history.state,'',location.pathname+location.search); closeSheet(); }
}

if (sheet && typeof sheet.showModal === 'function') {
  for (const card of detailCards.values()) {
    const trigger = card.querySelector('[data-project-open]');
    trigger.setAttribute('aria-haspopup','dialog');
    trigger.setAttribute('aria-controls',sheet.id);
    trigger.setAttribute('aria-expanded','false');
    trigger.addEventListener('click', event => {
      event.preventDefault();
      if (closing) return;
      if (hashId() !== card.id) history.pushState({...history.state,lmrProjectSheet:card.id},'',`#${card.id}`);
      openSheet(card.id,trigger,event.detail>0);
    });
  }
  sheet.querySelectorAll('[data-project-close]').forEach(button => button.addEventListener('click',requestClose));
  sheet.addEventListener('cancel',event => { event.preventDefault(); requestClose(); });
  sheet.addEventListener('keydown',event => {
    if (event.key !== 'Tab') return;
    const controls = [...sheet.querySelectorAll('button,a[href]')].filter(control => !control.disabled && control.getClientRects().length);
    if (!controls.length) return;
    if (!event.shiftKey && document.activeElement===controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
    else if (event.shiftKey && document.activeElement===controls[0]) { event.preventDefault(); controls.at(-1).focus(); }
  });
  const outside = event => {
    const rect = sheet.getBoundingClientRect();
    return event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom;
  };
  let startedOutside = false;
  sheet.addEventListener('pointerdown',event => { startedOutside=outside(event); });
  sheet.addEventListener('click',event => { if (event.detail>0 && startedOutside && outside(event)) requestClose(); startedOutside=false; });
  reduced.addEventListener('change',()=>{ if(reduced.matches){entryAnimation?.cancel();photoAnimation?.cancel();} });
  addEventListener('popstate',syncLocation);
  addEventListener('hashchange',syncLocation);
  addEventListener('pagehide',closeSheet);
  addEventListener('pageshow',event=>{if(event.persisted)syncLocation();});
  syncLocation();
}
