import { escapeHtml as e } from '../../shared/html.mjs';
import { picture } from '../../shared/layout.mjs';

// All three views read the same first photograph; missing media never invents a work.
export function projectCover(ctx, project, { className = '', sizes = '(max-width: 760px) 90vw, 400px', caption = false, clientLogo = true, illustration = '' } = {}) {
  const photo = project.photos?.[0];
  const kind = photo ? 'photo' : illustration ? 'drawing' : 'identity';
  const media = photo
    ? picture(ctx, photo.image, photo.alt, { className: 'project-visual-image', sizes })
    : illustration || picture(ctx, 'logo', '', { className: 'project-visual-logo project-fallback-logo', sizes: '200px' });
  const badge = clientLogo && project.logo
    ? picture(ctx, project.logo.replace(/\.[^.]+$/, ''), '', { className: 'project-visual-client', sizes: '72px' })
    : '';
  return `<figure class="project-visual project-visual--${kind} ${e(className)}" ${photo ? '' : 'aria-hidden="true"'}>${media}${badge}${caption && photo ? `<figcaption>${e(photo.caption)}</figcaption>` : ''}</figure>`;
}
