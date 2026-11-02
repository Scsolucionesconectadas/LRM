# Actualizaci?n de la demo p?blica verificada

Fecha: 02/11/2026, America/Buenos_Aires.

## Alcance autorizado

El usuario pidi? publicar las mejoras locales de [[14_Funcionalidad_y_Calidad]] en las demos existentes. Se realiz? commit/push al repositorio propio y Cloudflare actualiz? el sitio mediante la conexi?n autom?tica de main. No se activ? correo, indexaci?n, cambio de plan o dominio definitivo.

URL: https://lmr-demo.scsolucionesconectadas.com.ar/

## Publicaci?n comprobada

- Commit funcional: fbf4e787b80b75fffcfc06d68d02bc2d30b53acf.
- Check de Cloudflare: completed / success.
- Build: 1eb6699f-8ac4-4039-a9e4-a57d7b490ddd.
- Validaci?n previa: npm run check, 36 pruebas y build:demo correctos. El hook obligatorio de pre-push tambi?n pas? pruebas y build.
- Recursos p?blicos verificados: 84, todos HTTP 200 y noindex. Archivos de aplicaci?n coinciden con el artefacto; textos comparados normalizando CRLF/LF. Los 23 PDF de i-Solution se conservaron por SHA-256.
- Cloudflare a?ade su beacon de Analytics a los HTML y contenido administrado a robots.txt. Se verific? esa diferencia concreta sin alterar la configuraci?n del servicio. Las comparaciones excluyen solo esa inyecci?n conocida; no se ignoran otros cambios de scripts o contenido.
- 31 p?ginas de ambos sitios en 390/1366 px: 62 casos p?blicos sin desborde, im?genes rotas detectadas, encabezados H1 faltantes/duplicados o errores JavaScript.
- B?squeda radar 80 y cambio de instrumento en Contacto comprobados en i-Solution publicado. Validaci?n nueva cargada y bot?n de env?o deshabilitado en ambos sitios; endpoints vac?os.
- 404 propias verificadas y rutas de fuentes/docs/entorno no expuestas. Un agente de diagn?stico personalizado recibi? 403 en rutas inexistentes; con navegador y User-Agent normal se confirm? HTTP 404. No se cambi? protecci?n o acceso de Cloudflare.

## Documentaci?n de cierre

Despu?s del commit funcional fbf4e78, un commit solo documental registra estas comprobaciones. La evidencia final del ?ltimo check y sincronizaci?n se conserva en el archivo interno de Solution Group, nota70_Publicacion_Mejoras_Demos. El contenido funcional no cambia en ese cierre documental.

## L?mites conservados

Demos noindex/nofollow/noarchive, 404 propia, formulario sin transporte, sin env?os o activaciones. No se subieron QA, consultas, transcripciones ficticias, presupuestos o material pendiente de permiso. Destinatario institucional fuente conservado; recepci?n real a?n no comprobada.

Material/fotos/validaci?n t?cnica y subt?tulos revisados del video original siguen pendientes. Los puntos 5/6 del plan permanecen aplazados; esta tarea utiliz? el flujo de publicaci?n existente.
