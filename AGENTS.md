# LMR: repositorio independiente

- Proyecto local de trabajo: C:/Proyectos/LRM. Remoto autorizado: https://github.com/Scsolucionesconectadas/LRM. La marca es LMR; conservar el nombre LRM del repositorio elegido por el usuario.
- Leer docs/obsidian/00_Contexto_Proyecto.md y 05_Pendientes.md antes de cambios relevantes. Actualizar la documentación al finalizar.
- Contenido en content/lmr/, interfaz y recursos en apps/lmr/, componentes comunes en shared/. No agregar i-Solution, panel administrador, presupuestos o fuentes privadas.
- Este repositorio es público. No versionar credenciales, .env.local, consultas del formulario, fotografías sin autorización, material marcado solo para revisión privada ni documentación comercial interna.
- La demo pública es https://lmr-demo.scsolucionesconectadas.com.ar/. Worker lmr-demo, configuración deploy/lmr-demo/wrangler.jsonc. Se está conectando GitHub main con Cloudflare Builds; verificar evidencia antes de anunciar actualización automática.
- Build de demo: npm run build:demo. Salida exclusiva .qa/cloudflare/lmr-demo, raíz /, noindex, sin sitemap/canonical definitivo ni material previewOnly. El formulario no tiene transporte en esa copia; no enviar pruebas ni activaciones. Destino definitivo infolmr@solution.com.ar se conserva en la configuración fuente.
- No activar producción/indexación/dominio del cliente ni enviar correos sin instrucción expresa. No prometer llegada a Recibidos.
- Una modificación local no se publica hasta commit/push. El usuario autorizó la subida inicial y vinculación automática; para publicaciones posteriores respetar la instrucción vigente de cada tarea.
- Ejecutar npm run check, npm test y npm run build:demo. Revisar Git diff y fuentes públicas antes de commit. No force-push. Comprobar despliegue real tras push autorizado.
- No modificar ERP-AGRIMENSURA ni el proyecto histórico LMR-WEB. El archivo de trabajo completo previo se conserva en SOLUTION-GROUP; desde la separación, esta carpeta es la fuente de LMR.
