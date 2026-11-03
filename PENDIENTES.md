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

## Plantillas de circuito: fuerza, coordinación y una tercera parte (2026-11-02)

- Hay tres plantillas: **fuerza, coordinación, pelota**; **fuerza, coordinación, aeróbico**; y **fuerza, coordinación, velocidad máxima** (esta salía de la idea de "salir corriendo"; borrala si no la usás). Comparten los bancos de opciones: 14 de fuerza, 8 de coordinación, 11 de pelota, 6 de aeróbico y 4 de velocidad. Las armé yo con lo que había en Ejercicios y lo que mencionaste: sacá o agregá lo que no te sirva (`circuits.json` > `bancos`).
- **Aeróbico:** trote continuo, HIIT 10/10, HIIT 15/15, intervalo 4×4, reducido y rondo. Es una lista mía; confirmá cuáles entran como tercera parte de un circuito.
- **Coordinación:** como solo existe la escalera (con sus 3 patrones) y la técnica de carrera (skipping, taloneo, rodillas altas), las separé en opciones. "Aceleración a cada cono en zigzag" es un ejercicio nuevo que sale de la "Parte 2" del Doc y no tiene más descripción que esa.
- La elección se hace en la página Circuitos y no se guarda. **Las sesiones todavía no usan las plantillas.**
- Ninguna plantilla tiene vueltas ni tiempos: no los dijiste.

## Nombres (2026-11-02)

- "Glosario" pasó a llamarse **Ejercicios** en lo que se ve (menú, títulos, textos). Los archivos siguen llamándose `glosario.html` y `glosario.js` para no romper links ni lo que guarda la versión sin señal.

## "Qué vas a ganar" en las sesiones (2026-11-02)

- Hay 8 cosas que se pueden ganar (`objetivos.json`): velocidad y aceleración, resistencia aeróbica, fuerza, potencia y salto, control y técnica con pelota, precisión de tiro, coordinación y agilidad, movilidad y prevención. Los nombres y las frases son míos; solo la de resistencia aeróbica sale del Doc.
- **Qué aporta cada ejercicio** (`aporta` en `exercises.json`): lo asigné yo, uno o dos por ejercicio. Los más discutibles: rondo (control y aeróbico), pase con presión y arcos (control y velocidad), activación neuromuscular (velocidad y movilidad) y sprints con trineo o cuesta (velocidad y fuerza).
- **El cálculo es aproximado:** reparte los minutos del bloque en partes iguales entre sus ejercicios, y si un ejercicio aporta dos cosas, mitad y mitad. Por eso dice "unos N min". Para algo más fino habría que poner minutos por ejercicio.
- **El objetivo de cada sesión** sale de las frases del Doc ("Objetivo:" de cada día) para velocidad, fuerza y día previo; para el martes y el jueves lo escribí con lo que me contaste. Las otras sesiones del Doc (Días 4 y 6) no tienen sesión propia.
- Como el martes tiene "movilidad y prevención" en segundo lugar (activación + vuelta a la calma suman 20 min), puede parecer más importante de lo que querés. Si preferís que solo cuente lo que sea entrenamiento, se puede excluir esos bloques del cálculo.

## Sin días, etiquetas de lo que se gana y circuito de fuerza sin versiones (2026-11-02)

- **Se sacaron "martes" y "jueves"** de las sesiones y de sus nombres internos (ahora `fisico-aerobico-piernas` y `pelota-fisico-liviano`). El objetivo de la segunda ya no dice "sábado" sino "partido".
- **Las etiquetas** de sesiones y circuitos dicen qué se gana (aeróbico, velocidad, pelota...), se calculan solas y no se escriben a mano. "Movilidad y prevención" no aparece como etiqueta porque está en todas las sesiones; sí en el detalle.
- **Circuito de fuerza:** ya no tiene versiones (piernas, glúteo y core, corto, fuerza y control). Es la lista de 14 ejercicios posibles y la propuesta de 6 que se hace hoy. Se pierde la idea de "glúteo y core, bajo impacto" como versión: queda como una combinación posible dentro de la lista (abducción de cadera, plancha lateral, puente...).
- **Descanso de 30 s:** las sesiones "Pelota + físico liviano" y "Fuerza y control" lo usan, como en el Doc; el resto, 20 s.
- **El bloque de circuito de "Pelota + físico liviano" pasó de 22 a 25 min** (ahora son 6 estaciones y no 5); la sesión pasa de 87 a 90 min, como el Día 6 del Doc.
- **En la sesión no se eligen los ejercicios**: se ve la propuesta y el resto como lista, con un link a la página Circuitos para elegir los del día.

