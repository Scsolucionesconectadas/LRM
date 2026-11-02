import test from 'node:test';
import assert from 'node:assert/strict';
import { readingProgress, backTopOffset } from '../apps/lmr/scroll-ui.js';
test('progreso es finito y acotado incluso en páginas cortas y overscroll', () => {
  assert.equal(readingProgress(0, 500, 800), 0);
  assert.equal(readingProgress(600, 2000, 800), .5);
  assert.equal(readingProgress(-30, 2000, 800), 0);
  assert.equal(readingProgress(3000, 2000, 800), 1);
});

test('volver arriba evita la franja de créditos y se ubica dentro del footer al final', () => {
  assert.equal(backTopOffset(1800, 900), 24);
  assert.equal(backTopOffset(850, 900), 66);
  assert.equal(backTopOffset(780, 900), 136);
});
