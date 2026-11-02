# Publicación e infraestructura

## Demo pública — 02/11/2026

- URL: https://lmr-demo.scsolucionesconectadas.com.ar/.
- Worker: lmr-demo, solo archivos estáticos, sin script de aplicación ni base de datos.
- URL técnica: https://lmr-demo.contacto-solucionesconectadas.workers.dev/.
- Dominio personalizado de la zona existente de SC, creado sin modificar raíz, MX, TXT de correo ni servidores DNS.
- Primera publicación manual: versión 5a1b24df, mostrada como 100% lista.
- Configuración reproducible: deploy/lmr-demo/wrangler.jsonc, ruta raíz, auto-trailing-slash y 404-page.
- Artefacto: 84 archivos/2.295.626 bytes; ZIP de 2.061.867 bytes. No incluye fuentes, docs, credenciales, i-Solution o material pendiente de permiso.
- X-Robots-Tag noindex/nofollow/noarchive, meta robots noindex y robots.txt Disallow: /. Cloudflare añade contenido administrado a robots.txt; conservar la directiva final y no exigir igualdad binaria de ese único archivo.
- Las otras 81 respuestas verificadas coinciden con sus archivos locales; cinco páginas x tres anchos (390/768/1365) sin overflow, imágenes rotas ni errores JavaScript. Formulario disabled y endpoint vacío en la demo. No se realizaron envíos.

## GitHub y publicación automática — en configuración

Repositorio https://github.com/Scsolucionesconectadas/LRM, main, raíz /.

Aplicación oficial Cloudflare Workers and Pages instalada con Only select repositories → LRM, no todos los repositorios. No copiar secretos al proyecto.

Build: `npm run check && npm test && npm run build:demo`. Deploy: `npx --yes wrangler@4.156.1 deploy --config deploy/lmr-demo/wrangler.jsonc`. Cloudflare realiza instalación npm según lockfile. Node 22 fijado en .nvmrc.

Falta registrar aquí la evidencia del primer commit/build remoto correcto antes de dar la integración por terminada.
