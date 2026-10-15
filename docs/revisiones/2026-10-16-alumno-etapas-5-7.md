# Revisión como alumno: etapas 5, 6 y 7 (Sergio, 34 años, novato)

**Resumen**
- Recorrido: las 34 diligencias de las etapas 5 (Migración), 6 (IT) y 7 (Dirección) en Edge sin ventana y en modo prueba. Escribí intentos de novato con errores típicos y alternativas válidas en todos los ejercicios, arreglos, retos y casos (unos 150 envíos). Todas las diligencias se superaron y no hubo errores JS.
- Tiempo: unas 2 h de agente. Para un alumno real calculo entre 12 y 15 h.
- **Nota: 8/10.** Explicaciones muy cuidadas, buenos mensajes de error en general y un misterio que avanza bien. Fallan sobre todo algunos mensajes de fallo y varias reglas que no son iguales en todos los pasos.
- Lo más urgente: (1) la trampa del `GROUP BY alias` cuando el alias se llama igual que la columna (e5-02, e5-10); (2) en la etapa 6, el resultado no recuerda que un `CREATE` se deshace, y en unos ejercicios añadir un `SELECT` de comprobación da fallo y en otros no; (3) el mensaje de «alias en el WHERE», que sale también cuando el alias no está en ningún WHERE (e7-08) y pone un ejemplo que no sirve.
- Recuento: 🔴 0 · 🟠 5 · 🟡 8 · 🕵️ 1 (menor).

Escenarios en `tests/navegador/agentes/sergio57-recorrido.mjs` (copia del recorrido con intentos) y `sergio57-ejecutar.mjs` (botón Ejecutar).
Los pasos «sobre el papel» (e6-07 p8, e6-09 p2 y p5) no los probé como alumno: se resolvieron con la solución.

## 🟠 Confuso

1. **e5-02 p6 (reto) y e5-10 p2: `GROUP BY` con un alias que se llama igual que la columna.**
   - Qué hice: `SELECT INITCAP(TRIM(ciudad)) AS ciudad, COUNT(*) … GROUP BY ciudad` y `SELECT lower(trim(email)) AS email … GROUP BY email`. Es lo natural, y e5-06 p3 enseña después que «puedes escribir el alias en el GROUP BY».
   - Qué pasó: PostgreSQL agrupa por la columna original. En e5-02 solo salen tres comprobaciones en rojo sin explicación; en e5-10, «Te faltan 17 filas». Solo la pista 1 de e5-10 lo explica. El enunciado de e5-10 («agrupa por `email` … con ese alias») casi empuja a cometer el error.
   - Propuesta: avisarlo en la explicación de e5-06 p3 («si el alias coincide con una columna, gana la columna») y dar un mensaje propio cuando el `GROUP BY` usa un nombre que es a la vez alias y columna.

2. **Etapa 6 (e6-01 p3 y en general): no se ve que la ejecución se deshace.**
   - La explicación dice «el resultado te lo recuerda», pero solo pasa con DML. Tras `CREATE TABLE notas …;` sale «✔️ Consulta ejecutada. No devuelve ninguna tabla.», sin aviso. Al ejecutar después `SELECT * FROM notas;` sale «No existe ninguna tabla llamada notas. Mira los nombres en la pestaña Esquema», sin mencionar que se deshizo.
   - Con `INSERT` sí aparece «(Es práctica: al terminar se deshace sola.)».
   - Lo de «crea y consulta en la misma ejecución» se entiende bien gracias al texto y al quiz p7, pero en el momento del susto el mensaje no ayuda.
   - Propuesta: mostrar la misma nota tras DDL. Y en la etapa 6, que el 42P01 añada «¿La creaste en otra ejecución? Se deshizo: créala y consúltala en la misma».

3. **e6-02 p2, e6-06 p4 y e6-07 p9: el `SELECT` de comprobación unas veces se exige, otras se rechaza y otras da igual.**
   - Hice lo que enseña la etapa (crear o cambiar y comprobar en la misma ejecución): `INSERT …; SELECT * FROM empleados WHERE id = 24;` y `UPDATE …; SELECT …;`.
   - El revisor responde «Has escrito 2 consultas. Aquí se pide una sola». En e6-07 p9 el propio editor empieza con «Primero ejecuta el SELECT…; después cámbialo por el DELETE», y si lo dejo todo en la misma ejecución, el mismo error.
   - En cambio, e6-01 p5 acepta el `CREATE TABLE` sin el `SELECT` que pide el enunciado.
   - Propuesta: permitir `SELECT` finales en los ejercicios de DML (`varias: true`), o escribir «Una sola orden» en todos los enunciados donde se exija, y cambiar el comentario de e6-07 p9.

4. **Mensaje del alias: «X es un alias del SELECT y en el WHERE todavía no existe… por ejemplo SUM(cantidad)».**
   - En e7-08 p7, `…, LAG(facturacion) OVER (…) AS anterior, facturacion - anterior AS diferencia` da ese mensaje, pero ahí no hay ningún WHERE con el alias: el alias está en el mismo SELECT.
   - En e5-05 p8 (con un WHERE de verdad), el ejemplo `SUM(cantidad)` despista, porque un agregado tampoco vale en el WHERE.
   - Propuesta: «Un alias no se puede usar en el mismo SELECT ni en el WHERE: repite la expresión entera». Y quitar el ejemplo o poner uno no agregado.