## Activación como circuito y "Qué vas a ganar" plegado (2026-11-02)

- **La activación es un circuito** (`activacion`: trote suave 3-4 min + movilidad articular) que usan 4 sesiones, y hay otro para el día de velocidad (`activacion-velocidad`: trote progresivo, movilidad dinámica y técnica de carrera). El día previo reutiliza `activacion` con una nota ("muy suave, sin pelota"). Agregué el ejercicio **Trote suave**, que salía del Doc ("trote suave 3-4 min + movilidad articular").
- Antes, "Fuerza y control" arrancaba con trote suave de **3 min**; ahora usa el circuito de 3-4 min como las demás.
- **Las sesiones ya reutilizan** ejercicios y circuitos por id. Lo que siguen definiendo por su cuenta es lo propio de cada una: dosis y notas, la estructura de vueltas del HIIT y del rondo del martes, y las variantes del rondo y del tiro suave en el día previo. Si querés mover la estructura del HIIT al ejercicio, se puede.
- **"Qué vas a ganar"** arranca plegado, con las etiquetas visibles en la línea cerrada. Si lo abrís, queda abierto al cambiar de sesión.

## Con pelota y sin pelota, y subcategorías (2026-11-02)

- La página Ejercicios filtra primero **Con pelota / Sin pelota**. En "Con pelota" aparecen las subcategorías: tiro al arco, pase corto, pase largo, control orientado, conducción y regate, posesión y rondo, con oposición (1v1, 2v1) y pelota parada. En "Sin pelota", las categorías de siempre.
- Las subcategorías de pelota las definí yo a partir de las que dijiste (tiro al arco, pase largo, pase corto, control orientado) más las que hacían falta para los otros ejercicios. Qué subcategorías lleva cada uno (uno a tres) también es mío: revisalo.
- **"Reducido" pasó de Aeróbico a Con pelota** (sigue aportando aeróbico).
- La categoría "Pelota" ahora se llama "Con pelota".

## Ocho sesiones, una por objetivo, y materiales (2026-11-02)

- **Las 5 sesiones anteriores se reemplazaron por 8**, una por objetivo (velocidad, coordinación, fuerza, potencia, aeróbico, control con pelota, definición, movilidad). Las variantes son opciones dentro de cada bloque. El "día previo" quedó dentro de Movilidad (el bloque "Pelota suave"). Hay que validar la distribución de minutos y qué opciones ofrece cada bloque.
- **Materiales:** cada ejercicio tiene `materiales` y se muestra como sección en su detalle y como línea al abrirlo en una sesión (ya no hay aviso ⚠). Los materiales que asigné a cada ejercicio salen de la descripción y hay que validarlos.
- **Opciones nuevas a validar:** "Series pesadas" (fuerza; dosis propuesta 3-5 series de 6-10 repeticiones), "Cuesta" (velocidad) y los bloques de potencia, que dependen de material que no tenemos.

## Circuitos unidos (2026-11-02)

- **Activación es un solo circuito:** trote suave, movilidad articular y técnica de carrera como **opcional** (se usa en los días de velocidad). Se eliminó `activacion-velocidad`; la sesión de Velocidad lo reutiliza con una nota.
- **Las tres plantillas son una:** "Fuerza, coordinación y cierre". La última parte junta pelota, aeróbico y velocidad (20 alternativas, con el nombre del banco de cada una). Como propuesta queda el primer ejercicio de pelota: decime si preferís otro.
- **Las sesiones muestran todo desplegado** (ejercicios y guías); "Qué vas a ganar" sigue plegado.

## Cuatro sesiones (2026-11-02)

- **Quedaron 4 sesiones** (antes 8): **Velocidad y agilidad** (85 min), **Fuerza y potencia** (90), **Aeróbico** (85) y **Pelota** (90, con conducción, pase y definición). Cada bloque conserva las opciones de las sesiones que se unieron.
- **Movilidad y prevención ya no es sesión.** Se perdió el "día previo / día después". `activacion-neuromuscular` quedó sin sesión (`huerfano_ok`); sigue en Ejercicios.
- Validar los minutos de los bloques nuevos y cuáles opciones quedan en cada uno. Los ejercicios que necesitan material que no tenemos (cajón, pelota medicinal, barra, trineo, cuesta) siguen marcados con ⚠ al abrirlos.

