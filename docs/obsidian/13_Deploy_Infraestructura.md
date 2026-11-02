# Publicación e infraestructura

## 02/11/2026 — Mejoras publicadas y verificadas

Commitfbf4e78, check Cloudflare completed/success, build1eb6699f-8ac4-4039-a9e4-a57d7b490ddd. 84 recursos públicos correctos y revisión conjunta de62 casos responsive. Evidencia en [[15_Actualizacion_Demo_Publica]]. Transporte vacío/noindex conservados; sin correos/activaciones o cambios de DNS/plan/dominio final. Documentación de cierre sincronizada mediante un commit posterior sin cambios funcionales.

## 02/11/2026 — Actualización de mejoras autorizada

Publicar [[14_Funcionalidad_y_Calidad]] mediante el flujo main → lmr-demo. Ver [[15_Actualizacion_Demo_Publica]] para el resultado vigente. Conservar endpoint vacío/noindex; no modificar dominios finales o servicio de correo.

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

## GitHub y publicación automática — verificada

Repositorio https://github.com/Scsolucionesconectadas/LRM, main, raíz /.

Aplicación oficial Cloudflare Workers and Pages instalada con Only select repositories → LRM, no todos los repositorios. No copiar secretos al proyecto.

Build: `npm run check && npm test && npm run build:demo`. Deploy: `npx --yes wrangler@4.156.1 deploy --config deploy/lmr-demo/wrangler.jsonc`. Cloudflare realiza instalación npm según lockfile. Node 22 fijado en .nvmrc.

Primer commit subido: bc8ce28f751f623058f588b232d58d38ec2fd72e. Check GitHub Workers Builds: lmr-demo completed/success; build dd06484c-14f5-4e77-a755-713d02595ee0, duración aproximada58s, versión8367edaa lista. La URL personalizada responde200 con X-Robots-Tag noindex. La subida se hizo con la cuenta autorizada Scsolucionesconectadas y autenticación aislada; el primer intento desde otra cuenta recibió403 y no modificó el remoto.

Validación posterior a Git: recursos200 y cabeceras correctas. Al comparar Windows con el build Linux, normalizar CRLF/LF en textos. La tarjeta PNG social se genera con fuentes del entorno; comprobar formato PNG1200x630, no imponer igualdad binaria entre sistemas operativos. Estos matices no representan archivos ausentes o una versión equivocada. Las notas finales se suben en un segundo commit para verificar otra activación del flujo.
