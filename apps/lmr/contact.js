import { contactEndpoint, submitConsultation } from './contact-model.js';
import { trackSiteEvent } from './insights.js';
import { installFormValidation } from './form-validation.js';

export function installDraftGuard(form) {
  const fields = ['name', 'company', 'email', 'phone', 'service', 'message'];
  const snapshot = () => JSON.stringify(fields.map(name => form.elements.namedItem(name)?.value || ''));
  let initial = snapshot(), listening = false;
  const warn = event => { event.preventDefault(); event.returnValue = ''; };
  function sync() {
    const dirty = snapshot() !== initial;
    form.dataset.dirty = String(dirty);
    if (dirty && !listening) { addEventListener('beforeunload', warn); listening = true; }
    else if (!dirty && listening) { removeEventListener('beforeunload', warn); listening = false; }
  }
  const clean = () => { initial = snapshot(); sync(); };
  form.addEventListener('input', sync);
  form.addEventListener('change', sync);
  form.addEventListener('reset', () => queueMicrotask(clean));
  addEventListener('pageshow', sync);
  sync();
  return { clean };
}

export function enhanceContact(form) {
  const validation = installFormValidation(form);
  const button = form.querySelector('[type="submit"]');
  const buttonLabel = button.querySelector('[data-submit-label]');
  const status = form.querySelector('[data-form-status]');
  let endpoint = '';
  try { endpoint = contactEndpoint(form.dataset.endpoint); } catch { /* Keep unavailable state. */ }
  form.hidden = false;
  const query = new URLSearchParams(location.search);
  const service = form.elements.namedItem('service');
  if ([...service.options].some(option => option.value === query.get('servicio'))) service.value = query.get('servicio');
  const project = query.get('proyecto');
  if (project) form.elements.namedItem('message').value = (form.dataset.projectTemplate || '').replace('{project}', project.slice(0, 180));
  const draft = installDraftGuard(form);
  const show = (state, message, focus = false) => {
    form.dataset.state = state;
    status.textContent = message;
    status.hidden = false;
    if (focus) {
      status.focus({ preventScroll: true });
      status.scrollIntoView({ block:'nearest', behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  };
  button.disabled = !endpoint;
  if (!endpoint) show('unavailable', form.dataset.unavailable);
  form.addEventListener('input', event => {
    event.target.setCustomValidity?.('');
    if (endpoint && form.dataset.state !== 'sending') { status.hidden = true; form.dataset.state = 'idle'; }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (form.dataset.state === 'sending') return;
    if (!endpoint) { show('unavailable', form.dataset.unavailable, true); return; }
    const message = form.elements.namedItem('message');
    const name = form.elements.namedItem('name');
    name.setCustomValidity(name.value.trim() ? '' : form.dataset.invalidName);
    message.setCustomValidity(message.value.trim().length >= 10 ? '' : form.dataset.invalidMessage);
    if (!validation.validate()) return;
    const data = new FormData(form);
    const fields = Object.fromEntries(data.entries());
    fields.service = service.selectedOptions[0].textContent;
    fields.subject = form.dataset.subject;
    fields.source = location.origin + location.pathname;
    const controls = [...form.querySelectorAll('input, select, textarea, button')];
    const disabled = controls.map(control => control.disabled);
    controls.forEach(control => { control.disabled = true; });
    form.setAttribute('aria-busy', 'true');
    buttonLabel.textContent = form.dataset.sending;
    show('sending', form.dataset.sending);
    try {
      await submitConsultation(endpoint, fields);
      form.reset();
      draft.clean();
      trackSiteEvent('consultation_accepted');
      show('success', form.dataset.success, true);
    } catch (error) {
      const key = error.code === 'ACTIVATION_REQUIRED' ? 'activation' : error.code === 'RATE_LIMIT' ? 'rateLimit' : error.code === 'TIMEOUT' || error.code === 'NETWORK' ? 'uncertain' : 'failure';
      show(key === 'activation' ? 'activation' : 'error', form.dataset[key], true);
    } finally {
      controls.forEach((control, index) => { control.disabled = disabled[index]; });
      form.removeAttribute('aria-busy');
      buttonLabel.textContent = form.dataset.submit;
    }
  });
}

if (typeof document !== 'undefined') {
  const form = document.querySelector('#consultation');
  if (form) enhanceContact(form);
}
