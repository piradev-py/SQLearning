# Pendientes de SQLearning

Lista viva de tareas y decisiones. Mantenerla al día.

## Fase 1 · Base
- [x] Repo propio (`main`), `docs/HISTORIA.md`, `docs/PLAN_CURSO.md`, `docs/FORMATO_LECCION.md`
- [x] Agente `.claude/agents/profesor-sql.md`
- [x] Servidor local (`npm run servir`)
- [x] Etapa 0 opcional «El archivo de papel» (petición del usuario) añadida al temario y al formato

## Revisiones periódicas (petición del usuario)
Agentes `.claude/agents/alumno-novato.md` (hace el curso como novato) y `.claude/agents/qa-estres.md` (intenta romper la app).
Solo escriben informes en `docs/revisiones/` y escenarios en `tests/navegador/agentes/`; no tocan la app.
**Cuándo:** al cerrar cada fase y cada etapa, y siempre antes de publicar. Primero `qa-estres`, luego
`alumno-novato` (nunca a la vez: comparten puertos). Tras cada revisión: el coordinador arregla, anota aquí lo que
quede pendiente y vuelve a pasar los tests.
- [x] Revisión fin de fase 2 (motor) — `qa-estres`, informe `docs/revisiones/2026-10-15-qa-fase2.md` (🔴1 🟠5 🟡19).
  Arreglados: F1–F15, F17–F19, F20 (Inicio/Fin, capa inert), F21, F22 (portada), F23 (ETag). Regresiones en
  `tests/probar-motor.html` (46/46) y `esc-laboratorio.mjs`. De paso: la regla de movimiento reducido creaba
  transiciones en todo (0.01ms → 0s) y el motor recargaba los datos en cada consulta (DISCARD ALL en bloque).
  Quedan pendientes (menores):
  - [ ] F16 · editor lento con textos enormes (500 líneas: 70 ms/tecla): repintar solo lo visible
  - [ ] Dos pestañas del laboratorio se pisan el borrador
  - [ ] Sin conexión: service worker para cachear PGlite y las fuentes (antes de publicar)
  - [x] GitHub Pages sirve wasm/data con gzip (10,5→3,7 MB y 6,2→1,8 MB)
- [ ] Revisión fin de fase 3 (interfaz)
- [ ] Revisión etapa 1 antes de publicar (las dos)

## Fase 2 · Motor
- [x] Vendorizar PGlite 0.5.10 (`vendor/pglite/`, 18,3 MB) en un Web Worker; corte a los 4 s con reinicio y recarga de datos
- [x] `herramientas/generar-datos.mjs` (semilla fija) → `datos/faro-e1.sql`
- [x] Traductor de errores (`js/traductor.js`), revisor (`js/revisor-sql.js`), `PRUEBA` (`js/pruebas.js`)
- [x] Batería `tests/probar-motor.html` + arnés `tests/navegador/cdp.mjs` (26/26)
- [x] Editor SQL propio (`js/editor-sql.js`): resaltado, números de línea, autocompletado según contexto, Ctrl+Enter, Tab/Mayús+Tab, Esc+Tab para salir, marca de línea con error
- [x] Vistas del resultado (`js/resultado.js`): tabla con tipos en español y NULL, fichas de esquema con claves, errores explicados
- [x] `laboratorio.html`: práctica libre, separador arrastrable, borrador guardado, ejemplos; prueba `esc-laboratorio.mjs`
- [x] Estética **cyberpunk/retrowave** (petición del usuario): tema noche neón por defecto + día; ciudad neón propia
  (`herramientas/generar-ciudad.mjs` → `recursos/ciudad-neon.svg`) con el faro; fuentes Orbitron + JetBrains Mono

## Fase 3 · Interfaz
- [x] Inicio: **prólogo obligatorio** (`js/prologo.js`, «Anteriormente en el caso…») → **hoja de ruta** como tablero holográfico (`js/tablero.js`, expedientes CLASIFICADOS, hilos de neón)
- [x] Progreso con **créditos ◈, bloques verificados, credenciales, autorización L1–L6**, turnos, expediente de pistas, modo prueba, reinicio (`js/progreso.js`); índice `js/curso.js`; prueba `esc-inicio.mjs`
- [x] Página de lección (`leccion.html` + `js/leccion.js`): todos los tipos de paso, pistas/solución, bloques y créditos, credenciales, pista del expediente, pantalla «Diligencia superada»; prueba `esc-leccion.mjs`
- [x] Pasos «sobre el papel» (`js/papel.js`): `clasificar` (también Venn), `seleccionar`, `ordenar`, `diagrama`, con clics y teclado; prueba `esc-papel.mjs`
- [x] Verificador de lecciones (`tests/verificar-lecciones.html`, `esc-verificar.mjs`) y `npm test` (todas las baterías)
- [x] Niveles de referencia: `e1-01` (SQL) y `e0-01` (sobre el papel)
- [ ] Revisión fin de fase 3 (`qa-estres` + `alumno-novato` con e0-01 y e1-01)

