// Utilidades compartidas. Cada página importa esto como módulo ES (<script type="module">),
// parecido a un `from common import ...` de Python.

export const PERSONAS = [2, 3, 4, 8];

// Instalable y sin señal: el service worker (sw.js) guarda la web en el celu.
// En local no se registra, porque mostraría versiones viejas mientras se edita (y se limpia uno
// que haya quedado de una prueba). Para probarlo en local: abrir la página con ?sw.
function registrarServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  if (local && !new URLSearchParams(location.search).has("sw")) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
    caches.keys().then((ks) => ks.forEach((k) => caches.delete(k)));
    return;
  }
  navigator.serviceWorker.register("sw.js").catch(() => { /* sin service worker la web anda igual, solo con señal */ });
}
registrarServiceWorker();

// h("div", {class: "x"}, "texto", otroNodo) arma un nodo DOM sin pasar por innerHTML.
export function h(tag, attrs = {}, ...hijos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const hijo of hijos.flat()) {
    if (hijo === null || hijo === undefined || hijo === false) continue;
    el.append(hijo);
  }
  return el;
}

// Variantes por cantidad de personas, todas en una lista.
export function variantesNodo(vars) {
  const claves = PERSONAS.filter((p) => vars[String(p)]);
  if (!claves.length) return null;
  return h("ul", { class: "variantes-lista" },
    claves.map((p) => h("li", {}, h("strong", {}, `Con ${p}: `), vars[String(p)])));
}

// Imágenes del ejercicio: una por cantidad de personas (con su epígrafe) o, si no hay, la general.
// Sin imagen devuelve [] (así no queda ningún placeholder roto).
// Toda imagen de contenido va dentro de un marco con tamaño máximo (ver .marco en style.css), así ninguna ocupa media pantalla.
export function marcoImagen(src, alt) {
  return h("div", { class: "marco" }, h("img", { src, alt, loading: "lazy", width: 640, height: 400 }));
}

export function imagenesNodos(ej) {
  const porCantidad = ej.imagenes || {};
  const claves = PERSONAS.filter((p) => porCantidad[String(p)]);
  const foto = ej.imagen ? [marcoImagen(ej.imagen, ej.nombre)] : [];
  return foto.concat(claves.map((p) => h("figure", { class: "fig" },
    marcoImagen(porCantidad[String(p)], `${ej.nombre}, con ${p}`),
    h("figcaption", {}, `Con ${p}`))));
}

// Botones de video: el principal ("video") y los extra (lista "videos" de {nombre, url}).
export function videosNodos(ej) {
  const boton = (url, texto) => h("a", { class: "btn", href: url, target: "_blank", rel: "noopener" }, texto);
  return [ej.video ? boton(ej.video, "Ver video") : null,
    ...(ej.videos || []).map((v) => boton(v.url, `Ver video: ${v.nombre}`))].filter(Boolean);
}

// Patrones de un ejercicio (por ejemplo, los de la escalera): el nombre, cómo se hace con palabras y debajo la imagen.
export function patronesNodos(ej) {
  return (ej.patrones || []).map((p) => h("article", { class: "patron" },
    h("h3", { class: "patron__nombre" }, p.nombre),
    h("p", { class: "patron__texto" }, p.descripcion),
    p.video ? h("a", { class: "btn patron__video", href: p.video, target: "_blank", rel: "noopener" }, `▶ Ver cómo se hace en YouTube${p.tiempo ? ` (desde ${p.tiempo})` : ""}`) : null,
    ...imagenesDePatron(p).map((src) => marcoImagen(src, `${ej.nombre}: ${p.nombre}`))));
}

// Un patrón puede traer una imagen ("imagen") o varias ("imagenes").
export const imagenesDePatron = (p) => p.imagenes || (p.imagen ? [p.imagen] : []);

// Materiales que necesita un ejercicio, como etiquetas. Sin materiales devuelve null.
export function materialesNodo(ej) {
  const lista = ej.materiales || [];
  return lista.length ? h("span", { class: "materiales" }, lista.map((m) => h("span", { class: "etiqueta" }, m))) : null;
}

// Minúsculas y sin tildes, para que "estocada" y "Estócada" matcheen igual.
export function normalizar(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function renderHeader(activa) {
  const link = (href, texto, id) =>
    h("a", { href, "aria-current": activa === id ? "page" : null }, texto);

  const header = h("header", { class: "cabecera" },
    h("div", { class: "cabecera-in" },
      h("a", { class: "marca", href: "index.html" }, h("span", { class: "marca-texto" }, "Entrenamiento")),
      h("nav", { class: "nav", "aria-label": "Principal" },
        link("glosario.html", "Ejercicios", "glosario"),
        link("circuitos.html", "Circuitos", "circuitos"),
        link("sesiones.html", "Sesiones", "sesiones"))));
  document.body.prepend(header);
}

// fetch es asíncrono: `await` es como esperar el resultado de una corutina en Python (asyncio).
export async function cargarJSON(ruta) {
  if (location.protocol === "file:") {
    throw new Error("file");
  }
  const r = await fetch(ruta); // ruta relativa: funciona bajo /nombre-repo/ en GitHub Pages
  if (!r.ok) throw new Error(`${ruta}: HTTP ${r.status}`);
  return r.json();
}

export function mostrarError(contenedor, err) {
  const msg = err.message === "file"
    ? h("p", {}, "No se pueden leer los datos abriendo el archivo directo. Abrí la web con ",
        h("code", {}, "python -m http.server"), " y entrá a ", h("code", {}, "http://localhost:8000"), ".")
    : h("p", {}, "No se pudieron cargar los datos. Probá recargar. (", String(err.message), ")");
  contenedor.replaceChildren(h("div", { class: "aviso", role: "alert" }, msg));
}

// Qué materiales tenemos: se eligen en Ejercicios y quedan guardados en el navegador.
const CLAVE_MATERIALES = "entrenamiento.materiales";

export function leerMateriales() {
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE_MATERIALES) || "[]");
    return Array.isArray(lista) ? lista.filter((m) => typeof m === "string") : [];
  } catch { return []; }
}

export function guardarMateriales(lista) {
  try { lista.length ? localStorage.setItem(CLAVE_MATERIALES, JSON.stringify(lista)) : localStorage.removeItem(CLAVE_MATERIALES); } catch { /* sin almacenamiento */ }
}
