import { picture } from '../../shared/layout.mjs';
import { escapeHtml as e, arrow } from '../../shared/html.mjs';

const drawings = {
  plans: '<rect x="40" y="18" width="69" height="77" rx="3"/><path d="M51 34h32m-32 9h42M53 58h42v25H53zm13 0v25m-13-12h42M114 32l9-9 8 8-9 9m-8-8-17 17-5 13 13-5 17-17"/><circle cx="76" cy="71" r="4"/>',
  ground: '<path d="M35 38h90M45 38v25m35-25v25m35-25v25M35 63h90m-80 0v13m35-13v13m35-13v13M32 81h26m-22 7h18m-14 7h10m17-14h26m-22 7h18m-14 7h10m17-14h26m-22 7h18m-14 7h10"/><circle cx="45" cy="38" r="4"/><circle cx="80" cy="38" r="4"/><circle cx="115" cy="38" r="4"/>',
  estimate: '<rect x="42" y="20" width="59" height="76" rx="3"/><path d="M54 34h32m-32 12h32m-32 13h19m-19 12h19m-19 12h19M80 59h8m-8 12h8m-8 12h8"/><circle cx="112" cy="77" r="20"/><path d="M105 81v-9m7 13V67m7 18v-7"/>',
  documents: '<path d="M48 23h47l16 16v54H48zM95 23v16h16M55 17h48l15 15v45"/><path d="M59 50l4 4 7-8m7 5h23M59 67l4 4 7-8m7 5h23M59 84h40"/>',
  industry: '<path d="M30 93V48l29 14V40l30 19V28h17v65zM25 93h110M42 75h9m18 0h9m18 0h10M42 84h9m18 0h9m18 0h10M93 20h11"/>',
  power: '<path d="M40 25h80v70H40zM40 43h80M66 43v52m28-52v52M50 32h8m20 0h8m20 0h6M52 57v12m26-12v12m28-12v12M35 99h90M64 18h32"/><circle cx="53" cy="82" r="3"/><circle cx="80" cy="82" r="3"/><circle cx="107" cy="82" r="3"/>',
  control: '<rect x="30" y="32" width="100" height="53" rx="4"/><path d="M53 32v53m19-53v53m19-53v53m19-53v53M34 25h92M34 92h92M38 42h8m-8 9h8"/><g fill="currentColor"><circle cx="62" cy="44" r="2"/><circle cx="81" cy="44" r="2"/><circle cx="100" cy="44" r="2"/><circle cx="119" cy="44" r="2"/></g><path d="M61 60v12m19-12v12m19-12v12m19-12v12"/>',
  network: '<rect x="32" y="20" width="96" height="75" rx="4"/><path d="M32 40h96M32 62h96M41 30h8m7 0h8m-23 21h78m-78 22h78M45 81v8m14-8v8m14-8v8m14-8v8m14-8v8m14-8v8"/><circle cx="115" cy="30" r="2"/>'
};

export function lineDrawing(name, className = '') {
  if (!drawings[name]) throw new Error(`Ilustración no definida: ${name}`);
  return `<svg class="technical-drawing ${className}" viewBox="0 0 160 112" fill="none" aria-hidden="true"><path d="M22 12h8m-4-4v8m106 82h8m-4-4v8" stroke="currentColor" opacity=".25"/><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${drawings[name]}</g></svg>`;
}

export function serviceThumbnail(ctx, service) {
  const media = ctx.serviceUi.media[service.id];
  const content = media.image ? picture(ctx, media.image, media.alt, { sizes: '(max-width: 600px) 80px, 132px' }) : lineDrawing(media.diagram);
  return `<span class="service-thumb">${content}</span>`;
}

export function integrationMap(ctx) {
  const c = ctx.copy.home;
  return `<div class="integration-map" data-motion-diagram data-ambient-motion data-motion-active="false" role="group" aria-label="${e(c.integrationLabel)}"><div class="integration-floor" aria-hidden="true"></div><svg class="integration-connections" viewBox="0 0 620 430" fill="none" aria-hidden="true"><g stroke="#67b8ed" stroke-width="2"><path data-diagram-part d="M160 70h72l78 145"/><path data-diagram-part d="M460 204H380l-70 11"/><path data-diagram-part d="M160 350h78l72-135"/></g><g fill="#a5dcff"><circle class="signal-dot signal-energy" cx="160" cy="70" r="5"/><circle class="signal-dot signal-control" cx="460" cy="204" r="5"/><circle class="signal-dot signal-data" cx="160" cy="350" r="5"/></g></svg><div class="integration-hub" data-diagram-part><b>${e(c.hub)}</b><span>${e(c.hubDetail)}</span></div>${c.nodes.map(n => `<a class="integration-node node-${n.id}" href="${ctx.href('servicios/')}#${n.target}" data-diagram-part>${lineDrawing(n.icon)}<div><strong>${e(n.title)}</strong><span>${e(n.detail)}</span></div>${arrow}</a>`).join('')}</div>`;
}

export const circuit = `<svg class="circuit" viewBox="0 0 480 260" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.4"><path data-diagram-part d="M0 45h100l50 50h100l50-50h180"/><path data-diagram-part d="M0 130h190l50 50h240"/><path data-diagram-part d="M0 215h85l45-45V25h100l55 55h195"/><path data-diagram-part d="M350 0v100l-55 55v105"/><g data-diagram-part><circle cx="100" cy="45" r="6"/><circle cx="190" cy="130" r="6"/><circle cx="85" cy="215" r="6"/><circle cx="350" cy="100" r="6"/></g></g></svg>`;
