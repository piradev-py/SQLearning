# Guía de estilo visual de SQLearning

Estética **cyberpunk / retrowave con aire de misterio**: una ciudad de neón de noche, entre niebla, donde algo no
cuadra. Oscuro y sobrio; el neón es luz lejana, no un cartel chillón. Decisiones del usuario (2026-10-15).

## Dos ambientes
| Ambiente | Dónde | Cómo se activa | Intensidad |
|---|---|---|---|
| **Trabajo** | laboratorio, editor, pasos con código de las lecciones | por defecto | Sobrio: neón apagado, distrae poco |
| **Historia** | inicio, mapa, tickets (`historia`), expediente, casos, celebraciones | `<html data-ambiente="historia">` | Neón un punto más vivo, escena completa con figuras |

Los dos comparten el mismo misterio: fondo casi negro violáceo, niebla, viñeta. Los colores salen siempre de las
variables de `css/tema.css` (nunca colores sueltos en otros CSS), así un cambio de tono se hace en un solo sitio.
Tema **noche** por defecto; **día** («amanecer synthwave») como alternativa en el botón 🌙/☀️.

## Paleta (noche)
- Fondo `#04030a` → cielo `#0b0818`; paneles `#0a0914` / `#13111f`; bordes `#242036`.
- Texto `#c4bfd6` (gris lavanda), secundario `#857f9e`. Nunca blanco puro en párrafos.
- Magenta polvoriento `--acento` (historia: más vivo) · cian de niebla `--cian` · ámbar del faro `#c9a66b`.
- El neón va en **bordes, títulos y detalles**; los textos largos sin brillo.

## Tipografía
Orbitron (marca y títulos, en mayúsculas, con espaciado) · JetBrains Mono (código) · fuente del sistema (texto).

## Figuras (dibujos propios en SVG, nunca imágenes de terceros)
- ✅ Ciudad neón con el faro de Faro (`herramientas/generar-ciudad.mjs` → `recursos/ciudad-neon.svg`).
- ✅ Retratos en pixel art de los siete personajes para tickets, consejos y notas de Lucía
  (`herramientas/generar-retratos.mjs` → `recursos/retratos/<id>.svg`), con la luz del retrato grande de Héctor.
- ✅ Lluvia fina de neón y un dron que cruza el cielo (CSS en `css/fondo.css`, solo en el ambiente historia) y carteles
  FARO, GETAFE y BAR en la ciudad (letras de píxeles en `generar-ciudad.mjs`; la imagen va con `?v=` porque `recursos/` no lleva versión).
- ✅ Sello «CASO CERRADO» (prólogo y expediente final).
- ✅ La silueta borrosa del **Fantasma**: aparece y desaparece en el expediente de pistas; con el caso cerrado ya no sale.
- Animaciones lentas y sutiles (parpadeo de neón, lluvia, destello del faro); con `prefers-reduced-motion: reduce`
  quedan quietas (el Windows del usuario lo tiene activado).

## Accesibilidad
Contraste de texto AA como mínimo en los dos temas y ambientes; foco visible (cian); nada de información solo por color.
