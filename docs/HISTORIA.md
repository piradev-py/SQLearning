# Historia de SQLearning: «El Fantasma de Faro»

> ⚠️ **Spoilers.** Este documento es la «biblia» de la historia para quien escribe lecciones y genera datos.
> El alumno nunca lo ve. Cualquier lección, ticket o dato del Fantasma debe ser coherente con lo que hay aquí.

## La empresa
**Faro** es una cadena de tiendas de tecnología y hogar con cinco puntos de venta: **Madrid, Valencia, Sevilla,
Bilbao y la tienda online**. Tiene almacén central en Getafe (Madrid). Vende productos de varias categorías
(informática, telefonía, audio, hogar, gaming) a clientes particulares.

El alumno entra como **becario/a de datos** en el equipo de Lucía. No tiene nombre en la historia: los personajes
le hablan de tú («Oye, ¿puedes mirar…?»).

## Prólogo (se ve SIEMPRE al entrar, antes de la hoja de ruta)
Secuencia breve (~30–40 s): las frases aparecen una a una sobre la ciudad de neón; al final, el botón
«Continuar a la hoja de ruta». Hacer clic adelanta la frase siguiente (se leen todas igualmente). Con movimiento
reducido aparecen todas a la vez y el botón llega a los pocos segundos. Texto (en `js/prologo.js`):

Texto definitivo del usuario (adaptado: «cuatro tiendas y una tienda online», para cuadrar con los datos):

1. La ciudad tiene secretos. Y algunos se esconden en los datos.
2. En **Faro**, una empresa tecnológica con cuatro tiendas y una tienda online, algo extraño está ocurriendo: productos que desaparecen, clientes que nunca existieron y reembolsos imposibles.
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

Lo que lo delata en los datos (y cómo lo va descubriendo el alumno):

| Etapa | Pista del Expediente | Qué se ve en los datos |
|---|---|---|
| 1 | **El inventario imposible** | Un producto con stock negativo (-12). Ordenando por stock aparece arriba del todo. |
| 2 | **Clientes de madrugada** | Varios clientes dados de alta entre las 2:00 y las 5:00, todos con email `@correo-rapido.example`. Uno reclama un pedido que «nunca hizo». |
| 3 | **Reembolsos disparados** | Los reembolsos de la tienda online triplican la media de las demás tiendas. |
| 4 | **Pedidos fantasma** | Pedidos reembolsados que no tienen envío registrado (LEFT JOIN → NULL); los pocos envíos que hay los firma el almacén de Getafe. |
| 5 | **Una sola dirección** | Al limpiar los datos (mayúsculas, espacios, abreviaturas «C/» = «Calle»), las direcciones de los clientes falsos son la misma, y coincide con la de un empleado. |
| 6 | **La cuenta `admin_temp`** | La tabla de auditoría que diseña el alumno registra que todos los cambios raros los hace `admin_temp`. Iván parece culpable. |
| 7 | **La coartada de Iván** | Con funciones ventana y fechas: `admin_temp` actúa durante las vacaciones de Iván, y siempre pocos minutos después de que Héctor ficha en el almacén. |
| 8 | **Caso cerrado** | Analítica de anomalías (z-score) y cuantificación del fraude; el informe final para Ana Beltrán señala a Héctor. |

Reglas para no romper el misterio:
- Antes de la etapa 7 **nunca** se nombra a Héctor como sospechoso. Puede aparecer como personaje amable.
- Iván debe parecer culpable en la etapa 6 (pista falsa) y quedar limpio en la 7.
- Los datos del Fantasma son **pocos y discretos**: no deben llamar la atención en las lecciones normales,
  solo cuando la consulta del caso los busca a propósito.
- Las cifras y nombres concretos los fija `herramientas/generar-datos.mjs` (semilla fija). Si una lección cita
  un número, debe salir de ahí.

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
Ana Beltrán te ofrece el puesto de Head of Data. Lucía te recomienda los siguientes pasos de un Data Analyst
fuera de SQL: hojas de cálculo, una herramienta de BI (Power BI, Tableau, Looker) y Python con pandas.
