// Service worker: guarda la web en el celu para poder instalarla y abrirla sin señal.
// Estrategia "stale-while-revalidate": responde al toque con lo guardado y, en paralelo, baja la
// versión nueva para la próxima vez. Un cambio en los datos se ve la segunda vez que se abre.
// Solo toca archivos de este mismo sitio: los videos (Instagram, YouTube) siguen pidiendo señal.

const CACHE = "entrenamiento-v2"; // subirlo si se borra o renombra un archivo, para limpiar lo viejo
const BASICOS = [
  "./", "index.html", "glosario.html", "circuitos.html", "sesiones.html",
  "css/style.css", "js/common.js", "js/glosario.js", "js/sesiones.js", "js/circuitos.js", "js/estructura.js",
  "data/exercises.json", "data/sessions.json", "data/muscles.json", "data/circuits.json", "data/objetivos.json",
  "manifest.webmanifest", "img/icon-180.png", "img/icon-192.png", "img/icon-512.png",
];

self.addEventListener("install", (e) => {
  self.skipWaiting(); // la versión nueva toma el control sin esperar a que se cierren las pestañas
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // cache: "reload" salta la caché HTTP del navegador, así se guarda lo último publicado.
    // Si falta algún básico, la instalación falla entera (mejor que quedar a medias).
    await cache.addAll(BASICOS.map((r) => new Request(r, { cache: "reload" })));
    // Las imágenes salen de exercises.json: no hay una segunda lista que mantener.
    const { ejercicios } = await (await cache.match("data/exercises.json")).json();
    const imagenes = ejercicios.flatMap((x) => [x.imagen, ...Object.values(x.imagenes || {})]).filter(Boolean);
    // allSettled: si una imagen falla, la instalación sigue; esa se guarda cuando se mire.
    await Promise.allSettled(imagenes.map(async (r) => { if (!(await cache.match(r))) await cache.add(r); }));
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim(); // las pestañas abiertas pasan a usar este worker ya
  })());
});

// Baja el archivo de la red y lo guarda. cache: "no-cache" pregunta al servidor si cambió (304 si no).
async function bajar(e, cache, clave) {
  const r = await fetch(e.request, { cache: "no-cache" });
  if (r.ok) e.waitUntil(cache.put(clave, r.clone()));
  return r;
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  const clave = url.origin + url.pathname; // sin ?query ni #hash: una sola copia por archivo
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const guardado = await cache.match(clave);
    const nueva = bajar(e, cache, clave);
    if (!guardado) return nueva; // primera vez: hay que esperar a la red
    e.waitUntil(nueva.catch(() => {})); // sin señal falla en silencio: ya se respondió con lo guardado
    return guardado;
  })());
});
