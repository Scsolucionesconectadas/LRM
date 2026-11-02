const internal = /Intervención publicada|Sobre esta referencia|referencia institucional|folleto institucional|archivo institucional|material institucional|imagen ilustrativa|\bilustrativa\b|Demo local|Lorem ipsum|\bTODO\b/i;
export function pagesWithMetadata(routes, copy) {
  const titles = new Set();
  return routes.map(route => {
    const seo = copy.pages[route.slug || 'inicio'];
    if (!seo || typeof seo.title !== 'string' || !seo.title.trim() || typeof seo.description !== 'string' || !seo.description.trim()) throw new Error(`SEO incompleto: ${route.slug || 'inicio'}`);
    const key = seo.title.trim().toLocaleLowerCase('es-AR');
    if (titles.has(key)) throw new Error(`Título SEO duplicado: ${seo.title}`);
    titles.add(key);
    return { ...route, title: seo.title.trim(), description: seo.description.trim() };
  });
}
export function validateEditorial(value, path = 'contenido') {
  if (typeof value === 'string' && internal.test(value)) throw new Error(`Nota editorial interna en ${path}`);
  if (Array.isArray(value)) value.forEach((item, i) => validateEditorial(item, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) validateEditorial(item, `${path}.${key}`);
}