## Sin activación ni vuelta a la calma en las sesiones (2026-11-02)

- Se sacaron los bloques **Activación** y **Vuelta a la calma** de las 4 sesiones (duran ahora 60, 70, 65 y 70 min). El circuito `activacion` y el ejercicio de estiramiento siguen en Circuitos y Ejercicios, pero ninguna sesión los usa.
- La nota de trote progresivo y la técnica de carrera del día de velocidad se perdieron; la técnica de carrera sigue como opción del bloque "Pies".

## Activación como la hacés vos (2026-11-02)

- El circuito `activacion` ahora es: trote suave (3-4 min), activación dinámica (primero tren superior, después inferior), progresión de aceleración y velocidad máxima hasta el cono. Reemplaza a "trote suave + movilidad articular + técnica de carrera". "Movilidad articular" quedó sin uso (sigue en Ejercicios). Falta definir dosis de la aceleración y la velocidad.

## Cambios a partir de papers de fútbol (2026-11-02)

- **Fuerza y potencia:** ahora primero Potencia (con el cuerpo fresco) y después Fuerza. Es criterio mío, sin paper directo.
- **Nuevo ejercicio: Nordic hamstring**, en el banco del circuito de fuerza (como alternativa, no en la propuesta de 6). Necesita un compañero que sujete los tobillos y una colchoneta (⚠). La dosis (2-3 series de 4-6 repeticiones) la propuse yo. Respaldo: metaanálisis con hasta ~50% menos lesiones de isquios en fútbol, con pocos estudios.
- **Aeróbico:** el bloque aeróbico pasó de 30 a 35 min (un 4×4 completo son unos 25 min más transiciones). La sesión dura 70.
- **"Cuándo" en cada sesión:** una línea que sugiere en qué momento de la semana hacerla (velocidad dos días antes del partido, fuerza y aeróbico temprano, pelota suave el día previo). Es una inferencia a partir de estudios sobre la semana de partido; no encontré un paper que diga el reparto exacto.
- Sigue sin haber ejercicio con **aductores** como músculo principal.

## Página de inicio nueva (2026-11-02)

- Rehecha de cero siguiendo `DESIGN_PLAYBOOK_unificado.md` §12 (landing): header angosto, hero a pantalla completa con degradé al fondo, título con dos palabras clave en color ("fútbol", "cancha"), un solo botón que baja a las sesiones, y abajo las sesiones (con sus bloques) y "Cómo está armado" (con los conteos reales de los datos).
- **Sin foto de fondo:** el playbook sugiere una foto con licencia libre; como no hay una elegida, el hero usa las rayas del césped y el círculo de la cancha dibujados en CSS. Si querés foto, pasame palabras clave (cancha de noche, pelota, botines...) y la pruebo.
- Los textos del hero y las frases de cada sección son míos: cambialos si no te suenan.

## Header nuevo y portada sin degradé blanco (2026-11-02)

- **Header en todas las páginas:** barra fija verde oscuro con vidrio esmerilado, ⚽ como logo, links como pastillas y la página actual en amarillo. Sacó las rayas del césped y la línea blanca gruesa. Los saltos a un bloque o ejercicio descuentan la barra (`--header-h`).
- **Portada:** el hero ya no se funde con el fondo claro; termina con el borde inferior redondeado.

## Patrones de la escalera de coordinación (2026-11-02)

- La escalera ahora tiene **6 patrones con su diagrama**: un pie por cuadrado, dos pies por cuadrado, adentro-adentro-afuera-afuera, lateral, zig-zag y salto con un pie. Los dibujé yo (SVG propios, sin derechos de terceros): blanco = pie izquierdo, amarillo = derecho, los números son el orden de los apoyos.
- **Hay que validar cada patrón.** Del Doc salían solo "pie-pie", "in-in-out-out" y "lateral" (y "zig-zag, in-out, lateral" en otra parte); cómo se hace cada uno exactamente (por ejemplo, el lateral y el zig-zag) lo definí yo. "Dos pies por cuadrado" y "Salto con un pie" los sumé yo por ser comunes.
- Se regeneran con `python3 scripts/gen_diagramas.py`.

