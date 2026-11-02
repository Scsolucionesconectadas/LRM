# Contexto de LMR

Fecha: 02/11/2026, America/Buenos_Aires.

## Objetivo y estado

Web institucional de ingeniería, obras eléctricas MT/BT, tableros y PLC, redes/fibra y servicios complementarios. Cinco páginas, diez servicios y seis referencias publicables. Separada de SOLUTION-GROUP por pedido del usuario y preparada para https://github.com/Scsolucionesconectadas/LRM.

Fuente local vigente: C:/Proyectos/LRM. Demo ya publicada mediante carga manual en https://lmr-demo.scsolucionesconectadas.com.ar/. La conexión automática a main está en configuración; completar [[13_Deploy_Infraestructura]] con evidencia del primer despliegue Git antes de darla por verificada.

## Stack

Node.js >=22, módulos ECMAScript, HTML/CSS/JS nativos, Sharp 0.35.5 para imágenes. Contenido JSON; generación estática. Sin backend ni administrador. Cloudflare Workers Static Assets; Wrangler 4.156.1 fijado en el comando de despliegue.

## Ejecución

`npm ci`, `npm run dev`; abrir http://127.0.0.1:4174/lmr/.

`npm run check`, `npm test`, `npm run build:demo`. Ver [[06_Comandos_Runbook]].

## Límites vigentes

Demo pública noindex, transporte de correo deshabilitado en su artefacto. No enviar pruebas o activaciones; la recepción definitiva no fue comprobada. Material sin permiso de publicación y notas comerciales permanecen fuera del repo público, conservados en el proyecto previo. No cambiar dominio/indexación del cliente por esta separación. No mezclar i-Solution o panel.

[[05_Pendientes]] · [[02_Decisiones_Tecnicas]] · [[03_Bitacora_Desarrollo]] · [[13_Deploy_Infraestructura]].
