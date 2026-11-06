# Entrenamiento de fútbol

Web estática, de solo lectura, para usar desde el celu en la cancha. HTML + CSS + JS plano, sin backend. Los datos están en dos JSON y cada ejercicio se explica una sola vez (en la página Ejercicios); los circuitos combinan ejercicios y las sesiones combinan bloques, que pueden ser un circuito o un solo ejercicio (correr 30 minutos, HIIT).

## Cómo se organiza

1. **Ejercicios** (`exercises.json`): lo más chico. Se explica una sola vez, con su músculo, variantes, imagen y video.
2. **Circuitos** (`circuits.json`): dos o más ejercicios en orden (con sus vueltas y descansos), o una plantilla donde se elige una opción por parte.
3. **Sesiones** (`sessions.json`): una lista de bloques con sus minutos. Cada bloque tiene una o más opciones, y cada opción es un circuito o directamente un ejercicio (por ejemplo "trote continuo, 30 min" o "HIIT 10/10").

Los archivos se siguen llamando `glosario.html` y `glosario.js` para no romper links: la página se muestra como "Ejercicios".

## Correr local

`fetch` no funciona con `file://`, así que hace falta un servidor:

```bash
python3 -m http.server 8000 --directory docs
```

Después abrí http://localhost:8000.

## Validar los datos

```bash
python3 scripts/validate.py
```

Corta (exit 1) si hay referencias rotas, ids duplicados, ejercicios huérfanos, categorías inexistentes o ejercicios con `requiere_variantes` sin las 4 variantes (2, 3, 4, 8). Las variantes marcadas `pendiente_validar` y las dosis pendientes salen como WARNING. Corre solo en cada push (`.github/workflows/validate.yml`).

## Agregar un ejercicio

En `docs/data/exercises.json`, dentro de `ejercicios`:

```json
{
  "id": "sentadilla-salto",
  "nombre": "Sentadilla con salto",
  "alias": [],
  "categoria": "fuerza",
  "descripcion": "Cómo se hace.",
  "dosis": null,
  "requiere_variantes": false,
  "variantes": {},
  "imagen": null,
  "video": null
}
```

- `id`: minúsculas con guiones, único. Es el link `glosario.html#sentadilla-salto`.
- `categoria`: alguna de las de `categorias`. Los que se hacen con pelota usan `"pelota"` (se muestra "Con pelota") y además llevan `subcategorias`: una o más de `subcategorias` (tiro al arco, pase corto, pase largo, control orientado, conducción, posesión, con oposición, pelota parada). Es obligatorio y es lo que usan los filtros de la página Ejercicios.
- `materiales`: lista de lo que hace falta para el ejercicio (vacía si no hace falta nada). Obligatorio. Se muestra en el detalle del ejercicio y al abrirlo dentro de una sesión.
- `aporta`: qué se gana con el ejercicio, con ids de `docs/data/objetivos.json` (velocidad, aeróbico, fuerza, potencia, control, precisión de tiro, coordinación, movilidad). Obligatorio. La sesión usa esto para armar "Qué vas a ganar".
- `trabaja`: `{ "principal": "cuadriceps", "secundarios": ["gluteo-mayor"] }`, con ids de `docs/data/muscles.json` (ahí se escribe para qué sirve cada músculo). Es obligatorio.
- `numero`: número fijo del ejercicio, único; se muestra como "12" en Ejercicios y en Sesiones para poder referirse a él. No se reusa ni se renumera: si se borra o se une uno, su número queda libre; un ejercicio nuevo toma el siguiente al más alto.
- `jugadores_min`: cuántos jugadores como mínimo necesita (sin dato = 1). Lo usan el filtro "Jugadores" y los colores de las tarjetas en Ejercicios.
- `jugadores_max`: tope de jugadores (sin dato = sin tope). Junto con `jugadores_min`, lo usa el selector "Hoy somos" de cada sesión: al elegir una cantidad, deja solo las opciones cuyos ejercicios aceptan esa cantidad.
- Si depende de cuántos son, poné `"requiere_variantes": true` y cargá `"2"`, `"3"`, `"4"` y `"8"` en `variantes`.
- Si propusiste una variante que todavía no validaste, agregá `"pendiente_validar": ["4"]`.
- Un ejercicio que ninguna sesión usa es error, salvo que le pongas `"huerfano_ok": true`.

## Agregar una imagen o un video

1. Copiá la imagen a `docs/img/` (máx. ~800 px de ancho).
2. En el ejercicio: `"imagen": "img/sentadilla.jpg"` (ruta relativa a `docs/`, sin `/` al principio) y/o `"video": "https://youtu.be/..."`.

No hay que tocar código. Sin imagen o video, no se muestra nada.

## Agregar una sesión

En `docs/data/sessions.json`, dentro de `sesiones`:

