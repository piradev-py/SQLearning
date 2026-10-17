CURSO.registrar({
  id: "e8-06",
  titulo: "Estadística descriptiva: centro, dispersión e histogramas",
  xp: 45,
  objetivo: "Sabrás describir una distribución con SQL: su centro (media, mediana y moda), su dispersión (rango, desviación típica, varianza, cuartiles e IQR) y su forma, con un histograma de tramos fijos.",
  pasos: [
    {
      tipo: "historia",
      de: "ana",
      asunto: "¿Cuánto gasta un cliente normal?",
      texto: "En el consejo alguien preguntará: «¿y cuánto gasta un cliente normal en un pedido?». El ticket medio que me disteis es un número, pero no me dice si casi todos los pedidos rondan esa cifra o si hay de todo, desde compras pequeñas hasta pedidos enormes.\nQuiero poder contestar con propiedad: qué es lo normal, cuánto se aleja la gente de lo normal y cómo se reparten los pedidos."
    },
    {
      tipo: "explicacion",
      titulo: "El centro: media, mediana y moda",
      texto: "Tres formas de decir «lo normal»:\n- **Media** (`AVG`): suma entre número de valores. Se deja arrastrar por los extremos.\n- **Mediana** (`percentile_cont(0.5) WITHIN GROUP (ORDER BY …)`, la viste con Ana): el valor del medio.\n- **Moda** (`mode() WITHIN GROUP (ORDER BY …)`): el valor que más se repite. Con importes casi nunca se repite nada; brilla con categorías, como el método de pago más usado.\nEl ejemplo, con los pedidos netos (sin `cancelado` ni `reembolsado`) de enero a septiembre de 2026, por tienda.",
      ejemplo: `SELECT tienda_id,
  ROUND(AVG(total), 2) AS media,
  ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY total)::numeric, 2) AS mediana,
  mode() WITHIN GROUP (ORDER BY metodo_pago) AS pago_mas_usado
FROM pedidos
WHERE estado NOT IN ('cancelado', 'reembolsado')
  AND fecha >= DATE '2026-01-01'
  AND fecha < DATE '2026-10-01'
GROUP BY tienda_id
ORDER BY tienda_id;`,
      consejo: "Si en tu distribución hay una cola de valores muy altos (unos pocos pedidos carísimos), la media queda **por encima** de la mediana. Cuando las dos difieren mucho, en el informe pon las dos y explica por qué."
    },
    {
      tipo: "explicacion",
      titulo: "La dispersión: cuánto se alejan de lo normal",
      texto: "Dos tiendas pueden tener la misma media y ser muy distintas. La **dispersión** mide cuánto varían los valores:\n- **Rango**: `MAX − MIN`. Fácil, pero lo decide un solo valor extremo.\n- **Desviación típica** (`stddev_samp`): cuánto se aleja, de media, cada valor de la media, en euros. Su cuadrado es la **varianza** (`variance`), en «euros al cuadrado», menos intuitiva.\n- **Cuartiles** e **IQR**: el percentil 25 (Q1) y el 75 (Q3). Entre los dos está la mitad central de los pedidos; su distancia, `Q3 − Q1`, es el **IQR** (rango intercuartílico), que no se deja engañar por los extremos.",
      ejemplo: `SELECT
  MAX(total) - MIN(total) AS rango,
  ROUND(stddev_samp(total), 2) AS desviacion,
  ROUND(percentile_cont(0.25) WITHIN GROUP (ORDER BY total)::numeric, 2) AS q1,
  ROUND(percentile_cont(0.75) WITHIN GROUP (ORDER BY total)::numeric, 2) AS q3,
  ROUND((percentile_cont(0.75) WITHIN GROUP (ORDER BY total)
    - percentile_cont(0.25) WITHIN GROUP (ORDER BY total))::numeric, 2) AS iqr
FROM pedidos
WHERE estado NOT IN ('cancelado', 'reembolsado')
  AND tienda_id = 5
  AND fecha >= DATE '2026-01-01'
  AND fecha < DATE '2026-10-01';`,
      otrosMotores: "`stddev_samp` y `variance` existen con ese nombre en MySQL y BigQuery; en SQL Server son `STDEV` y `VAR` (y `STDEVP`/`VARP` para la población). Los cuartiles, como la mediana: en SQL Server y BigQuery, `PERCENTILE_CONT` con `OVER`."
    },
    {
      tipo: "prediccion",
      consulta: `SELECT AVG(x) AS media, stddev_samp(x) AS desviacion
FROM (VALUES (42)) AS t(x);`,
      pregunta: "Una tienda con **un solo pedido**, de 42 €. ¿Qué devuelve `stddev_samp`?",
      opciones: ["0", "42", "NULL"],
      correcta: 2,
      explicacion: "La desviación típica de una **muestra** divide entre (n − 1): con un solo valor, entre 0. PostgreSQL no da error: devuelve **NULL**, «no se puede saber». Si un grupo de tu informe tiene la desviación vacía, mira cuántas filas tiene antes de pensar en un fallo."
    },
    {
      tipo: "quiz",
      pregunta: "`stddev_samp` divide entre (n − 1) y `stddev_pop` entre n. Calculas la dispersión de **todos** los pedidos de 2025, sin dejarte ninguno, para describir ese año. ¿Cuál corresponde?",
      opciones: [
        "`stddev_pop`: tienes la población entera, no una muestra",
        "`stddev_samp`: es la que se usa siempre",
        "Da igual: dan exactamente lo mismo"
      ],
      correcta: 0,
      explicacion: "Si tienes **todos** los casos y solo quieres describirlos, es la población: `stddev_pop`. Si esos datos son una muestra para sacar conclusiones de algo más grande (los pedidos «que vendrán»), `stddev_samp`. Con cientos de filas la diferencia es mínima; con pocas, se nota."
    },
    {
      tipo: "ejercicio",
      desdeEjemplo: true,
      enunciado: "Por tienda, con los pedidos netos (sin `cancelado` ni `reembolsado`) de **enero a septiembre de 2026** (`fecha >= DATE '2026-01-01'` y `< DATE '2026-10-01'`): `tienda_id`, `media` (de `total`), `mediana` (`percentile_cont(0.5)`) y `desviacion` (`stddev_samp`), las tres redondeadas a 2, ordenado por `tienda_id`.",
      solucion: `SELECT tienda_id,
  ROUND(AVG(total), 2) AS media,
  ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY total)::numeric, 2) AS mediana,
  ROUND(stddev_samp(total), 2) AS desviacion
FROM pedidos
WHERE estado NOT IN ('cancelado', 'reembolsado')
  AND fecha >= DATE '2026-01-01'
  AND fecha < DATE '2026-10-01'
GROUP BY tienda_id
ORDER BY tienda_id;`,
      pistas: [
        "Parte del primer ejemplo: cambia la moda por `ROUND(stddev_samp(total), 2) AS desviacion`.",
        "SELECT tienda_id, ROUND(AVG(total), 2) AS media, ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY total)::numeric, 2) AS mediana, ROUND(stddev_samp(total), 2) AS desviacion FROM pedidos WHERE estado NOT IN ('cancelado', 'reembolsado') AND fecha >= DATE '2026-01-01' AND fecha < DATE '2026-10-01' GROUP BY tienda_id ORDER BY tienda_id;"
      ]
    },
    {
      tipo: "explicacion",
      titulo: "El histograma: tramos fijos",
      texto: "Un **histograma** cuenta cuántos valores caen en cada tramo: de 0 a 250 €, de 250 a 500 €… y enseña la **forma** de la distribución de un vistazo.\nEl tramo de cada pedido es su límite inferior: `floor(total / 250) * 250`. `floor` redondea hacia abajo: 380 / 250 = 1,52 → 1 → tramo 250.\nTodos los tramos tienen que tener el **mismo ancho** y empezar en el mismo sitio (múltiplos de 250); si no, las barras no son comparables. El ejemplo lo hace con tramos de 100 € para la tienda de Madrid.",
      ejemplo: `SELECT floor(total / 100) * 100 AS tramo, COUNT(*) AS pedidos
FROM pedidos
WHERE estado NOT IN ('cancelado', 'reembolsado')
  AND tienda_id = 1
  AND fecha >= DATE '2026-01-01'
  AND fecha < DATE '2026-10-01'
GROUP BY floor(total / 100) * 100
ORDER BY tramo;`,
      grafico: true,
      consejo: "PostgreSQL tiene también `width_bucket(total, 0, 1500, 6)`: reparte entre 0 y 1 500 en 6 tramos iguales y devuelve el número de tramo (1, 2, 3…). Es cómodo, pero el número de tramo hay que traducirlo a euros para el informe; `floor` ya te da el límite en euros."
    },
    {
      tipo: "reto",
      de: "ana",
      enunciado: "El histograma de la tienda **online** (`tienda_id = 5`): pedidos netos (sin `cancelado` ni `reembolsado`) de **enero a septiembre de 2026**, en tramos de **250 €**. Columnas `tramo` (límite inferior del tramo, `floor(total / 250) * 250`) y `pedidos` (cuántos caen en él), ordenado por `tramo`.",
      inicial: "-- Escribe tu consulta aquí\n",
      grafico: true,
      comprobaciones: [
        { texto: "Tiene las columnas tramo y pedidos", prueba: (r) => PRUEBA.columnas(r, ["tramo", "pedidos"]) },
        { texto: "Los tramos van de menor a mayor", prueba: (r) => (r?.filas?.length ?? 0) > 0 && PRUEBA.ordenado(r, "tramo", "asc") },
        { texto: "Cada tramo de 250 € con sus pedidos online netos de enero a septiembre", prueba: (r, db) => PRUEBA.igualA(r, db, `SELECT floor(total / 250) * 250 AS tramo, COUNT(*) AS pedidos
FROM pedidos
WHERE estado NOT IN ('cancelado', 'reembolsado')
  AND tienda_id = 5
  AND fecha >= DATE '2026-01-01'
  AND fecha < DATE '2026-10-01'
GROUP BY floor(total / 250) * 250
ORDER BY tramo;`) }
      ],
      pistas: [
        "Como el ejemplo de Madrid, con tres cambios: `tienda_id = 5`, y `250` en lugar de `100` tanto en el `SELECT` como en el `GROUP BY`.",
        "SELECT floor(total / 250) * 250 AS tramo, COUNT(*) AS pedidos FROM pedidos WHERE estado NOT IN ('cancelado', 'reembolsado') AND tienda_id = 5 AND fecha >= DATE '2026-01-01' AND fecha < DATE '2026-10-01' GROUP BY floor(total / 250) * 250 ORDER BY tramo;"
      ],
      solucion: `SELECT floor(total / 250) * 250 AS tramo, COUNT(*) AS pedidos
FROM pedidos
WHERE estado NOT IN ('cancelado', 'reembolsado')
  AND tienda_id = 5
  AND fecha >= DATE '2026-01-01'
  AND fecha < DATE '2026-10-01'
GROUP BY floor(total / 250) * 250
ORDER BY tramo;`
    }
  ]
});
