import { escapeHtml as e, richText as r, headingText as h, arrow } from '../../shared/html.mjs';
import { mailIcon, whatsappIcon } from './company-icons.mjs';

const locationIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>';

export function renderContact(ctx) {
  const c = ctx.copy.contact, site = ctx.site;
  const address = [site.address.street, site.address.city, site.address.region, 'Argentina'].join(', ');
  const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address);
  const mapEmbed = 'https://www.google.com/maps?q=' + encodeURIComponent(address) + '&z=16&output=embed';
  const wa = 'https://wa.me/' + site.whatsapp;
  const input = (id, label, attrs = '', required = false) => `<div><label for="${id}">${e(label)}${required ? ` <span>(${e(c.required)})</span>` : ''}</label><input id="${id}" name="${id}" ${attrs} ${required ? 'required' : ''}></div>`;
  const formData = Object.entries({
    endpoint:ctx.contactEndpoint || '', submit:c.submit, sending:c.sending, success:c.success, activation:ctx.contactTestMode ? 'Falta confirmar el correo de prueba. Revisá el mensaje de activación de FormSubmit antes de volver a enviar.' : 'Todavía no se habilitó la recepción de consultas. Podés contactarnos por los otros canales.',
    unavailable:c.unavailable, failure:c.failure, uncertain:c.uncertain, 'rate-limit':c.rateLimit,
    'invalid-name':c.invalidName, 'invalid-message':c.invalidMessage, 'project-template':c.projectTemplate, subject:ctx.contactTestMode ? '[PRUEBA LMR] Consulta del formulario web' : c.subject
  }).map(([key, value]) => `data-${key}="${e(value)}"`).join(' ');
  return `<section class="contact-hero" aria-labelledby="contact-title"><div class="container contact-hero-inner">
    <div class="contact-hero-copy" data-reveal><p class="contact-eyebrow">${e(c.eyebrow)}</p><h1 id="contact-title">${h(c.title)}</h1><p class="contact-hero-intro">${r(c.intro)}</p><div class="button-row"><a class="button" href="#consulta">${e(c.heroCta)} ${arrow}</a><a class="text-link" href="#ubicacion">${e(c.locationCta)} ${arrow}</a></div></div>
    <div class="contact-direct" data-reveal><div class="contact-direct-heading"><span class="contact-direct-line" aria-hidden="true"></span><h2>${h(c.directTitle)}</h2><p>${e(c.directText)}</p></div>
      <a class="contact-direct-link" href="mailto:${e(site.email)}"><span class="contact-channel-icon" aria-hidden="true">${mailIcon}</span><span><span class="contact-channel-label">${e(c.emailLabel)}</span><strong>${e(site.email)}</strong></span>${arrow}</a>
      <a class="contact-direct-link" href="${e(wa)}" target="_blank" rel="noopener noreferrer"><span class="contact-channel-icon" aria-hidden="true">${whatsappIcon}</span><span><span class="contact-channel-label">WhatsApp</span><strong>${e(site.phones[0])}</strong></span>${arrow}</a>
      <a class="contact-direct-location" href="#ubicacion">${locationIcon}<span>${e(site.address.city)}, ${e(site.address.region)}</span>${arrow}</a>
    </div>
  </div></section>
  <section class="container contact-layout contact-workspace" aria-label="${e(c.workspaceLabel)}">
    <aside class="contact-info"><h2>${h(c.infoTitle)}</h2><p class="contact-info-intro">${r(c.infoIntro)}</p>
      <div class="contact-item"><h3>${e(c.emailLabel)}</h3><a href="mailto:${e(site.email)}">${e(site.email)}</a></div>
      <div class="contact-item"><h3>${e(c.phoneLabel)}</h3>${site.phones.map(p=>`<a href="tel:${p.replace(/\s/g,'')}">${e(p)}</a>`).join('')}</div>
      <div class="contact-location" id="ubicacion"><div class="contact-location-heading">${locationIcon}<h3>${e(c.addressLabel)}</h3></div><p>${e(site.address.street)} · CP ${e(site.address.postalCode)}<br>${e(site.address.city)}, ${e(site.address.region)} · ${e(ctx.copy.common.country)}</p>
        <iframe class="contact-map" title="${e(c.mapTitle)}" src="${e(mapEmbed)}" width="480" height="270" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        <a class="text-link" href="${e(mapUrl)}" target="_blank" rel="noopener noreferrer">${e(c.mapCta)} ${arrow}</a>
      </div>
    </aside>
    <div class="contact-form-panel" id="consulta"><p class="contact-form-kicker">${e(c.formLabel)}</p><h2>${e(c.formTitle)}</h2><p>${r(c.formIntro)}</p>${ctx.contactTestMode ? '<p class="contact-test-note">Formulario en prueba: las consultas se envían al correo temporal de prueba.</p>' : ''}
      <noscript><p class="notice">${e(c.nojs)} <a href="mailto:${e(site.email)}">${e(site.email)}</a></p></noscript>
      <form id="consultation" ${formData} hidden>
        <div class="form-grid">${input('name',c.name,'autocomplete="name" maxlength="100"',true)}${input('company',c.company,'autocomplete="organization" maxlength="150"')}</div>
        <div class="form-grid">${input('email',c.email,'type="email" autocomplete="email" maxlength="150"',true)}${input('phone',c.phone,'type="tel" autocomplete="tel" maxlength="40"')}</div>
        <label for="service">${e(c.service)}</label><select id="service" name="service"><option value="">${e(c.serviceDefault)}</option>${ctx.services.map(s=>`<option value="${e(s.id)}">${e(s.short)}</option>`).join('')}<option value="otras-consultas">${e(c.otherService)}</option></select>
        <label for="message">${e(c.message)} <span>(${e(c.required)})</span></label><textarea id="message" name="message" rows="5" minlength="10" maxlength="1800" required aria-describedby="message-help"></textarea><small id="message-help">${e(c.help)}</small>
        <div class="contact-honeypot" aria-hidden="true"><label for="website">Website</label><input id="website" name="_gotcha" type="text" tabindex="-1" autocomplete="off"></div>
        <p class="form-privacy">${e(c.privacy)}</p><button class="button contact-submit" type="submit" ${ctx.contactEndpoint ? '' : 'disabled'}><span data-submit-label>${e(c.submit)}</span>${arrow}</button>
        <p class="contact-form-status" data-form-status role="status" aria-live="polite" aria-atomic="true" tabindex="-1" ${ctx.contactEndpoint ? 'hidden' : ''}>${ctx.contactEndpoint ? '' : e(c.unavailable)}</p>
      </form>
    </div>
  </section>
  <section class="contact-faq" aria-labelledby="contact-faq-title"><div class="container contact-faq-inner"><div class="contact-faq-heading" data-reveal><p class="contact-eyebrow">${e(c.faqLabel)}</p><h2 id="contact-faq-title">${h(c.faqTitle)}</h2><p>${r(c.faqIntro)}</p><a class="text-link" href="${ctx.href('servicios/')}">${e(c.servicesCta)} ${arrow}</a></div><div class="contact-faq-list">${c.faq.map(item=>`<details><summary>${e(item.question)}<span aria-hidden="true">+</span></summary><div><p>${r(item.answer)}</p></div></details>`).join('')}</div></div></section>`;
}
