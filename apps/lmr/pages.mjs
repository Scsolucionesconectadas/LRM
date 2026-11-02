import { renderContact } from './contact-page.mjs';
import { renderCompany } from './company-page.mjs';
import { renderServices } from './services-page.mjs';
import { renderProjects } from './projects-page.mjs';
import { escapeHtml as e, richText as r, headingText as h, arrow } from '../../shared/html.mjs';
import { picture } from '../../shared/layout.mjs';
import { lineDrawing, integrationMap } from './visuals.mjs';
import { projectCover } from './project-cover.mjs';
import { projectSector } from './projects-model.js';

const cta = (ctx, title = ctx.copy.common.contactTitle, text = ctx.copy.common.contactText) => `<section class="contact-band"><div class="container contact-band-inner"><div data-reveal><h2>${h(title)}</h2><p>${r(text)}</p></div><a class="button button-white" href="${ctx.href('contacto/')}">${e(ctx.copy.common.mainCta)} ${arrow}</a></div></section>`;
const pageIntro = (ctx, label, c) => `<nav class="breadcrumbs container" aria-label="Ruta de navegación"><a href="${ctx.href('')}">${e(ctx.site.pages[0].label)}</a><span aria-hidden="true">/</span><span aria-current="page">${e(label)}</span></nav><section class="page-intro container"><h1>${h(c.title)}</h1><p>${r(c.intro)}</p></section>`;

function carousel(ctx, kind, items, label) {
  const c = ctx.copy.common;
  return `<div class="carousel ${kind === 'brands' ? 'brand-carousel' : 'projects-carousel'}" data-carousel="${kind}" data-autoplay="${kind === 'brands'}" data-position="${e(c.position)}" role="region" aria-label="${e(label)}"><div class="carousel-track" data-carousel-track>${items}</div><div class="carousel-controls" hidden><button class="carousel-arrow carousel-prev" type="button" data-carousel-prev aria-label="${e(c.previous)} · ${e(label)}">${arrow}</button><button class="carousel-arrow carousel-next" type="button" data-carousel-next aria-label="${e(c.next)} · ${e(label)}">${arrow}</button></div><span class="sr-only" data-carousel-status aria-live="polite"></span></div>`;
}
function brands(ctx) {
  const c = ctx.copy.common;
  const items = ctx.site.brands.map(b => `<div class="brand-item" data-carousel-item>${picture(ctx, b.image.replace(/\.[^.]+$/, ''), b.name, { sizes: '(max-width: 600px) 110px, 180px' })}</div>`).join('');
  return `<section class="brands container"><div class="section-heading compact"><h2>${e(c.brandsTitle)}</h2><p>${e(c.brandsText)}</p></div>${carousel(ctx, 'brands', items, c.brandsTitle)}</section>`;
}
function projectCard(ctx, project) {
  const c = ctx.copy.projects;
  const progress = project.status === 'in-progress';
  const hasPhotos = Boolean(project.photos?.length);
  const href = hasPhotos ? ctx.href('referencias/') + '#' + project.id : ctx.href('contacto/') + '?proyecto=' + encodeURIComponent(project.title);
  return `<article class="project-card" id="${e(project.id)}" data-carousel-item>${projectCover(ctx, project)}<div class="project-card-body"><p class="project-sector">${e(projectSector(project,ctx.projectUi))}</p>${progress ? `<span class="project-state">${e(c.inProgress)}</span>` : ''}<h3>${e(project.title)}</h3><p class="project-work">${e(project.work)}</p><a class="text-link" href="${e(href)}" aria-label="${e(hasPhotos ? c.progressCta : c.consult)}: ${e(project.title)}">${e(hasPhotos ? c.progressCta : c.consult)} ${arrow}</a></div></article>`;
}
function home(ctx) {
  const c = ctx.copy.home, shared = ctx.copy.common;
  const selected = ['media-tension','baja-tension','automatizacion','ingenieria'].map(id => ctx.services.find(s => s.id === id));
  return `<section class="hero container"><div class="hero-copy"><h1>${h(c.title)}</h1><p>${r(c.intro)}</p><div class="button-row" data-reveal><a class="button" href="${ctx.href('contacto/')}">${e(c.primaryCta)} ${arrow}</a><a class="button button-outline" href="${ctx.href('servicios/')}">${e(c.secondaryCta)} ${arrow}</a></div><div class="hero-footnote"><span class="status-dot" aria-hidden="true"></span>${e(c.note)}</div></div><figure class="hero-media" data-reveal="media">${picture(ctx,'hero',c.heroAlt,{eager:true,sizes:'(max-width: 760px) 100vw, 52vw'})}<figcaption><div class="hero-capabilities">${c.heroLinks.map(l=>`<a href="${ctx.href('servicios/')}#${l.service}"><b>${e(l.tag)}</b>${e(l.label)}</a>`).join('')}</div></figcaption></figure></section>
  <nav class="container disciplines" aria-label="${e(c.disciplinesLabel)}">${c.disciplineCards.map(card=>`<a class="discipline-card" href="${ctx.href('servicios/')}#${e(card.target)}"><span class="discipline-icon" aria-hidden="true">${lineDrawing(card.icon)}</span><span class="discipline-title">${e(card.title)}</span><span class="discipline-description">${e(card.text)}</span><span class="discipline-link">${e(c.disciplineCta)} ${arrow}</span></a>`).join('')}</nav>
  <section class="section container"><div class="section-heading"><h2>${h(c.servicesTitle)}</h2><p>${r(c.servicesIntro)}</p></div><div class="service-showcase"><div class="service-list">${selected.map((s,i)=>`<a class="service-row" data-reveal href="${ctx.href('servicios/')}#${s.id}"><span class="row-number">0${i+1}</span><div><h3>${e(s.short)}</h3><p>${e(s.summary)}</p></div>${arrow}</a>`).join('')}</div><figure class="work-image" data-reveal>${picture(ctx,'electricidad',c.workAlt)}<figcaption><span>${e(c.workTitle)}</span><p>${r(c.workText)}</p><a class="button work-cta" href="${ctx.href('servicios/')}">${e(shared.servicesCta)} ${arrow}</a></figcaption></figure></div></section>
  <section class="network-feature"><div class="container network-inner"><div data-reveal><h2>${h(c.networkTitle)}</h2><p>${r(c.networkIntro)}</p><a class="button button-glass" href="${ctx.href('servicios/')}#redes-y-fibra">${e(c.networkCta)} ${arrow}</a></div>${integrationMap(ctx)}</div></section>
  <section class="section container"><div class="section-heading"><h2>${h(c.projectsTitle)}</h2><div><p>${r(c.projectsIntro)}</p><a class="button button-outline" href="${ctx.href('referencias/')}">${e(shared.projectsCta)} ${arrow}</a></div></div>${carousel(ctx,'projects',ctx.projects.map(p=>projectCard(ctx,p)).join(''),shared.projectsCta)}</section>${brands(ctx)}${cta(ctx)}`;
}
const company = renderCompany;
const services = renderServices;
const projects = renderProjects;
const contact = renderContact;
export function renderPage(ctx,page){return({'':home,'empresa/':company,'servicios/':services,'referencias/':projects,'contacto/':contact})[page.slug](ctx);}
