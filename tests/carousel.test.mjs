import test from 'node:test';
import assert from 'node:assert/strict';
import { nextPosition, canAutoPlay } from '../apps/lmr/carousel.js';
test('carrusel recorre elementos sin saltar fuera de sus límites', () => {
  assert.equal(nextPosition(0, 1, 6, 3), 1);
  assert.equal(nextPosition(3, 1, 6, 3), 0);
  assert.equal(nextPosition(0, -1, 6, 3), 3);
  assert.equal(nextPosition(0, 1, 2, 4), 0);
  assert.equal(nextPosition(0, 1, 0, 1), 0);
});
test('autoplay se detiene por pausa, foco, reducción o falta de visibilidad', () => {
  const state = { autoplay: true, paused: false, reduced: false, hovered: false, focused: false, visible: true, hidden: false, movable: true };
  assert.equal(canAutoPlay(state), true);
  for (const key of ['paused', 'reduced', 'hovered', 'focused', 'hidden', 'completed']) assert.equal(canAutoPlay({ ...state, [key]: true }), false, key);
  for (const key of ['autoplay', 'visible', 'movable']) assert.equal(canAutoPlay({ ...state, [key]: false }), false, key);
});
