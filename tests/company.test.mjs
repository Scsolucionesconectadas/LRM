import test from 'node:test';
import assert from 'node:assert/strict';
import { companyPortrait, companyContactLinks } from '../apps/lmr/company-page.mjs';
import { methodStepAtPosition } from '../apps/lmr/company.js';

test('el equipo admite fotografía local responsive y conserva iniciales cuando no hay foto', () => {
  const ctx = { href: path => `/lmr/${path}`, images: { retrato: [{ file: 'retrato-240.webp', width: 240, height: 300 }, { file: 'retrato-480.webp', width: 480, height: 600 }] } };
  const person = { name: 'Persona de prueba', initials: 'PP', photo: null };
  assert.match(companyPortrait(ctx, person), /company-initials/);
  assert.doesNotMatch(companyPortrait(ctx, person), /<img|pendiente|placeholder/);
  person.photo = { image: 'retrato', alt: 'Retrato <script> "test"' };
  const photo = companyPortrait(ctx, person);
  assert.match(photo, /srcset="\/lmr\/assets\/retrato-240.webp 240w, \/lmr\/assets\/retrato-480.webp 480w"/);
  assert.match(photo, /alt="Retrato &lt;script&gt; &quot;test&quot;"/);
  assert.doesNotMatch(photo, /company-initials|<script>/);
  assert.throws(() => companyPortrait(ctx, { ...person, photo: { image: 'inexistente' } }), /Imagen faltante/);
});

test('el método sigue indicando la etapa visible con una sola cabecera', () => {
  assert.equal(methodStepAtPosition([], 170), -1);
  assert.equal(methodStepAtPosition([500, 900, 1300], 170), 0);
  assert.equal(methodStepAtPosition([-300, 120, 540], 170), 1);
  assert.equal(methodStepAtPosition([-800, -400, 100], 170), 2);
});

test('los contactos individuales se conservan como enlaces nativos sin inferir canales faltantes', () => {
  const person = {name:'Persona <test>',phone:'+54 341 0000000',whatsapp:'5493410000000',email:'persona@example.invalid'};
  const html = companyContactLinks(person);
  assert.match(html, /href="https:\/\/wa.me\/5493410000000"/);
  assert.match(html, /href="mailto:persona@example.invalid"/);
  assert.match(html, /aria-label="WhatsApp de Persona &lt;test&gt;"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.ok(html.includes(person.phone) && html.includes(person.email));
  assert.equal(companyContactLinks({name:'Otra persona',phone:'+54 341 0000000'}),'');
});

test('las iniciales decorativas no ocultan al lector de pantalla los contactos del retrato', () => {
  const person = {name:'Persona de prueba',initials:'PP',photo:null,phone:'+54 341 0000000',whatsapp:'5493410000000',email:'persona@example.invalid'};
  const html = companyPortrait({href: p=>p,images:{}},person);
  assert.doesNotMatch(html, /<div class="company-person-portrait"[^>]*aria-hidden/);
  assert.equal((html.match(/<a /g)||[]).length,2);
  assert.match(html, /class="company-initials" aria-hidden="true"/);
});
