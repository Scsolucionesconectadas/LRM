# Comandos y operación

Ejecutar desde C:/Proyectos/LRM.

```powershell
npm ci
npm run dev
```

Local: http://127.0.0.1:4174/lmr/.

```powershell
npm run check
npm test
npm run build:demo
git status --short
git diff
```

Para una subida autorizada, agregar únicamente los archivos revisados, commit convencional y `git push origin main`. Verificar después el commit en Cloudflare Builds y la URL pública. No usar force-push.

La demo genera .qa/cloudflare/lmr-demo; el informe de inventario queda fuera del artefacto. `npm run package:demo` genera el ZIP portátil mediante Python estándar para recuperación/carga manual. No usar Compress-Archive para esta carga: puede introducir barras invertidas en nombres de entrada.

La publicación de Cloudflare se configura con `npm run check && npm test && npm run build:demo` y `npm run deploy:demo`. Cloudflare gestiona su credencial; la CLI local requiere login por separado y no está autenticada por haber iniciado sesión en el navegador.

Rollback: elegir una versión válida anterior en Cloudflare y confirmar el cambio de tráfico; después conciliar el código mediante un commit de reversión para que el siguiente push no restaure el error. No borrar historial Git ni hacer force-push.
