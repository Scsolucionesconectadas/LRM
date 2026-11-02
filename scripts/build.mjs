import { readFile, mkdir, rm, writeFile, cp, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join, relative, isAbsolute, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { escapeHtml } from '../shared/html.mjs';
import { contactEndpoint as validateContactEndpoint } from '../apps/lmr/contact-model.js';
import { renderPage } from '../apps/lmr/pages.mjs';
import { layout } from '../shared/layout.mjs';
import { validateEditorial, pagesWithMetadata } from '../shared/editorial.mjs';
export { escapeHtml };
export const projectRoot = resolve(import.meta.dirname, '..');

function cleanPath(value, allowRoot = true) {
  if (typeof value !== 'string' || !/^\/(?:[a-z0-9-]+\/)*$/.test(value) || (!allowRoot && value === '/')) throw new Error('Ruta inválida: usar segmentos simples /nombre/.');
  return value;
}
export function getConfig(input = {}) {
  const mode = input.mode ?? 'preview';
  if (!['preview', 'production'].includes(mode)) throw new Error('Modo inválido');
  const sitePath = cleanPath(input.sitePath ?? '/lmr/');
  if (input.includePreviewProjects !== undefined && typeof input.includePreviewProjects !== 'boolean') throw new Error('includePreviewProjects debe ser booleano.');
  const includePreviewProjects = mode === 'preview' && input.includePreviewProjects !== false;
  const prefix = input.deploymentPrefix ?? '';
  if (prefix && !/^\/(?:[a-z0-9-]+\/)*[a-z0-9-]+$/.test(prefix)) throw new Error('Prefijo de despliegue inválido');
  const basePath = prefix + sitePath;
  let publicBaseUrl = '';
  if (mode === 'production') {
    if (!input.publicBaseUrl) throw new Error('PUBLIC_BASE_URL es obligatorio en producción.');
    const u = new URL(input.publicBaseUrl);
    if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash || u.pathname !== basePath || u.hostname === 'localhost') throw new Error('PUBLIC_BASE_URL debe ser HTTPS y coincidir con el prefijo del sitio.');
    publicBaseUrl = u.href;
  }
  const contactTestEndpoint = validateContactEndpoint(input.contactTestEndpoint ?? '');
  if (mode !== 'preview' && contactTestEndpoint) throw new Error('El destinatario de prueba no se admite en producción. Retirar LMR_CONTACT_TEST_ENDPOINT.');
  return { mode, sitePath, basePath, publicBaseUrl, deploymentPrefix: prefix, includePreviewProjects, contactEndpoint: contactTestEndpoint || validateContactEndpoint(input.contactEndpoint ?? ''), contactTestMode:Boolean(contactTestEndpoint) };
}

async function createAssets(target, excludedImageKeys = new Set()) {
  const source = join(projectRoot, 'apps/lmr/assets/source');
  const images = {};
  await mkdir(target, { recursive: true });
  for (const name of await readdir(source)) {
    const input = join(source, name);
    const key = name.replace(/\.[^.]+$/, '');
    if (excludedImageKeys.has(key)) continue;
    const isBrand = key.startsWith('MAR-') || key.startsWith('agency-');
    const prepared = isBrand ? await sharp(input).trim({ background: '#ffffff', threshold: 12, margin: 8 }).png().toBuffer() : await readFile(input);
    const meta = await sharp(prepared).metadata();
    const widths = key === 'hero' ? [240, 640, 1000, 1600] : key === 'empresa-panorama' ? [480, 960, 1440, meta.width] : key === 'servicios-ilustraciones' ? [768, meta.width] : key === 'logo' ? [240, 480] : [...new Set([Math.min(meta.width, 240), Math.min(meta.width, 480), Math.min(meta.width, 1000)])];
    const variants = [];
    for (const width of widths) {
      const filename = `${key}-${width}.webp`;
      const info = await sharp(prepared).autoOrient().resize({ width, withoutEnlargement: true }).webp({ quality: key === 'logo' ? 95 : 88, lossless: isBrand, smartSubsample: true }).toFile(join(target, filename));
      variants.push({ file: filename, width: info.width, height: info.height, bytes: info.size });
    }
    images[key] = variants;
  }
  await cp(join(projectRoot, 'apps/lmr/assets/fonts'), join(target, 'fonts'), { recursive: true });
  await cp(join(projectRoot, 'shared/styles/site.css'), join(target, 'site.css'));
  await cp(join(projectRoot, 'shared/styles/services-catalog.css'), join(target, 'services-catalog.css'));
  await cp(join(projectRoot, 'shared/styles/experience.css'), join(target, 'experience.css'));
  await cp(join(projectRoot, 'shared/styles/readability.css'), join(target, 'readability.css'));
  await cp(join(projectRoot, 'shared/styles/home.css'), join(target, 'home.css'));
  await cp(join(projectRoot, 'shared/styles/company.css'), join(target, 'company.css'));
  await cp(join(projectRoot, 'apps/lmr/company.js'), join(target, 'company.js'));
  for (const name of ['contact.js', 'contact-model.js', 'catalog-filter.js', 'insights.js']) await cp(join(projectRoot, 'apps/lmr', name), join(target, name));
  await cp(join(projectRoot, 'shared/styles/contact.css'), join(target, 'contact.css'));
  await cp(join(projectRoot, 'apps/lmr/services.js'), join(target, 'services.js'));
  await cp(join(projectRoot, 'apps/lmr/projects.js'), join(target, 'projects.js'));
  await cp(join(projectRoot, 'apps/lmr/projects-model.js'), join(target, 'projects-model.js'));
  await cp(join(projectRoot, 'shared/styles/projects.css'), join(target, 'projects.css'));
  await cp(join(projectRoot, 'apps/lmr/app.js'), join(target, 'app.js'));
  await cp(join(projectRoot, 'apps/lmr/carousel.js'), join(target, 'carousel.js'));
  await cp(join(projectRoot, 'apps/lmr/scroll-ui.js'), join(target, 'scroll-ui.js'));
  await cp(join(projectRoot, 'apps/lmr/home-motion.js'), join(target, 'home-motion.js'));
  const socialBackground = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f3f7fa"/><rect x="0" y="0" width="16" height="630" fill="#2780c4"/><path d="M850 0v170l150 150h200M920 630V470l150-150M760 0v100l180 180h260" fill="none" stroke="#d8e4ef" stroke-width="3"/><g fill="#0c1f36" font-family="Arial,sans-serif" font-weight="600" font-size="62"><text x="75" y="310">Ingeniería y</text><text x="75" y="385">obras eléctricas.</text></g><text x="79" y="465" fill="#245e9a" font-family="Arial,sans-serif" font-size="30">Media tensión · Baja tensión · PLC</text><text x="79" y="560" fill="#52657a" font-family="Arial,sans-serif" font-size="22">LMR · Rosario, Argentina</text></svg>`);
  const originalLogo = await sharp(join(source, 'logo.jpg')).resize({ width: 230 }).png().toBuffer();
  await sharp(socialBackground).composite([{ input: originalLogo, left: 75, top: 50 }]).png().toFile(join(target, 'compartir-lmr.png'));
  // Original supplied logo preserved as a source; the browser uses faithful WebP variants.
  return images;
}

