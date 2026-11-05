# Plan: cuántos somos ese día

**Actualización (2026-11-05):** se implementó una versión: en cada sesión (una sola vez, arriba) hay solapas "Hoy somos" 1–10; tocar una filtra las opciones de todos los bloques con `jugadores_min`/`jugadores_max` de cada ejercicio, y tocarla de nuevo la saca. Si ninguna opción sirve, avisa. Por ahora solo `pelota-al-campo-rival` tiene `jugadores_max` (2); el resto de los topes están por definir. Lo de abajo es el plan original.

**Estado (2026-11-03): en pausa otra vez.** Hubo una primera versión simple (selector "Hoy somos" en cada sesión, guardado en el navegador, que ocultaba las opciones de cada bloque que pedían más jugadores). Se sacó de la web por decisión tuya para dejarlo como posible mejora futura. Quedó el dato `jugadores_min` en `exercises.json` (lo usan el filtro "Jugadores" y los colores de las tarjetas en Ejercicios). La versión del selector está en el historial de git: commit `9d7073d` (código en `docs/js/sesiones.js` y `docs/js/common.js`). Todavía no está claro cómo implementarlo. El selector "Somos" se sacó del código de la web: ya no existe en el header ni se guarda nada en el navegador. Cada ejercicio muestra todas sus variantes (2, 3, 4 y 8) y todos sus diagramas. La versión vieja del selector (botones 2, 3, 4, 8 que elegían una sola variante) está en el historial de git, en el commit `6d954ff` (`docs/js/common.js`).

## Qué se quiere

La cantidad de jugadores puede ser cualquier número, no solo 2, 3, 4 u 8. Cada ejercicio tendría una cantidad ideal. Si los que somos ese día quedan fuera de ese rango, el ejercicio no se tiene en cuenta.

## Idea de implementación (borrador)

1. **Selector libre:** un número con − / + (de 1 a un techo a definir) en lugar de los cuatro botones.
2. **Rango por ejercicio:** un campo `jugadores: {min, max}` en `exercises.json`. Los individuales (sentadilla, plancha) van de 1 a "sin tope".
3. **Variantes por rango:** las claves `"2"`, `"3"`, `"4"`, `"8"` pasarían a rangos como `"2"`, `"3"`, `"4"`, `"5-8"`. La web usa la que contiene a N.
4. **Ejercicio fuera de rango:**
   - Glosario: se oculta o se atenúa con "no va con N".
   - Sesiones: no se saca en silencio, porque el bloque podría quedar vacío sin que se note. Se muestra atenuado con aviso, y de las opciones de un bloque se elige por defecto la primera que sirva. Si ninguna sirve: "Sin opciones para N, salteá este bloque".
5. **Validador:** avisar de cantidades que dejen un bloque sin opciones, para verlo antes de ir a la cancha.
6. **Diagramas:** hoy hay uno por 2, 3, 4 y 8. Para otros números habría que decidir si se reusa el más cercano o se generan más (`scripts/gen_diagramas.py`).

## Preguntas abiertas

- ¿Qué se hace con 5, 6 y 7? Opciones: definir variantes, excluir el ejercicio del rango, o usar la variante más cercana hacia abajo.
- ¿Cuál es el techo del selector?
- ¿Quién define el rango de cada ejercicio? Se puede proponer uno y marcarlo en `PENDIENTES.md` para validar.
- ¿El filtro debe ocultar ejercicios o solo avisar?

## Cuándo retomarlo

Cuando estén resueltas las preguntas de arriba, sobre todo la de 5-7 y la del filtro.
