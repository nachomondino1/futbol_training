# Plan (stand-by): cuántos somos ese día

**Estado:** en pausa. Todavía no está claro cómo implementarlo. El selector "Somos" está sacado del header: `SELECTOR_PERSONAS = false` en `docs/js/common.js`. Sin selector, cada ejercicio muestra todas sus variantes (2, 3, 4 y 8) y todos sus diagramas. Poner el flag en `true` lo vuelve a mostrar (versión vieja: elige una sola variante, no filtra).

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