## Tres ejercicios nuevos con pelota (2026-11-03)

- **Cuadrado con uno en el medio** (rondo en cuadrado de 3 m): lo puse en la sesión Pelota. La variante de 4 (un lado del cuadrado siempre vacío) ya está confirmada. La rotación del del medio después de cada minuto también la sumé yo.
- **Conducción y vuelta por detrás** (de a 3, conos a 15 m): en Pelota, bloque "Conducción y pase". Que rotan los lugares después de unos minutos lo sumé yo. Lo leí como una dejada: el que conduce deja la pelota al compañero (que no se mueve) y le da la vuelta por detrás para retomarla.
- **Pelota al campo rival** (idea tuya, de a 2): en Velocidad y agilidad, bloque "Pelota". Reglas confirmadas por vos: punto si la pelota queda quieta en el campo rival antes de que pueda pegarle, punto para el rival si la mandás afuera, a 10. Falta el tamaño exacto de la cancha.
- Subcategorías y qué aporta cada uno (control, velocidad) las asigné yo.

## Pared y control orientado entre conos (2026-11-03)

- Ejercicio nuevo de a 3 (conos a 15 m, pared de primera y control orientado). Quedó en la sesión Pelota, bloque "Conducción y pases con conos". Lo dosifiqué en 1 minuto por tanda, como dijiste ("ponele"), y que rotan después lo sumé yo. Subcategorías y lo que aporta (control, velocidad) las asigné yo.

## Revisión de ejercicios (2026-11-03)

- **Imágenes:** 11 diagramas nuevos dibujados por mí (conos y pelota). Ahora 45 de 62 ejercicios tienen imagen. Hay que validar que cada dibujo coincida con cómo se hace. Sin imagen quedan 17: los individuales con pelota (sole + push, zigzag, V push & cut, light touches, conducción a ritmo variable), los de movilidad y calentamiento, los de definición (uno contra uno, pivote de 9, centro al vértice), técnica de carrera, progresión de aceleración, activación neuromuscular, leg hop y nordic hamstring.
- **Textos limpiados:** se sacaron referencias al Doc ("Parte 2", "biblioteca del Doc", "reel") de trote continuo, aceleración en zigzag y leg hop.
- **Duplicados unificados (2026-11-03):** (1) *Activación neuromuscular* pasó a ser alias de *Progresión de aceleración*, que absorbió su texto (sin pelota, en parejas, 10-15 m al 60-70%, protege de desgarros). (2) *Velocidad máxima hasta el cono* pasó a ser alias de *Flying sprint* (tramo marcado con conos, la vuelta a máxima o caminando); la activación usa ahora flying sprint. (3) *Reducido* quedó solo como partidos en espacios chicos (5v5…); la posesión de 2-3 personas se explica en *Rondo*. (4) *Conducción y vuelta por detrás* se unió con *Pared y control orientado entre conos*: un solo ejercicio de a 3 con dos formas (pared de primera, o dejada y vuelta por detrás), cada una con su dibujo. Hay que validar que las fusiones sean como las usan.
- **Descripciones flojas:** "Uno defiende, otro ataca" (no dice dónde ni cómo se juega), "Velocidad máxima hasta el cono" (sin distancia) y "Activación dinámica completa" (usa "loco" sin explicar y mezcla varias cosas).
- **Nombres en inglés mezclados** con los en español (Sole + push + acceleration, V push & cut, Light touches, Flying sprint, Box jump, T-drill…).

## "Hoy somos" en las sesiones (2026-11-03)

- Selector arriba de Sesiones (lista y detalle): decís cuántos son una vez, se guarda en el navegador y cada bloque muestra solo las opciones que se pueden hacer. "No filtrar" lo saca.
- **Mínimo de jugadores por ejercicio (`jugadores_min`): lo asigné yo, hay que validarlo.** De a 2: rondo, pases con control orientado, pase-control-definición, pases combinados, presión y arcos, pase y va, pase al cono lateral, carrera en V con devolución, uno defiende otro ataca, pivote de 9, centro al vértice, pelota al campo rival y reactive sprint. De a 3: pared y control orientado entre conos. De a 4: cuadrado con uno en el medio. De a 6: reducido. El resto, 1.
- Solo se usa el mínimo: con más jugadores se pueden armar varios grupos. No hay máximo ni diagramas para 5, 6 y 7 (ver `PLAN_CANTIDAD_JUGADORES.md`).
- Con 1 jugador, el bloque "Definición" y el de "Pases y control orientado" de Fuerza y potencia no tienen opciones: muestra todas con un aviso.

