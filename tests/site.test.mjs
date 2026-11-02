import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build, escapeHtml, getConfig } from '../scripts/build.mjs';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const read = p => readFile(p, 'utf8');
test('escapa texto y atributos de contenido', () => {
  assert.equal(escapeHtml('<img src="x" onerror=\'x\'>&'), '&lt;img src=&quot;x&quot; onerror=&#39;x&#39;&gt;&amp;');
});
test('rechaza modo público sin URL final o con URL/prefijo incompatibles', () => {
  assert.throws(() => getConfig({ mode: 'production' }), /PUBLIC_BASE_URL/);
  for (const publicBaseUrl of ['http://example.com/lmr/', 'https://example.com/otra/', 'https://user:pass@example.com/lmr/', 'https://example.com/lmr/?x=1']) {
    assert.throws(() => getConfig({ mode: 'production', publicBaseUrl }));
  }
  assert.throws(() => getConfig({ sitePath: '/../fuera/' }));
  assert.throws(() => getConfig({ deploymentPrefix: '//host' }));
});
test('construye cinco páginas HTML, contenido completo y enlaces locales válidos', async () => {
  const outDir = resolve(root, '.qa/test-preview');
  const report = await build({ outDir });
  assert.equal(report.pages, 5);
  for (const slug of ['', 'empresa/', 'servicios/', 'referencias/', 'contacto/']) {
    const html = await read(resolve(outDir, 'lmr', slug, 'index.html'));
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    assert.match(html, /<html lang="es-AR"/);
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.doesNotMatch(html, /rel="canonical"/);
    assert.doesNotMatch(html, /presion\.png|temperatura\.png|caudal\.png|productos\//);
    assert.doesNotMatch(html, /motion-toggle|Reducir animaciones/);
    assert.doesNotMatch(html, /Intervención publicada|Sobre esta referencia|referencia institucional|folleto institucional|archivo institucional|material institucional|Imagen ilustrativa|Ilustrativa|Demo local/);
    assert.match(html, /<strong>/);
    assert.match(html, /data-scroll-progress/);
    assert.match(html, /data-back-top/);
    assert.match(html, /<footer\b[\s\S]*?data-back-top[\s\S]*?<\/footer>/);
    assert.doesNotMatch(html, /data-ambient-pause|data-carousel-pause|data-play-icon|class="utility-bar"/);
    assert.match(html, /Diseño y desarrollo/);
    for (const match of html.matchAll(/(?:href|src)="(\/lmr\/[^"?#]*)/g)) {
      const p = match[1].endsWith('/') ? `${match[1]}index.html` : match[1];
      await access(resolve(outDir, `.${p}`));
    }
  }
  const services = await read(resolve(outDir, 'lmr/servicios/index.html'));
  assert.equal((services.match(/data-service-card\b/g) || []).length, 10);
  assert.equal((services.match(/service-card--primary/g) || []).length, 3);
  assert.equal((services.match(/class="service-card-details"/g) || []).length, 10);
  assert.equal((services.match(/class="service-art"/g) || []).length, 10);
  assert.match(services, /Elegí una especialidad/);
  assert.equal((services.match(/data-service-filter=/g) || []).length, 5);
  assert.equal((services.match(/<dialog\b/g) || []).length, 1);
  assert.match(services, /aria-labelledby="service-sheet-title"/);
  assert.match(services, /assets\/services-catalog.css/);
  assert.match(services, /assets\/services.js/);
  assert.equal((services.match(/class="service-faq"/g) || []).length, 4);
  assert.match(services, /Preguntas antes de empezar/);
  const sourceServices = JSON.parse(await read(resolve(root, 'content/lmr/servicios.json')));
  // The user approved brief public sheets. All 76 source points remain internal.
  assert.equal(sourceServices.flatMap(service => service.details).length, 76);
  const serviceUi = JSON.parse(await read(resolve(root, 'content/lmr/servicios-ui.json')));
  for (const service of sourceServices) {
    assert.ok(services.includes(`id="${service.id}"`) && services.includes(`?servicio=${service.id}`), `Ficha y consulta: ${service.id}`);
    const card = serviceUi.cards.find(card => card.id === service.id);
    assert.equal(card.highlights.length, 3);
    for (const line of card.highlights) assert.ok(services.includes(escapeHtml(line)), `Resumen publicado: ${service.id}`);
  }
  assert.doesNotMatch(services, /Evaluación de resistividad del terreno y parámetros eléctricos/);
  for (const word of ['OTDR', 'media tensión', 'baja tensión', 'PLC', 'celdas', 'licitaciones']) assert.ok(services.includes(word), word);
  const projects = await read(resolve(outDir, 'lmr/referencias/index.html'));
  const expectedProjects = JSON.parse(await read(resolve(root, 'content/lmr/proyectos.json')));
  assert.equal((projects.match(/data-portfolio-project/g) || []).length, expectedProjects.length);
  assert.equal((projects.match(/data-project-open=/g) || []).length, 0, 'Las referencias sin material ampliable no abren fichas vacias');
  assert.equal((projects.match(/<dialog\b/g) || []).length, 0);
  assert.match(projects, /assets\/projects.css/);
  assert.match(projects, /assets\/projects.js/);
  assert.doesNotMatch(projects, /class="project-number"|class="contact-band"|class="project-electrical"/);
  const sourceProjectList = JSON.parse(await read(resolve(root, 'content/lmr/proyectos.json')));
  for (const project of sourceProjectList) {
    assert.ok(projects.includes(`id="${project.id}"`) && projects.includes(escapeHtml(project.work)));
    assert.ok(projects.includes(`?proyecto=${encodeURIComponent(project.title)}`));
  }
  const home = await read(resolve(outDir, 'lmr/index.html'));
  assert.equal((home.match(/class="project-card"/g) || []).length, expectedProjects.length);
  assert.match(home, /data-carousel="projects"/);
  assert.match(home, /data-carousel="brands"/);
  assert.match(home, /integration-map/);
  assert.equal((home.match(/class="discipline-card"/g) || []).length, 4);
  assert.match(home, /<figcaption>[\s\S]*?class="button work-cta"/);
  assert.doesNotMatch(home, /class="button button-outline all-services"/);
  assert.match(home, /data-ambient-motion/);
  assert.doesNotMatch(home, />Reproducir</);
  assert.match(home, /assets\/readability.css/);
  assert.match(home, /assets\/home.css/);
  assert.match(home, /assets\/home-motion.js/);
  assert.doesNotMatch(services, /assets\/home.css|assets\/home-motion.js/);
  const company = await read(resolve(outDir, 'lmr/empresa/index.html'));
  assert.doesNotMatch(home + company + services, /assets\/projects.css|assets\/projects.js/);
  assert.doesNotMatch(home + company + projects, /assets\/services-catalog.css|assets\/services.js/);
  assert.match(company, /class="company-panorama"/);
  for (const id of ['quienes-somos', 'como-trabajamos', 'equipo', 'experiencia']) {
    assert.ok(company.includes(`id="${id}"`), `Ancla conservada: ${id}`);
  }
  assert.doesNotMatch(company, /company-chapters|data-company-index|company-blueprint/);
  assert.match(company, /empresa-panorama-\d+\.webp/);
  assert.match(company, /fetchpriority="high" loading="eager"/);
  assert.equal((company.match(/data-company-step/g) || []).length, 3);
  assert.equal((company.match(/data-company-person/g) || []).length, 3);
  assert.match(company, /data-method-track/);
  assert.match(company, /id="experiencia" data-company-chapter/);
  assert.match(company, /assets\/company.css/);
  assert.match(company, /assets\/company.js/);
  assert.doesNotMatch(company, /assets\/home.css|assets\/home-motion.js|company-hero-copy|company-principles-grid|company-team-grid|class="contact-band"/);
  assert.doesNotMatch(home + services, /assets\/company.css|assets\/company.js/);
  const team = JSON.parse(await read(resolve(root, 'content/lmr/empresa.json'))).team;
  for (const person of team) {
    assert.ok(company.includes(escapeHtml(person.name)) && company.includes(escapeHtml(person.role)));
    assert.ok(company.includes(escapeHtml(person.email)) && company.includes(escapeHtml(person.phone)));
    assert.equal((company.match(new RegExp(`href="https://wa.me/${person.whatsapp}"`,'g'))||[]).length,2);
    assert.equal(company.split(`href="mailto:${person.email}"`).length-1,2);
  }
  assert.equal((company.match(/class="company-person-actions"/g)||[]).length,3);
  assert.equal((company.match(/class="company-person-contacts"/g)||[]).length,3);
  assert.equal((company.match(/data-company-illustration=/g)||[]).length,3);
  assert.doesNotMatch(company, /company-contact-symbol|company-chapter-number/);
  const contact = await read(resolve(outDir,'lmr/contacto/index.html'));
  assert.match(contact, /assets\/contact.css/);
  assert.match(contact, /assets\/contact.js/);
  assert.match(contact, /class="contact-hero"/);
  assert.doesNotMatch(contact, /class="breadcrumbs|message-preview|send-email|send-whatsapp|Preparar mensaje|Los datos se usan en este navegador/);
  assert.match(contact, /<option value="otras-consultas">Otras consultas<\/option>/);
  assert.match(contact, /class="contact-map"[^>]+loading="lazy"/);
  assert.match(contact, /data-endpoint="https:\/\/formsubmit\.co\/ajax\/infolmr@solution\.com\.ar"/);
  assert.doesNotMatch(contact, /type="submit" disabled|class="contact-test-note"/);
  assert.equal((contact.match(/<details>/g)||[]).length,5);
  assert.match(company, /class="company-directory"/);
  const companyCopy = JSON.parse(await read(resolve(root, 'content/lmr/textos.json'))).company;
  const sourceProjects = JSON.parse(await read(resolve(root, 'content/lmr/proyectos.json')));
  assert.equal((company.match(/class="company-reference"/g) || []).length, companyCopy.experienceCases.length);
  for (const item of companyCopy.experienceCases) {
    const reference = sourceProjects.find(project => project.id === item.projectId);
    assert.ok(reference && !reference.previewOnly, 'Empresa muestra referencias habilitadas también en producción');
    assert.ok(company.includes(escapeHtml(reference.title)) && company.includes(escapeHtml(reference.work)), 'El resumen coincide con la ficha real');
    assert.ok(company.includes(`/referencias/#${reference.id}`) && projects.includes(`id="${reference.id}"`), 'El enlace apunta a una ficha existente');
  }
  assert.match(company, /class="company-participation"/);
  assert.match(company, /class="company-objectives"/);
  for (const term of ['media y baja tensión', 'PLC', 'necesidades, planos', 'provisiones', 'registros, verificaciones', 'alcance de cada contratación']) assert.ok(company.includes(term), `Capacidad y alcance conservados: ${term}`);
  assert.match(await read(resolve(outDir, 'robots.txt')), /Disallow: \//);
});
test('produce canonical, sitemap y schema solo con dominio explícito; admite raíz y prefijo Pages', async () => {
  const outDir = resolve(root, '.qa/test-production');
  const base = 'https://sc.example/solution-group/lmr/';
  await build({ outDir, mode: 'production', publicBaseUrl: base, deploymentPrefix: '/solution-group' });
  const publicProjects = await read(resolve(outDir, 'lmr/referencias/index.html'));
  const publicHome = await read(resolve(outDir, 'lmr/index.html'));
  assert.equal((publicProjects.match(/data-portfolio-project/g) || []).length, 6);
  assert.doesNotMatch(publicProjects + publicHome, /unidad-penal-8|Unidad penal 8|pinero-/);
  assert.doesNotMatch(publicProjects, /data-portfolio-filter="Institucional"|<dialog\b|data-project-open=/);
  assert.ok(!(await readdir(resolve(outDir, 'lmr/assets'))).some(f => f.startsWith('pinero-')), 'Fotos pendientes excluidas también del artefacto público');
  const html = await read(resolve(outDir, 'lmr/servicios/index.html'));
  assert.ok(html.includes(`rel="canonical" href="${base}servicios/"`));
  assert.ok(html.includes(`${base}assets/compartir-lmr.png`));
  const social = await sharp(resolve(outDir, 'lmr/assets/compartir-lmr.png')).metadata();
  assert.equal(social.width, 1200);
  assert.equal(social.height, 630);
  assert.match(html, /href="\/solution-group\/lmr\/empresa\/"/);
  assert.ok((await read(resolve(outDir, 'lmr/sitemap.xml'))).includes(`${base}referencias/`));
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.ok(schema['@graph'].some(x => x['@type'] === 'Service'));
  assert.doesNotMatch(JSON.stringify(schema), /aggregateRating|openingHours|geo"/);
  const rootOut = resolve(root, '.qa/test-root');
  await build({ outDir: rootOut, sitePath: '/' });
  assert.match(await read(resolve(rootOut, 'empresa/index.html')), /href="\/servicios\/"/);
  const rootProjects = await read(resolve(rootOut, 'referencias/index.html'));
  assert.match(rootProjects, /src="\/assets\/projects.js"/);
  assert.match(rootProjects, /href="\/contacto\/\?proyecto=/);
});
