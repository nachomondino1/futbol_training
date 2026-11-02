# Pendientes para validar

Todo lo de acá lo propuse yo: no está en el Doc. Cuando lo valides, borrá la clave de `pendiente_validar` en el JSON y tachá la línea.

## Variantes para 4 personas (propuestas)

- **Rondo**: 3v1 (3 tocan, 1 presiona, rotan cada 2-3 min).
- **Pases cortos con control orientado**: 2 parejas en simultáneo.
- **Pase, control y definición**: 2 pasan en pared, 1 define, 1 defensor pasivo; rotan los 4 roles.
- **Circuito de pases combinados**: 2 parejas en simultáneo.
- **Circuito por estaciones**: los 4 hacen la misma estación (deriva de "con 8, grupos de 4").
- **Día previo**: rondo 3v1 a ritmo bajo; tiro suave con pared simple de a dos.

## Variantes 2/3/4 inventadas donde el Doc solo cubría 8 (o nada)

- **Conducción a ritmo variable** (2, 3, 4).
- **Progresión de aceleración** (2, 3, 4).

## Dosis que faltan en el Doc

- **Pausa entre vueltas de los circuitos**: cargué 2 min (120 s) en los 4 circuitos por tu indicación; el Doc no la dice. Ajustala por circuito si hace falta.

- **Estiramiento estático**: cuánto sostener cada uno.
- Circuitos de fuerza: el Doc da tiempos (40/20 o 40/30, 3 vueltas) pero no repeticiones ni dosis por ejercicio; quedaron en `null`.

## Decisiones mías sobre el Doc

- Plancha se separó en `plancha-frontal` y `plancha-lateral` (las sesiones las usan por separado).
- Escalera: un solo ejercicio con los 3 patrones.
- "Tiro al arco" quedó como alias de Pase, control y definición.
- Días 1, 2, 3, 4, 6 y 7 se reagruparon en 5 sesiones. **Jueves (pelota + físico liviano) no existe en el Doc**: la armé mezclando Día 2, Día 6 y la idea de tu brief. Día 4 y Día 6 no tienen sesión propia: sus bloques quedaron como opciones en martes y jueves.
- Vuelta a la calma de martes: el Doc dice 10-15 min; el bloque suma 10.
- Tiro al arco suave del día previo: el Doc dice 7-8 min; el bloque suma 7. Con eso la sesión da 54 min, no los 50 que dice el Doc.

## Importado del Doc completo (2026-11-02)

Se importaron al glosario todos los ejercicios del Doc de 13 MB que tenían descripción. Los que ninguna sesión usa están marcados `huerfano_ok`: son biblioteca, no rutina. Para armar sesiones con ellos, editá `sessions.json`.

- **Circuito de fuerza del martes (nuevo):** 6 estaciones (sentadilla explosiva, estocada, salto a una pierna, plancha frontal, glúteo, elevación de gemelo), 40 s / 20 s, 3 vueltas, 2 min entre vueltas. Salió de tu mensaje y de la nota "Martes" del Doc. Quedó como primera opción del bloque Circuito del martes. "Glúteo" lo cargué como puente de glúteo: confirmá la variante.
- **Sin descripción en el Doc (no se importaron):** tiros libres con barrera, "pase a extremo + centro", "jugar corto 3 vs 2" (solo un link de Instagram) y el "movimiento del pie" del tiro.
- **Ejercicios sin variantes por cantidad:** los importados no traen variantes para 2, 3, 4 y 8; se indica en el texto cuando son individuales.
- **Instagram:** leg hop, sole+push, zigzag, v-push y light touches apuntan al mismo reel (`video`). No usé las capturas del reel como imagen porque muestran el botón de play.
- **Imágenes:** se usó una imagen por ejercicio, de `fuente/doc_exportado/`. La mayoría parecen sacadas de sitios de terceros (por ejemplo la marca de Gympik en una de las planchas, que no se usa en la web, o las ilustraciones de fitness). Si el repo y la web son públicos, conviene revisar los derechos o reemplazarlas por fotos propias.
- **Imagen del HIIT 10/10:** es la captura de la app Interval Timer con tu configuración (15 sets, 10 s / 10 s, preparación 10 s, cool down 30 s).
- **Cosas del Doc que no importé:** el concepto de "Circuito en 3 partes" (técnica/fuerza, coordinación, aeróbico/técnica con pelota), los links de Instagram de la sección Velocidad (en `fuente/`), "Mentalidad" y la nota de las bandas elásticas.

