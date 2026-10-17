/* ============================================================
   SQLearning · Expediente final (caso-cerrado.html)
   Se abre al resolver el caso final del curso; antes, sale CLASIFICADO.
   Las cifras son las del caso e8-12 (datos de semilla fija, ver docs/DATOS.md).
   ============================================================ */
(function () {
  // shortcut: noches de admin_temp copiadas de faro-e8 (semilla fija); si cambian los datos, sacarlas otra vez con
  // node herramientas/consultar.mjs faro-e8 "SELECT DISTINCT inicio::date FROM sesiones WHERE usuario = 'admin_temp' ORDER BY 1"
  const NOCHES = new Set(("03-04,03-06,03-07,03-09,03-13,03-16,03-17,03-20,03-23,03-26,03-30,03-31,04-02,04-05,04-09,04-12,04-14," +
    "04-16,04-17,04-20,04-21,04-23,04-26,04-28,04-30,05-02,05-03,05-06,05-11,05-20,05-21,05-22,05-25,05-26,05-27,05-30,06-11," +
    "06-12,06-13,06-19,06-20,06-25,06-28,07-09,07-16,07-18,07-25,07-26,07-28,07-30,08-02,08-04,08-07,08-08,08-11,08-12,08-13," +
    "08-15,08-16,08-19,08-20,08-21,08-23,08-25,08-29,09-06,09-07,09-09,09-10,09-14,09-15,09-19,09-23,09-24,09-27").split(","));
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre"];
  const $ = s => document.querySelector(s);

  const ultima = CURSO.ETAPAS[CURSO.ETAPAS.length - 1];
  const casoFinal = ultima.niveles[ultima.niveles.length - 1].id;
  const abierto = PROGRESO.completado(casoFinal) || PROGRESO.datos().credenciales.includes("exp-" + ultima.n);
  $("[data-clasificado]").hidden = abierto;
  $("[data-expediente]").hidden = !abierto;
  if (!abierto) return;

  // Calendario de marzo a septiembre de 2026, semanas de lunes a domingo; cada mes se lee como una imagen con su lista
  $("[data-calendario]").innerHTML = [3, 4, 5, 6, 7, 8, 9].map(m => {
    const mm = String(m).padStart(2, "0");
    const dias = new Date(Date.UTC(2026, m, 0)).getUTCDate();
    const hueco = (new Date(Date.UTC(2026, m - 1, 1)).getUTCDay() + 6) % 7;
    const marcadas = [];
    let celdas = '<i class="cc-fuera"></i>'.repeat(hueco);
    for (let d = 1; d <= dias; d++) {
      const noche = NOCHES.has(`${mm}-${String(d).padStart(2, "0")}`);
      if (noche) marcadas.push(d);
      celdas += `<i${noche ? ' class="cc-noche"' : ""}></i>`;
    }
    const etiqueta = `${MESES[m - 1]} de 2026: ${marcadas.length} noches (días ${marcadas.join(", ")})`;
    return `<figure class="cc-mes" role="img" aria-label="${etiqueta}"><figcaption aria-hidden="true">${MESES[m - 1].slice(0, 3)}</figcaption>
      <div class="cc-dias" aria-hidden="true">${celdas}</div></figure>`;
  }).join("");

  // Lo que se lleva el analista
  const d = PROGRESO.datos(), aut = PROGRESO.autorizacion();
  $("[data-tu]").textContent = `Tu expediente: ${d.creditos.toLocaleString("es")} ◈ · L${aut.nivel} ${aut.nombre} · ` +
    `${PROGRESO.totalBloques()} bloques verificados · ${d.expediente.length} pistas.`;
})();