## Fase 4 · Primer hito jugable
- [x] Etapa 0 completa (10 niveles) y Etapa 1 completa (9 niveles): verificador 19/19 y `npm test` en verde
- [x] Música de fondo: playlist de 4 pistas en bucle con **crossfade** de 6 s, play/stop y volumen en todas las páginas, sigue donde iba al cambiar de página; locución solo en el prólogo, baja la música (`js/musica.js`, prueba `esc-musica.mjs`)
- [x] Volver de una lección o del laboratorio lleva a la hoja de ruta (`index.html#ruta`), sin repetir el prólogo
- [x] Audios hechos con Suno por el usuario (atribución en README y `docs/LICENCIAS.md`)
- [x] **Etapa 2 completa** (9 niveles, verificador 28/28, `npm test` verde)
- [x] Revisión de sección (etapas 0, 1 y 2): `qa-estres` hecha (`docs/revisiones/2026-10-15-qa-etapas-0-2.md`, 🔴1 🟠5 🟡17). Arreglados F1 (doble envío en casos), F2 (progreso entre pestañas), F3 (ayudas tras recargar), F4 (progreso corrupto validado pieza a pieza), F5 (e2-07 exige ILIKE), F6 (foco del teclado en clasificar y diagrama) y de los menores: diligencias no listas no se abren por URL, aviso de modo prueba en la lección, aviso si no se pudo guardar, una sola música con varias pestañas. `alumno-novato` hecha (`docs/revisiones/2026-10-15-alumno-etapas-0-2.md`, nota 8/10, 🔴0 🟠5): arreglados los mensajes «null» del traductor (comillas dobles con espacios, email sin comillas), e2-02 (`'tarjeta'` en minúsculas), e2-03 (reto sin mezclar AND/OR), e0-07 (dirección de 1:N con mensaje propio y etiquetas visibles), e0-01 (cualitativo/cuantitativo explicado antes del quiz), errata de seleccionar, spoilers (Getafe en e1-08, −12 en un ejemplo de e1-09): `qa-estres` (retomar la de fase 3, cortada por el límite de uso) + `alumno-novato`
- [x] **Publicado** (2026-10-15): https://piradev-py.github.io/SQLearning/ (repo público github.com/piradev-py/SQLearning, Pages desde `main`, `/`). Comprobado: PGlite viaja con gzip (≈6 MB la primera visita), laboratorio listo en ~1,8 s, lecciones y prólogo funcionan

## Etapa 3 · Ventas (preparación)
- [x] Datos `datos/faro-e3.sql` (`lineas_pedido` + `pedidos.mes`) y cifras en `docs/DATOS.md`; temario detallado en PLAN_CURSO
- [x] **Pestaña «Gráfico»** (`js/grafico.js`, `css/grafico.css`) en laboratorio y lección: barras/líneas automáticas, series por la 2.ª columna, un panel por medida, hover y teclado, paleta validada con la skill `dataviz`; campo de paso `grafico: true`; pruebas en `esc-laboratorio.mjs`
- [x] Nombre «SQLearning» en Sixtyfour (la del prólogo) en todas las cabeceras; la lección ahora lo muestra
- [x] Favicon en todos los tamaños + `apple-touch-icon`
- [x] El laboratorio carga los datos de la etapa más avanzada abierta y jugable (lo indica junto al título); prueba en `esc-laboratorio.mjs`
- [x] **Etapa 3 completa** (9 niveles, 2 agentes `profesor-sql`; verificador 37/37, `npm test` verde). Comprobado con SQL: sin empate en el corte del top 5 de e3-08, los ejemplos con HAVING devuelven filas, altas de Getafe desde marzo de 2026; corregido «cuatro tiendas físicas» (son cinco) y «entre 1 y 4 reembolsos» (hay meses con 0). Gráfico: miles con espacio («1 527»)
- [ ] Revisión del siguiente bloque (etapas 3 y 4, o 3–5): `qa-estres` + `alumno-novato` **cuando haya 2 o 3 expedientes nuevos** (decisión del usuario: se revisa por bloques, como el 0–2, no etapa a etapa)

## Al final: detalles visuales (decisión del usuario: primero lo técnico)
- [x] Prólogo definitivo del usuario (versión corta) en `js/prologo.js`; «cinco tiendas y una tienda online» como dice la locución; los datos tienen una 5.ª tienda física (Barcelona, recién inaugurada, sin pedidos)
- [ ] Prólogo con movimiento reducido: ¿frase a frase con fundido (sin movimiento) en vez de todo de golpe? (el Windows del usuario lo tiene activado)
- [ ] Figuras del ambiente historia (lluvia, carteles, siluetas de personajes, el Fantasma) — ver `docs/ESTILO.md`
- [ ] Pulido visual de la página de lección, pasos «sobre el papel» y pantalla de diligencia superada

## Decisiones abiertas
- (ninguna por ahora)