## Músculos y "para qué sirve" (propuesto por mí, a validar)

El Doc solo decía el grupo muscular de sentadilla y estocada (cuádriceps, glúteos e isquios) y unas etiquetas sueltas (piernas, core, full body). Todo lo demás lo asigné yo:

- **Músculo principal y secundarios de cada ejercicio** (`trabaja` en `exercises.json`). Los más discutibles: cambios de ritmo con conos (cuádriceps), T-drill (glúteo medio), activación neuromuscular (isquios), técnica de carrera (coordinación).
- **Textos de "En la cancha"** de `docs/data/muscles.json`. Los redacté con criterio general, no con una fuente: revisalos y corregí lo que no cierre con lo que te dice tu preparador. Solo la frase de resistencia aeróbica sale del Doc.
- **Grupos que no son músculos:** resistencia aeróbica, coordinación y control, y movilidad, para poder asignar algo a los ejercicios de pelota, el trote y el calentamiento.
- **Cómo rotar las estaciones** ya no es un ejercicio: pasó a `sessions.json` > `guias`. Su variante de 4 personas sigue sin validar.

## Glosario de circuitos (2026-11-02)

- Los 5 circuitos de fuerza que ya estaban en las sesiones se unificaron en uno solo, "Circuito de fuerza", con 4 variaciones (piernas, glúteo y core, fuerza y control, corto). Los nombres y las notas los puse yo, cambialos si querés. La estructura base es 40 s / 20 s y 3 vueltas; "fuerza y control" y "corto" descansan 30 s, como en el Doc.
- **Nuevo, sin tiempos:** "Técnica con pelota: V, coordinación y zigzag" (V push & cut, escalera, zigzag con pelota), armado con lo que contaste. Ninguna sesión lo usa todavía y le faltan vueltas, tiempos y orden exacto si tiene alguna regla. Está marcado `huerfano_ok`.
- Sesiones y circuitos hoy se editan en dos archivos: si cambiás un circuito, cambia en todas las sesiones que lo usan.

## Ejercicios y circuito combinado que contaste (2026-11-02)

- **Cuatro ejercicios nuevos**, con tu descripción: carrera en V con devolución, conducción en V con suela, un toque desde el cono central y pase al cono lateral con control a máxima velocidad. Más "velocidad máxima hasta el cono", que sale de tu mensaje y de la "Parte 3" del Doc. Ninguno tiene variantes por cantidad de personas: los tres últimos se hacen de a dos; no definí qué hacer con más gente.
- **"B corta":** lo entendí como una V corta (tres conos). Si era otra figura, corregí el nombre y la descripción.
- **Pase al cono lateral:** no estabas seguro de si, después de la vueltita, el del cono central devuelve el pase o el que corre vuelve hasta el primer cono. Cargué "vuelve corriendo hasta el primer cono", que fue lo último que dijiste. Confirmalo.
- **Medidas que mencionaste:** 8 m entre los dos conos del último ejercicio y 5 m de radio en el del cono central. Los cargué como "unos".
- **Circuito combinado de 3 ejercicios:** reemplaza al de técnica suelto. Tiene tres versiones (fuerza-coordinación-pelota, fuerza-coordinación-velocidad máxima y técnica-coordinación-pelota sin fuerza). Los ejercicios de cada una los elegí yo con lo que mencionaste: revisalos. No tiene vueltas ni tiempos porque no los dijiste, y ninguna sesión lo usa todavía.
- **Leg hop está en la categoría Potencia:** en la primera versión (que dice "Fuerza") sale con la etiqueta Potencia. Si preferís otro ejercicio de fuerza como primera parte, cambialo en `circuits.json`.

## Pase con presión inmediata y arcos en L (2026-11-02)

- Ya estaba en el glosario con el montaje del Doc. Lo reescribí con tu explicación (delantero, defensor que sale a máxima, pasador detrás del defensor, arquitos mirando al delantero) y agregué las variantes de 2 y 3 personas, que salen de que "el defensor puede actuar como pasador con 2". Están marcadas sin validar.
- Sin variantes para 4 y 8 personas: no dijiste cómo se hace con más.
- Cambió un detalle respecto del Doc: antes el pasador estaba "detrás y a un costado del defensor"; ahora dice "detrás del defensor", como contaste.
