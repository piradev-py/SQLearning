# Historia de SQLearning: «El Fantasma de Faro»

> ⚠️ **Spoilers.** Este documento es la «biblia» de la historia para quien escribe lecciones y genera datos.
> El alumno nunca lo ve. Cualquier lección, ticket o dato del Fantasma debe ser coherente con lo que hay aquí.

## La empresa
**Faro** es una empresa tecnológica con **cinco tiendas físicas y una tienda online**: **Madrid, Valencia, Sevilla,
Bilbao, Barcelona (recién inaugurada) y la online**. Tiene almacén central en Getafe (Madrid). Vende productos de varias categorías
(informática, telefonía, audio, hogar, gaming) a clientes particulares.

El alumno entra como **becario/a de datos** en el equipo de Lucía. No tiene nombre en la historia: los personajes
le hablan de tú («Oye, ¿puedes mirar…?»).

## Prólogo (se ve SIEMPRE al entrar, antes de la hoja de ruta)
Secuencia breve (~30–40 s): las frases aparecen una a una sobre la ciudad de neón; al final, el botón
«Continuar a la hoja de ruta». Hacer clic adelanta la frase siguiente (se leen todas igualmente). Con movimiento
reducido el ritmo es el mismo, pero cada frase entra con un fundido, sin desplazamiento (petición del usuario). Texto (en `js/prologo.js`):

Texto definitivo del usuario (igual que la locución, que no se puede cambiar):

1. La ciudad tiene secretos. Y algunos se esconden en los datos.
2. En **Faro**, una empresa tecnológica con cinco tiendas y una tienda online, algo extraño está ocurriendo: productos que desaparecen, clientes que nunca existieron y reembolsos imposibles.
3. Alguien está detrás de todo. Le llaman **el Fantasma**.
4. Lucía Mora, jefa de datos, te ha elegido para descubrir la verdad. Tu única herramienta es **SQL**. Tus únicas pistas, miles de registros.
5. Cada consulta revela una pista. Cada error oculta un secreto.
6. ¿Estás preparado para encontrar al Fantasma?
7. Ten cuidado. Puede que él también te esté buscando.
8. *(sello)* **CASO ABIERTO · EL FANTASMA DE FARO**

La locución `recursos/spech_intropage.mp3` suena durante el prólogo.

**Si ya has avanzado**, tras la frase 3 se muestra «Anteriormente en el caso…» con las pistas del Expediente que
ya tienes y el último nivel superado, luego la frase 7 y el sello (que cambia a «CASO EN CURSO»; y a «CASO CERRADO» al
terminar la etapa 8). Nunca muestra pistas que el alumno no haya descubierto.

## Prólogo opcional: la Etapa 0 «El archivo de papel»
Antes del primer día, Lucía pone al candidato una prueba: ordenar el archivo de la **primera tienda de Faro (1998)**,
que llevaba todo en fichas de papel y un Excel gigante. Es una historia **autónoma** (sin pistas del Fantasma),
para que quien se la salte no pierda nada de la trama. Sus datos son pequeños y viven dentro de cada nivel
(fichas y tablas de ejemplo), no en `datos/`.

## La tienda nueva: Barcelona
Faro acaba de inaugurar su quinta tienda física, **Barcelona** (1 de octubre de 2026, tienda id 6). En las etapas
1–5 no tiene ventas: es la «recién llegada». Idea del usuario: **aprovecharla en los temas avanzados**:
- **Etapa 6 (IT):** darla de alta de verdad en la base de datos — `INSERT` de su plantilla y su stock inicial,
  restricciones (`CHECK`, `FOREIGN KEY`), transacciones (si falla algo, no se queda a medias).
- **Etapas 7–8 (Dirección / Analítica):** sus primeras semanas de ventas frente a las otras tiendas (crecimiento,
  ventanas, comparación con aperturas anteriores, cohortes de sus primeros clientes) y el informe para Ana Beltrán.
- Posible pista falsa: su apertura coincide en el tiempo con el final de la trama; sus datos deben estar limpios.