## Variante de 3 en "Uno defiende, otro ataca" (2026-11-03)

- Cargada como la contaste; el tercer jugador es el arquero (confirmado). Falta la separación de los conos y quién ataca y quién defiende (supuse que ataca el que lleva la pelota).

## Ejercicios como grilla de tarjetas (2026-11-03)

- La página Ejercicios ya no es una tabla: es una grilla de tarjetas con imagen y nombre. Al tocar una se abre su detalle (cómo se hace, variantes, dosis, sesiones, material con ⚠ si falta, imágenes y video). Los links desde sesiones y circuitos abren directo el detalle.
- Los ejercicios sin imagen (16) muestran un recuadro verde con el emoji de su categoría. Se reemplaza solo cuando se les cargue una imagen.
- Se mantiene la búsqueda, los filtros (con/sin pelota y subcategorías) y la sección de músculos abajo. Al volver del detalle queda el filtro y el lugar donde estabas.

## Imágenes para los ejercicios que faltaban (2026-11-03)

- Dibujé 9 diagramas más (conducción a ritmo variable, progresión de aceleración, uno contra uno, pivote de 9, zigzag con pelota, V push & cut, sole + push, light touches y leg hop). Hay que validar que cada dibujo coincida con cómo se hace.
- Siguen sin imagen 7: movilidad articular, técnica de carrera, estiramiento estático, activación dinámica, trote suave, nordic hamstring y centro al vértice del área. Los seis primeros son de movimiento del cuerpo (necesitan foto o ilustración) y del centro no tengo clara la geometría para dibujarlo.
- Busqué fotos con licencia libre en Wikimedia Commons y no encontré nada adecuado (nordic hamstring y estiramientos no tienen archivos útiles). No descargué nada.

## Filtros nuevos en Ejercicios (2026-11-03)

- **Se hace solo / Hace falta alguien más:** usa el mismo `jugadores_min` que "Hoy somos" (sin dato o 1 = se hace solo). Esos mínimos son míos.
- **Materiales que tengo:** desplegable con casillas (los materiales salen de los ejercicios, los más usados primero). Con materiales tildados se muestran los ejercicios que se pueden hacer con ellos y los que no piden nada. Lo que tildás queda guardado en el navegador. Hoy no filtra las opciones de las sesiones (se podría).

- **Filtros rediseñados (2026-11-03):** ahora son tres botones en una fila (Categoría, Jugadores, Materiales). Al tocar uno se abre su menú con una pregunta ("¿Con pelota o sin pelota?", "¿Qué se trabaja?", "¿Cuántas personas hacen falta?", "Marcá los materiales que tenés"). Categoría muestra la subcategoría recién después de elegir con o sin pelota. El botón muestra lo elegido y aparece "✕ Limpiar filtros" junto a la cantidad.

## Fotos de V push & cut, light touches, zigzag y sole + push (2026-11-03)

- Pusiste las imágenes de los cuatro ejercicios (capturas de un video de un entrenador, con el botón de reproducir encima). Reemplazan a mis diagramas, que borré. Les agregué los conos como material (se ven en las fotos).
- **Derechos:** son fotogramas de un video ajeno (con su título y el ícono de play). Si la web se publica, conviene confirmar que se puede usarlas o reemplazarlas por fotos propias; igual que las otras imágenes copiadas de internet.

## Foto y video de "Pases cortos con control orientado" (2026-11-03)

- Sumé tu foto (3 jugadores con un cuadrado de conos) y el video del reel. La foto va primero y debajo siguen los dibujos para 2, 3, 4 y 8. Es otro fotograma de un video ajeno (con el botón de play encima): mismo cuidado con los derechos que las otras.

## Videos de Instagram (2026-11-03)

- **Leg hop:** sumé la variante hacia adelante (avanzás saltando en vez de saltar en el lugar, 5 formas distintas) y el video de la cuenta scientificallyfaster como segundo botón. **Faltan las 5 variantes:** no alcancé a distinguirlas en el video; contámelas (nombre y cómo se hace cada una) y las cargo.
- **Step-up unilateral:** sumé el video de jmendoza_oficial y las variantes por objetivo (aceleración, potencia, coordinación, agilidad, fuerza y estabilidad), solo con los nombres que se ven en el video. Falta cómo se hace cada una.
- Los dos videos son de cuentas ajenas (una de ellas vende un programa): es un link, no se copia nada.