```json
{
  "id": "pelota-suave",
  "nombre": "Pelota suave",
  "objetivo": "Trabajo aeróbico con pelota, sin exigir demasiado.",
  "bloques": [
    {
      "titulo": "Aeróbico",
      "min": 30,
      "opciones": [
        { "label": "Trote", "items": [{ "ex": "trote-continuo", "dosis": "30 min" }] },
        { "label": "Rondo", "items": [{ "ex": "rondo" }] }
      ]
    }
  ]
}
```

- La duración de la sesión es la suma de `min` de los bloques: no se escribe a mano.
- No hay días ni etiquetas: lo que se muestra como etiquetas (aeróbico, velocidad, pelota...) se calcula solo con lo que aporta cada ejercicio (`aporta`).
- Un bloque sin alternativas tiene una sola opción y sin `label`. Con 2 o más opciones, todas necesitan `label`.
- En cada item, `ex` es el id del ejercicio. `dosis` y `nota` son opcionales y específicos de esa sesión.
- Un item puede traer su propio `variantes` (con las claves `"2"`, `"3"`, `"4"`, `"8"`) si en esa sesión el ejercicio se hace distinto a como figura en Ejercicios.

Las explicaciones que no son un ejercicio (por ejemplo cómo rotar las estaciones de un circuito) van en `sessions.json` > `guias` y se enlazan con `"guia"` en la opción.

## Agregar un circuito

Un circuito es un conjunto de ejercicios, en orden. Se define una vez en `docs/data/circuits.json` y las sesiones lo referencian:

```json
{
  "id": "tecnica-v-zigzag",
  "nombre": "Técnica: V y zigzag",
  "descripcion": "Primero V con la pelota y después zigzag.",
  "guia": "circuito-estaciones",
  "estructura": { "modo": "circuito", "vueltas": 3, "trabajo_s": 40, "descanso_s": 30, "pausa_vuelta_s": 120 },
  "items": [{ "ex": "v-push-cut" }, { "ex": "zigzag", "nota": "Con el borde externo." }]
}
```

- `estructura` y `guia` son opcionales: un circuito puede ser solo la lista de ejercicios, sin tiempos (ver "Vueltas, trabajo y descanso" más abajo).
- Un circuito de **estaciones con varias partes** lleva `items` en orden y `"agrupar": 3`: cada grupo de 3 ejercicios es una estación (la persona que está ahí hace los 3 seguidos) y `estructura` cuenta las estaciones, no los ejercicios. Con `bancos` (lista de bancos) se muestran, aparte, los otros ejercicios que también sirven. Ejemplo: `fuerza-coordinacion-cierre`.
- Si lo que importa es **qué ejercicios se pueden meter** y no un orden fijo (el circuito de fuerza), usá un banco y una propuesta en lugar de `items`: `banco` es la lista de ejercicios posibles, `elegir` cuántos se hacen y `propuesta` el orden que se sugiere. En Circuitos y en la sesión se ve la propuesta y el resto como "otros ejercicios que podés usar" (no se eligen):

```json
{ "id": "circuito-fuerza", "nombre": "Circuito de fuerza", "banco": "fuerza", "elegir": 6,
  "propuesta": [{ "ex": "sentadilla" }, { "ex": "zancada-estatica" }],
  "estructura": { "modo": "circuito", "vueltas": 3, "trabajo_s": 40, "descanso_s": 20, "pausa_vuelta_s": 120 } }
```

- Si es una plantilla con una opción propuesta por parte (la primera) y alternativas (fuerza, coordinación, pelota), usá `partes` en lugar de `items`. Las opciones se escriben una sola vez en `bancos` y las partes los referencian:

```json
"bancos": {
  "fuerza": { "nombre": "Fuerza", "opciones": [{ "ex": "sentadilla" }, { "ex": "zancada-estatica" }] },
  "pelota": { "nombre": "Pelota", "opciones": [{ "ex": "zigzag" }] }
},
"circuitos": [
  { "id": "fuerza-coordinacion-cierre", "nombre": "Fuerza, coordinación y cierre",
    "partes": [{ "banco": "fuerza" }, { "banco": "coordinacion" },
               { "nombre": "Pelota, aeróbico o velocidad", "bancos": ["pelota", "aerobico", "velocidad"] }] }
]
```

  Una opción puede traer `nombre` (lo que se ve en el botón) y `nota`. Una parte puede juntar varios bancos con `bancos` (cada opción muestra el nombre de su banco). Un ejercicio de un circuito puede ser opcional con `"opcional": true`. Los bancos son los mismos que usa el circuito de fuerza.
- En una sesión, la opción lo usa así: `{ "circuito": "circuito-fuerza", "estructura": { "descanso_s": 30 } }`. Lo que la opción defina por su cuenta (acá, el descanso) pisa lo del circuito.
- Un circuito que ninguna sesión usa es error, salvo que le pongas `"huerfano_ok": true`. Sus ejercicios cuentan como usados.

