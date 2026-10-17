# Revisión como alumno: etapa 8 (Analítica) y final del curso (Sergio, 34 años, novato)

**Resumen**
- Recorrido: las 12 diligencias de la etapa 8 en orden (e8-01 a e8-12, con las 9 partes de «Caso cerrado»), con progreso real de las etapas 0–7 completas. Después, el diálogo «Diligencia superada» de e8-12 y su botón «Abrir el expediente final», la pantalla `caso-cerrado.html` (escritorio y móvil), la portada con el sello «CASO CERRADO» y la hoja de ruta final. Al final, e1-01 con el progreso vacío. Unos 120 envíos, con errores de novato y alternativas válidas en todos los ejercicios, arreglos, retos y partes del caso. No hubo errores JS.
- Tiempo: unos 45 min de agente. Para un alumno real calculo entre 7 y 9 h para la etapa 8.
- **Nota: 8,5/10.** Es la etapa mejor escrita del curso: problemas de negocio de verdad, consejos de Lucía que enseñan oficio y un caso final que obliga a usar todo lo aprendido. El expediente final luce mucho.
- Lo más urgente: (1) el revisor rechaza `ORDER BY 3 DESC, 1` en e8-07 p6 y acepta un `JOIN` normal en la tabla de contingencia de e8-12 parte 7, que es precisamente la prueba de «ni una noche de más»; (2) tras cerrar el caso, la hoja de ruta pliega EXP.8 y esconde el único enlace al expediente final; (3) dos mensajes que mandan al alumno en la dirección equivocada (e8-08 p6 «dividiendo entre cero» cuando el problema es la división entera; e8-09 p5 «si es un texto, va entre comillas» cuando falta el alias `t`).
- Recuento: 🔴 2 · 🟠 6 · 🟡 7 · 🕵️ 3 (menores).

Escenarios en `tests/navegador/agentes/`:
- `sergio8-recorrido.mjs` con `sergio8-cfg-recorrido.json`: recorrido completo con progreso real 0–7, intentos y final del curso.
- `sergio8-revisar.mjs`: envíos sueltos en un paso, en modo prueba.
- `sergio8-ejecutar.mjs`: botón Ejecutar y pestaña Esquema.
- `sergio8-cfg-e1.json`: e1-01 con progreso vacío.
- `sergio8-cfg-lectura.json`: primera lectura.
- `sergio8-mira.mjs`: botones del paso «ordenar».

Fotos en `tests/navegador/salida/sergio8-*.png`.
No usé ninguna pista en el recorrido (3 bloques en todas). Algunas las leí aparte para valorarlas.

## 🔴 Bloqueante

1. **e8-07 p6 (reto): rechaza `ORDER BY 3 DESC, 1`.**
   - Qué hice: la consulta correcta, con `ORDER BY 3 DESC, 1 LIMIT 5` (y también con `FETCH FIRST 5 ROWS ONLY`). El resultado es idéntico al esperado, con el desempate bien hecho.
   - Qué esperaba: «Reto superado». El propio curso usa posiciones: `GROUP BY 1, 2 ORDER BY 1, 2` en el ejemplo de e8-12 p2, y e8-05 p2 me aceptó `ORDER BY 4 DESC, 1`.
   - Qué pasó: «✘ El ORDER BY desempata por producto_id». La comprobación busca el texto `producto_id` en el `ORDER BY`. Con `ORDER BY z DESC, u.producto_id` sí pasa.
   - Propuesta: que la comprobación acepte también la posición de la columna (o que mire el resultado con el orden de las filas empatadas cambiado, como en otras comprobaciones de desempate).

2. **e8-12 parte 7: la tabla de contingencia acepta un `JOIN` normal en vez del `FULL JOIN`.**
   - Qué hice: las dos CTE de fechas bien hechas, pero unidas con `FROM h JOIN s ON s.dia = h.dia`.
   - Qué esperaba: un fallo. Con un `JOIN` interior solo pueden salir las noches comunes, así que la casilla «uno sin el otro» sale vacía siempre, sea Héctor o cualquier otro. La explicación (p2) y el consejo de Lucía insisten justo en esto.
   - Qué pasó: «✔ Reto superado». Con estos datos el resultado coincide (una sola fila, true/true, 75), y el revisor no lo distingue.
   - Propuesta: una comprobación `PRUEBA` que añada una noche de admin_temp sin fichaje (o un fichaje de madrugada sin sesión) y exija que aparezca la fila false/true (o true/false). Es la prueba central del desenlace: un alumno que la apruebe con `JOIN` no ha entendido por qué demuestra algo.

## 🟠 Confuso

