import test from 'node:test';
import assert from 'node:assert/strict';
import { canRunAmbient } from '../apps/lmr/home-motion.js';

test('movimiento decorativo requiere visibilidad y respeta pestaña y reducción', () => {
  const state = { visible: true, hidden: false, reduced: false };
  assert.equal(canRunAmbient(state), true);
  for (const change of [{ visible: false }, { hidden: true }, { reduced: true }]) {
    assert.equal(canRunAmbient({ ...state, ...change }), false);
  }
});