5. **e6-08 p8 (reto): rechaza `START TRANSACTION`.**
   - e6-08 p1 dice que PostgreSQL también acepta `START TRANSACTION;`. Lo usé y la comprobación «Lo haces dentro de una transacción (BEGIN … COMMIT)» salió en rojo.
   - El enunciado pide `BEGIN`, así que el impacto es bajo, pero el curso rechaza algo que él mismo da por válido.
   - Propuesta: aceptar las dos formas.

## 🟡 Mejorable

6. **e5-07 p8:** `EXTRACT(YEAR FROM fecha_alta)` sobre texto da «La función pg_catalog.extract no existe o no acepta esos datos». La palabra `pg_catalog` asusta. Mejor: «fecha_alta es texto: conviértela primero con to_date».
7. **e7-10 p6:** `ROUND(percentile_cont(…), 2)` sin `::numeric` da «La función round no existe o no acepta esos datos». La lección lo explica, pero el mensaje podría recordarlo («¿falta `::numeric`?»).
8. **e7-03 p3:** un `NOT EXISTS (SELECT 1 FROM envios)` sin correlación da solo «Te falta 1 fila». Es justo el error del consejo de Lucía, así que el mensaje podría apuntar a la condición que une con la fila de fuera.
9. **e6-05 p7:** `dia date NOT NULL UNIQUE (empleado_id, dia)` (falta la coma antes de la regla de tabla) da «Hay algo mal escrito cerca de (». Podría sugerir «¿falta una coma antes de UNIQUE?».
10. **e7-06 p1:** dice «lo que hacías con `SUM(CASE WHEN … THEN 1 ELSE 0 END)`», pero e5-06 enseñó `COUNT(CASE WHEN … THEN 1 END)`. Mejor citar la forma que el alumno ya conoce.
11. **e6-12, parte 4:** la unión de auditoria con productos sin `a.tabla = 'productos'` se acepta por casualidad de los datos (los `registro_id` de pedidos y clientes no coinciden con ids de producto). Conviene que el enunciado diga «solo las filas de la tabla productos».
12. **e5-08 p8:** con `COUNT(*)` en vez de contar las entregas, solo sale una comprobación genérica en rojo. Podría decir «estás contando también los envíos sin entrega».
13. **e6-01 p5:** acepta el ejercicio sin el `SELECT` que pide el enunciado (relacionado con el punto 3).

## 🕵️ Historia

- Funciona: Iván es sospechoso en las etapas 5 y 6. En e5-11 la dirección de los 9 clientes falsos es la suya, y en e6-12 él creó admin_temp y la dejó activa. En la etapa 7 queda limpio: 14 acciones durante sus vacaciones sin sesiones ni fichajes, y la cuenta siempre se conectó desde ALM-GET-03.
- **Héctor no se señala antes de e7-11, parte 7.** Solo aparece como usuario `hector.vidal` si alguien lista `cuentas` por su cuenta. Lucía frena las acusaciones en cada cierre; está muy bien llevado.
- Menor: el título «Caso: La coartada de Iván», visible en la hoja de ruta, adelanta que Iván saldrá limpio. Si se quiere mantener la duda, valdría algo como «Caso: Dónde estaba cada uno».

## 💚 Lo que funciona bien

- La idea de que todo se deshace está bien explicada (e6-01 p3, quiz p7, e6-08 p1 «el entorno ya es una transacción») y no hubo bloqueos.
- Muchos errores traducidos son claros:
  - comillas dobles en un texto;
  - `WHERE` detrás de `ORDER BY`;
  - `DISTINCT` con `ORDER BY` de una columna que no se muestra;
  - falta el `;`;
  - «sobra la columna split_part».
- Las preguntas de negocio aceptan respuestas razonables: «9 direcciones», «36.470,20 €», «36470.2», «Hector» sin tilde, «Iván» o «ivan.soler», «alm-get-03», «17 minutos».
- Acepta alternativas válidas:
  - `LIKE '__/__/____'` en vez de una regex;
  - `NOT IN … WHERE responsable_id IS NOT NULL`;
  - `LEFT JOIN … GROUP BY` en vez de una subconsulta correlacionada;
  - recursiva que empieza en Elena con nivel 0 y la filtra después;
  - `UNION ALL` para los valores imposibles;
  - `CAST`, minúsculas, `int` y `bool`, `!=` y `<>`;
  - subconsulta en FROM sin alias;
  - el orden de los `REPLACE`.
- Las predicciones y quizzes explican bien el porqué (la trampa de `NOT IN` con NULL, `RANK` frente a `ROW_NUMBER`, la media de medias, `RANGE` frente a `ROWS`).
- La dificultad sube de forma gradual. El salto más grande, e7-11 parte 8 (UNION ALL + LAG + filtro), es razonable porque está en un caso.