3. **e8-08 p6 (reto): la división entera da «Estás dividiendo entre cero. Usa NULLIF».**
   - Qué hice: `compra_a / carrito_a AS pa` (sin `* 1.0`), como haría un novato.
   - Qué pasó: `pa`, `pb` y `p` salen 0, el error estándar sale 0 y PostgreSQL divide entre cero. El mensaje manda poner `NULLIF`: si le hago caso, el z sale NULL y sigo sin saber qué pasa. Todas las comprobaciones salen en rojo.
   - Propuesta: si hay un 22012 y en la consulta hay una división entre dos `COUNT` o columnas enteras sin `100.0`, `1.0` ni `::numeric`, añadir «¿Has dividido dos enteros? 142 / 288 da 0 en PostgreSQL: multiplica por 1.0 antes».

4. **e8-09 p5 (ejercicio): falta el alias `t` y el mensaje habla de comillas.**
   - Qué hice: copié del enunciado `ORDER BY GROUPING(t.ciudad), t.ciudad` y escribí `FROM pedidos JOIN tiendas ON tiendas.id = pedidos.tienda_id`, sin `AS t`.
   - Qué pasó: «✘ Has escrito t.algo como si t fuera una tabla. Si es un texto (un email, un nombre…), va entre comillas simples: 'así'». No es un texto: me falta dar el alias. Un novato acabaría escribiendo `'t.ciudad'`.
   - Propuesta: si el nombre antes del punto es una sola letra o coincide con el inicial de una tabla del FROM, decir «No hay ninguna tabla ni alias llamado t en el FROM: ¿falta `AS t` detrás de `tiendas`?». Y en el enunciado: «une `pedidos AS p` con `tiendas AS t`», como ya dice la pista.

5. **e8-08 p5 (pregunta de negocio): «¿Cambia el ticket medio? Responde sí o no».**
   - Qué hice: calculé las medias (398,97 € frente a 423,81 €) y el z (0,45). Respondí «Sí, B tiene unos 25 € más de ticket medio».
   - Qué pasó: «✘ No es eso. Vuelve a mirar los datos». Los datos dicen lo que he escrito: la media cambia. Lo que no cambia es de forma significativa. Solo la pista lo aclara («la diferencia de ticket es la que daría la suerte. No cambia»).
   - Propuesta: preguntar «¿La diferencia de ticket medio es significativa (|z| > 1,96)?». O aceptar el «sí» con un mensaje propio: «La media sube, pero mira el z: ¿es más de lo que daría la suerte?».

6. **Hoja de ruta tras cerrar el caso: el enlace al expediente final queda escondido.**
   - Qué hice: volví a la portada después de ver el expediente final y pulsé «Continuar a la hoja de ruta».
   - Qué esperaba: ver en algún sitio «CASO CERRADO · Ver el expediente final».
   - Qué pasó: EXP.8 aparece plegado, como todos los cerrados («CERRADO · 12/12»), y el enlace `exp-final` está dentro del cuerpo plegado. Ni la portada ni la cabecera llevan a `caso-cerrado.html`. Para volver a ver la gran recompensa del curso hay que adivinar que se despliega EXP.8 (foto `sergio8-despues-tablero.png`).
   - Propuesta: sacar el enlace fuera del cuerpo (en la cabecera del expediente o como banda encima de la hoja de ruta), o no plegar EXP.8 cuando el caso está cerrado. En la portada, un botón «Ver el expediente final» junto al sello «CASO CERRADO» quedaría redondo.

7. **e8-01 p7 (reto): el enunciado dice «del 2026-07-01 al 2026-09-30» y eso invita a perder el último día.**
   - Qué hice: `fecha >= '2026-07-01' AND fecha <= '2026-09-30'`, que es lo que dice el enunciado al pie de la letra (y además `COUNT(cliente_id)` sin `DISTINCT`).
   - Qué pasó: solo sale «✘ Cada tienda con sus cinco KPI del trimestre». El mensaje es el mismo con los dos errores y también cuando arreglé solo uno, así que no sabía qué me quedaba. El resto de la etapa escribe «fecha >= … y < …», y aquí solo lo dice la pista 1. Lucía avisa del `COUNT(DISTINCT cliente_id)` en p3, pero no hay una comprobación propia.
   - Propuesta: escribir «(fecha desde el 2026-07-01 y antes del 2026-10-01)», como en e8-07, e8-09 y e8-11. Y añadir dos comprobaciones: «Cuentas clientes distintos» y «Entra el 30 de septiembre entero».

8. **e8-02 p5 → p7: el YoY con autounión solo se explica con palabras.**
   - La explicación p5 cuenta «une la tabla mensual consigo misma: `b.mes = a.mes - INTERVAL '1 year'`», pero el ejemplo del editor es el YTD con `FILTER`, no la autounión. El reto exige justo la autounión (o `LAG(…, 12)`) sin haberla visto funcionar.
   - Yo la saqué a la segunda (la primera se me coló octubre). Para Sergio de verdad es el salto más grande de la etapa antes del caso. La pista 1 es buena y lo resuelve.
   - Propuesta: que el ejemplo de p5 sea la autounión de dos o tres meses y dejar el YTD en el texto, o añadir un ejercicio corto de autounión antes del reto.

