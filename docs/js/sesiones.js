import { getPersonas, h, renderHeader, cargarJSON, mostrarError } from "./common.js";

const app = document.getElementById("app");
let ejercicios = new Map(); // id -> ejercicio (como un dict de Python)
let datos = null;

// Estado de la vista de detalle. Vive en memoria mientras la página esté abierta.
const abiertos = new Set();   // "bloque:ex" de los ítems expandidos; sobrevive al cambio de opción/personas
let elegidas = {};            // índice de bloque -> índice de opción elegida
let sesionActual = null;

renderHeader("sesiones");

const duracion = (s) => s.bloques.reduce((t, b) => t + b.min, 0);

function grilla() {
  app.replaceChildren(
    h("h1", {}, "Sesiones"),
    h("div", { class: "grid-sesiones" }, datos.sesiones.map((s) =>
      h("a", { class: "card-sesion", href: `#${s.id}` },
        h("span", { class: "card-min" }, String(duracion(s)), h("small", {}, " min")),
        h("span", { class: "card-nombre" }, s.nombre),
        h("span", { class: "card-meta" },
          s.dia ? h("span", { class: "dia" }, s.dia) : null,
          s.etiquetas.map((e) => h("span", { class: "etiqueta" }, e)))))));
}

function varianteDe(item, ej, n) {
  const propias = item.variantes || {};
  return propias[String(n)] || (ej.variantes || {})[String(n)] || null;
}

function itemNodo(item, bi) {
  const ej = ejercicios.get(item.ex);
  const n = getPersonas();
  const clave = `${bi}:${item.ex}`;
  const variante = varianteDe(item, ej, n);
  const dosis = item.dosis || ej.dosis;
  const medios = [];
  if (ej.imagen) medios.push(h("img", { src: ej.imagen, alt: ej.nombre, loading: "lazy" }));
  if (ej.video) medios.push(h("a", { class: "btn", href: ej.video, target: "_blank", rel: "noopener" }, "Ver video"));

  return h("details", {
      class: "item", open: abiertos.has(clave),
      ontoggle: (e) => { e.target.open ? abiertos.add(clave) : abiertos.delete(clave); } },
    h("summary", {},
      h("span", { class: "item-nombre" }, ej.nombre),
      dosis ? h("span", { class: "item-dosis" }, dosis) : null),
    h("div", { class: "item-cuerpo" },
      item.nota ? h("p", { class: "nota" }, item.nota) : null,
      h("p", {}, ej.descripcion),
      variante ? h("p", { class: "variante" }, h("strong", {}, `Con ${n}: `), variante) : null,
      medios.length ? h("div", { class: "medios" }, medios) : null,
      h("a", { class: "link-glosario", href: `glosario.html#${ej.id}` }, "Ver en el glosario")));
}

function bloqueNodo(b, bi) {
  const idx = Math.min(elegidas[bi] ?? 0, b.opciones.length - 1);
  const opcion = b.opciones[idx];
  const varias = b.opciones.length > 1;
  return h("section", { class: "bloque", "aria-labelledby": `b${bi}` },
    h("header", { class: "bloque-cab" },
      h("h2", { id: `b${bi}` }, b.titulo),
      h("span", { class: "bloque-min" }, String(b.min), h("small", {}, " min"))),
    varias
      ? h("div", { class: "opciones", role: "group", "aria-label": `Opciones de ${b.titulo}` },
          b.opciones.map((o, oi) => h("button", {
            type: "button", class: "chip", "aria-pressed": String(oi === idx),
            onclick: () => { elegidas[bi] = oi; detalle(sesionActual, true); } }, o.label)))
      : null,
    h("div", { class: "items" }, opcion.items.map((it) => itemNodo(it, bi))));
}

function precauciones() {
  return h("details", { class: "precauciones" },
    h("summary", {}, "Precauciones por lesión"),
    h("table", { class: "tabla" },
      h("thead", {}, h("tr", {}, ["Lesión", "Evitar", "Alternativa"].map((t) => h("th", { scope: "col" }, t)))),
      h("tbody", {}, datos.precauciones.map((p) => h("tr", {},
        h("td", { class: "td-nombre", "data-label": "Lesión" }, h("span", { class: "nombre" }, p.lesion)),
        h("td", { "data-label": "Evitar" }, p.evitar),
        h("td", { "data-label": "Alternativa" }, p.alternativa))))));
}

// conservar = true cuando solo cambia una opción o la cantidad: no se tocan elegidas ni abiertos
function detalle(s, conservar = false) {
  if (!conservar || sesionActual !== s) {
    if (sesionActual !== s) { abiertos.clear(); elegidas = {}; }
  }
  sesionActual = s;
  const y = window.scrollY;
  app.replaceChildren(
    h("a", { class: "volver", href: "#" }, "Todas las sesiones"),
    h("h1", {}, s.nombre),
    h("p", { class: "detalle-meta" },
      `${duracion(s)} min`, s.dia ? ` · ${s.dia}` : "", ` · somos ${getPersonas()}`),
    ...s.bloques.map(bloqueNodo),
    precauciones());
  if (conservar) window.scrollTo(0, y);
  else window.scrollTo(0, 0);
}

function ruta() {
  const id = decodeURIComponent(location.hash.slice(1));
  const s = datos.sesiones.find((x) => x.id === id);
  if (s) detalle(s); else { sesionActual = null; grilla(); document.title = "Sesiones"; }
  if (s) document.title = s.nombre;
}

try {
  const [ex, ses] = await Promise.all([cargarJSON("data/exercises.json"), cargarJSON("data/sessions.json")]);
  ejercicios = new Map(ex.ejercicios.map((e) => [e.id, e]));
  datos = ses;
  ruta();
  window.addEventListener("hashchange", ruta);
  document.addEventListener("personas-change", () => { if (sesionActual) detalle(sesionActual, true); });
} catch (err) {
  mostrarError(app, err);
}
