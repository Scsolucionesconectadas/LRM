import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getConfig, projectRoot } from '../scripts/build.mjs';
import { demoDirectory, prepareLmrDemo } from '../scripts/prepare-lmr-demo.mjs';

test('publicar una revisión no habilita proyectos pendientes en producción', () => {
  assert.equal(getConfig().includePreviewProjects, true);
  assert.equal(getConfig({ includePreviewProjects: false }).includePreviewProjects, false);
  assert.equal(getConfig({ mode: 'production', publicBaseUrl: 'https://example.com/lmr/', includePreviewProjects: true }).includePreviewProjects, false);
  assert.throws(() => getConfig({ includePreviewProjects: 'false' }), /booleano/);
});

test('demo pública de LMR: raíz, enlaces, noindex y ausencia de material privado o transporte de correo', async () => {
  const report = await prepareLmrDemo();
  assert.equal(report.pages, 5);
  assert.equal(report.basePath, '/');
  for (const slug of ['', 'empresa/', 'servicios/', 'referencias/', 'contacto/']) {
    const html = await readFile(resolve(demoDirectory, slug, 'index.html'), 'utf8');
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.doesNotMatch(html, /rel="canonical"|unidad-penal-8|pinero-|formsubmit\.co\/ajax|formspree\.io\/f\//);
    assert.doesNotMatch(html, /(?:href|src)="\/lmr\//);
    for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)/g)) {
      const localPath = match[1].endsWith('/') ? `${match[1]}index.html` : match[1];
      await access(resolve(demoDirectory, `.${localPath}`));
    }
  }
  const projects = await readFile(resolve(demoDirectory, 'referencias/index.html'), 'utf8');
  assert.equal((projects.match(/data-portfolio-project/g) || []).length, 6);
  assert.ok(!(await readdir(resolve(demoDirectory, 'assets'))).some(file => file.startsWith('pinero-')));
  assert.match(await readFile(resolve(demoDirectory, 'contacto/index.html'), 'utf8'), /data-endpoint=""/);
  assert.match(await readFile(resolve(demoDirectory, '_headers'), 'utf8'), /X-Robots-Tag: noindex, nofollow, noarchive/);
  assert.match(await readFile(resolve(demoDirectory, 'robots.txt'), 'utf8'), /Disallow: \//);
  assert.match(await readFile(resolve(demoDirectory, '404.html'), 'utf8'), /Volver al inicio/);
  for (const file of ['sitemap.xml', 'instrumental-solution', 'docs', '.env', 'lmr-demo-report.json']) {
    await assert.rejects(access(resolve(demoDirectory, file)));
  }
  const manifest = JSON.parse(await readFile(resolve(projectRoot, '.qa/cloudflare/lmr-demo-report.json'), 'utf8'));
  assert.ok(manifest.inventory.every(file => file.bytes <= 25 * 1024 * 1024));
  assert.ok(manifest.files < 20000);
});