export async function build(input = {}) {
  const config = getConfig(input);
  const outDir = resolve(input.outDir ?? join(projectRoot, 'dist'));
  const rel = relative(projectRoot, outDir);
  if (isAbsolute(rel) || rel.startsWith(`..${sep}`) || !['dist', '.qa'].includes(rel.split(sep)[0])) throw new Error('La salida debe estar dentro de dist/ o .qa/ del proyecto.');
  await rm(outDir, { recursive: true, force: true });
  const siteDir = join(outDir, config.sitePath.slice(1));
  const load = async name => JSON.parse(await readFile(join(projectRoot, 'content/lmr', `${name}.json`), 'utf8'));
  const [site, services, allProjects, company, serviceUi, projectUi, copy] = await Promise.all(['site', 'servicios', 'proyectos', 'empresa', 'servicios-ui', 'proyectos-ui', 'textos'].map(load));
  if (!config.contactTestMode) config.contactEndpoint = validateContactEndpoint(input.contactEndpoint ?? site.contactEndpoint ?? '');
  const projects = allProjects.filter(p => config.includePreviewProjects || !p.previewOnly);
  const visibleImageKeys = new Set(projects.flatMap(p => (p.photos ?? []).map(photo => photo.image)));
  const excludedImageKeys = new Set(allProjects.filter(p => !projects.includes(p)).flatMap(p => (p.photos ?? []).map(photo => photo.image)).filter(key => !visibleImageKeys.has(key)));
  validateEditorial(copy);
  validateEditorial(services);
  validateEditorial(serviceUi);
  validateEditorial(projects.map(({ title, work, sector }) => ({ title, work, sector })));
  site.pages = pagesWithMetadata(site.pages, copy);
  const images = await createAssets(join(siteDir, 'assets'), excludedImageKeys);
  const href = path => `${config.basePath}${path}`;
  const ctx = { ...config, site, services, projects, company, serviceUi, projectUi, copy, images, href, escapeHtml };
  for (const page of site.pages) {
    const dir = join(siteDir, page.slug);
    await mkdir(dir, { recursive: true });
    const html = layout(ctx, page, renderPage(ctx, page));
    validateEditorial(html, page.slug || 'inicio');
    if ((html.match(/<h1[ >]/g) || []).length !== 1) throw new Error(`H1 inválida: ${page.slug || 'inicio'}`);
    await writeFile(join(dir, 'index.html'), html, 'utf8');
  }
  if (config.mode === 'production') {
    const urls = site.pages.map(p => `<url><loc>${escapeHtml(config.publicBaseUrl + p.slug)}</loc></url>`).join('');
    await writeFile(join(siteDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
    await writeFile(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${config.publicBaseUrl}sitemap.xml\n`);
  } else {
    await writeFile(join(outDir, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  }
  await writeFile(join(outDir, '.nojekyll'), '');
  // No private sources, commercial PDFs, credentials or repository docs in the artifact.
  return { pages: site.pages.length, outDir, mode: config.mode, basePath: config.basePath, assets: images };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const localEnv = join(projectRoot, '.env.local');
  if (existsSync(localEnv)) process.loadEnvFile(localEnv);
  const report = await build({ contactTestEndpoint:process.env.LMR_CONTACT_TEST_ENDPOINT ?? '', contactEndpoint: process.env.LMR_CONTACT_ENDPOINT, mode: process.env.BUILD_MODE ?? 'preview', publicBaseUrl: process.env.PUBLIC_BASE_URL, deploymentPrefix: process.env.DEPLOY_PREFIX ?? '', sitePath: process.env.LMR_SITE_PATH ?? '/lmr/' });
  console.log(`${report.pages} páginas LMR generadas · ${report.mode} · ${report.basePath}`);
}
