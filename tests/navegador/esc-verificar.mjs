// Verificador de lecciones: cada nivel listo cumple el formato y funciona (soluciones, iniciales, ejemplos…).
// Uso: node tests/navegador/cdp.mjs esc-verificar.mjs
export default async function (b) {
  await b.ir("tests/verificar-lecciones.html");
  await b.hasta("!document.querySelector('[data-resumen]').textContent.includes('Comprobando')", 300000);
  b.log(await b.eval("document.querySelector('[data-resumen]').textContent"));
  b.log(await b.eval("[...document.querySelectorAll('[data-filas] tr')].map(tr => [...tr.cells].map(c => c.innerText.trim()).join(' | ')).join('\\n')"));
}
