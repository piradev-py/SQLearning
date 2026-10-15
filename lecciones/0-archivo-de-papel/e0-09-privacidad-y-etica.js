CURSO.registrar({
  id: "e0-09",
  titulo: "Privacidad y ética de los datos",
  xp: 25,
  objetivo: "Sabrás qué datos personales hay que proteger y qué se puede compartir sin poner en riesgo a nadie.",
  pasos: [
    {
      tipo: "historia",
      de: "lucia",
      asunto: "Antes de enviar ni una fila",
      texto: "En las fichas de 1998 hay nombres, DNI, teléfonos… y hasta alguna nota sobre la salud de un cliente.\nUna agencia de marketing nos pide «el listado de clientes» para estudiar qué se vende en cada ciudad. Antes de enviar nada, quiero que sepas qué puede salir y qué no. Aquí un error no es una errata: es una multa y la confianza de los clientes."
    },
    {
      tipo: "explicacion",
      titulo: "Dato personal y dato sensible",
      texto: "Un **dato personal** es cualquier dato que identifica a una persona, directa o indirectamente: nombre, DNI, teléfono, email, dirección… o una combinación como «mujer, 34 años, calle Toledo».\nUn **dato sensible** es un dato personal especialmente delicado: **salud**, religión, ideas políticas, origen étnico, orientación sexual, afiliación a un sindicato, huellas o rasgos biométricos. Tiene protección reforzada.\nLo que **no** es personal: totales y recuentos que no señalan a nadie, como «ventas de Madrid en 1998»."
    },
    {
      tipo: "clasificar",
      enunciado: "Clasifica cada dato del archivo de 1998: ¿no es personal, es **personal** o es **sensible**?",
      grupos: ["No personal", "Personal", "Sensible"],
      elementos: [
        { texto: "Total vendido por la tienda en 1998", grupo: "No personal" },
        { texto: "Número de clientes por ciudad", grupo: "No personal" },
        { texto: "Categoría más vendida en diciembre", grupo: "No personal" },
        { texto: "Nombre y apellidos", grupo: "Personal" },
        { texto: "Teléfono del cliente", grupo: "Personal" },
        { texto: "DNI", grupo: "Personal" },
        { texto: "Nota: «usa audífono, hablarle de frente»", grupo: "Sensible" },
        { texto: "Empleado afiliado a un sindicato", grupo: "Sensible" }
      ],
      pistas: [
        "Primero: ¿señala a una persona concreta? Si no, no es personal. Si sí: ¿habla de salud, creencias, sindicato…? Entonces es sensible.",
        "Los tres totales y recuentos no son personales. La nota del audífono (salud) y la afiliación sindical son sensibles."
      ]
    },
    {
      tipo: "explicacion",
      titulo: "El RGPD en tres principios",
      texto: "El **RGPD** (Reglamento General de Protección de Datos) es la ley europea que protege los datos personales desde 2018. Aunque el archivo sea de 1998, hoy se aplica. Tres principios básicos:\n• **Finalidad**: los datos solo se usan para lo que se recogieron. El teléfono que diste para avisarte de una reparación no sirve para llamarte con ofertas.\n• **Minimización**: se usan solo los datos imprescindibles para ese fin, ni uno más.\n• **Acceso**: cada persona de la empresa ve solo lo que necesita para su trabajo, y cada cliente tiene derecho a ver sus datos, corregirlos o pedir que se borren.",
      consejo: "Si dudas de si algo puede salir de la empresa, no lo envíes y pregunta al **delegado de protección de datos** (DPO). Esa pregunta nunca sobra."
    },
    {
      tipo: "quiz",
      pregunta: "Los clientes dieron su teléfono para que les avisaran cuando llegara un pedido. ¿Puede el equipo de ventas usar esa lista para llamarles con ofertas?",
      opciones: [
        "Sí: los datos ya son de la empresa",
        "No: se recogieron para otra **finalidad**",
        "Sí, siempre que la llamada sea corta"
      ],
      correcta: 1,
      explicacion: "Principio de **finalidad**: el teléfono se dio para avisos de pedidos. Usarlo para publicidad necesita otro permiso del cliente."
    },
    {
      tipo: "explicacion",
      titulo: "Seudonimizar y anonimizar",
      texto: "Dos formas de proteger a las personas:\n• **Seudonimizar**: cambiar el nombre por un código (`Rosa Prieto` → `C-0042`) y guardar aparte, bajo llave, la tabla que dice qué código es de quién. Se puede deshacer, así que **sigue siendo dato personal**.\n• **Anonimizar**: transformar los datos para que **nadie**, ni siquiera tú, pueda saber de quién son. Por ejemplo, pasar de fichas a totales por ciudad, o de edad exacta a tramos («30–39»). No se puede deshacer y deja de ser dato personal.",
      consejo: "Quitar el nombre no basta. El código postal, la fecha de nacimiento y el sexo juntos identifican a muchísima gente. Mira siempre qué combinaciones quedan."
    },
    {
      tipo: "quiz",
      pregunta: "Cambias cada nombre por un código y guardas en otro archivo qué código corresponde a cada cliente. ¿Qué has hecho?",
      opciones: ["Anonimizar", "Seudonimizar", "Borrar los datos personales"],
      correcta: 1,
      explicacion: "Con el archivo de equivalencias se puede volver atrás: es **seudonimizar** y los datos siguen siendo personales. Anonimizar no tiene vuelta atrás."
    },
    {
      tipo: "explicacion",
      titulo: "Sesgos: cuando los datos no cuentan toda la historia",
      texto: "Un **sesgo** aparece cuando los datos no representan bien la realidad que quieres estudiar.\nEn 1998 solo se hacía ficha a los clientes del club de socios. Si con esas fichas concluyes «nuestros clientes compran sobre todo informática», hablas de los socios, no de todos los clientes.\nLos sesgos también pueden ser injustos: una decisión automática basada en datos sesgados puede tratar peor a un grupo de personas sin que nadie lo haya querido.",
      consejo: "Antes de sacar una conclusión, pregúntate siempre: «¿quién **no** está en estos datos?»."
    },
    {
      tipo: "seleccionar",
      reto: true,
      modo: "columnas",
      enunciado: "La agencia de marketing quiere estudiar **qué categorías se venden en cada ciudad y en qué meses**. Aplica la **minimización**: marca las columnas que **no deben salir de la empresa** (no son necesarias para ese estudio o identifican a alguien).",
      tabla: {
        columnas: ["nombre", "DNI", "teléfono", "ciudad", "categoría", "mes", "importe", "notas"],
        filas: [
          ["Rosa Prieto", "50712233-K", "915 552 311", "Madrid", "Audio", "1998-03", "43,40", "Usa audífono"],
          ["Tomás Ibarra", "02345871-P", "913 220 418", "Madrid", "Telefonía", "1998-03", "59,00", ""],
          ["Carmen Soto", "11908264-D", "916 404 127", "Alcalá de Henares", "Informática", "1998-04", "12,00", "Pide factura a nombre de su empresa"],
          ["Luis Andrade", "47221930-B", "917 338 090", "Getafe", "Hogar", "1998-05", "24,95", ""]
        ]
      },
      correctas: [0, 1, 2, 7],
      pistas: [
        "Pregunta a cada columna: ¿hace falta para saber qué se vende en cada ciudad y mes? ¿Señala a una persona concreta?",
        "Se quedan dentro **nombre**, **DNI**, **teléfono** y **notas** (una nota puede contener datos de salud). Salen ciudad, categoría, mes e importe."
      ]
    }
  ]
});
