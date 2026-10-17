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
  - [x] F16 · editor lento con textos enormes (500 líneas: 58 → 21 ms/tecla): con más de 300 líneas solo se pinta lo visible
  - [x] Dos pestañas del laboratorio se pisan el borrador: cada pestaña guarda el suyo en `sessionStorage`; `localStorage` para la próxima
  - [x] Sin conexión: `sw.js` guarda páginas, lecciones, datos, PGlite y fuentes; versión ligada a `npm run version`; batería `esc-sin-conexion.mjs` (apaga el servidor)
  - [x] GitHub Pages sirve wasm/data con gzip (10,5→3,7 MB y 6,2→1,8 MB)
- [x] ~~Revisión fin de fase 3 (interfaz)~~ → sustituida por las revisiones de las etapas 0–7 y la revisión final (decisión del usuario)
- [x] ~~Revisión etapa 1 antes de publicar (las dos)~~ → sustituida por la revisión final

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
- [x] ~~Revisión fin de fase 3 (`qa-estres` + `alumno-novato` con e0-01 y e1-01)~~ → sustituida por la revisión final

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
## Etapa 4 · Logística
- [x] Datos `faro-e4.sql` (almacenes, transportistas, envíos, `empleados.jefe_id`; e1–e3 sin cambios) y cifras en `docs/DATOS.md`
- [x] Temario detallado (10 niveles) y **etapa completa** (2 agentes `profesor-sql`; verificador 47/47, `npm test` verde). Cifras deducidas por los profesores comprobadas con PGlite; corregido un falso positivo («uso estrella»)

- [x] Revisión de las etapas 3 y 4: `qa-estres` hecha (`docs/revisiones/2026-10-15-qa-etapas-3-4.md`, 🔴1 🟠4 🟡17). Arreglados F1 (texto
  largo congelaba el gráfico: recorte por bisección con tope), F2 (valores gigantes, diminutos, infinitos o NaN: aviso; tope de marcas),
  F3 (pestañas de la lección con flechas/Inicio/Fin), F4 (variable `--oro` por tema, franja MODO PRUEBA legible, velos de diálogo con el color
  del tema), F5 (retos que se aprobaban escribiendo la cifra: la comprobación ya no la muestra y exige consultar la tabla) y de los menores:
  todo NULL avisa, comillas invertidas en nombres de columna, etiquetas del eje X recortadas y ancladas, foco al repintar, doble clic en
  «Siguiente», indicador del caso, parte del caso guardada al recargar, «%»/«#»/«pedido» en respuestas numéricas, tolerancia 0,05,
  más formas de respuesta en e3-09/e4-03/e4-10, acentos de día ≥ 4,5:1 sobre la cabecera, botón de tema sin partir.
  Quedan (menores):
  - [x] Retos que aprueban por casualidad de los datos (e3-03, e3-05, e3-06 orden, e3-07 `>= 15`, e4-05): comprobaciones sobre el código con `PRUEBA.codigo()`; regresión en `agentes/qa5-retos.mjs`
  - [x] e4-06: `COALESCE(SUM(...), 0)` se rechaza sin decir por qué → ahora se acepta
  - [x] `UPDATE` dentro de un CTE altera lo que ve la comprobación: los retos cuya solución solo consulta corren en `READ ONLY`
  - [x] `COPY … TO STDOUT` dice «Consulta ejecutada» sin más → error explicado, como `FROM STDIN`