## 🟡 Mejorable

9. **Mensajes genéricos justo en los errores que la lección acaba de nombrar.** En todos estos casos solo sale «N no coinciden» o una comprobación genérica en rojo:
   - e8-01 p6: `… / COUNT(*) * 100.0` (el `100.0` después de dividir) da «5 no coinciden». Sería ideal «sigue saliendo 0: el 100.0 tiene que ir antes de dividir».
   - e8-04 p4: `COUNT(*)` en vez de `COUNT(DISTINCT sesion_id)` da «1 no coincide». El reto sí tiene la comprobación «cuentas sesiones, no eventos»; el ejercicio no.
   - e8-04 p8: la división entera en `conv_pago_compra` da una comprobación genérica. En e8-01 había una propia («¿división entera?»): se podría repetir aquí.
   - e8-03 p6: sin `DISTINCT` (cuenta pedidos, no clientes) da una comprobación genérica.
   - e8-05 p4: `ORDER BY r DESC` al final en vez de dar la vuelta al `NTILE` da «5 no coinciden».
   - e8-12 parte 9: `MIN(fecha)` sin `::date` da «Todas las cifras del informe coinciden» en rojo, sin decir cuál falla.

10. **El diálogo «Diligencia superada» de e8-12 se come el desenlace.**
    - El cuadro trae la pista «Caso cerrado» completa: las tres pruebas, los cabos sueltos, el desenlace y el epílogo. Son unas 20 líneas.
    - A 1366×900 se abre desplazado hacia abajo (el foco cae en los botones). Se pierde el título «Diligencia superada» y el primer golpe es un muro de texto (foto `sergio8-final-dialogo.png`).
    - Luego el expediente final cuenta lo mismo, así que el clímax se lee dos veces y la primera vez en el sitio menos vistoso.
    - Propuesta: en el diálogo, dos líneas («69 reembolsos, 36 470,20 €, la cuenta de nómina de Héctor Vidal. Caso cerrado.») y el botón «Abrir el expediente final» bien grande. El desenlace y el epílogo, solo en el expediente. Y que el diálogo se abra arriba.

11. **«igual que la dirección de Olmo de los clientes falsos»** (pista final, e8-12). Leído en frío, «Olmo» parece una persona. Mejor «la dirección de la calle Olmo».

12. **e8-12 partes 7 y 8: en la tabla de contingencia sale una sola fila (true, true, 75).** La explicación habla de «casillas» vacías, pero las combinaciones con 0 noches no aparecen. Lo entendí, pero Sergio podría pensar que su consulta está mal. Propuesta: una frase en p2 o en la parte 7: «las combinaciones sin ninguna noche no salen como fila: si solo ves true/true, las otras valen 0».

13. **e8-10 p6:** el enunciado pide redondear `valor` y `mes_anterior` a 2 en todas las filas, y la fila `pedidos` sale «202.00 · 191.00». Choca con el consejo de e8-11 («cifras pocas y redondeadas»). Se podría permitir enteros en `pedidos` o redondear solo los importes.

14. **En e8 los ejercicios empiezan con el editor vacío** y casi todos son «lo mismo que el ejemplo, pero…». Hay que volver con «‹ Anterior» para copiar el ejemplo. No es grave, pero dejar el ejemplo en el editor (como hacen los «arregla la consulta») ahorraría idas y venidas.

15. **e1-01, título «Bienvenida a Faro».** Se puede leer como femenino («bienvenida») por un alumno. «Bienvenido/a» queda raro; «Te damos la bienvenida a Faro» evita la duda. Muy menor.

## 🕵️ Historia

- **El desenlace se entiende y convence.** Las tres pruebas son independientes y las cifras cuadran en todas partes: diálogo, expediente final, partes del caso y lo que yo mismo consulté.
  - Comprobé por mi cuenta que ningún reembolso de admin_temp es anterior a su pedido, que todos caen dentro de una sesión de admin_temp y que cada abono coincide con el total de su pedido.
  - Solo Héctor tiene 75 entradas de madrugada; el siguiente empleado, 7.
  - Los cabos sueltos se atan bien: Iván y admin_temp en 2019, la calle Olmo de e5-11, Iratxe Muñoz y el pedido 2210 de etapas anteriores. Que Iván quede «todavía molesto» es un buen detalle humano.
