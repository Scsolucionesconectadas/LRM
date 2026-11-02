import test from 'node:test';
import assert from 'node:assert/strict';
import { galleryIndex, hasProjectDetails, projectSector } from '../apps/lmr/projects-model.js';

test('una referencia breve no abre una ficha por tener notas internas de relevamiento', () => {
  assert.equal(hasProjectDetails({work:'Instalación BMS',context:'Contexto interno',reference:'Fuente privada',source:'Folleto'}),false);
  assert.equal(hasProjectDetails({description:'   ',photos:[]}),false);
  assert.equal(hasProjectDetails({description:'Rack en proceso de armado.'}),true);
  assert.equal(hasProjectDetails({photos:[{image:'rack'}]}),true);
});

test('la galería manual conserva los límites, incluso con cero o una fotografía', () => {
  assert.equal(galleryIndex(0,-1,3),0);
  assert.equal(galleryIndex(0,1,3),1);
  assert.equal(galleryIndex(2,1,3),2);
  assert.equal(galleryIndex(2,-1,3),1);
  assert.equal(galleryIndex(0,1,1),0);
  assert.equal(galleryIndex(0,1,0),0);
});

test('la presentación separa sector y especialidad sin alterar la fuente del proyecto', () => {
  const project={id:'pinero',sector:'Redes y comunicaciones'};
  assert.equal(projectSector(project,{sectorById:{pinero:'Institucional'}}),'Institucional');
  assert.equal(project.sector,'Redes y comunicaciones');
  assert.equal(projectSector({id:'otro',sector:'Salud'},{sectorById:{}}),'Salud');
});
