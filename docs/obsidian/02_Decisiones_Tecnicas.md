# Decisiones técnicas

## 2026-11-02 — Repositorio y demo independientes

**Decisión:** LMR pasa a C:/Proyectos/LRM y Scsolucionesconectadas/LRM, con Cloudflare Workers Static Assets. main será la rama de publicación de la demo.

**Motivo:** el usuario solicitó un repositorio por web y actualización de la página al subir cambios. No se migra a GitLab; se mantiene GitHub como fuente y Cloudflare como alojamiento.

**Impacto:** i-Solution y archivos privados no se incorporan. El repo público tiene seis referencias publicables; el material pendiente permanece en SOLUTION-GROUP. La demo solicita noindex y usa un endpoint de correo vacío sin cambiar el destinatario institucional de la fuente. No cambiar indexación, sitio del cliente o correo por una publicación de revisión.

**Alternativas consideradas:** subir todo el monorepo (mezcla sitios/materiales); publicar solo HTML sin fuentes (dificulta mantenimiento); tokens de despliegue en Git (descartado). Se usa la aplicación oficial de Cloudflare limitada a LRM.

**Archivos:** package.json, scripts/prepare-lmr-demo.mjs, deploy/lmr-demo/wrangler.jsonc, content/lmr/, AGENTS.md.
