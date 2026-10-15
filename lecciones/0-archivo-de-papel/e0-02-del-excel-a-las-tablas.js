CURSO.registrar({
  id: "e0-02",
  titulo: "Del Excel gigante a las tablas",
  xp: 25,
  objetivo: "Sabrás qué es una tabla y por qué repetir datos en todas partes trae problemas.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "El disquete de 1998",
      texto: "Junto a las fichas apareció un disquete con `ventas_1998.xls`: un Excel gigante donde se apuntaba cada venta… y, en cada fila, **todos** los datos del cliente.\nNadie se atreve a tocarlo. Quiero que me digas por qué es un problema y cómo lo partirías."
    },
    {
      tipo: "explicacion",
      titulo: "Tabla, fila y columna",
      texto: "Una **tabla** es una cuadrícula, como una hoja de cálculo.\n- Cada **columna** es un dato concreto con nombre (`ciudad`, `precio`) y siempre del mismo tipo.\n- Cada **fila** es una cosa concreta: un cliente, una venta.\n- Donde se cruzan una fila y una columna hay una **celda**: un solo dato.\nRegla de oro: **una tabla = un tipo de cosa**. La tabla de clientes solo habla de clientes; la de ventas, solo de ventas.",
      consejo: "Antes de mirar los datos, pregúntate «¿qué es cada fila?». Si no puedes responder en una frase, la tabla está mal planteada."
    },
    {
      tipo: "seleccionar",
      enunciado: "Este es un trozo de `ventas_1998.xls`. Cada fila es **una venta**. Marca las **columnas** que no describen la venta, sino **al cliente**.",
      tabla: {
        columnas: ["fecha", "cliente", "teléfono", "ciudad", "producto", "precio"],
        filas: [
          ["03/02/1998", "Rosa Prieto", "915 552 311", "Madrid", "Walkman Sonora", "39,90 €"],
          ["03/02/1998", "Tomás Herrero", "916 204 870", "Alcorcón", "Calculadora CX-2", "12,50 €"],
          ["17/02/1998", "Rosa Prieto", "915 552 311", "Madrid", "Pilas (pack 4)", "3,20 €"],
          ["02/03/1998", "Inés Calvo", "913 778 045", "Madrid", "Radio portátil", "24,00 €"],
          ["15/03/1998", "Rosa Prieto", "915 525 311", "Madrid", "Auriculares Sonora", "15,90 €"],
          ["21/03/1998", "Tomás Herrero", "916 204 870", "Alcorcón", "Discman Sonora", "89,00 €"]
        ]
      },
      modo: "columnas",
      correctas: [1, 2, 3],
      pistas: [
        "Pregúntate de cada columna: si el cliente comprara otra cosa mañana, ¿este dato cambiaría?",
        "Son tres columnas seguidas: el nombre del cliente, su teléfono y su ciudad."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "El problema de repetir",
      texto: "Rosa aparece en tres filas, y en cada una se copian su teléfono y su ciudad. Eso se llama **redundancia**: el mismo dato guardado en muchos sitios.\n- **Cambiarlo cuesta**: si Rosa cambia de teléfono y compró 40 veces, hay que tocar 40 celdas.\n- **Erratas**: basta un dedo torpe para que haya dos teléfonos «de Rosa». ¿Cuál es el bueno?\n- **Espacio**: el mismo dato copiado miles de veces.\nLa solución es **separar**: una tabla `clientes` con cada cliente **una sola vez** y una tabla `ventas` que solo indica quién compró.",
      consejo: "En el trabajo verás muchos Excel así. No son «malos»: son cómodos para apuntar, pero muy difíciles de mantener."
    },
    {
      tipo: "quiz",
      pregunta: "En la quinta fila del Excel, el teléfono de Rosa es `915 525 311`; en las otras dos, `915 552 311`. ¿Qué es lo más probable?",
      opciones: [
        "Que Rosa tenga dos teléfonos distintos",
        "Una errata al copiar el dato: es el riesgo de repetirlo en cada fila",
        "Que el Excel haya calculado mal los números"
      ],
      correcta: 1,
      explicacion: "Dos cifras cambiadas de sitio: una errata típica de copiar a mano. Si el teléfono viviera una sola vez en `clientes`, no podría pasar."
    },
    {
      tipo: "quiz",
      pregunta: "Separas el Excel en `clientes` y `ventas`. Rosa cambia de teléfono. ¿Cuántas celdas tienes que tocar?",
      opciones: [
        "Una: el teléfono de su fila en `clientes`",
        "Tres: una por cada compra que hizo",
        "Ninguna: al separar, el teléfono deja de guardarse"
      ],
      correcta: 0,
      explicacion: "Esa es la gracia de separar: cada dato vive en un solo sitio. Las ventas siguen sabiendo que las hizo Rosa, pero no copian su teléfono."
    },
    {
      tipo: "seleccionar",
      reto: true,
      enunciado: "Otra hoja del Excel. Marca **todas las celdas que repiten datos de un cliente que ya apareció en una fila anterior** (su nombre, teléfono y ciudad): son las que sobrarían si los clientes vivieran en su propia tabla.",
      tabla: {
        columnas: ["fecha", "cliente", "teléfono", "ciudad", "producto", "precio"],
        filas: [
          ["04/05/1998", "Andrés Molina", "914 330 192", "Madrid", "Teléfono inalámbrico", "59,00 €"],
          ["04/05/1998", "Carmen Soto", "918 441 027", "Getafe", "Walkman Sonora", "39,90 €"],
          ["11/05/1998", "Andrés Molina", "914 330 192", "Madrid", "Cintas de vídeo (pack 3)", "9,90 €"],
          ["19/05/1998", "Lola Ibáñez", "915 019 664", "Madrid", "Radio portátil", "24,00 €"],
          ["26/05/1998", "Carmen Soto", "918 441 027", "Getafe", "Pilas (pack 4)", "3,20 €"],
          ["02/06/1998", "Andrés Molina", "914 330 192", "Madrid", "Auriculares Sonora", "15,90 €"]
        ]
      },
      modo: "celdas",
      correctas: [[2, 1], [2, 2], [2, 3], [4, 1], [4, 2], [4, 3], [5, 1], [5, 2], [5, 3]],
      pistas: [
        "Recorre la columna `cliente` de arriba abajo: ¿quién aparece por segunda o tercera vez? La primera aparición de cada cliente no se marca.",
        "Andrés repite en la 3.ª y la 6.ª fila, y Carmen en la 5.ª. Marca en esas tres filas el nombre, el teléfono y la ciudad: 9 celdas."
      ]
    }
  ]
});