- [x] Revisión de las etapas 3 y 4: `alumno-novato` hecha (`docs/revisiones/2026-10-15-alumno-etapas-3-4.md`, nota 8/10). Arreglados:
  el **Almacén central ya no señala a Héctor** (nuevo empleado 23, Iker Salas, jefe de muelle que depende de él; 23 empleados en e4),
  **altas antes del primer pedido** (las 11 que no lo cumplían pasan a la víspera; falsos: 4 mar–30 abr 2026), mensajes de error de JOIN
  (alias, columna de otra tabla, JOIN sin ON, CROSS JOIN con ON, ORDER BY antes de INTERSECT), alias en HAVING/WHERE, WHERE tras GROUP BY,
  columna del ORDER BY en 42803, self join sin alias, avisos de `= NULL` y `100.000`, «260 clientes»/«el pedido 2210» aceptados,
  e4-01 acepta JOIN, e3-08 exige desempate, e3-05 no marca las sumas si solo falla el orden, e3-07 rechaza `>= 15`, erratas
  (e4-10 «devuelto», e4-06 «lo vendido», e3-05 predicción, café repetido) y botón «Ver mi resultado» en «Diligencia superada».
  Quedan (menores):
  - [x] e3-09 partes 1 y 2: sin `ORDER BY tienda_id` aprueba (ahora exige ORDER BY) (el GROUP BY ya lo da en orden por casualidad)
  - [x] Gráfico de líneas por mes: los meses sin filas no salen y el eje los junta → salen como hueco (sin inventar ceros), con nota que sugiere `generate_series`; un valor aislado lleva su punto
  - [x] Noche: en gráficos de 5 líneas, las series 2 y 4 (magenta y violeta) se distinguen poco → violeta `#9085e9` (ΔE 15 → 20,6, validado)
  - [x] e3-03: la comprobación del reto muestra las cifras antes de escribir nada → ya no (revisados los demás retos: solo pasaba aquí)

## Etapa 5 · Migración
- [x] Datos `faro-e5.sql` (CRM antiguo sucio + fichas de empleados; pista falsa contra Iván, decisión del usuario), temario (11 niveles) y **etapa completa** (2 agentes `profesor-sql`; verificador 58/58). Cifras de los profesores comprobadas con PGlite

## Etapa 6 · IT
- [x] Datos `faro-e6.sql` (cuentas, auditoría con el rastro de admin_temp, stock por tienda), temario (12 niveles) y lecciones e6-01…e6-12 (2 agentes `profesor-sql`). Verificador: todas en verde tras corregir el total de stock de e6-08 (1 648)
- [x] `npm test` completo en verde (7/7)

