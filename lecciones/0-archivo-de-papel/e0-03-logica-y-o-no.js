CURSO.registrar({
  id: "e0-03",
  titulo: "Verdadero o falso: lógica Y/O/NO",
  xp: 30,
  objetivo: "Sabrás decidir qué fichas cumplen una condición combinada con Y, O, NO y paréntesis.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "La nota del encargado",
      texto: "Entre las fichas de 1998 y 1999 hay una nota del encargado: «Llamar a los clientes de Madrid que compraron en 1999 o que gastaron más de 100 €».\nQuiero saber a quién habría llamado. Para eso hay que pensar como una base de datos: con **verdadero** o **falso**."
    },
    {
      tipo: "explicacion",
      titulo: "Condiciones",
      texto: "Una **condición** es una pregunta que, para cada ficha, solo puede responderse con **verdadero** o **falso**: «¿es de Madrid?», «¿gastó más de 100 €?».\nPara la ficha de Rosa (Madrid, 80 €), la primera es verdadera y la segunda, falsa.\n**Filtrar** es eso: aplicar la condición a cada ficha, una por una, y quedarte solo con las que dan **verdadero**. Más adelante, en SQL, esto lo harás con `WHERE`.",
      consejo: "«Más de 100» no incluye el 100. Si el negocio quiere incluirlo, debe decir «100 o más». Ante la duda, pregunta."
    },
    {
      tipo: "explicacion",
      titulo: "Y, O, NO",
      texto: "Las condiciones se combinan:\n- **Y**: verdadero solo si **todas** lo son. «De Madrid Y más de 100 €».\n- **O**: verdadero si **alguna** lo es (o las dos). «De Madrid O de Getafe».\n- **NO**: le da la vuelta. «NO es de Madrid».\nSus **tablas de verdad** (V = verdadero, F = falso):\n- V Y V = V · V Y F = F · F Y F = F\n- V O V = V · V O F = V · F O F = F\n- NO V = F · NO F = V\nEn SQL se escriben `AND`, `OR` y `NOT`.",
      consejo: "Cuidado con el «o» del día a día («¿café o té?» = uno de los dos). En lógica, O también se cumple cuando se cumplen las dos cosas."
    },
    {
      tipo: "seleccionar",
      enunciado: "Marca las fichas que cumplen: ciudad es Madrid **Y** gasto mayor que 100 €.",
      tabla: {
        columnas: ["cliente", "ciudad", "gasto (€)"],
        filas: [
          ["Óscar Vela", "Madrid", 95],
          ["Nieves Gallo", "Leganés", 140],
          ["Raúl Ortega", "Madrid", 230],
          ["Pilar Sanz", "Getafe", 60],
          ["Hugo Ferrer", "Madrid", 101]
        ]
      },
      modo: "filas",
      correctas: [2, 4],
      pistas: [
        "Con Y tienen que cumplirse las dos cosas a la vez. Basta un falso para descartar la ficha.",
        "Óscar es de Madrid pero gastó 95 €; Nieves gastó 140 € pero es de Leganés. Quedan dos fichas."
      ]
    },
    {
      tipo: "seleccionar",
      enunciado: "Las mismas fichas, otra condición. Marca las que cumplen: ciudad es Madrid **O** gasto mayor que 100 €.",
      tabla: {
        columnas: ["cliente", "ciudad", "gasto (€)"],
        filas: [
          ["Óscar Vela", "Madrid", 95],
          ["Nieves Gallo", "Leganés", 140],
          ["Raúl Ortega", "Madrid", 230],
          ["Pilar Sanz", "Getafe", 60],
          ["Hugo Ferrer", "Madrid", 101]
        ]
      },
      modo: "filas",
      correctas: [0, 1, 2, 4],
      pistas: [
        "Con O basta con que se cumpla una de las dos. Solo se descarta una ficha si fallan las dos.",
        "Solo hay una ficha que no es de Madrid y además gastó 100 € o menos: la de Pilar. Todas las demás se marcan."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Paréntesis",
      texto: "Cuando mezclas Y con O, los **paréntesis** mandan: lo de dentro se resuelve primero, como en matemáticas.\n«Madrid Y (1999 O más de 100 €)»: primero miras si compró en 1999 o gastó más de 100 €; después, si además es de Madrid.\n«(Madrid Y 1999) O más de 100 €» es **otra pregunta**: aquí sí entraría una clienta de Getafe que gastó 150 €.",
      consejo: "Pon paréntesis siempre que mezcles Y con O, aunque creas que no hacen falta. Te ahorrarán errores, a ti y a quien lea después."
    },
    {
      tipo: "quiz",
      pregunta: "Ficha de Ramón: Getafe, compró en 1999, gastó 40 €. ¿Cumple «Madrid **Y** (1999 **O** más de 100 €)»?",
      opciones: [
        "Sí, porque compró en 1999",
        "No, porque no es de Madrid",
        "No se puede saber"
      ],
      correcta: 1,
      explicacion: "El paréntesis da verdadero (compró en 1999), pero el Y exige además que sea de Madrid, y eso es falso. V Y F = F."
    },
    {
      tipo: "explicacion",
      titulo: "¿Y si no lo sé?",
      texto: "En algunas fichas el gasto está **en blanco**. ¿Gastó más de 100 €? **No lo sabemos**. Las bases de datos usan un tercer valor: **desconocido** («no sé»).\n- F Y no sé = **F** (con un falso, el Y ya falla).\n- V O no sé = **V** (con un verdadero, el O ya se cumple).\n- V Y no sé = **no sé** · F O no sé = **no sé** · NO (no sé) = **no sé**.\nAl filtrar solo pasan las fichas que dan **verdadero**: las del «no sé» se quedan fuera. En SQL, ese dato vacío se llama `NULL`.",
      consejo: "Un dato vacío no es un cero. «Gasto: en blanco» no significa que gastó 0 €: significa que nadie lo apuntó."
    },
    {
      tipo: "quiz",
      pregunta: "Ficha de Marta: Madrid, compró en 1998, gasto **en blanco**. ¿Qué da «Madrid **Y** (1999 **O** más de 100 €)»?",
      opciones: [
        "Verdadero",
        "Falso",
        "No sé, así que no entra en la lista"
      ],
      correcta: 2,
      explicacion: "Dentro del paréntesis: 1999 es falso y el gasto, no sé → F O no sé = no sé. Fuera: Madrid es verdadero → V Y no sé = no sé. Y lo que no es verdadero no pasa el filtro."
    },
    {
      tipo: "seleccionar",
      reto: true,
      enunciado: "Las fichas de la nota. Marca a quién habría que llamar: de Madrid **Y** (compró en 1999 **O** gastó más de 100 €). Si el resultado es «no sé», no la marques.",
      tabla: {
        columnas: ["cliente", "ciudad", "año de compra", "gasto (€)"],
        filas: [
          ["Rosa Prieto", "Madrid", 1999, 80],
          ["Tomás Herrero", "Alcorcón", 1999, 150],
          ["Inés Calvo", "Madrid", 1998, 120],
          ["Andrés Molina", "Madrid", 1998, 60],
          ["Carmen Soto", "Getafe", 1998, 210],
          ["Lola Ibáñez", "Madrid", 1999, "(en blanco)"],
          ["Pablo Rey", "Madrid", 1998, "(en blanco)"],
          ["Julia Navas", "Madrid", 1998, 100],
          ["Sergio Lozano", "Alcorcón", 1998, 45]
        ]
      },
      modo: "filas",
      correctas: [0, 2, 5],
      pistas: [
        "Primero descarta las que no son de Madrid: con un falso, el Y ya falla. Luego, entre las de Madrid, basta con que se cumpla una de las dos cosas del paréntesis.",
        "Ojo: 100 € no es «más de 100». Y si compró en 1999, el O ya es verdadero aunque el gasto esté en blanco. Son 3 fichas."
      ]
    }
  ]
});
