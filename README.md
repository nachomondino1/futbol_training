# Entrenamiento de fútbol

Web estática, de solo lectura, para usar desde el celu en la cancha. HTML + CSS + JS plano, sin backend. Los datos están en dos JSON y cada ejercicio se explica una sola vez (en el glosario); las sesiones solo lo referencian por id.

## Correr local

`fetch` no funciona con `file://`, así que hace falta un servidor:

```bash
python3 -m http.server 8000
```

Después abrí http://localhost:8000.

## Validar los datos

```bash
python3 scripts/validate.py
```

Corta (exit 1) si hay referencias rotas, ids duplicados, ejercicios huérfanos, categorías inexistentes o ejercicios con `requiere_variantes` sin las 4 variantes (2, 3, 4, 8). Las variantes marcadas `pendiente_validar` y las dosis pendientes salen como WARNING. Corre solo en cada push (`.github/workflows/validate.yml`).

## Agregar un ejercicio

En `data/exercises.json`, dentro de `ejercicios`:

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
- Si depende de cuántos son, poné `"requiere_variantes": true` y cargá `"2"`, `"3"`, `"4"` y `"8"` en `variantes`.
- Si propusiste una variante que todavía no validaste, agregá `"pendiente_validar": ["4"]`.
- Un ejercicio que ninguna sesión usa es error, salvo que le pongas `"huerfano_ok": true`.

## Agregar una imagen o un video

1. Copiá la imagen a `img/` (máx. ~800 px de ancho).
2. En el ejercicio: `"imagen": "img/sentadilla.jpg"` (ruta relativa, sin `/` al principio) y/o `"video": "https://youtu.be/..."`.

No hay que tocar código. Sin imagen o video, no se muestra nada.

## Agregar una sesión

En `data/sessions.json`, dentro de `sesiones`:

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

## Deploy en GitHub Pages

1. Subí el repo a GitHub (rama `main`).
2. En el repo: Settings → Pages → Source: "Deploy from a branch" → `main` / `(root)`.
3. Queda en `https://<usuario>.github.io/<repo>/`. Todas las rutas son relativas, así que funciona bajo ese subpath.

## Estructura

```
index.html · glosario.html · sesiones.html
css/style.css
js/common.js      header, selector de personas, utilidades
js/glosario.js · js/sesiones.js
data/exercises.json · data/sessions.json
scripts/validate.py
fuente/           Doc original exportado (solo referencia)
PENDIENTES.md     lo que propuse yo y falta validar
```
