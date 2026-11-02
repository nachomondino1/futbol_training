# Entrenamiento de fútbol

Web estática, de solo lectura, para usar desde el celu en la cancha. HTML + CSS + JS plano, sin backend. Los datos están en dos JSON y cada ejercicio se explica una sola vez (en el glosario); las sesiones solo lo referencian por id.

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
- `categoria`: alguna de las de `categorias`.
- `trabaja`: `{ "principal": "cuadriceps", "secundarios": ["gluteo-mayor"] }`, con ids de `docs/data/muscles.json` (ahí se escribe para qué sirve cada músculo). Es obligatorio.
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
  "id": "sabado-suave",
  "nombre": "Sábado suave",
  "dia": null,
  "etiquetas": ["pelota"],
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
- Un bloque sin alternativas tiene una sola opción y sin `label`. Con 2 o más opciones, todas necesitan `label`.
- En cada item, `ex` es el id del ejercicio. `dosis` y `nota` son opcionales y específicos de esa sesión.
- Un item puede traer su propio `variantes` (con las claves `"2"`, `"3"`, `"4"`, `"8"`) si en esa sesión el ejercicio se hace distinto al glosario.

Las explicaciones que no son un ejercicio (por ejemplo cómo rotar las estaciones de un circuito) van en `sessions.json` > `guias` y se enlazan con `"guia"` en la opción.

## Agregar un circuito

Un circuito es un conjunto de ejercicios del glosario, en orden. Se define una vez en `docs/data/circuits.json` y las sesiones lo referencian:

```json
{
  "id": "fuerza-corto",
  "nombre": "Fuerza corto",
  "descripcion": "Circuito corto de fuerza.",
  "etiquetas": ["fuerza"],
  "guia": "circuito-estaciones",
  "estructura": { "modo": "circuito", "vueltas": 3, "trabajo_s": 40, "descanso_s": 30, "pausa_vuelta_s": 120 },
  "items": [{ "ex": "sentadilla" }, { "ex": "plancha-frontal", "nota": "Sin apoyar las rodillas." }]
}
```

- `estructura` y `guia` son opcionales: un circuito de técnica con pelota puede ser solo la lista de ejercicios, sin tiempos (ver "Vueltas, trabajo y descanso" más abajo).
- Si es el mismo circuito pero con otros ejercicios, no hagas otro circuito: agregá una `variaciones` (misma estructura, otra lista de ejercicios):

```json
"variaciones": [
  { "id": "corto", "nombre": "Corto (5 estaciones)", "nota": "Sin wall sit.",
    "estructura": { "descanso_s": 30 }, "items": [{ "ex": "sentadilla" }, { "ex": "plancha-frontal" }] }
]
```

  El `items` de arriba es la versión original; cada variación lo reemplaza, y su `estructura` solo pisa lo que nombra (acá, el descanso).
- En una sesión, la opción lo usa así: `{ "label": "Corto", "circuito": "circuito-fuerza", "variacion": "corto" }` (sin `variacion`, usa la original). Lo que la opción defina por su cuenta (por ejemplo otra `estructura`) pisa lo del circuito.
- Un circuito que ninguna sesión usa es error, salvo que le pongas `"huerfano_ok": true`. Sus ejercicios cuentan como usados.

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
- En `series` se puede agregar `sets`: cuántos sets seguidos van dentro de cada vuelta (HIIT: 15 sets de 10 s / 10 s, 2 vueltas, 2 min entre vueltas).
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
  index.html · glosario.html · sesiones.html
  css/style.css
  js/common.js      header, selector de personas, utilidades
  js/glosario.js · js/sesiones.js
  data/exercises.json · data/circuits.json · data/sessions.json · data/muscles.json
scripts/validate.py · scripts/gen_iconos.py
fuente/           Doc original exportado (solo referencia)
PENDIENTES.md     lo que propuse yo y falta validar
PLAN_CANTIDAD_JUGADORES.md   plan en stand-by: filtrar ejercicios según cuántos somos
```
