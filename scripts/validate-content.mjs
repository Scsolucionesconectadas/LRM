import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateEditorial } from '../shared/editorial.mjs';
const base = resolve(import.meta.dirname, '../content/lmr');
const load = async n => JSON.parse(await readFile(resolve(base, `${n}.json`), 'utf8'));
const [site, services, projects] = await Promise.all(['site', 'servicios', 'proyectos'].map(load));
assert.equal(site.pages.length, 5);
assert.equal(new Set(site.pages.map(p => p.slug)).size, 5);
assert.equal(services.length, 10);
assert.equal(new Set(services.map(s => s.id)).size, 10);
for (const s of services) { assert.match(s.id, /^[a-z-]+$/); assert.ok(s.details.length >= 5); assert.ok(s.title && s.summary); }
assert.ok(projects.length >= 6);
assert.equal(new Set(projects.map(p => p.id)).size, projects.length);
for (const p of projects) {
  assert.ok(p.source && p.work && p.title);
  assert.ok(p.previewOnly === undefined || typeof p.previewOnly === 'boolean');
  assert.ok(p.status === undefined || p.status === 'in-progress');
  for (const photo of p.photos ?? []) { assert.match(photo.image, /^[a-z0-9-]+$/); assert.ok(photo.alt && photo.caption); }
}
const projectUi = await load('proyectos-ui');
assert.equal(new Set(projectUi.sectors).size, projectUi.sectors.length);
for (const [id, sector] of Object.entries(projectUi.sectorById)) {
  assert.ok(projects.some(project => project.id === id));
  assert.ok(projectUi.sectors.includes(sector));
}
for (const project of projects) assert.ok(projectUi.sectors.includes(projectUi.sectorById[project.id] ?? project.sector));
const serviceUi = await load('servicios-ui');
const grouped = serviceUi.groups.flatMap(g => g.services);
assert.equal(serviceUi.groups.length, 4);
assert.equal(new Set(grouped).size, services.length);
assert.equal(grouped.length, services.length);
for (const s of services) { assert.ok(grouped.includes(s.id)); assert.ok(serviceUi.media[s.id]); }
assert.equal(serviceUi.cards.length, services.length);
assert.equal(new Set(serviceUi.cards.map(card => card.id)).size, services.length);
assert.equal(new Set(serviceUi.cards.map(card => card.artIndex)).size, services.length);
for (const card of serviceUi.cards) {
  assert.ok(services.some(service => service.id === card.id));
  assert.ok(Number.isInteger(card.artIndex) && card.artIndex >= 0 && card.artIndex < 10);
  assert.equal(card.artFrame.length, 4);
  assert.ok(card.artFrame.every(value => Number.isFinite(value) && value >= 0));
  const [x, y, width, height] = card.artFrame;
  assert.ok(width > 0 && height > 0 && x + width <= 1122 && y + height <= 1402);
  assert.ok(card.title && card.summary && card.description && card.consult);
  assert.equal(card.highlights.length, 3);
  assert.equal(new Set(card.relatedProjects ?? []).size, (card.relatedProjects ?? []).length);
  for (const id of card.relatedProjects ?? []) assert.ok(projects.some(project => project.id === id), `Referencia de servicio inexistente: ${id}`);
  for (const line of card.highlights) assert.ok(typeof line === 'string' && line.trim());
}
for (const f of serviceUi.faq) assert.ok(f.question && f.answer);
assert.match(site.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const copy = await load('textos');
assert.ok(copy.contact.faq.length >= 4);
for (const item of copy.contact.faq) assert.ok(item.question && item.answer);
assert.ok(copy.contact.otherService && copy.contact.unavailable && copy.contact.success);
const company = await load('empresa');
for (const person of company.team) {
  assert.ok(person.name && person.role && person.initials, 'Cada persona necesita nombre, cargo e iniciales.');
  assert.match(person.email, /^[^\s@?]+@[^\s@?]+\.[^\s@?]+$/, 'Correo individual válido.');
  assert.match(person.phone, /^\+54[\d\s]+$/, 'Teléfono visible con código de país.');
  assert.match(person.whatsapp, /^\d{10,15}$/, 'WhatsApp publicado en formato internacional sin separadores.');
  if (person.photo !== null && person.photo !== undefined) {
    assert.match(person.photo.image, /^[a-z0-9-]+$/, 'Usar una clave local de imagen, sin rutas ni URLs.');
    assert.ok(typeof person.photo.alt === 'string' && person.photo.alt.trim(), 'La fotografía necesita texto alternativo.');
  }
}
for (const item of copy.company.experienceCases) {
  assert.ok(projects.some(project => project.id === item.projectId && !project.previewOnly));
  assert.ok(['health', 'water', 'industry'].includes(item.illustration));
}
validateEditorial(copy);
validateEditorial(services);
validateEditorial(serviceUi);
const titles = site.pages.map(p => copy.pages[p.slug || 'inicio']?.title);
assert.equal(new Set(titles).size, site.pages.length);
for (const p of site.pages) {
  const seo = copy.pages[p.slug || 'inicio'];
  assert.ok(seo?.title && seo?.description);
}
for (const credit of site.credits) assert.match(credit.url, /^https:\/\//);
console.log(`Contenido válido: 5 páginas, 10 servicios, ${projects.length} referencias (${projects.filter(p => p.previewOnly).length} solo preview) y 6 marcas.`);