## Personajes
| Personaje | Rol | Etapa principal | Tono |
|---|---|---|---|
| **Lucía Mora** | Jefa de datos, mentora | todas | Cercana, exigente, da los consejos técnicos (`consejo`) |
| **Marcos Gil** | Atención al cliente | 2 | Agobiado, siempre con un cliente al teléfono |
| **Elena Ruiz** | Directora de ventas | 3 | Quiere números para «ayer» |
| **Héctor Vidal** | Jefe de logística | 4 | Simpático, muy servicial… demasiado |
| **Nuria Campos** | Responsable de la migración de sistemas | 5 | Ordenada, odia los datos sucios |
| **Iván Soler** | Administrador de sistemas (IT) | 6 | Brusco, técnico, el sospechoso evidente |
| **Ana Beltrán** | Directora general | 7–8 | Pide informes para el consejo |
| **«El Fantasma»** | Nunca aparece | — | Solo deja rastro en los datos |

## El misterio (solución)
**El culpable es Héctor Vidal (logística).** Durante meses ha creado **clientes falsos** y les ha hecho
**reembolsos** de pedidos que nunca se enviaron, cobrando el dinero en cuentas suyas. Para tapar el hueco de
inventario hace **ajustes de stock** y algún **cambio de precio** de madrugada. Lo hace con la cuenta de sistema
`admin_temp`, una cuenta antigua de IT que nadie desactivó, para que las sospechas caigan sobre **Iván Soler**.

Detalles de la resolución (decisión del usuario, etapa 8):
- **Cómo consiguió `admin_temp`:** Iván la dejó configurada en 2019 en el terminal ALM-GET-03 del almacén de Getafe,
  donde trabaja Héctor. Héctor también conocía la dirección de Iván (compañeros desde hace años) y la usó para los falsos.
- **Adónde fue el dinero:** los 69 reembolsos del Fantasma se abonan por transferencia a una única cuenta, que es la
  **cuenta de nómina de Héctor** (`abonos` y `fichas_empleados.cuenta_nomina` en `faro-e8.sql`).

Lo que lo delata en los datos (y cómo lo va descubriendo el alumno):

| Etapa | Pista del Expediente | Qué se ve en los datos |
|---|---|---|
| 1 | **El inventario imposible** | Un producto con stock negativo (-12). Ordenando por stock aparece arriba del todo. |
| 2 | **Clientes de madrugada** | Varios clientes dados de alta entre las 2:00 y las 5:00, todos con email `@correo-rapido.example`. Uno reclama un pedido que «nunca hizo». |
| 3 | **Reembolsos disparados** | Los reembolsos de la tienda online triplican la media de las demás tiendas. |
| 4 | **Pedidos fantasma** | Pedidos reembolsados que no tienen envío registrado (LEFT JOIN → NULL); los pocos envíos que hay los firma el almacén de Getafe. |
| 5 | **Una sola dirección** | Al limpiar los datos (mayúsculas, espacios, abreviaturas «C/» = «Calle»), las direcciones de los clientes falsos son la misma, y coincide con la de **Iván Soler** (`fichas_empleados`). Es una **pista falsa** puesta por Héctor, igual que la cuenta `admin_temp`: refuerza que Iván parezca culpable en la etapa 6. |
| 6 | **La cuenta `admin_temp`** | La tabla de auditoría que diseña el alumno registra que todos los cambios raros los hace `admin_temp`. Iván parece culpable. |
| 7 | **La coartada de Iván** | Con funciones ventana y fechas: `admin_temp` actúa durante las vacaciones de Iván, y siempre pocos minutos después de que Héctor ficha en el almacén. |
| 8 | **Caso cerrado** | Analítica de anomalías (z-score) y cuantificación del fraude; los abonos llegan a la cuenta de nómina de Héctor; el informe final para Ana Beltrán lo señala. |

Reglas para no romper el misterio:
- Antes de la etapa 7 **nunca** se nombra a Héctor como sospechoso. Puede aparecer como personaje amable.
- Iván debe parecer culpable en la etapa 6 (pista falsa) y quedar limpio en la 7.
- Los datos del Fantasma son **pocos y discretos**: no deben llamar la atención en las lecciones normales,
  solo cuando la consulta del caso los busca a propósito.
