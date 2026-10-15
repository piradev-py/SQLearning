CURSO.registrar({
  id: "e0-08",
  titulo: "El ciclo del análisis y los roles",
  xp: 25,
  objetivo: "Sabrás qué pasos sigue un análisis de datos y quién hace cada cosa en un equipo de datos.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "¿Y todo esto para qué?",
      texto: "Ya sabes cómo se guardan los datos. Ahora, lo importante: para qué sirven.\nEn enero de 1999, el dueño de la tienda de Madrid hizo una pregunta: ¿por qué vendimos menos en diciembre que el año anterior? Nadie le contestó: los tiques estaban en cajas.\nHoy te enseño el camino de un análisis de principio a fin y quién hace cada parte en un equipo de datos."
    },
    {
      tipo: "explicacion",
      titulo: "El ciclo del análisis",
      texto: "Todo análisis sigue seis pasos:\n1. **Pregunta**: qué quiere saber el negocio.\n2. **Datos**: buscar y reunir la información necesaria.\n3. **Limpieza**: quitar duplicados, corregir erratas, decidir qué hacer con los huecos vacíos.\n4. **Análisis**: contar, sumar, comparar, buscar patrones.\n5. **Comunicar**: una tabla, un gráfico y una conclusión que se entienda en un minuto.\n6. **Decisión**: alguien actúa con lo que has encontrado.\nY vuelta a empezar: cada decisión trae preguntas nuevas.",
      consejo: "La limpieza suele llevarse **más de la mitad** del tiempo. No es tiempo perdido: con datos sucios, el análisis miente con mucha seguridad."
    },
    {
      tipo: "explicacion",
      titulo: "Una buena pregunta de negocio",
      texto: "El ciclo empieza por la pregunta, y una pregunta vaga da una respuesta inútil.\n• Vaga: «¿Qué tal van las ventas?»\n• Buena: «¿Cuánto vendió la tienda de Madrid en diciembre de 1998 frente a diciembre de 1997, por categoría?»\nUna buena pregunta es **concreta** (qué se mide), tiene **periodo** (cuándo), dice **dónde o de quién** y sirve para **decidir** algo.",
      consejo: "Antes de abrir ningún dato, pregunta: «¿qué decisión vas a tomar con esto?». Te ahorrará días de trabajo que nadie iba a usar."
    },
    {
      tipo: "quiz",
      pregunta: "¿Cuál es la **mejor** pregunta para empezar un análisis?",
      opciones: [
        "¿Cómo están los clientes?",
        "¿Qué porcentaje de los clientes que compraron en 1997 volvieron a comprar en 1998, por tienda?",
        "¿Podemos mirar todos los datos a ver qué sale?"
      ],
      correcta: 1,
      explicacion: "Dice qué se mide (porcentaje que vuelve), cuándo (1997 y 1998) y cómo se reparte (por tienda). Las otras dos no tienen un final claro: nunca sabrías cuándo has terminado."
    },
    {
      tipo: "ordenar",
      enunciado: "Este es el análisis que nadie hizo en 1999. Ordena sus pasos de principio a fin.",
      elementos: [
        "El dueño pregunta: ¿por qué vendimos menos en diciembre de 1998 que en diciembre de 1997?",
        "Reúnes los tiques de caja de diciembre de los dos años",
        "Quitas los tiques repetidos y corriges las fechas mal escritas",
        "Comparas las ventas de cada categoría entre los dos diciembres",
        "Presentas un gráfico: casi toda la caída viene de telefonía",
        "El dueño decide pedir más teléfonos para la próxima Navidad"
      ],
      pistas: [
        "Sigue el ciclo: pregunta → datos → limpieza → análisis → comunicar → decisión.",
        "Los tiques se reúnen antes de limpiarlos, y se limpian antes de comparar nada. El gráfico va justo antes de la decisión."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "Quién es quién en un equipo de datos",
      texto: "• **Data Analyst** (analista de datos): responde preguntas de negocio con consultas, hojas de cálculo e informes. Es tu camino.\n• **Data Scientist** (científico de datos): crea modelos estadísticos que **predicen** o clasifican, a menudo con *machine learning* (programas que aprenden de ejemplos).\n• **Data Engineer** (ingeniero de datos): construye las «tuberías» que llevan los datos de un sistema a otro y mantiene el **almacén de datos** donde se juntan.\n• **BI** (*Business Intelligence*, inteligencia de negocio): monta **cuadros de mando** (paneles que se actualizan solos) con los **KPI**, los indicadores clave que la dirección mira cada día.",
      consejo: "En una empresa pequeña, una sola persona hace los cuatro papeles. Saber qué parte estás haciendo en cada momento te ayuda a pedir ayuda a la persona adecuada."
    },
    {
      tipo: "quiz",
      pregunta: "Cada noche, los datos de las cajas registradoras tienen que llegar solos al almacén de datos. ¿Quién se encarga de que eso funcione?",
      opciones: ["Data Analyst", "Data Scientist", "Data Engineer", "BI"],
      correcta: 2,
      explicacion: "Mover datos de un sistema a otro de forma automática y fiable es la «tubería» del Data Engineer. El analista usa esos datos cuando ya han llegado."
    },
    {
      tipo: "clasificar",
      reto: true,
      enunciado: "Lucía reparte el trabajo del equipo. Arrastra cada tarea al **rol** que la haría.",
      grupos: ["Data Analyst", "Data Scientist", "Data Engineer", "BI"],
      elementos: [
        { texto: "Averiguar por qué bajaron las ventas de diciembre", grupo: "Data Analyst" },
        { texto: "Sacar la lista de clientes que no compran desde hace un año", grupo: "Data Analyst" },
        { texto: "Predecir con un modelo cuántos teléfonos se venderán la próxima Navidad", grupo: "Data Scientist" },
        { texto: "Entrenar un modelo que avise de qué clientes van a dejar de comprar", grupo: "Data Scientist" },
        { texto: "Automatizar que los datos de las cajas lleguen cada noche al almacén de datos", grupo: "Data Engineer" },
        { texto: "Arreglar la conexión entre sistemas por la que se perdían ventas", grupo: "Data Engineer" },
        { texto: "Montar el cuadro de mando de ventas que la dirección abre cada mañana", grupo: "BI" },
        { texto: "Definir los KPI del cuadro de mando y mantenerlos al día", grupo: "BI" }
      ],
      pistas: [
        "Pregúntate qué hace cada tarea: ¿responde una pregunta concreta (Analyst), predice el futuro (Scientist), mueve datos entre sistemas (Engineer) o mantiene paneles para todos (BI)?",
        "Hay dos tareas por rol. Las de «modelo» son de Data Scientist; las de cajas y conexiones, de Data Engineer; las de cuadro de mando y KPI, de BI. Las dos que quedan, de Data Analyst."
      ]
    }
  ]
});
