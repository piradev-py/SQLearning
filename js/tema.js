/* ============================================================
   SQLearning · Tema noche (neón, por defecto) / día
   Se guarda en localStorage (si falla, funciona igual en noche).
   Cualquier botón con [data-tema] lo alterna.
   ============================================================ */
(function () {
  const CLAVE = "sqlearning-tema";
  const ETIQUETA = { dark: "🌙 Noche", light: "☀️ Día" };

  const leer = () => {
    try { return localStorage.getItem(CLAVE) === "light" ? "light" : "dark"; } catch (e) { return "dark"; }
  };
  function aplicar(tema) {
    document.documentElement.setAttribute("data-theme", tema);
    document.querySelectorAll("[data-tema]").forEach(b => {
      b.textContent = ETIQUETA[tema];
      b.setAttribute("aria-label", `Tema: ${tema === "dark" ? "noche" : "día"}. Pulsa para cambiarlo`);
    });
  }

  aplicar(leer());
  document.addEventListener("DOMContentLoaded", () => aplicar(leer()));
  document.addEventListener("click", ev => {
    if (!ev.target.closest("[data-tema]")) return;
    const siguiente = leer() === "dark" ? "light" : "dark";
    try { localStorage.setItem(CLAVE, siguiente); } catch (e) { /* sin guardado */ }
    aplicar(siguiente);
  });

  window.TEMA = { aplicar, leer };
})();
