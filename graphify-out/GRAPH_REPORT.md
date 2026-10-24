# Graph Report - sqlearning  (2026-10-24)

## Corpus Check
- 151 files · ~892,080 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: .css 8, (none) 4)

## Summary
- 605 nodes · 911 edges · 124 communities (23 shown, 101 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 80 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4219dd15`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Contrato de formato de nivel
- Plan del curso y casos
- Datos y trama de Faro
- Generador de datos
- Motor de lecciones (leccion.js)
- Motor SQL (WASM)
- Laboratorio y papel
- Revisor SQL
- Editor SQL
- Graficos
- Progreso y credenciales
- Musica
- Tablero
- Agente alumno novato y revisiones
- package.json
- Pruebas de lecciones
- Prologo
- Resultados
- Traductor de errores
- CLAUDE.md
- generar-hector.mjs
- motor-worker.js
- generar-ciudad.mjs
- sw.js
- ref_node_fs
- servir.mjs
- version.mjs
- generar-retratos.mjs

## God Nodes (most connected - your core abstractions)
1. `Datos de Faro por etapa (faro-eN.sql)` - 28 edges
2. `Contrato de formato de nivel` - 21 edges
3. `QA · revisión final antes de publicar (2026-10-17)` - 15 edges
4. `pasoConRevision()` - 14 edges
5. `Pagina de leccion (diligencia)` - 14 edges
6. `crear()` - 13 edges
7. `SQLearning: curso-juego de SQL con misterio` - 13 edges
8. `Pagina de inicio (prologo + hoja de ruta)` - 11 edges
9. `insertar()` - 10 edges
10. `marcarSuperado()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `💚 Lo que funciona bien` --references--> `fecha()`  [INFERRED]
  docs/revisiones/2026-10-17-alumno-final.md → herramientas/generar-datos.mjs
- `🟡 F2 · `interpretar`: respuestas correctas y naturales que se rechazan` --references--> `interpretar()`  [INFERRED]
  docs/revisiones/2026-10-17-qa-final.md → js/leccion.js
- `QA · revisión final antes de publicar (2026-10-17)` --references--> `interpretar()`  [INFERRED]
  docs/revisiones/2026-10-17-qa-final.md → js/leccion.js
- `🟡 F6 · Editor (>300 líneas): al agrandarlo sin escribir ni desplazar, las líneas de abajo quedan invisibles` --references--> `pintarVisible()`  [INFERRED]
  docs/revisiones/2026-10-17-qa-final.md → js/editor-sql.js
- `Otras notas (sin gravedad)` --references--> `rellenarMeses()`  [INFERRED]
  docs/revisiones/2026-10-17-qa-final.md → js/grafico.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cadena de casos del misterio de Faro** — docs_plan_curso_e1_09_inventario_imposible, docs_plan_curso_e2_09_clientes_madrugada, docs_plan_curso_e3_09_reembolsos_disparados, docs_plan_curso_e4_10_pedidos_fantasma, docs_plan_curso_e5_11_una_sola_direccion, docs_plan_curso_e6_12_cuenta_admin_temp, docs_plan_curso_e7_11_coartada_ivan [EXTRACTED 0.95]
- **Misterio: Hector, admin_temp y pista falsa de Ivan** — docs_historia_hector_vidal, docs_historia_admin_temp, docs_historia_ivan_soler, docs_historia_el_fantasma [EXTRACTED 1.00]
- **Paginas web de SQLearning** — index_inicio, laboratorio_laboratorio_pagina, leccion_leccion_pagina [EXTRACTED 1.00]
- **Agentes del proyecto SQLearning** — _claude_agents_alumno_novato_alumno_novato, _claude_agents_profesor_sql_profesor_sql, _claude_agents_qa_estres_qa_estres [INFERRED 0.85]
- **Serie de revisiones alumno y QA del curso** — docs_revisiones_2026_10_15_alumno_etapas_0_2, docs_revisiones_2026_10_15_alumno_etapas_3_4, docs_revisiones_2026_10_16_alumno_etapas_5_7, docs_revisiones_2026_10_15_qa_etapas_0_2, docs_revisiones_2026_10_15_qa_etapas_3_4, docs_revisiones_2026_10_15_qa_fase2, docs_revisiones_2026_10_16_qa_etapas_5_7 [INFERRED 0.85]

## Communities (124 total, 101 thin omitted)

### Community 0 - "Contrato de formato de nivel"
Cohesion: 0.06
Nodes (43): Ciudad neon SVG (generar-ciudad.mjs), Ambientes Trabajo e Historia, Estetica cyberpunk/retrowave, css/tema.css (variables de color), Contrato de formato de nivel, js/curso.js ETAPAS (indice del curso), Paso arreglar, Paso caso (+35 more)

### Community 1 - "Plan del curso y casos"
Cohesion: 0.07
Nodes (50): Plan del curso SQLearning, Cuenta admin_temp, CTE y CTE recursiva, Caso e1-09 El inventario imposible, Caso e2-09 Clientes de madrugada, Caso e3-09 Reembolsos disparados, Caso e4-10 Pedidos fantasma, Caso e5-11 Una sola direccion (+42 more)

### Community 2 - "Datos y trama de Faro"
Cohesion: 0.08
Nodes (45): Agente profesor-sql, 9 clientes falsos @correo-rapido.example, Coartada de Ivan: vacaciones y fichajes de Hector, Datos de Faro por etapa (faro-eN.sql), herramientas/generar-datos.mjs (semillas fijas), Pista falsa: direccion unica de los falsos = Ivan, Reclamacion de Iratxe Munoz (pedido 2210), Producto Auriculares Sonora Pulse con stock -12 (+37 more)

### Community 3 - "Generador de datos"
Cohesion: 0.11
Nodes (38): ALMACEN_DE, almacenes, azar(), CALLES, CP_DE, DIRECCION_IVAN, email(), empleados (+30 more)

### Community 4 - "Motor de lecciones (leccion.js)"
Cohesion: 0.17
Nodes (32): actualizarNav(), arreglar(), aviso(), botonesEditor(), cabeceraPersonaje(), cargarScript(), caso(), ejecutar() (+24 more)

### Community 6 - "Motor SQL (WASM)"
Cohesion: 0.23
Nodes (18): arrancar(), cargarDatos(), crearDb(), crearWorker(), ejecutar(), enCola(), enviar(), errorAlumno() (+10 more)

### Community 7 - "Laboratorio y papel"
Cohesion: 0.18
Nodes (10): ejecutar(), mostrar(), barajar(), clasificar(), mover(), diagrama(), lineas(), pintar() (+2 more)

### Community 8 - "Revisor SQL"
Cohesion: 0.22
Nodes (15): bienEscrita(), clavesOrden(), comparar(), consejoTrampa(), iguales(), normalizarTexto(), ordenCorrecto(), ordenImporta() (+7 more)

### Community 9 - "Editor SQL"
Cohesion: 0.09
Nodes (28): 🟡 F10 · 1024 px: el número de cuenta se parte y deja «4417» sola, 🟡 F11 · El acceso desde EXP.8 y la propia página usan reglas distintas para «resuelto», 🟠 F1 · Sin conexión: PostgreSQL no se guarda al instalar; si no se abrió una diligencia con red, ninguna funciona, 🟡 F2 · `interpretar`: respuestas correctas y naturales que se rechazan, 🟡 F3 · e8-12 parte 3: con `mes` como fecha suspende con un motivo falso, 🟡 F4 · Retos que aprueban con constantes si se nombran las tablas en un `FROM` de adorno, 🟡 F5 · `COPY … TO STDOUT` al pulsar «Revisar» no da el error explicado, 🟡 F6 · Editor (>300 líneas): al agrandarlo sin escribir ni desplazar, las líneas de abajo quedan invisibles (+20 more)

### Community 10 - "Graficos"
Cohesion: 0.26
Nodes (16): Otras notas (sin gravedad), analizar(), analizarForma(), ancho(), barraH(), barras(), crearTooltip(), demasiadas() (+8 more)

### Community 11 - "Progreso y credenciales"
Cohesion: 0.25
Nodes (14): ajustar(), anadirPista(), autorizacion(), cargar(), darCredencial(), disponible(), entrarPrueba(), etapaAbierta() (+6 more)

### Community 12 - "Musica"
Cohesion: 0.32
Nodes (12): alInteractuar(), aplicarVolumen(), callar(), cargar(), cruzar(), iniciar(), intentar(), montar() (+4 more)

### Community 13 - "Tablero"
Cohesion: 0.32
Nodes (13): ajustes(), alternar(), cabecera(), celda(), dialogoCredenciales(), dialogoExpediente(), dibujarHilos(), estadoEtapa() (+5 more)

### Community 14 - "Agente alumno novato y revisiones"
Cohesion: 0.22
Nodes (9): Agente alumno-novato (Sergio), Informes en docs/revisiones, Sergio, alumno novato de 34 anos, Gravedades de informe (bloqueante, confuso, mejorable, historia), Ataques al motor SQL (destructivo, recursos, raro, trampas), Escenarios tests/navegador/agentes y arnes cdp.mjs, Agente qa-estres, Medicion de rendimiento (+1 more)

### Community 16 - "package.json"
Cohesion: 0.18
Nodes (10): description, name, private, scripts, datos, publicar, servir, test (+2 more)

### Community 17 - "Pruebas de lecciones"
Cohesion: 0.12
Nodes (7): 🔴 Bloqueante, 🟠 Confuso, 🕵️ Historia, 💚 Lo que funciona bien, 🟡 Mejorable, Revisión como alumno: etapa 8 (Analítica) y final del curso (Sergio, 34 años, novato), valor()

### Community 18 - "Prologo"
Cohesion: 0.43
Nodes (7): iniciar(), empezar(), mostrar(), siguiente(), terminar(), piezas(), pintarVoz()

### Community 19 - "Resultados"
Cohesion: 0.47
Nodes (3): aviso(), celda(), tabla()

### Community 105 - "generar-hector.mjs"
Cohesion: 0.12
Nodes (8): BAYER, C, DIGITOS, FIGURA, L, LINEAS, numero, rejilla

### Community 106 - "motor-worker.js"
Cohesion: 0.25
Nodes (6): ACCIONES, limpiarFila(), PARSERS, resultado(), TIPOS, turno

### Community 107 - "generar-ciudad.mjs"
Cohesion: 0.29
Nodes (9): capa(), entre(), faro(), LETRAS, r1(), rnd, ruta(), SALIDA (+1 more)

### Community 125 - "servir.mjs"
Cohesion: 0.33
Nodes (3): PUERTO, RAIZ, TIPOS

### Community 127 - "generar-retratos.mjs"
Cohesion: 0.25
Nodes (10): BAYER, cabeza(), COMUN, dir, L, luz(), pelo(), PERSONAJES (+2 more)

## Knowledge Gaps
- **19 isolated node(s):** `Ambientes Trabajo e Historia`, `Paso explicacion`, `Paso interpretar`, `Paso prediccion`, `Paso quiz` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 236 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **101 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `QA · revisión final antes de publicar (2026-10-17)` connect `Editor SQL` to `Graficos`, `Motor de lecciones (leccion.js)`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Pagina de leccion (diligencia)` (e.g. with `Contrato de formato de nivel` and `Paso reto`) actually correct?**
  _`Pagina de leccion (diligencia)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Ambientes Trabajo e Historia`, `Paso explicacion`, `Paso interpretar` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Contrato de formato de nivel` be split into smaller, more focused modules?**
  _Cohesion score 0.06108597285067873 - nodes in this community are weakly interconnected._
- **Should `Plan del curso y casos` be split into smaller, more focused modules?**
  _Cohesion score 0.07058823529411765 - nodes in this community are weakly interconnected._
- **Should `Datos y trama de Faro` be split into smaller, more focused modules?**
  _Cohesion score 0.07918552036199095 - nodes in this community are weakly interconnected._
- **Should `Generador de datos` be split into smaller, more focused modules?**
  _Cohesion score 0.11201079622132254 - nodes in this community are weakly interconnected._