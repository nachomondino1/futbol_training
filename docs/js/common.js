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

// Cuando hay muchas imágenes se muestran chicas (ver .medios en style.css); tocar una la agranda y muestra su explicación.
function alternarFig(e) {
  const fig = e.currentTarget;
  fig.setAttribute("aria-expanded", String(fig.classList.toggle("fig--grande")));
}
const figAtributos = {
  class: "fig", tabindex: "0", "aria-expanded": "false", onclick: alternarFig,
  onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternarFig(e); } },
};

// Imágenes del ejercicio: una por cantidad de personas (con su epígrafe) o, si no hay, la general.
// Sin imagen devuelve [] (así no queda ningún placeholder roto).
export function imagenesNodos(ej) {
  const porCantidad = ej.imagenes || {};
  const claves = PERSONAS.filter((p) => porCantidad[String(p)]);
  if (claves.length) {
    return claves.map((p) => h("figure", figAtributos,
      h("img", { src: porCantidad[String(p)], alt: `${ej.nombre}, con ${p}`, loading: "lazy", width: 640, height: 400 }),
      h("figcaption", {}, `Con ${p}`)));
  }
  return ej.imagen ? [h("img", { src: ej.imagen, alt: ej.nombre, loading: "lazy", width: 640, height: 400 })] : [];
}

// Patrones de un ejercicio (por ejemplo, los de la escalera): un diagrama con su nombre y cómo se hace cada uno.
export function patronesNodos(ej) {
  return (ej.patrones || []).map((p) => h("figure", figAtributos,
    h("img", { src: p.imagen, alt: `${ej.nombre}: ${p.nombre}`, loading: "lazy", width: 640, height: 400 }),
    h("figcaption", {}, h("strong", {}, p.nombre), h("span", { class: "fig__desc" }, ` — ${p.descripcion}`))));
}

// Materiales de un ejercicio. Los que no tenemos (todo salvo lo de `disponibles`) van resaltados.
export function materialesFaltantes(ej, disponibles) {
  return (ej.materiales || []).filter((m) => !disponibles.includes(m));
}

// Aviso para cuando se abre un ejercicio de una sesión.
export function avisoMateriales(ej, disponibles) {
  const f = materialesFaltantes(ej, disponibles);
  return f.length ? h("p", { class: "aviso-material", role: "note" }, `⚠ Necesita material que no tenemos: ${f.join(", ")}.`) : null;
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