- **Se queda algo corto en emoción.** Héctor no dice ni una palabra y no hay móvil: por qué lo hizo, si había deudas, si sospechaba que le seguíamos. Tampoco hay una escena con él, ni siquiera una línea. Tras ocho expedientes persiguiendo al Fantasma, una frase suya (o de Lucía contando cómo reaccionó) daría el cierre que el expediente visual merece. El «Ten cuidado. Puede que él también te esté buscando» del prólogo no se recoge en ningún sitio; sería el momento de cerrarlo.
- Sin spoilers en la etapa 8. Que la parte 6 pregunte «¿de quién es?» cuando la historia de p0 ya dice «si el patrón es de Héctor» resta algo de sorpresa, pero es coherente: el sospechoso venía de e7-11 y aquí se trata de demostrarlo, no de descubrirlo.
- Menor: la cabecera del expediente final dice «Tu expediente: … · 8 pistas». Está bien, pero ese «expediente» con las 8 pistas no se enlaza desde ahí (el botón 📁 Expediente está en la hoja de ruta).

## 💚 Lo que funciona bien

- **El expediente final** (`caso-cerrado.html`, fotos `sergio8-cc-0.png`, `sergio8-cc-1.png` y `sergio8-cc-movil-*.png`) es una recompensa de verdad:
  - el retrato pixel art de Héctor ante la regla de alturas;
  - el sello «CASO CERRADO» girado;
  - las tres pruebas numeradas;
  - el calendario de las 75 noches;
  - la ficha FARO-FANTASMA con las cifras que yo mismo calculé.
  En móvil se ve bien. El retrato tiene un `alt` descriptivo y el calendario tiene etiquetas accesibles por mes.
- **La portada al cerrar el caso:**
  - el prólogo quita «Ten cuidado…»;
  - lista las 8 pistas, de «El inventario imposible» a «Caso cerrado»;
  - muestra «Última diligencia: 8.12»;
  - termina con el sello «CASO CERRADO».
  Antes de la etapa 8 decía «CASO EN CURSO». La cabecera pasa a «L6 · Head of Data · Autorización máxima» y el diálogo de e8-10 anuncia el ascenso: encaja con el epílogo (Ana te ofrece el puesto).
- **Arreglado desde la revisión anterior:**
  - el mensaje del alias ahora dice «se crea en este mismo SELECT: ahí todavía no se puede usar… o calcúlala antes en una CTE» (e8-07 p3, e8-12 parte 1);
  - `ROUND` sobre double explica «conviértelo: ROUND(valor::numeric, 2)» (e8-06 p5).
- **Otros mensajes claros:**
  - las funciones ventana en `GROUP BY` (e8-05 p7);
  - `!= NULL` («con NULL no vale =», e8-08 p2);
  - comillas dobles;
  - falta el `;`;
  - «Sobra la columna mes» (e8-10 p2);
  - «¿Querías decir productos?» (e1-01).
- **Acepta alternativas válidas:**
  - `CASE WHEN` en vez de `FILTER`;
  - `LAG(…, 12)` en vez de la autounión;
  - `EXTRACT(YEAR …) = 2025` y `BETWEEN` en vez de rangos;
  - la columna `mes` de texto en vez de `fecha`;
  - ventana sobre agregado (`AVG(SUM(total)) OVER ()`) en vez de CTE;
  - `GROUP BY 1`, minúsculas, sin `AS`, `<>` y `!=`, `NULLIF`, `COALESCE` en el ROLLUP;
  - `FETCH FIRST`;
  - `ORDER BY 3 DESC` en e8-05.
- **Acepta respuestas escritas naturales:** «49.505,85 €», «49505,85», «36,5 %», «89,9 %», «5 meses», «hector», «Héctor Vidal», «ninguna», «0», «no cambia».
- **Las comprobaciones con `PRUEBA` hacen su trabajo:** «Cambiando solo la fecha de params a agosto…» (e8-10) detecta la fecha escrita a mano, y «la línea base de 2024–2025, no frente a todos los meses» (e8-12 parte 3) detecta el z contra todos los meses.
- **Las predicciones enseñan de verdad:**
  - `3 / 4` = 0;
  - eventos frente a sesiones;
  - `stddev_samp` de un valor = NULL;
  - el enmascaramiento del 95, que me pilló dos veces y es la mejor de la etapa.
- **Los consejos de Lucía son oficio, no relleno:** el 100 % del periodo 0, «un atípico es una pregunta», no mirar el A/B cada día, cuadrar antes de enviar, datos personales con lo mínimo.
- **El caso final** reparte bien la dificultad en 9 partes y la última junta todo en una fila que cuadra con las anteriores. Es la mejor despedida posible para el curso.
- **e1-01 con progreso vacío sigue siendo una entrada clara:**
  - prólogo completo con «CASO ABIERTO»;
  - explicación en dos pantallas;
  - errores típicos bien guiados (`producto` → «¿Querías decir productos?», falta el `;`);
  - el reto acepta `select *  from   EMPLEADOS ;`.
