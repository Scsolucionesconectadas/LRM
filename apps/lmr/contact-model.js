// This is a public form address, never an API key or SMTP credential.
export function contactEndpoint(value = '') {
  if (value === '') return '';
  const formspree = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]{6,64}$/;
  const formsubmit = /^https:\/\/formsubmit\.co\/ajax\/(?:[A-Za-z0-9]{16,128}|[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})$/;
  if (typeof value !== 'string' || !(formspree.test(value) || formsubmit.test(value))) {
    throw new Error('Usar un endpoint público HTTPS de Formspree o FormSubmit, sin credenciales ni parámetros.');
  }
  return value;
}

export class ContactError extends Error {
  constructor(code) { super(code); this.name = 'ContactError'; this.code = code; }
}

export async function submitConsultation(endpoint, fields, { fetchImpl = globalThis.fetch, timeoutMs = 15000 } = {}) {
  let target;
  try { target = contactEndpoint(endpoint); } catch { throw new ContactError('UNAVAILABLE'); }
  if (!target) throw new ContactError('UNAVAILABLE');
  if (String(fields._gotcha ?? '').trim()) throw new ContactError('INVALID');
  if (!String(fields.name ?? '').trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fields.email ?? '').trim()) || String(fields.message ?? '').trim().length < 10) throw new ContactError('INVALID');
  for (const [key, limit] of Object.entries({ name:100, company:150, email:150, phone:40, service:160, message:1800, subject:120 })) {
    if (fields[key] !== undefined && typeof fields[key] !== 'string' || String(fields[key] ?? '').length > limit) throw new ContactError('INVALID');
  }
  if (/[\r\n]/.test(String(fields.email ?? '') + String(fields.subject ?? ''))) throw new ContactError('INVALID');
  const formsubmit = target.startsWith('https://formsubmit.co/ajax/');
  const values = {};
  for (const key of ['name', 'company', 'email', 'phone', 'service', 'message']) values[key] = String(fields[key] ?? '').trim();
  let body;
  const headers = { Accept:'application/json' };
  if (formsubmit) {
    values._subject = String(fields.subject ?? '').trim();
    values._replyto = values.email;
    values._honey = '';
    values._template = 'table';
    if (fields.source) {
      let source;
      try { source = new URL(fields.source); } catch { throw new ContactError('INVALID'); }
      if (!['http:', 'https:'].includes(source.protocol) || source.username || source.password) throw new ContactError('INVALID');
      values._url = source.origin + source.pathname;
    }
    body = JSON.stringify(values);
    headers['Content-Type'] = 'application/json';
  } else {
    body = new FormData();
    for (const [key, value] of Object.entries({ ...values, subject:String(fields.subject ?? '').trim(), _gotcha:'' })) body.set(key, value);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(target, { method: 'POST', body, headers, credentials: 'omit', mode: 'cors', redirect: 'error', signal: controller.signal });
    if (response.status === 429) throw new ContactError('RATE_LIMIT');
    if (!response.ok) throw new ContactError('REJECTED');
    const result = await response.json();
    if (formsubmit) {
      if (result && /needs?\s+activation|activate\s+(?:your\s+)?form/i.test(String(result.message ?? ''))) throw new ContactError('ACTIVATION_REQUIRED');
      if (!result || typeof result !== 'object' || 'error' in result || 'errors' in result || ![true, 'true'].includes(result.success)) throw new ContactError('REJECTED');
      return { accepted:true };
    }
    // Formspree's documented success shape has "next"; older responses use "ok".
    // The returned URL is never followed. An error or malformed response is not success.
    if (!result || typeof result !== 'object' || 'error' in result || 'errors' in result || !(typeof result.next === 'string' || result.ok === true)) throw new ContactError('REJECTED');
    return { accepted: true };
  } catch (error) {
    if (error instanceof ContactError) throw error;
    throw new ContactError(controller.signal.aborted ? 'TIMEOUT' : 'NETWORK');
  } finally { clearTimeout(timer); }
}
