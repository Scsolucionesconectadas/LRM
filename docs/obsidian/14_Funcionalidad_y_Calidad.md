# Funcionalidad y calidad hasta el punto 4

Fecha: 02/11/2026, America/Buenos_Aires.

## Alcance vigente

El usuario aprobó avanzar con funcionalidad, contenido, formularios y calidad de las mismas webs. Los puntos 5 (operación) y 6 (dominio/lanzamiento) quedan para después. Implementación local, sin commit/push, publicación o DNS en esta sesión. La demo pública conserva su versión anterior hasta una subida posterior autorizada.

## Cambios implementados

- Validación accesible de Contacto: resumen enfocable con enlaces a campos, mensajes junto al campo y aria-describedby/aria-invalid, conservando ayudas y restricciones HTML.
- Reply-To explícito para que la respuesta se dirija al correo informado por quien consulta; sin CC, autorespuestas o redirecciones añadidas.
- El transporte rechaza tipos inesperados, exceso de longitud en servicio/asunto, saltos de línea en cabeceras y fuentes malformadas antes de invocar la red.
- Se conserva la protección existente del borrador y el manejo de aceptación, activación pendiente, límite, red y timeout, sin reintentos automáticos.
- Se revisaron modales, recuperación de foco, navegación y servicios accesibles sin JavaScript. No se cambió la estética aprobada o el contenido comercial.

**Archivos:** apps/lmr/contact.js, contact-model.js, form-validation.js; shared/styles/contact.css; scripts/build.mjs; tests/contact.test.mjs.

## Validación

- npm run check correcto; 36 pruebas correctas con npm test; npm run build:demo correcto (85 archivos / 2.301.516 bytes).
- Revisión conjunta de 31 páginas en 320, 390, 768 y 1366 px: 124 casos sin desborde, un H1 por página, sin IDs duplicados, imágenes rotas detectadas o errores JavaScript.
- axe-core 4.14.0, solo herramienta QA ignorada, sin dependencia runtime: ninguna infracción automática en las reglas WCAG A/AA ejecutadas sobre las 31 páginas. Fondos con fotografías/gradientes y video requieren comprobaciones manuales; este resultado no acredita por sí solo toda la accesibilidad.
- Formularios de ambas webs revisados localmente con transporte interceptado: campos obligatorios, foco/enlaces del resumen, respuesta 429 conservando texto y aceptación simulada limpiando campos/errores. Cero solicitudes de envío al proveedor o a una casilla real.
- Galería con flechas de teclado y un solo fotograma visible; servicios LMR con Escape y devolución del foco. El aria-controls del servicio apunta al diálogo existente que está cerrado inicialmente.
- Sin JavaScript, 17 entradas del catálogo y diez servicios permanecen visibles a 390 px, sin desborde.
- Respeto a prefers-reduced-motion; cero animaciones activas en la muestra medida. No se descargan PDF/MP4 automáticamente en Inicio o en la ficha de radar revisada; video con preload=none.
- Las medidas de carga son locales/representativas, no estadísticas de usuarios reales o una medición de Core Web Vitals en producción.

## Correo y límites

Destinatario institucional fuente conservado. El artefacto build:demo y la copia local servida para revisar tienen endpoint vacío y botón de envío deshabilitado. El endpoint de QA solo se inyectó en una respuesta HTML interceptada, nunca en archivos fuente o demos públicas. No se enviaron pruebas, correos o activaciones. No afirmar recepción real ni entrega garantizada a Recibidos.

Preparación de transporte y errores verificada con respuestas simuladas; habilitación y prueba real siguen pendientes de autorización. Contrato oficial: [FormSubmit](https://formsubmit.co/documentation). Validación progresiva: [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation).

## Revisión local y continuidad

Abrir http://127.0.0.1:4174/lmr/. Servidor local iniciado en esta sesión. Para reconstruir manteniendo envíos apagados, ver [[06_Comandos_Runbook]]. npm run dev usa la configuración fuente habitual y puede habilitar su endpoint; no usarlo para revisar sin comprobar el transporte.

Fotografías de equipo/proyectos, detalles de obras y permisos del cliente. Mantener fuera de lo publicable los casos o materiales aún no autorizados.

No se añadieron dependencias al package/lock, no se desarrolló administrador y no se abordaron los puntos 5/6. Continuidad de diseño: [[10_UI_UX_Diseno]]. Estado y pendientes: [[00_Contexto_Proyecto]] y [[05_Pendientes]].
