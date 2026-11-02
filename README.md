# LMR · Ingeniería y obras eléctricas

Sitio de LMR con cinco páginas independientes: Inicio, Empresa, Servicios, Proyectos y Contacto.

- **Demo pública:** https://lmr-demo.scsolucionesconectadas.com.ar/
- **Repositorio:** https://github.com/Scsolucionesconectadas/LRM
- **Carpeta local de trabajo:** `C:\Proyectos\LRM`
- **Alojamiento:** Cloudflare Workers Static Assets, Worker `lmr-demo`.

## Desarrollo local

Requiere Node.js 22 o superior. Python solo se utiliza si se desea empaquetar un ZIP para una carga manual.

```powershell
npm ci
npm run dev
```

Abrir http://127.0.0.1:4174/lmr/. Se usa un puerto independiente del proyecto anterior.

## Validar y generar la demo

```powershell
npm run check
npm test
npm run build:demo
```

La salida publicable está en `.qa/cloudflare/lmr-demo`. No subir la carpeta completa del repositorio como si fuera el sitio.

La demo conserva la estética y navegación final, pero solicita no indexación y deshabilita el envío de consultas. El dominio definitivo, la indexación y las pruebas de correo corresponden a una etapa posterior autorizada. `noindex` no restringe el acceso: cualquiera con el enlace puede verla.

## Actualizaciones en Cloudflare

Integración oficial GitHub → Cloudflare Builds configurada y verificada para la rama `main`:

- Compilación: `npm run check && npm test && npm run build:demo`.
- Despliegue: `npx --yes wrangler@4.156.1 deploy --config deploy/lmr-demo/wrangler.jsonc`.
- Directorio raíz del proyecto: `/`.
- Configuración: `deploy/lmr-demo/wrangler.jsonc`.

El ciclo de trabajo es editar → validar → commit → push → comprobar build y URL pública. Guardar archivos en la computadora no dispara por sí solo una publicación. Si falla la validación o la compilación, no debe reemplazarse la versión pública anterior.

No se necesitan tokens en este repositorio: la integración de Cloudflare gestiona sus credenciales fuera del código. No agregar secretos al frontend ni archivos `.env` al historial.

## Contenidos

| Directorio | Responsabilidad |
|---|---|
| `content/lmr/` | Textos, servicios, proyectos, equipo y contactos |
| `apps/lmr/` | Páginas, interacciones, imágenes y fuentes |
| `shared/` | Layout, HTML seguro y estilos |
| `scripts/` | Generación y validación |
| `tests/` | Pruebas de contenido, navegación y contratos |
| `docs/obsidian/` | Contexto, pendientes y operación |

El repositorio contiene únicamente materiales publicables de LMR. i-Solution y el administrador son proyectos independientes.
