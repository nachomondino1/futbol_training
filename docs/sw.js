// Service worker: guarda la web en el celu para poder instalarla y abrirla sin señal.
// Estrategia: el código y los datos (páginas, js, css, json) van "primero la red": con señal se ve siempre lo
// último publicado, y sin señal (o si la red tarda más de 3 s) se usa lo guardado. Las imágenes van "primero lo
// guardado": no cambian y pesan. Así un cambio se ve la primera vez que se abre, sin subir ninguna versión.
// Solo toca archivos de este mismo sitio: los videos (Instagram, YouTube) siguen pidiendo señal.

const CACHE = "entrenamiento-v3"; // subirlo solo si se borra o renombra un archivo, para limpiar lo viejo
const ESPERA_RED_MS = 3000;
const BASICOS = [
  "./", "index.html", "glosario.html", "circuitos.html", "sesiones.html",
  "css/style.css", "css/pages/inicio.css", "js/common.js", "js/glosario.js", "js/sesiones.js", "js/circuitos.js", "js/estructura.js", "js/inicio.js",
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
    const imagenes = ejercicios.flatMap((x) => [x.imagen, ...Object.values(x.imagenes || {}), ...(x.patrones || []).flatMap((p) => p.imagenes || [p.imagen])]).filter(Boolean);
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
function bajar(e, cache, clave) {
  return fetch(e.request, { cache: "no-cache" }).then((r) => {
    if (r.ok) e.waitUntil(cache.put(clave, r.clone()));
    return r;
  });
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  const clave = url.origin + url.pathname; // sin ?query ni #hash: una sola copia por archivo
  const esImagen = /\/img\//.test(url.pathname);
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const guardado = await cache.match(clave);
    if (esImagen) return guardado || bajar(e, cache, clave); // las imágenes no cambian: lo guardado manda
    if (!guardado) return bajar(e, cache, clave); // primera vez: hay que esperar a la red
    // Hay algo guardado: gana la red si responde bien y rápido; si no (sin señal, lenta o con error), lo guardado.
    const red = bajar(e, cache, clave).then((r) => (r.ok ? r : guardado));
    e.waitUntil(red.catch(() => {})); // la bajada sigue en segundo plano aunque se haya respondido con lo guardado
    return Promise.race([red.catch(() => guardado), new Promise((ok) => setTimeout(() => ok(guardado), ESPERA_RED_MS))]);
  })());
});
