// Pasa la batería de tests/probar-motor.html (motor, traductor de errores, revisor).
// Uso: node tests/navegador/cdp.mjs esc-motor.mjs
export default async function (b) {
  await b.tam(1280, 900);
  await b.ir("tests/probar-motor.html");
  await b.hasta("!document.querySelector('[data-resumen]').textContent.includes('Comprobando')", 120000);
  b.log(await b.eval("document.querySelector('[data-resumen]').textContent"));
  b.log(await b.eval("[...document.querySelectorAll('[data-lista] li')].map(li => li.textContent).join('\\n')"));
}