La entrada en calor antes del partido es un circuito (`entrada-en-calor`, en Circuitos), no una sesión: trote suave, activación dinámica, aceleración, velocidad, posesión reducida y, si hay arco, tiro.

Una opción puede traer su propio `min`; si es una serie (HIIT, rondo) los minutos se calculan con su estructura y, si no, vale el `min` del bloque. Cada sesión lleva un `objetivo` (una frase). Debajo, la página calcula "Qué vas a ganar": reparte los minutos de cada bloque, con la opción elegida, entre lo que aporta cada ejercicio, y muestra lo principal.

### Vueltas, trabajo y descanso

Una opción puede traer `estructura` para que la sesión diga cuántas vueltas hacer y cuánto trabajar y descansar:

```json
{
  "label": "Piernas",
  "guia": "circuito-estaciones",
  "estructura": { "modo": "circuito", "vueltas": 3, "trabajo_s": 40, "descanso_s": 20, "pausa_vuelta_s": 120 },
  "items": [{ "ex": "sentadilla" }, { "ex": "zancada-estatica" }]
}
```

- `modo: "circuito"`: cada item es una estación, numeradas en orden. En cada una se hace `trabajo_s` + `descanso_s`; al terminar todas se descansa `pausa_vuelta_s` y se repite. `guia` es el ejercicio que explica cómo rotar (se muestra arriba).
- `modo: "series"`: un solo item que se repite `vueltas` veces con `trabajo_s` / `descanso_s` (por ejemplo el rondo: 5 vueltas de 4 min con 1 min 30 s de `descanso_nombre: "pausa activa"`).
- En `series` se puede agregar `sets`: cuántos sets seguidos van dentro de cada vuelta (HIIT: 15 sets de 10 s / 10 s, 3 vueltas, 2 min entre vueltas).
- Todos los tiempos van en segundos. La web calcula el tiempo total; el validador avisa si no entra en el `min` del bloque.
- Si falta `pausa_vuelta_s` en un circuito de más de una vuelta, el validador avisa y la web muestra "a definir".

## Deploy en GitHub Pages

1. Subí el repo a GitHub (rama `main`).
2. En el repo: Settings → Pages → Source: "Deploy from a branch" → `main` / `/docs`.
3. Queda en `https://<usuario>.github.io/<repo>/`. Todas las rutas son relativas, así que funciona bajo ese subpath.

## Instalar en el celu y usar sin señal

La web se puede instalar (Android/Chrome: menú ⋮ → "Instalar aplicación"; iPhone/Safari: Compartir → "Añadir a pantalla de inicio") y abrir sin señal. Abrila una vez con conexión para que se guarde todo (unos 4 MB, imágenes incluidas). En el iPhone, la app instalada puede tener su propia copia: la primera vez que la abras desde el ícono, también con señal.

- `docs/sw.js` es el service worker. Responde con lo guardado y en paralelo baja la versión nueva, así que **un cambio publicado se ve la segunda vez que se abre la web**.
- `BASICOS` (en `sw.js`) lista las páginas, scripts, estilos y JSON que se guardan al instalar. **Si agregás una página, un script o un JSON, sumalo ahí**: `validate.py` falla si falta (o si apunta a un archivo que no existe). Las imágenes no hay que listarlas: salen de `exercises.json`.
- Subí `CACHE` (`entrenamiento-v1` → `v2`) si borrás o renombrás un archivo, para que el celu no guarde de más.
- **En local no se registra** (mostraría versiones viejas mientras editás, y limpia el que haya quedado de una prueba). Para probarlo: abrir cualquier página con `?sw` (por ejemplo `http://localhost:8000/?sw`) y, para simular sin señal, apagar el servidor y recargar.
- Los videos (Instagram, YouTube) son links a otros sitios: siguen necesitando señal.
- Los íconos (`img/icon-*.png`) se regeneran con `python3 scripts/gen_iconos.py`.

## Estructura

```
docs/             la web (lo que sirve GitHub Pages)
  sw.js · manifest.webmanifest   instalable y sin señal
  index.html · glosario.html · circuitos.html · sesiones.html
  css/style.css     estilos compartidos
  css/pages/inicio.css   estilos propios de la página de inicio (hero, secciones)
  js/common.js      header, utilidades compartidas
  js/inicio.js · js/glosario.js · js/circuitos.js · js/sesiones.js
  data/exercises.json · data/circuits.json · data/sessions.json · data/muscles.json
scripts/validate.py · scripts/gen_iconos.py
fuente/           Doc original exportado (solo referencia)
PENDIENTES.md     lo que propuse yo y falta validar
PLAN_CANTIDAD_JUGADORES.md   filtro según cuántos somos: idea para el futuro (una primera versión se sacó de la web)
```
