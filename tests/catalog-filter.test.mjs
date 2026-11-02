import test from 'node:test';
import assert from 'node:assert/strict';
import { readFilter, filterUrl } from '../apps/lmr/catalog-filter.js';
import { trackSiteEvent } from '../apps/lmr/insights.js';

test('categorías compartibles conservan el prefijo, parámetros ajenos y la ficha', () => {
  const url = filterUrl('https://example.invalid/solution-group/lmr/referencias/?origen=web#hospital-privado', 'sector', 'Agua e infraestructura');
  assert.equal(url.pathname, '/solution-group/lmr/referencias/');
  assert.equal(url.searchParams.get('origen'), 'web');
  assert.equal(url.hash, '#hospital-privado');
  assert.equal(readFilter(url, 'sector', ['Salud', 'Agua e infraestructura']), 'Agua e infraestructura');
  assert.equal(filterUrl(url, 'sector', 'all').search, '?origen=web');
});

test('una categoría desconocida o maliciosa vuelve a Todas sin interpretarse como HTML', () => {
  const allowed = ['all', 'electricas', 'redes-seguridad'];
  for (const query of ['?area=inexistente', '?area=%3Cscript%3E', '']) {
    assert.equal(readFilter('https://example.invalid/lmr/servicios/' + query, 'area', allowed), 'all');
  }
});

test('el punto de integración de medición excluye datos personales, consultas y URL', () => {
  const originalDocument = globalThis.document;
  const originalDispatch = globalThis.dispatchEvent;
  const received = [];
  globalThis.document = { body: { dataset: { page: 'contacto/' } } };
  globalThis.dispatchEvent = event => { received.push(event.detail); };
  try {
    trackSiteEvent('consultation_accepted', { email: 'anonymous@example.invalid', name: 'Ficticio', message: 'No publicar', id: 'irrelevante', url: '?proyecto=privado' });
    assert.deepEqual(received, [{ event: 'consultation_accepted', page: 'contacto/' }]);
    trackSiteEvent('service_open', { id: 'automatizacion', phone: '000' });
    assert.deepEqual(received[1], { event: 'service_open', page: 'contacto/', id: 'automatizacion' });
    trackSiteEvent('evento_no_permitido', { channel: 'whatsapp' });
    assert.equal(received.length, 2);
  } finally {
    if (originalDocument === undefined) delete globalThis.document; else globalThis.document = originalDocument;
    if (originalDispatch === undefined) delete globalThis.dispatchEvent; else globalThis.dispatchEvent = originalDispatch;
  }
});
