import { escapeHtml as e, richText as r, headingText as h, arrow } from '../../shared/html.mjs';
import { picture } from '../../shared/layout.mjs';
import { companyIllustration, mailIcon, whatsappIcon, qualityIcon } from './company-icons.mjs';
import { projectCover } from './project-cover.mjs';

export function companyContactLinks(person, iconOnly = false, labels = {}) {
  const links = [];
  if (person.whatsapp) links.push(`<a href="https://wa.me/${e(person.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="${e(labels.contactWhatsapp || 'WhatsApp de')} ${e(person.name)}">${whatsappIcon}${iconOnly ? '' : `<span>${e(person.phone)}</span>`}</a>`);
  if (person.email) links.push(`<a href="mailto:${e(person.email)}" aria-label="${e(labels.contactEmail || 'Escribir a')} ${e(person.name)}">${mailIcon}${iconOnly ? '' : `<span>${e(person.email)}</span>`}</a>`);
  return links.join('');
}

// Portrait containers use a vertical 3:4 frame, ready for the client's real photographs.
export function companyPortrait(ctx, person) {
  const content = person.photo?.image
    ? picture(ctx, person.photo.image, person.photo.alt || person.name, { sizes: '(max-width: 760px) 90vw, (max-width: 1400px) 30vw, 405px' })
    : `<span class="company-initials" aria-hidden="true">${e(person.initials)}</span>`;
  const contacts = companyContactLinks(person, true, ctx.copy?.company);
  return `<div class="company-person-portrait${person.photo?.image ? '' : ' company-person-portrait--empty'}">${content}${contacts ? `<div class="company-person-actions">${contacts}</div>` : ''}</div>`;
}

export function renderCompany(ctx) {
  const c = ctx.copy.company;
  const references = c.experienceCases.map(item => {
    const project = ctx.projects.find(project => project.id === item.projectId);
    if (!project) throw new Error(`Referencia de Empresa no disponible: ${item.projectId}`);
    return `<article class="company-reference" data-reveal>${projectCover(ctx, project, {className: 'company-reference-cover', illustration: companyIllustration(item.illustration)})}<div class="company-reference-copy"><p class="company-reference-sector">${e(item.label)}</p><h3>${e(project.title)}</h3><p>${e(project.work)}</p><a class="text-link" href="${ctx.href('referencias/')}#${e(project.id)}" aria-label="${e(c.experienceCaseCta)}: ${e(project.title)}">${e(c.experienceCaseCta)} ${arrow}</a></div></article>`;
  }).join('');
  return `<section class="company-panorama" aria-labelledby="company-title">
    ${picture(ctx, 'empresa-panorama', '', { eager: true, sizes: '100vw', className: 'company-panorama-image' })}
    <div class="container company-panorama-content" data-reveal><p class="company-eyebrow">${e(ctx.site.pages[1].label)}</p><h1 id="company-title">${h(c.title)}</h1><p class="company-intro">${r(c.intro)}</p></div>
  </section>
  <section class="company-identity company-chapter" id="quienes-somos" data-company-chapter tabindex="-1" aria-labelledby="company-identity-title">
    <div class="container company-editorial"><div><div class="company-chapter-heading"><h2 id="company-identity-title">${h(c.identityTitle)}</h2></div><p class="company-identity-context">${r(c.identityContext)}</p></div><div class="company-identity-copy" data-reveal><p class="company-lead">${r(c.identityText)}</p><p>${r(c.identityDetail)}</p><p>${r(c.identityComplement)}</p><a class="text-link" href="${ctx.href('servicios/')}">${e(c.secondaryCta)} ${arrow}</a></div></div>
    <div class="container"><div class="company-participation"><h3>${h(c.participationTitle)}</h3><div><p>${r(c.heroDetail)}</p><p>${r(c.participationText)}</p></div></div></div>
  </section>
  <section class="company-method company-chapter" id="como-trabajamos" data-company-chapter tabindex="-1" aria-labelledby="company-method-title"><div class="container company-method-layout">
    <div class="company-method-visual"><div class="company-chapter-heading"><h2 id="company-method-title">${h(c.processTitle)}</h2></div><p>${r(c.processIntro)}</p><figure>${picture(ctx, 'empresa', c.imageAlt, { sizes: '(max-width: 760px) 90vw, 42vw' })}</figure></div>
    <div class="company-method-track" data-method-track><span class="company-method-connector" aria-hidden="true"></span><ol>${c.method.map((item, i) => `<li data-company-step data-reveal><span class="company-step-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3>${e(item.title)}</h3><p>${r(item.text)}</p><p>${r(item.detail)}</p></div></li>`).join('')}</ol></div>
  </div><div class="container"><div class="company-objectives" data-reveal><div><span class="company-quality-mark" aria-hidden="true">${qualityIcon}</span><h3>${h(c.objectivesTitle)}</h3></div><div class="company-objectives-copy"><p>${r(c.objectivesText)}</p><p>${r(c.objectivesTeam)}</p></div></div></div></section>
  <section class="container company-team company-chapter" id="equipo" data-company-chapter tabindex="-1" aria-labelledby="company-team-title"><div class="company-team-heading"><div class="company-chapter-heading"><h2 id="company-team-title">${h(c.teamTitle)}</h2></div><p class="company-team-intro">${r(c.teamIntro)}</p></div><div class="company-directory">${ctx.company.team.map(person => `<article class="company-person" data-company-person data-reveal>${companyPortrait(ctx, person)}<div class="company-person-info"><h3>${e(person.name)}</h3><p>${e(person.role)}</p><div class="company-person-contacts">${companyContactLinks(person, false, c)}</div></div></article>`).join('')}</div></section>
  <section class="company-experience company-chapter" id="experiencia" data-company-chapter tabindex="-1" aria-labelledby="company-experience-title"><div class="container"><div class="company-experience-inner"><h2 id="company-experience-title">${h(c.experienceTitle)}</h2><p>${r(c.experienceText)}</p></div><div class="company-references">${references}</div><div class="company-experience-footer"><a class="button button-outline" href="${ctx.href('referencias/')}">${e(c.experienceCta)} ${arrow}</a></div></div></section>
  <section class="container company-contact" data-reveal><div><h2>${h(c.closeTitle)}</h2><p>${r(c.closeText)}</p></div><div class="company-contact-action"><a class="button company-contact-button" href="${ctx.href('contacto/')}">${e(c.closeCta)} ${arrow}</a></div></section>`;
}