## Escalera de coordinación: 16 patrones (2026-11-03)

- Pasé de 6 a **16 patrones**, del más simple al más difícil, a partir del artículo que pegaste (kingsportstraining.com) y el video de YouTube (queda como "Ver video: 13 patrones"). Los textos son resúmenes míos en español, con el nombre en inglés entre paréntesis.
- Se unieron los que coincidían: *Un pie por cuadrado* = One Step, *Lateral* = Side Step, y *Adentro, adentro, afuera, afuera* = Double Trouble (ahora en cada cuadrado van adentro izquierdo y derecho y afuera izquierdo y derecho; antes alternaba cuadrados).
- **Con dibujo (9):** un pie, dos pies, lateral, adentro-adentro-afuera-afuera, adentro y afuera de costado, saltos adentro y afuera, 5 saltos y carrera, zig-zag y salto con un pie. Los dibujé yo: hay que validarlos. **Solo texto (7):** cruzado, carioca, ciempiés, ickey shuffle, river dance, atrás y adelante y shuffle a una pierna; sus pasos no estaban lo bastante claros para dibujarlos sin inventar.

## Leg hop: 5 progresiones hacia adelante (2026-11-03)

- Cargué los fotogramas que mandaste (uno por progresión, numeradas 1 a 5 en el video). **Las descripciones las inferí yo de las imágenes**: de menos a más (trote con saltitos, más rodilla, saltos largos, más potencia, casi un sprint). Faltan los nombres reales y cómo se hace cada una. Corregilas cuando puedas.
- Son fotogramas de un video ajeno (cuenta scientificallyfaster): mismo cuidado con los derechos.

- **Los 7 patrones de la escalera que estaban solo con texto ahora tienen dibujo** (cruzado, carioca, ciempiés, ickey shuffle, river dance, atrás y adelante, shuffle a una pierna). Son esquemas míos hechos desde la descripción del artículo: la posición exacta de cada pie es mi interpretación (sobre todo carioca, ickey shuffle y river dance), así que hay que validarlos o corregirlos. Los fotogramas del video de YouTube se descartaron (con una sola imagen no se entiende el patrón).

- **Escalera (cambio de criterio):** los patrones que vienen del video de YouTube ahora tienen un botón "▶ Ver cómo se hace en YouTube (desde m:ss)" que abre el video justo en su sección. Saqué los diagramas de los 7 de los que no estaba segura (cruzado, carioca, ciempiés, ickey shuffle, river dance, atrás y adelante, shuffle a una pierna): quedan con texto y video. Conservé los 9 diagramas más claros. Los patrones que no están en el video (dos pies, zig-zag, salto con un pie, shuffle a una pierna) no tienen link.

## Posesión XvX en cuadrado (2026-11-03)

- Ejercicio nuevo ("como el Reducido, pero sin arcos"): en la sesión Pelota, bloque "Rondos, pases y conducción". Mínimo 4 jugadores (lo asigné yo). Que el comodín juega con el equipo que tiene la pelota lo supuse yo. Falta el tamaño del cuadrado y la imagen.

## El loco (2026-11-03)

- Ejercicio nuevo: círculo de jugadores con uno o varios corriendo por adentro para recuperar la pelota. En la sesión Pelota, bloque "Rondos, pases y conducción". La regla de cambio ya está (el último que la tocó entra a recuperar y el que la recuperó sale al círculo). Falta cuántos van adentro y el mínimo de jugadores (puse 4). Antes "loco" solo aparecía mencionado dentro de Activación dinámica.

## Entrada en calor antes del partido (2026-11-03)

- Convertí el circuito de activación en **"Entrada en calor antes del partido"** (mismo id `activacion`, ninguna sesión lo usa): trote suave, activación dinámica, progresión de aceleración, flying sprint, **posesión XvX en cuadrado** y, opcional, **tiro al arco** (pase, control y definición). Falta definir cuánto dura cada parte y el orden; el orden y que el tiro sea opcional los puse yo. Si preferís dos circuitos separados (activación y entrada en calor con pelota), lo divido.