- Las cifras y nombres concretos los fija `herramientas/generar-datos.mjs` (semilla fija). Si una lección cita
  un número, debe salir de ahí.

## «Lucía, en voz baja» (notas de pasillo, idea del usuario)
Campo `rumor` de la lección: al superar la primera diligencia y el caso de cada etapa, Lucía te cuenta algo del pasillo.
Dan trasfondo, desvían sospechas y **siembran lo que se paga en el expediente final**. Reglas: antes de la etapa 7 Héctor
solo es amable, servicial o curioso, nunca sospechoso; cada siembra tiene su pago.

| Siembra (diligencia) | Pago |
|---|---|
| Héctor pregunta por la persona nueva de datos (e1-01), te busca por los envíos de Getafe (e4-10), quiere «entender» lo de los fichajes (e7-01), pregunta si has terminado (e8-01) | Alguien intenta entrar con tu usuario desde el almacén (e8-11) → salió de ALM-GET-03: «él también te estaba buscando» (expediente final; cierra la frase 7 del prólogo) |
| Héctor llega de madrugada al muelle y el terminal «aún tiene cosas de IT de la migración de 2019» (e4-01) | `admin_temp` en ALM-GET-03 y las 75 noches (e7, e8) |
| Iván «mal de dinero, la hipoteca» (e5-01) | Lo contó Héctor (expediente final) |
| Héctor ayudó a Iván con la mudanza a la calle Olmo y lo defiende tres veces (e5-11) | Conocía la dirección de los clientes falsos (desenlace) |
| Correo de Héctor «a disposición de quien investigue» (e6-12), le llaman del banco (e7-11) | Su frase y sus deudas (expediente final) |
| Marcos y la clienta de Bilbao (e2-01) | Iratxe Muñoz, pedido 2210 (e2, desenlace) |
| Iván pregunta quién mira las altas (e2-09), portazos (e6-01), deja de darlos y te trae un café (e7-11) | Iván, sospechoso evidente que queda limpio |

## Recompensas (decisión del usuario: nada de estrellas ni insignias infantiles)
- **Créditos ◈** (la criptomoneda interna de Faro) en lugar de XP: `xp` del nivel + 10 por bloque.
- **Bloques verificados** (1–3 por nivel) en lugar de estrellas: 3 = sin pistas · 2 = con pistas · 1 = viendo la
  solución. Se dibujan como bloques encadenados ▰▰▱.
- **Credenciales** (tarjetas de acceso) en lugar de insignias.
- **Niveles de autorización** en lugar de rangos: L1 Becario → L2 Analista junior → L3 Analista → L4 Analista
  senior → L5 Lead de datos → L6 Head of Data (umbrales de créditos en `js/progreso.js`).
- **Hoja de ruta del caso** en lugar de mapa: un tablero holográfico de investigación. Cada etapa es un
  **expediente** (EXP.0 … EXP.8); cada nivel, una **diligencia**; los hilos de neón las unen. Los expedientes aún
  bloqueados aparecen **CLASIFICADOS** (títulos tachados), para no destripar el temario ni la trama.

## Epílogo (tras el caso final)
Se ve en `caso-cerrado.html` (el **expediente final**): ficha de Héctor con un retrato en pixel art generado por código
(`herramientas/generar-hector.mjs`: el Héctor de la historia, no un fugitivo; la imagen de `recursos/` solo fue referencia de estilo),
las tres pruebas (el dinero, el terminal, las noches), el sello CASO CERRADO, el desenlace y el epílogo. Se abre al resolver
el caso e8-12 (botón «Abrir el expediente final» y enlace en EXP.8); antes sale CLASIFICADO. El sello del prólogo cambia
al resolver el caso, aunque se haya jugado con todo desbloqueado.
Ana Beltrán te ofrece el puesto de Head of Data. Lucía te recomienda los siguientes pasos de un Data Analyst
fuera de SQL: hojas de cálculo, una herramienta de BI (Power BI, Tableau, Looker) y Python con pandas.