## Etapa 7 · Dirección
- [x] Datos `faro-e7.sql` (vacaciones, fichajes, sesiones: la coartada de Iván y Héctor en Getafe), temario (11 niveles) y lecciones e7-01…e7-11 (2 agentes `profesor-sql`). Verificador 81/81
- [x] Revisión etapas 5–7: `qa-estres` hecha (`docs/revisiones/2026-10-16-qa-etapas-5-7.md`, 🔴1 🟠3 🟡9). Arreglados todos: F1 (`COMMIT; BEGIN; <error>` dejaba cambios: se recarga si el alumno escribió COMMIT/ROLLBACK/END/ABORT), F9 (marca con valor al azar por sesión), F2 (zona horaria UTC en cada sesión), F3 (e7-11 parte 2 exige consultar las tablas), F4/F11/F12/F13 (traductor: 2BP01, 428C9, SAVEPOINT, vistas, regex, ventanas, recursión, detalle de claves en español, intervalos, subconsulta con varias columnas), F5 (e6-04/05 prueban reglas también tras COMMIT; e6-06 cuenta filas cambiadas sin depender del txid), F6 (e6-07 código inicial), F7 (e6-10 exige el plan con el índice y admin_temp), F8 (BEGIN/COMMIT en comentarios o textos no cuentan), F10 (JSON se ve como JSON). Regresiones en `tests/probar-motor.html`
- [x] Revisión etapas 5–7: `alumno-novato` hecha (`docs/revisiones/2026-10-16-alumno-etapas-5-7.md`, nota 8/10, 🔴0 🟠5 🟡8). Arreglados: aviso de GROUP BY con alias igual a la columna (e5-02, e5-06, e5-10), resultado de DDL y tabla «que no existe» recuerdan que todo se deshace, comprobar con SELECT en la misma ejecución (e6-02, e6-06, e6-07), mensaje de alias en el mismo SELECT, START TRANSACTION aceptado, EXTRACT sobre texto, ROUND con double precision, e7-06 con COUNT(CASE…), e6-12 exige filtrar por tabla, caso e7-11 renombrado «¿Dónde estaba cada uno?» (no destripa)
  Quedan (menores): e7-03 p3 sin correlación solo dice «te falta 1 fila»; coma olvidada antes de `UNIQUE (…)` da «algo mal escrito cerca de (»; e5-08 p8 `COUNT(*)` en vez de contar entregas; e6-01 p5 acepta sin el `SELECT`

## Etapa 8 · Analítica
- [x] Plan detallado etapa 8 (12 niveles) en `docs/PLAN_CURSO.md`, con los datos nuevos que necesita `faro-e8.sql`
- [x] Datos `faro-e8.sql` (octubre 1–14 con Barcelona, `sesiones_web`/`eventos_web` con la prueba A/B, `abonos`,
  `fichas_empleados.cuenta_nomina`, admin_temp desactivada) y cifras en `docs/DATOS.md` (2,1 MB; comprobado con PGlite en Node: `herramientas/consultar.mjs`)
- [x] Lecciones e8-01…e8-12 (2 agentes `profesor-sql`; verificador 93/93 a la primera; cifras «(verificar)» comprobadas con PGlite)
- [x] Pantalla final `caso-cerrado.html` (expediente final con retrato en pixel art de Héctor, pruebas, sello, desenlace y epílogo); sello CASO CERRADO al resolver e8-12; pruebas en `esc-inicio.mjs`
- [x] Revisión final · `qa-estres` hecha (`docs/revisiones/2026-10-17-qa-final.md`, 🔴0 🟠1 🟡10). Arreglados: F1 (sin conexión,
  PGlite se guarda al instalar; mensaje propio sin red; la batería ya no abre nada con red antes de apagar el servidor), F2
  (respuestas escritas: sí/no por la primera palabra salvo «no sé», nombres contenidos salvo negados, «ninguna»/«cinco»,
  `49,505.85`, el número del % con varios; tolerancias 0,05), F3 (enunciado de e8-12 parte 3), F4 (e8-08 y e8-12 exigen
  contar), F5 (`COPY` al revisar), F6 (`ResizeObserver` en el editor), F7 (`npm run publicar` y `npm test` comprueba que la
  versión coincide), F9 (desempate en e8-07), F10 (cuenta sin partir), F11 (`PROGRESO.casoCerrado()`), y lo que vio al
  repasarlo: el alias «alta» en e8-03. Regresiones en `tests/probar-motor.html`. Queda aceptado F8 (el desenlace se lee en el
  código, como las soluciones).
- [x] Revisión final · `alumno-novato` hecha (`docs/revisiones/2026-10-17-alumno-final.md`, nota 8,5/10; 🔴2 🟠6 🟡7 🕵️3)

## Para terminar y publicar (siguiente sesión; el usuario pidió hacerlo paso a paso y «que quede perfecto»)
### A. Arreglos de la revisión del alumno (números del informe)
- [ ] 1 · e8-07 reto: la comprobación del desempate debe aceptar posiciones (`ORDER BY 3 DESC, 1`), no solo el texto `producto_id`
- [ ] 2 · e8-12 parte 7: exigir `FULL JOIN` (un `JOIN` interior da lo mismo con estos datos pero no prueba nada)
- [ ] 3 · traductor: 22012 con división de enteros → «¿Has dividido dos enteros? multiplica por 1.0 antes» (no solo NULLIF)
- [ ] 4 · traductor: alias de una letra que no existe (`t.ciudad` sin `AS t`) → «¿falta `AS t` detrás de la tabla?», no lo de las comillas; y e8-09 p5 decir `pedidos AS p` / `tiendas AS t`
- [ ] 5 · e8-08 p5: preguntar si la diferencia es **significativa** (o aceptar «sí» con mensaje sobre el z)
- [ ] 6 · Hoja de ruta: el enlace al expediente final no puede quedar dentro de EXP.8 plegado (sacarlo fuera o no plegar); botón «Ver el expediente final» junto al sello en la portada
- [ ] 7 · e8-01 reto: «desde el 2026-07-01 y antes del 2026-10-01» + comprobaciones propias (clientes distintos, 30 de septiembre entero)
- [ ] 8 · e8-02 p5: el ejemplo debe ser la autounión (YoY), no el YTD
- [ ] 9 · Comprobaciones propias en errores ya explicados: e8-01 p6 (`100.0` después de dividir), e8-04 p4 (eventos ≠ sesiones), e8-04 p8 (división entera), e8-03 p6 (sin DISTINCT), e8-05 p4, e8-12 p9 (`::date`)
- [ ] 10 · Diálogo final de e8-12: dos líneas + botón grande «Abrir el expediente final», abierto arriba; desenlace y epílogo solo en `caso-cerrado.html` (acortar `expediente.texto` de e8-12)
- [ ] 11 · «la dirección de Olmo» → «la dirección de la calle Olmo»
- [ ] 12 · e8-12 p2/p7: decir que las combinaciones con 0 noches no salen como fila
- [ ] 13 · e8-10 p6: `pedidos` sin decimales (redondear solo importes) · 14 · ejercicios de e8 con el ejemplo ya en el editor · 15 · e1-01 «Bienvenida» → «Te damos la bienvenida a Faro»
- [ ] 🕵️ «Tu expediente: … · 8 pistas» en `caso-cerrado.html`: enlazar el expediente de pistas

### B. «Lucía, en voz baja» (idea del usuario, 2026-10-18): notas de pasillo que dan trasfondo, desvían sospechas y cierran el «Ten cuidado. Puede que él también te esté buscando» del prólogo
- Mecánica propuesta (sin pasos nuevos): campo opcional `rumor: "…"` en la lección; `js/leccion.js` (`terminar`) lo muestra en «Diligencia superada» como tarjeta «Lucía, en voz baja». Documentarlo en `docs/FORMATO_LECCION.md` y el arco en `docs/HISTORIA.md` (reglas: antes de la etapa 7 Héctor solo amable/curioso, nunca sospechoso).
- Arco propuesto (**enseñarlo al usuario antes de escribirlo**): e1 Héctor pregunta quién es «el becario nuevo» (majo) · e1-09 Nuria pregunta si el stock negativo «ha salido en algún informe» · e2 Marcos agobiado por una clienta de Bilbao · e2-09 Iván pregunta quién consulta las altas a deshoras · e3 Elena nerviosa por su bonus · e3-09 Héctor, muy amable: «que me pida a mí los datos de logística» · e4 Iván pide un informe de quién mira los envíos · e4-10 Héctor pregunta qué hacías con los envíos de Getafe · e5 «Supe que Iván ha tenido problemas con la hipoteca…» · e5-11 Iván no viene a trabajar · e6 Iván da un portazo: «¿quién audita mis cuentas?» · e6-12 Héctor manda un comunicado «a disposición de quien investigue» (nadie le preguntó) · e7 Héctor quiere verte «para entender por qué miras los fichajes del almacén» · e7-11 Iván deja de dar portazos · e8 Héctor pregunta dos veces si has terminado «eso de los datos» · e8-11 alguien intentó entrar con tu usuario esta mañana (cierra el «te está buscando»).
- Cierre en el expediente final: una frase de Héctor, su motivo (deudas) y el giro: el rumor de la hipoteca de Iván lo había contado Héctor en la cafetería.

### C. Publicar
- [ ] `npm run publicar` (marca la versión y pasa `npm test`) → confirmar con el usuario → `git push` (GitHub Pages)


## Versión publicada
- [x] **Modo prueba y «desbloquear todo» solo en local** (`SOLO_LOCAL` en `js/progreso.js`): en la web publicada no se puede saltar a una diligencia (petición del usuario)
- [x] Test inestable: `esc-laboratorio` F3 (lista de sugerencias dentro del editor) falla de vez en cuando por tiempos → espera a que se coloque

## Al final: detalles visuales (decisión del usuario: primero lo técnico)
- [x] Prólogo definitivo del usuario (versión corta) en `js/prologo.js`; «cinco tiendas y una tienda online» como dice la locución; los datos tienen una 5.ª tienda física (Barcelona, recién inaugurada, sin pedidos)
- [x] Prólogo con movimiento reducido: frase a frase con un fundido de opacidad (sin desplazamiento), como sin movimiento reducido
- [ ] Figuras del ambiente historia (lluvia, carteles, siluetas de personajes, el Fantasma) — ver `docs/ESTILO.md`
- [ ] Pulido visual de la página de lección, pasos «sobre el papel» y pantalla de diligencia superada

## Decisiones abiertas
- (ninguna por ahora)
