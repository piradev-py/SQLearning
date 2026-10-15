CURSO.registrar({
  id: "e0-04",
  titulo: "Conjuntos: unir, cruzar y restar",
  xp: 30,
  objetivo: "Sabrás unir, cruzar y restar listas de clientes con diagramas de Venn.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "Dos listas, dos campañas",
      texto: "En el archivo hay dos listas de 1998: quién compró **audio** (walkman, discman, auriculares, radios) y quién compró **gaming** (consolas, videojuegos, mandos).\nImagina que preparas dos campañas. ¿Quién está en las dos listas? ¿Quién solo en una? Hora de pensar en **conjuntos**."
    },
    {
      tipo: "explicacion",
      titulo: "Conjuntos y diagramas de Venn",
      texto: "Un **conjunto** es una colección de elementos **sin repetidos y sin orden**: «clientes que compraron audio». Un cliente está o no está; no cuenta dos veces aunque comprara tres walkman.\nUn **diagrama de Venn** dibuja cada conjunto como un círculo. Si dos círculos se solapan, la zona común contiene lo que está en **los dos**. Lo que queda fuera de los círculos no está en ninguno.",
      consejo: "Una tabla de una base de datos se parece mucho a un conjunto de filas. Por eso esta forma de pensar te servirá en todo el curso."
    },
    {
      tipo: "explicacion",
      titulo: "Unir, cruzar y restar",
      texto: "Con dos conjuntos, A y B:\n- **Unión** (A ∪ B): lo que está en A **o** en B, cada elemento una sola vez. En SQL lo harás con `UNION`.\n- **Intersección** (A ∩ B): lo que está en A **y** en B. En SQL, `INTERSECT`; y es la idea que hay detrás de `JOIN`, que cruza dos tablas por lo que tienen en común.\n- **Diferencia** (A − B): lo que está en A pero **no** en B. En SQL, `EXCEPT`.\n¿Te suena? Unión es el **O** del nivel anterior; intersección, el **Y**; diferencia, el **Y NO**.",
      consejo: "La diferencia tiene dirección: «audio menos gaming» no es lo mismo que «gaming menos audio». Léela siempre como «están en el primero y no en el segundo».",
      otrosMotores: "En Oracle, `EXCEPT` se ha escrito tradicionalmente `MINUS`. MySQL no tuvo `INTERSECT` ni `EXCEPT` hasta la versión 8.0.31."
    },
    {
      tipo: "quiz",
      pregunta: "Audio = {Rosa, Tomás, Inés, Andrés}. Gaming = {Inés, Andrés, Carmen}. ¿Cuántos clientes hay en la **unión**?",
      opciones: ["7", "5", "2"],
      correcta: 1,
      explicacion: "4 + 3 = 7, pero Inés y Andrés están en las dos listas y en un conjunto cada elemento cuenta una vez: Rosa, Tomás, Inés, Andrés y Carmen. Son 5."
    },
    {
      tipo: "quiz",
      pregunta: "Con las mismas listas, ¿qué da **audio − gaming**?",
      opciones: ["Rosa y Tomás", "Carmen", "Inés y Andrés"],
      correcta: 0,
      explicacion: "Los que compraron audio y **no** gaming. Carmen sería gaming − audio, e Inés y Andrés son la intersección."
    },
    {
      tipo: "clasificar",
      enunciado: "Lucía te pasa encargos de la tienda. ¿Qué operación resuelve cada uno?",
      grupos: ["Unión", "Intersección", "Diferencia"],
      elementos: [
        { texto: "Juntar en una sola lista los clientes de audio y los de gaming para enviarles el catálogo", grupo: "Unión" },
        { texto: "Juntar las listas de clientes de dos tiendas en una sola, sin repetir a nadie", grupo: "Unión" },
        { texto: "Clientes que compraron audio y también gaming", grupo: "Intersección" },
        { texto: "Socios del club que además compraron en diciembre", grupo: "Intersección" },
        { texto: "Clientes de audio que nunca compraron gaming, para ofrecerles una consola", grupo: "Diferencia" },
        { texto: "Socios del club que este año no han comprado nada", grupo: "Diferencia" }
      ],
      pistas: [
        "Busca las palabras clave: «juntar» o «todos» suena a unión; «también» o «además», a intersección; «nunca» o «no», a diferencia.",
        "Hay dos encargos de cada operación. Los que llevan «nunca» o «no han comprado» son diferencias."
      ]
    },
    {
      tipo: "clasificar",
      reto: true,
      venn: true,
      enunciado: "Coloca a cada cliente de 1998 en el diagrama según lo que compró. **Audio** = walkman, discman, auriculares o radio. **Gaming** = consola, videojuego o mando.",
      grupos: ["Audio", "Gaming"],
      elementos: [
        { texto: "Rosa Prieto: walkman y auriculares", grupo: ["Audio"] },
        { texto: "Tomás Herrero: consola y videojuego", grupo: ["Gaming"] },
        { texto: "Inés Calvo: discman y mando", grupo: ["Audio", "Gaming"] },
        { texto: "Andrés Molina: teléfono inalámbrico", grupo: [] },
        { texto: "Carmen Soto: videojuego y radio portátil", grupo: ["Audio", "Gaming"] },
        { texto: "Lola Ibáñez: auriculares", grupo: ["Audio"] },
        { texto: "Pablo Rey: calculadora y pilas", grupo: [] },
        { texto: "Julia Navas: consola", grupo: ["Gaming"] }
      ],
      pistas: [
        "Para cada cliente, haz dos preguntas por separado: ¿compró algo de audio? ¿Compró algo de gaming? Dos «sí» = la zona común; dos «no» = fuera de los círculos.",
        "Inés y Carmen van en la zona común; Andrés y Pablo, en «Ninguno». Rosa y Lola son solo audio; Tomás y Julia, solo gaming."
      ]
    }
  ]
});
