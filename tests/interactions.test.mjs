import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const app = await readFile(new URL('../apps/lmr/app.js', import.meta.url), 'utf8');

function environment({ reduce = false, withReveal = false } = {}) {
  const listeners = {};
  const attributes = new Map();
  const menuListeners = {};
  const reduced = { matches: reduce, addEventListener: (type, fn) => { listeners[type] = fn; } };
  const mobile = { matches: false, addEventListener() {} };
  const header = { dataset: {}, toggleAttribute: (name, value) => attributes.set(name, value), contains: () => false };
  const menu = { hidden: true, setAttribute: (name, value) => attributes.set(name, value), getAttribute: name => attributes.get(name) ?? 'false', addEventListener: (type, fn) => { menuListeners[type] = fn; }, focus() {} };
  const animations = [];
  const element = { dataset: {}, animate: () => {
    const a = { cancelled: false, finished: new Promise(() => {}), cancel() { this.cancelled = true; } };
    animations.push(a);
    return a;
  } };
  const doc = { documentElement: { dataset: {} }, addEventListener() {}, querySelector: selector => ({ '.site-header': header, '.menu-toggle': menu, '#navigation': { contains: () => false } })[selector] ?? null, querySelectorAll: selector => withReveal && selector === '[data-reveal]' ? [element] : [] };
  const Observer = class {
    constructor(callback) { this.callback = callback; }
    observe(target) { this.callback([{ target, isIntersecting: true }]); }
    unobserve() {}
  };
  const context = { document: doc, matchMedia: q => q.includes('prefers-reduced-motion') ? reduced : mobile, window: withReveal ? { IntersectionObserver: Observer } : {}, IntersectionObserver: Observer, location: { hash: '', search: '' }, addEventListener() {}, URLSearchParams, HTMLDetailsElement: class {}, getComputedStyle: () => ({ getPropertyValue: () => 'cubic-bezier(0.23,1,0.32,1)' }) };
  return { context, doc, reduced, listeners, menuListeners, menu, animations, attributes };
}

test('inicializa sin botón de animación ni almacenamiento y mantiene menú operativo', () => {
  const env = environment();
  assert.doesNotThrow(() => runInNewContext(app, env.context));
  assert.equal(env.menu.hidden, false);
  env.menuListeners.click({ detail: 1 });
  assert.equal(env.attributes.get('aria-expanded'), 'true');
  assert.equal(env.doc.documentElement.dataset.reducedMotion, 'false');
});

test('el revelado de scroll no compite con la transición del catálogo al filtrar', () => {
  const env = environment({ withReveal: true });
  env.doc.querySelectorAll('[data-reveal]')[0].dataset.catalogInteracted = 'true';
  runInNewContext(app, env.context);
  assert.equal(env.animations.length, 0);
});

test('respeta reducción desde carga y cancela movimiento al cambiar preferencia', () => {
  const initiallyReduced = environment({ reduce: true, withReveal: true });
  runInNewContext(app, initiallyReduced.context);
  assert.equal(initiallyReduced.animations.length, 0);
  assert.equal(initiallyReduced.doc.documentElement.dataset.reducedMotion, 'true');
  const env = environment({ withReveal: true });
  runInNewContext(app, env.context);
  assert.ok(env.animations.length > 0);
  env.reduced.matches = true;
  env.listeners.change();
  assert.equal(env.doc.documentElement.dataset.reducedMotion, 'true');
  assert.ok(env.animations.every(a => a.cancelled));
});
