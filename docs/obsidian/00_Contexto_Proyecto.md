# Contexto de LMR

## 02/11/2026 — Actualización pública autorizada

El usuario solicitó publicar las mejoras locales. [[15_Actualizacion_Demo_Publica]] registra alcance y verificación de esta publicación; tiene prioridad sobre el estado local histórico de [[14_Funcionalidad_y_Calidad]]. Correo apagado y noindex conservados; dominio final/operación ampliada pendientes.

## 02/11/2026 — Funcionalidad y calidad locales

[[14_Funcionalidad_y_Calidad]] registra las correcciones y la revisión aprobada hasta el punto 4. 36 pruebas/check/build:demo correctos; auditoría conjunta de 31 páginas/124 casos responsive. Cambios locales sin commit/push: demo pública aún conserva su versión anterior. Copia local servida en http://127.0.0.1:4174/lmr/ sin envío. Puntos 5 (operación) y 6 (dominio) diferidos. Material del cliente y activación/prueba real de correo pendientes, sin envíos. [[10_UI_UX_Diseno]].

Fecha: 02/11/2026, America/Buenos_Aires.

## Objetivo y estado

Web institucional de ingeniería, obras eléctricas MT/BT, tableros y PLC, redes/fibra y servicios complementarios. Cinco páginas, diez servicios y seis referencias publicables. Separada de SOLUTION-GROUP por pedido del usuario y preparada para https://github.com/Scsolucionesconectadas/LRM.

Fuente local vigente: C:/Proyectos/LRM. Demo en https://lmr-demo.scsolucionesconectadas.com.ar/. Conexión automática main → Cloudflare comprobada: commit bc8ce28, check Workers Builds: lmr-demo success y versión8367edaa lista. [[13_Deploy_Infraestructura]] conserva evidencia y comandos. Git tiene helper local con sesión aislada de la cuenta Scsolucionesconectadas, sin cambiar la sesión global de otros proyectos.

## Stack

Node.js >=22, módulos ECMAScript, HTML/CSS/JS nativos, Sharp 0.35.5 para imágenes. Contenido JSON; generación estática. Sin backend ni administrador. Cloudflare Workers Static Assets; Wrangler 4.156.1 fijado en el comando de despliegue.

## Ejecución

`npm ci`, `npm run dev`; abrir http://127.0.0.1:4174/lmr/.

`npm run check`, `npm test`, `npm run build:demo`. Ver [[06_Comandos_Runbook]].

## Límites vigentes

Demo pública noindex, transporte de correo deshabilitado en su artefacto. No enviar pruebas o activaciones; la recepción definitiva no fue comprobada. Material sin permiso de publicación y notas comerciales permanecen fuera del repo público, conservados en el proyecto previo. No cambiar dominio/indexación del cliente por esta separación. No mezclar i-Solution o panel.

[[05_Pendientes]] · [[02_Decisiones_Tecnicas]] · [[03_Bitacora_Desarrollo]] · [[13_Deploy_Infraestructura]].
