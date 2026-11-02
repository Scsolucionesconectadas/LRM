import { escapeHtml as e, jsonScript, headingText as h, arrow } from './html.mjs';

export function picture(ctx, key, alt, { eager = false, className = '', sizes = '(max-width: 760px) 100vw, 50vw' } = {}) {
  const variants = ctx.images[key];
  if (!variants) throw new Error(`Imagen faltante: ${key}`);
  const last = variants.at(-1);
  return `<img class="${e(className)}" src="${ctx.href(`assets/${last.file}`)}" srcset="${variants.map(x => `${ctx.href(`assets/${x.file}`)} ${x.width}w`).join(', ')}" sizes="${e(sizes)}" width="${last.width}" height="${last.height}" alt="${e(alt)}" ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async">`;
}

function structuredData(ctx, page) {
  const { site, services, publicBaseUrl: base } = ctx;
  const org = { '@type': 'Organization', '@id': `${base}#organization`, name: site.name, url: base, logo: `${base}assets/${ctx.images.logo.at(-1).file}`, email: site.email, telephone: site.phones[0], address: { '@type': 'PostalAddress', streetAddress: site.address.street, addressLocality: site.address.city, addressRegion: site.address.region, postalCode: site.address.postalCode, addressCountry: site.address.country } };
  const graph = [org, { '@type': 'WebSite', '@id': `${base}#website`, url: base, name: site.name, inLanguage: 'es-AR', publisher: { '@id': org['@id'] } }, { '@type': 'WebPage', '@id': `${base}${page.slug}`, url: `${base}${page.slug}`, name: page.title, description: page.description, inLanguage: 'es-AR', isPartOf: { '@id': `${base}#website` } }];
  if (page.slug) graph.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: base }, { '@type': 'ListItem', position: 2, name: page.label, item: `${base}${page.slug}` }] });
  if (page.slug === 'servicios/') graph.push(...services.map(s => ({ '@type': 'Service', '@id': `${base}servicios/#${s.id}`, name: s.title, description: s.summary, provider: { '@id': org['@id'] }, url: `${base}servicios/#${s.id}` })));
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function layout(ctx, page, body) {
  const { href, site } = ctx;
  const c = ctx.copy.common;
  const canonical = ctx.publicBaseUrl + page.slug;
  const publicMeta = ctx.mode === 'production' ? `<link rel="canonical" href="${e(canonical)}"><meta property="og:url" content="${e(canonical)}"><meta property="og:image" content="${e(ctx.publicBaseUrl)}assets/compartir-lmr.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png"><meta property="og:image:alt" content="LMR · Ingeniería y obras eléctricas en media y baja tensión"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${jsonScript(structuredData(ctx, page))}</script>` : '';
  return `<!doctype html>
<html lang="es-AR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light">
<title>${e(page.title)}</title><meta name="description" content="${e(page.description)}"><meta name="robots" content="${ctx.mode === 'production' ? 'index, follow' : 'noindex, nofollow'}">
<meta name="theme-color" content="#2780c4"><meta property="og:type" content="website"><meta property="og:locale" content="es_AR"><meta property="og:site_name" content="LMR"><meta property="og:title" content="${e(page.title)}"><meta property="og:description" content="${e(page.description)}">
${publicMeta}<link rel="icon" type="image/webp" href="${href('assets/logo-240.webp')}"><link rel="stylesheet" href="${href('assets/site.css')}"><link rel="stylesheet" href="${href('assets/experience.css')}"><link rel="stylesheet" href="${href('assets/readability.css')}">${page.slug === 'servicios/' ? `<link rel="stylesheet" href="${href('assets/services-catalog.css')}"><script type="module" src="${href('assets/services.js')}"></script>` : ''}${page.slug === '' ? `<link rel="stylesheet" href="${href('assets/home.css')}"><script type="module" src="${href('assets/home-motion.js')}"></script>` : ''}${page.slug === 'empresa/' ? `<link rel="stylesheet" href="${href('assets/company.css')}"><script type="module" src="${href('assets/company.js')}"></script>` : ''}${page.slug === 'referencias/' ? `<link rel="stylesheet" href="${href('assets/projects.css')}"><script type="module" src="${href('assets/projects.js')}"></script>` : ''}${page.slug === 'contacto/' ? `<link rel="stylesheet" href="${href('assets/contact.css')}"><script type="module" src="${href('assets/contact.js')}"></script>` : ''}<link rel="preload" href="${href('assets/fonts/Poppins-Regular.woff2')}" as="font" type="font/woff2" crossorigin><script defer src="${href('assets/app.js')}"></script><script type="module" src="${href('assets/carousel.js')}"></script><script type="module" src="${href('assets/scroll-ui.js')}"></script><script type="module" src="${href('assets/insights.js')}"></script></head>
<body id="arriba" data-page="${e(page.slug || 'inicio')}" data-mode="${ctx.mode}">
<div class="reading-progress" data-scroll-progress aria-hidden="true"></div>
<a class="skip-link" href="#contenido">${e(c.skip)}</a>
<header class="site-header"><div class="container header-inner"><a class="logo" href="${href('')}" aria-label="LMR, ir al inicio">${picture(ctx, 'logo', 'LMR Solution S.R.L.', { eager: true, sizes: '120px' })}</a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation" hidden><span>${e(c.menu)}</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.7"/></svg></button>
<nav id="navigation" aria-label="${e(c.navigation)}">${site.pages.map(p => `<a href="${href(p.slug)}" ${p.slug === page.slug ? 'aria-current="page"' : ''}>${e(p.label)}</a>`).join('')}</nav>
<a class="button header-cta" href="${href('contacto/')}">${e(c.mainCta)} ${arrow}</a></div></header>
<main id="contenido">${body}</main>
<footer class="site-footer"><div class="container footer-grid"><div class="footer-brand"><a class="logo footer-logo" href="${href('')}" aria-label="LMR, inicio">${picture(ctx, 'logo', site.logoName, { sizes: '140px' })}</a><p>${h(c.footerTagline)}</p></div><div><h2>${e(c.footerNav)}</h2><ul>${site.pages.filter(p => p.slug).map(p => `<li><a href="${href(p.slug)}">${e(p.label)}</a></li>`).join('')}</ul></div><div><h2>${e(c.contact)}</h2><a href="mailto:${e(site.email)}">${e(site.email)}</a><a href="tel:${site.phones[0].replace(/\s/g, '')}">${e(site.phones[0])}</a><p>${e(site.address.street)}<br>${e(site.address.city)}, ${e(site.address.region)} · ${e(c.country)}</p></div><div class="footer-note"><h2>${e(c.footerProject)}</h2><p>${e(c.footerProjectText)}</p><a class="text-link" href="${href('contacto/')}">${e(c.footerContact)} ${arrow}</a></div></div>
<div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${e(c.copyright)}</span><span>${e(c.tagline)}</span></div><a class="back-top" href="#arriba" data-back-top aria-label="${e(c.backTop)}" hidden>${arrow}</a></footer>
<div class="agency-credits"><div class="container credits-inner"><span>${e(c.credits)}</span>${site.credits.map(a => `<a href="${e(a.url)}" target="_blank" rel="noopener noreferrer" aria-label="${e(a.name)}">${picture(ctx, a.image, a.name, { sizes: '45px' })}<span>${e(a.label)}</span></a>`).join('')}</div></div>
</body></html>`;
}
