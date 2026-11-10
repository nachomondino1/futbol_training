# Pendientes para validar

Lo de acá lo propuse yo y todavía no lo validaste. Cuando lo valides, borrá la línea (y, si tiene, la clave `pendiente_validar` del JSON). El historial largo de decisiones de antes (versión de 48 KB) está en git: `git show 3f52d1b:PENDIENTES.md`.

Las variantes y dosis marcadas en el JSON se ven con `python3 scripts/validate.py --por-validar` (hoy son 14).

## Descripciones que faltan

- **Split concéntrica** (patrón de Bulgarian split squat, 6), **Salto al cajón reactivo** (patrón de Box jump, 21) y **Ataque al cajón lateral** (patrón de Step-up unilateral, 15): dicen "Descripción a completar". Vienen del reel de @md.training__.
- **Movilidad de tobillo** (patrón de Movilidad articular, 2): faltan repeticiones, tiempo y hacia dónde tira la banda. La armé mirando el reel sin sonido.
- **Estiramiento estático** (61): cuánto sostener cada uno. **Nordic hamstring** (9): la dosis es propuesta mía.
- **Leg hop (22), progresiones 1 a 5:** las descripciones las inferí de los fotogramas; faltan los nombres reales y cómo se hace cada una.

## Textos que escribí yo

- **Variantes por cantidad** de Progresión de aceleración, Conducción a ritmo variable, Loco, Pase con presión y arcos en L, Pase, control y definición, Pases con control orientado y la guía de estaciones (ver `--por-validar`).
- **Posesión reducida (53):** las variantes (4v4, comodín, 3v1, 2v1) y la de los dos arquitos. **Pases con control orientado (50):** el texto unificado con el ex Circuito de pases combinados.
- **Quemado con pelota (62):** descripción y diagrama armados con lo que me contaste del reel de @fernandocastillejor.
- **Músculo principal y secundarios** de cada ejercicio (`trabaja`) y los textos "En la cancha" de `muscles.json`: criterio general, sin una fuente.

## Diagramas que dibujé yo

Dos contra uno, Centro al vértice, Tiros libres, Skipping bajo, Quemado con pelota, las 5 de Posesión reducida y los de los patrones de la escalera. Sin diagrama (movimientos del cuerpo): Movilidad articular, Activación dinámica, Trote suave, Nordic hamstring y Estiramiento.

## Circuitos: tiempos y orden propuestos por mí

3 Entrada en calor · 4 Todo coordinación (progresión y patrones) · 5 Posesión · 6 Control de balón · 7 Pase y control orientado · 8 Definición y tiro al arco · 14 Potencia: saltos · 15 Potencia con carga · 16 Fuerza pesada · 17 Cierre con pelota (tranqui) · 18 Duelos · 19 Estaciones mixtas · 20 Pelota de a dos · 21 Velocidad y agilidad.

Los circuitos 2 y 19 comparten estructura (3 vueltas, 100 s de trabajo, 30 s de descanso y 3 min entre vueltas). En el circuito de fuerza (1) la pausa entre vueltas es de 120 s por tu indicación; el Doc no la dice.

## Para decidir

- **Bloque 2 de Pelota:** tiene tres circuitos (6, 7 y 20). Si preferís dos, decime cuál sacar.
- **Circuitos fuera de las sesiones** (3, 4, 14, 15, 16): quedan en Circuitos para consultar. Si no los vas a usar, se pueden borrar.
- **Con "Hoy somos 2"** el circuito 7 queda excluido porque "Pared y control orientado" pide 3.

## Derechos de imágenes

- La mayoría de las imágenes de Ejercicios salen del Doc y parecen de sitios de terceros (ilustraciones de fitness, etc.).
- Los fotogramas del leg hop son de un video ajeno (cuenta scientificallyfaster).
- Si el repo y la web son públicos, conviene revisar los derechos o reemplazarlas por fotos propias.
