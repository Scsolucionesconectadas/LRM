const pages = new Set(['inicio', 'empresa/', 'servicios/', 'referencias/', 'contacto/']);
const events = new Set(['service_open', 'project_open', 'contact_channel', 'consultation_accepted']);

// Integration point only: no cookies, storage, external provider, or personal fields.
export function trackSiteEvent(event, fields = {}) {
  if (typeof document === 'undefined' || !events.has(event)) return;
  const page = document.body.dataset.page;
  if (!pages.has(page)) return;
  const detail = { event, page };
  if (['service_open', 'project_open'].includes(event) && /^[a-z0-9-]{1,64}$/.test(fields.id || '')) detail.id = fields.id;
  if (event === 'contact_channel' && ['email', 'phone', 'whatsapp', 'form'].includes(fields.channel)) detail.channel = fields.channel;
  dispatchEvent(new CustomEvent('lmr:interaction', { detail: Object.freeze(detail) }));
}

if (typeof document !== 'undefined') document.addEventListener('click', event => {
  const service = event.target.closest('[data-service-open]');
  const project = event.target.closest('[data-project-open]');
  if (service) trackSiteEvent('service_open', { id: service.dataset.serviceOpen });
  else if (project) trackSiteEvent('project_open', { id: project.dataset.projectOpen });
  const href = event.target.closest('a[href]')?.getAttribute('href') || '';
  const channel = href.startsWith('mailto:') ? 'email' : href.startsWith('tel:') ? 'phone' : href.startsWith('https://wa.me/') ? 'whatsapp' : href === '#consulta' ? 'form' : '';
  if (channel) trackSiteEvent('contact_channel', { channel });
});
