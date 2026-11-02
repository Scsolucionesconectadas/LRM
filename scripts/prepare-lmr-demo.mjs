import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build, projectRoot } from './build.mjs';

export const demoDirectory = resolve(projectRoot, '.qa/cloudflare/lmr-demo');

export async function prepareLmrDemo() {
  // Public review is different from the complete local preview: material awaiting
  // publication permission and mail transport must not enter this artifact.
  const report = await build({
    outDir: demoDirectory,
    mode: 'preview',
    sitePath: '/',
    contactEndpoint: '',
    includePreviewProjects: false
  });
  await writeFile(join(demoDirectory, '_headers'), `/*
  X-Robots-Tag: noindex, nofollow, noarchive
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Cache-Control: no-cache
`, 'utf8');
  await writeFile(join(demoDirectory, '404.html'), `<!doctype html>
<html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Página no encontrada · LMR</title><link rel="icon" href="/assets/logo-240.webp"><link rel="stylesheet" href="/assets/site.css"></head>
<body><main class="container" style="padding-block:5rem"><a href="/" aria-label="LMR, ir al inicio"><img src="/assets/logo-240.webp" alt="LMR Solution S.R.L." width="120"></a><h1 style="margin-top:2rem">No encontramos esta página.</h1><p>Podés volver al inicio para conocer nuestros servicios y proyectos.</p><a class="button" href="/">Volver al inicio</a></main></body></html>`, 'utf8');

  const files = [];
  async function inspect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await inspect(path);
      else files.push({ path: relative(demoDirectory, path).replaceAll('\\', '/'), bytes: (await readFile(path)).length });
    }
  }
  await inspect(demoDirectory);
  const publicReport = { ...report, assets: undefined, files: files.length, bytes: files.reduce((sum, file) => sum + file.bytes, 0) };
  await mkdir(resolve(projectRoot, '.qa/cloudflare'), { recursive: true });
  // The report is deliberately outside the directory that is uploaded.
  await writeFile(resolve(projectRoot, '.qa/cloudflare/lmr-demo-report.json'), JSON.stringify({ ...publicReport, inventory: files }, null, 2) + '\n');
  return publicReport;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await prepareLmrDemo(), null, 2));
}
