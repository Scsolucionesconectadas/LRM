import test from 'node:test';
import assert from 'node:assert/strict';
import { contactEndpoint, submitConsultation } from '../apps/lmr/contact-model.js';
import { getConfig } from '../scripts/build.mjs';

const endpoint = 'https://formspree.io/f/testform';
const fields = { name:' Persona de prueba ', email:'prueba@example.invalid', company:'Empresa ficticia', phone:'', service:'Otras consultas', message:'Consulta ficticia para validar el formulario.', subject:'Consulta web · LMR', _gotcha:'' };
const hasCode = code => error => error.code === code;

test('solo admite endpoints públicos de los dos proveedores sin credenciales ni parámetros', () => {
  assert.equal(contactEndpoint(), '');
  assert.equal(contactEndpoint(endpoint), endpoint);
  assert.equal(contactEndpoint('https://formsubmit.co/ajax/prueba@example.invalid'),'https://formsubmit.co/ajax/prueba@example.invalid');
  for (const value of ['http://formspree.io/f/testform','https://usuario:clave@formspree.io/f/testform','https://formspree.io.ejemplo.com/f/testform','https://formspree.io/f/testform?key=privada','https://formspree.io/f/testform#x','https://example.com/api',null]) assert.throws(()=>contactEndpoint(value));
});

test('el destinatario temporal está restringido a preview y no sustituye el definitivo en producción', () => {
  const testEndpoint='https://formsubmit.co/ajax/prueba@example.invalid';
  const config=getConfig({contactTestEndpoint:testEndpoint});
  assert.equal(config.contactTestMode,true);
  assert.equal(config.contactEndpoint,testEndpoint);
  assert.throws(()=>getConfig({mode:'production',publicBaseUrl:'https://example.com/lmr/',contactTestEndpoint:testEndpoint}),/prueba no se admite/);
  assert.equal(getConfig({mode:'production',publicBaseUrl:'https://example.com/lmr/'}).contactEndpoint,'');
});

test('FormSubmit usa su contrato JSON, conserva la fuente sin query y no reenvía campos peligrosos', async () => {
  let request;
  const result=await submitConsultation('https://formsubmit.co/ajax/prueba@example.invalid',{...fields,source:'http://127.0.0.1:4173/lmr/contacto/?proyecto=privado',_cc:'no@example.invalid'}, {fetchImpl:async(url,options)=>{
    request={url,...options};
    return new Response(JSON.stringify({success:'true',message:'Form successfully submitted'}),{status:200});
  }});
  const body=JSON.parse(request.body);
  assert.equal(result.accepted,true);
  assert.equal(body._subject,fields.subject);
  assert.equal(body._url,'http://127.0.0.1:4173/lmr/contacto/');
  assert.equal(body._honey,'');
  assert.equal(body._cc,undefined);
  assert.equal(body._captcha,undefined);
  assert.equal(request.headers['Content-Type'],'application/json');
});

test('FormSubmit diferencia activación requerida y nunca considera éxito el string false', async () => {
  const url='https://formsubmit.co/ajax/prueba@example.invalid';
  await assert.rejects(submitConsultation(url,fields,{fetchImpl:async()=>new Response(JSON.stringify({success:'false',message:'This form needs Activation.'}),{status:200})}),hasCode('ACTIVATION_REQUIRED'));
  for(const body of [{success:'false',message:'Error'},{success:false},{success:true,error:''},{}])await assert.rejects(submitConsultation(url,fields,{fetchImpl:async()=>new Response(JSON.stringify(body),{status:200})}),hasCode('REJECTED'));
});

test('sin activación o con datos inválidos no realiza ninguna petición ni devuelve éxito', async () => {
  let requests = 0;
  const options = { fetchImpl:async()=>{ requests++; } };
  await assert.rejects(submitConsultation('',fields,options),hasCode('UNAVAILABLE'));
  for (const patch of [{_gotcha:'bot'},{name:'  '},{email:'inválido'},{message:'   '},{message:'x'.repeat(1801)}]) await assert.rejects(submitConsultation(endpoint,{...fields,...patch},options),hasCode('INVALID'));
  assert.equal(requests,0);
});

test('POST envía solo los campos esperados y acepta la respuesta documentada sin seguir next', async () => {
  let request;
  const result=await submitConsultation(endpoint,{...fields,to:'otro@example.invalid',token:'no-enviar'}, {fetchImpl:async(url,options)=>{
    request={url,...options};
    return new Response(JSON.stringify({next:'https://formspree.io/thanks'}),{status:200,headers:{'Content-Type':'application/json'}});
  }});
  assert.deepEqual(result,{accepted:true});
  assert.equal(request.url,endpoint);
  assert.equal(request.method,'POST');
  assert.equal(request.credentials,'omit');
  assert.equal(request.redirect,'error');
  assert.deepEqual(request.headers,{Accept:'application/json'});
  assert.equal(request.body.get('name'),'Persona de prueba');
  assert.equal(request.body.get('email'),fields.email);
  assert.equal(request.body.get('to'),null);
  assert.equal(request.body.get('token'),null);
});

test('un 200 con errores, una respuesta inesperada o HTTP fallido nunca se consideran envío', async () => {
  for(const [status,body] of [[200,{error:'CAPTCHA requerido'}],[200,{errors:[]}],[200,{next:'https://example.com',error:''}],[200,{}],[200,{ok:false}],[400,{error:'Inválido'}],[500,{next:'https://example.com'}]]) {
    await assert.rejects(submitConsultation(endpoint,fields,{fetchImpl:async()=>new Response(JSON.stringify(body),{status})}),hasCode('REJECTED'));
  }
  await assert.rejects(submitConsultation(endpoint,fields,{fetchImpl:async()=>new Response('<html>error</html>',{status:200})}),hasCode('NETWORK'));
  await assert.rejects(submitConsultation(endpoint,fields,{fetchImpl:async()=>new Response('{}',{status:429})}),hasCode('RATE_LIMIT'));
});

test('un timeout se cancela sin reintentar automáticamente y una caída de red no simula éxito', async () => {
  let calls=0;
  await assert.rejects(submitConsultation(endpoint,fields,{timeoutMs:10,fetchImpl:async(_url,{signal})=>{
    calls++;
    return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('abort')),{once:true}));
  }}),hasCode('TIMEOUT'));
  assert.equal(calls,1);
  await assert.rejects(submitConsultation(endpoint,fields,{fetchImpl:async()=>{throw new TypeError('Network error');}}),hasCode('NETWORK'));
});
