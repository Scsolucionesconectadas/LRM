# Actualización de la demo pública verificada

Fecha: 02/11/2026, America/Buenos_Aires.

## Alcance autorizado

El usuario pidió publicar las mejoras locales de [[14_Funcionalidad_y_Calidad]] en las demos existentes. Se realizó commit/push al repositorio propio y Cloudflare actualizó el sitio mediante la conexión automática de main. No se activó correo, indexación, cambio de plan o dominio definitivo.

URL: https://lmr-demo.scsolucionesconectadas.com.ar/

## Publicación comprobada

- Commit funcional: fbf4e787b80b75fffcfc06d68d02bc2d30b53acf.
- Check de Cloudflare: completed / success.
- Build: 1eb6699f-8ac4-4039-a9e4-a57d7b490ddd.
- Validación previa: check, 36 pruebas y build:demo correctos. El hook obligatorio de pre-push también pasó pruebas y build.
- Recursos públicos verificados: 84, todos HTTP 200/noindex y comparados contra el artefacto. Los 23 PDF de i-Solution se conservaron por SHA-256.
- Textos comparados normalizando CRLF/LF. Cloudflare añade su beacon Analytics a los HTML y contenido administrado a robots.txt; se confirmó esa diferencia concreta sin cambiar el servicio. La comparación excluye solo esa inyección conocida.
- 31 páginas conjuntas en 390/1366 px: 62 casos públicos sin desbordes, imágenes rotas detectadas, H1 faltantes/duplicados o errores JavaScript.
- Búsqueda radar 80 y cambio de instrumento comprobados en i-Solution publicado. Validación nueva cargada y botón de envío deshabilitado en ambos sitios; endpoints vacíos.
- 404 propias y rutas de fuentes/docs/entorno no expuestas. Un agente personalizado recibió 403 en rutas inexistentes; con navegador y User-Agent normal se confirmó HTTP 404. No se modificó la protección de Cloudflare.

## Documentación de cierre

Un commit solo documental posterior a fbf4e78 registra las comprobaciones, sin cambiar el contenido funcional. La evidencia del último check y sincronización se conserva en la nota interna70_Publicacion_Mejoras_Demos de Solution Group.

## Límites conservados

Demos noindex/nofollow/noarchive, 404 propia y formulario sin transporte. Cero envíos o activaciones. QA, consultas, transcripciones ficticias, presupuestos y material pendiente de permiso quedan excluidos. El destinatario institucional fuente se conserva; recepción real pendiente.

Material/fotos/validación técnica y subtítulos revisados del video original siguen pendientes. Los puntos5/6 permanecen aplazados; esta tarea utilizó el flujo de publicación existente.
