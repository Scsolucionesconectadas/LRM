import test from 'node:test';
import assert from 'node:assert/strict';
import { richText, plainText } from '../shared/html.mjs';
import { validateEditorial, pagesWithMetadata } from '../shared/editorial.mjs';
test('énfasis editorial conserva texto y escapa HTML antes de generar strong', () => {
  assert.equal(richText('Obras **eléctricas** <img src=x onerror=alert(1)>'), 'Obras <strong>eléctricas</strong> &lt;img src=x onerror=alert(1)&gt;');
  assert.equal(plainText('Obras **eléctricas**'), 'Obras eléctricas');
});
test('build exige metadatos completos y únicos antes de publicar HTML', () => {
  const routes = [{ slug: '', label: 'Inicio' }, { slug: 'empresa/', label: 'Empresa' }];
  assert.throws(() => pagesWithMetadata(routes, { pages: {} }), /SEO/);
  const duplicate = { pages: { inicio: { title: 'LMR', description: 'Inicio' }, 'empresa/': { title: 'LMR', description: 'Empresa' } } };
  assert.throws(() => pagesWithMetadata(routes, duplicate), /duplicado/i);
  duplicate.pages['empresa/'].title = 'Empresa LMR';
  assert.equal(pagesWithMetadata(routes, duplicate)[1].title, 'Empresa LMR');
});
test('validación editorial impide notas internas sin bloquear alcance real', () => {
  assert.doesNotThrow(() => validateEditorial({ summary: 'Referencias y ejecución según el alcance contratado.' }));
  assert.throws(() => validateEditorial({ text: 'La referencia institucional menciona a otra empresa.' }), /editorial/i);
  assert.throws(() => validateEditorial({ text: 'Imagen del archivo institucional de LMR.' }), /editorial/i);
});
