// Batería de los pasos sobre el papel (clasificar/Venn, seleccionar, ordenar, diagrama).
// Uso: node tests/navegador/cdp.mjs esc-papel.mjs
export default async function (b) {
  await b.ir("tests/probar-papel.html");
  await b.hasta("!document.querySelector('[data-resumen]').textContent.includes('Comprobando')", 20000);
  b.log(await b.eval("document.querySelector('[data-resumen]').textContent"));
  b.log(await b.eval("[...document.querySelectorAll('[data-lista] li')].map(li => li.textContent).join('\\n')"));
}
