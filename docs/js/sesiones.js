import { h, imagenesNodos, variantesNodo, avisoMateriales, renderHeader, cargarJSON, mostrarError } from "./common.js";
import { completarItems, estructuraNodo, guiaDetalle, masGanado, normalizarCircuitos, repartirMinutos } from "./estructura.js";

const app = document.getElementById("app");
let ejercicios = new Map(); // id -> ejercicio (como un dict de Python)
let datos = null;
let disponibles = []; // materiales que tenemos (docs/data/exercises.json)
let objetivos = []; // qué se gana (docs/data/objetivos.json)
let circuitos = new Map(); // id -> circuito (docs/data/circuits.json)

// Estado de la vista de detalle. Vive en memoria mientras la página esté abierta.
const cerrados = new Set();   // "bloque:ex" de los ítems que cerraste; por defecto está todo desplegado
let elegidas = {};            // índice de bloque -> índice de opción elegida
let sesionActual = null;
let ganasAbierto = false;     // "Qué vas a ganar" arranca plegado y recuerda si lo abriste

renderHeader("sesiones");

const duracion = (s) => s.bloques.reduce((t, b) => t + b.min, 0);

function grilla() {
  app.replaceChildren(
    h("h1", {}, "Sesiones"),
    h("div", { class: "grid-sesiones" }, datos.sesiones.map((s) =>
      h("a", { class: "card-sesion", href: `#${s.id}` },
        h("span", { class: "card-min" }, String(duracion(s)), h("small", {}, " min")),
        h("span", { class: "card-nombre" }, s.nombre),
        h("ul", { class: "card-bloques" }, s.bloques.map((b) => h("li", {}, b.titulo)))))));
}

function itemNodo(item, bi, numero = null, conEstructura = false) {
  const ej = ejercicios.get(item.ex);
  const clave = `${bi}:${item.ex}`;
  const vars = item.variantes || ej.variantes || {};
  const dosis = item.dosis || (conEstructura ? null : ej.dosis);
  const medios = [];
  medios.push(...imagenesNodos(ej));
  if (ej.video) medios.push(h("a", { class: "btn", href: ej.video, target: "_blank", rel: "noopener" }, "Ver video"));

  return h("details", {
      class: "item", open: !cerrados.has(clave),
      ontoggle: (e) => { e.target.open ? cerrados.delete(clave) : cerrados.add(clave); } },
    h("summary", {},
      h("span", { class: "item-nombre" },
        numero ? h("span", { class: "est-num" }, String(numero)) : null, ej.nombre,
        item.opcional ? h("span", { class: "etiqueta" }, "opcional") : null),
      dosis ? h("span", { class: "item-dosis" }, dosis) : null),
    h("div", { class: "item-cuerpo" },
      avisoMateriales(ej, disponibles),
      item.nota ? h("p", { class: "nota" }, item.nota) : null,
      h("p", {}, ej.descripcion),
      variantesNodo(vars),
      medios.length ? h("div", { class: "medios" }, medios) : null,
      h("a", { class: "link-glosario", href: `glosario.html#${ej.id}` }, "Ver el ejercicio")));
}

// Índice de la sesión: cuántos bloques hay y cuánto dura cada uno, de un vistazo.
function resumenNodo(s) {
  return h("nav", { class: "resumen", "aria-label": "Bloques de la sesión" },
    h("p", { class: "resumen-tit" }, `${s.bloques.length} bloques · ${duracion(s)} min`),
    h("ol", {}, s.bloques.map((b, i) => h("li", {},
      h("button", { type: "button", class: "resumen-fila",
        onclick: () => document.getElementById(`bloque-${i}`).scrollIntoView({ block: "start" }) },
        h("span", { class: "bloque-n" }, String(i + 1)),
        h("span", { class: "resumen-nombre" }, b.titulo),
        h("span", { class: "resumen-min" }, `${b.min} min`))))));
}

function guiaNodo(id, bi) {
  const clave = `${bi}:guia:${id}`;
  return guiaDetalle(datos.guias[id], {
    abierto: !cerrados.has(clave),
    alAlternar: (e) => { e.target.open ? cerrados.delete(clave) : cerrados.add(clave); } });
}

// Una opción puede referenciar un circuito de la lista de circuitos: hereda sus items, estructura y guía.
function resolver(o) {
  const c = circuitos.get(o.circuito);
  if (!c) return o;
  const base = completarItems(c);
  const estructura = base.estructura || o.estructura ? { ...base.estructura, ...o.estructura } : undefined;
  return { ...base, ...o, items: base.items, estructura, numerado: true };
}

// Si el circuito es una lista de ejercicios posibles, la sesión muestra la propuesta y deja ver el resto.
function posiblesNodo(opcion) {
  const usados = new Set(opcion.items.map((it) => it.ex));
  const otros = opcion.opciones.filter((o) => !usados.has(o.ex));
  return h("div", { class: "posibles" },
    otros.length
      ? h("details", { class: "musculo-sec" },
          h("summary", {}, `Otros ejercicios que podés usar (${otros.length})`),
          h("ul", { class: "musculo-lista" }, otros.map((o) =>
            h("li", {}, h("a", { href: `glosario.html#${o.ex}` }, o.nombre || ejercicios.get(o.ex).nombre)))))
      : null);
}

function bloqueNodo(b, bi) {
  const idx = Math.min(elegidas[bi] ?? 0, b.opciones.length - 1);
  const opcion = resolver(b.opciones[idx]);
  const varias = b.opciones.length > 1;
  return h("section", { class: "bloque", id: `bloque-${bi}`, "aria-labelledby": `b${bi}` },
    h("header", { class: "bloque-cab" },
      h("span", { class: "bloque-n" }, String(bi + 1)),
      h("h2", { id: `b${bi}` }, b.titulo),
      h("span", { class: "bloque-min" }, String(b.min), h("small", {}, " min"))),
    h("div", { class: "bloque-cuerpo" },
    varias
      ? h("div", { class: "opciones", role: "group", "aria-label": `Opciones de ${b.titulo}` },
          b.opciones.map((o, oi) => h("button", {
            type: "button", class: "chip", "aria-pressed": String(oi === idx),
            onclick: () => { elegidas[bi] = oi; detalle(sesionActual, true); } }, o.label)))
      : null,
    opcion.nota ? h("p", { class: "nota" }, opcion.nota) : null,
    opcion.estructura ? estructuraNodo(opcion, opcion.guia ? guiaNodo(opcion.guia, bi) : null) : null,
    h("div", { class: "items" },
      opcion.items.map((it, i) => itemNodo(it, bi, opcion.numerado || opcion.estructura?.modo === "circuito" ? i + 1 : null, !!opcion.estructura))),
    opcion.opciones ? posiblesNodo(opcion) : null));
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

// Qué se gana con la sesión: reparte los minutos de cada bloque (con la opción elegida) entre lo que aporta cada ejercicio.
function minutosGanados(s, elegidasBloque = {}) {
  const minutos = new Map();
  s.bloques.forEach((b, bi) => {
    const opcion = resolver(b.opciones[Math.min(elegidasBloque[bi] ?? 0, b.opciones.length - 1)]);
    repartirMinutos(opcion.items, b.min, ejercicios, minutos);
  });
  return minutos;
}

function gananciasNodo(s) {
  const minutos = minutosGanados(s, elegidas);
  const fuertes = masGanado(minutos, objetivos);
  const poco = objetivos.filter((o) => minutos.get(o.id) > 0 && !fuertes.some((g) => g.id === o.id));
  const etiquetas = masGanado(minutos, objetivos, { max: 3, etiquetas: true });
  return h("details", { class: "ganas", open: ganasAbierto, ontoggle: (e) => { ganasAbierto = e.target.open; } },
    h("summary", {},
      h("h2", {}, "Qué vas a ganar"),
      etiquetas.map((g) => h("span", { class: "etiqueta" }, g.nombre))),
    h("div", { class: "ganas-cuerpo" },
      s.objetivo ? h("p", { class: "ganas-objetivo" }, s.objetivo) : null,
      h("ul", { class: "ganas-lista" }, fuertes.map((g) => h("li", {},
        h("span", { class: "ganas-nombre" }, g.nombre),
        h("span", { class: "ganas-min" }, `unos ${Math.round(g.min)} min`),
        h("span", { class: "ganas-para" }, g.para_que)))),
      poco.length ? h("p", { class: "ganas-poco" }, `Un poco de: ${poco.map((o) => o.nombre.toLowerCase()).join(", ")}.`) : null,
      h("p", { class: "ganas-nota" }, "Se calcula con las opciones que tengas elegidas en cada bloque.")));
}

function detalle(s, conservar = false) {
  if (!conservar || sesionActual !== s) {
    if (sesionActual !== s) { cerrados.clear(); elegidas = {}; }
  }
  sesionActual = s;
  const y = window.scrollY;
  app.replaceChildren(
    h("a", { class: "volver", href: "#" }, "Todas las sesiones"),
    h("h1", {}, s.nombre),
    s.cuando ? h("p", { class: "intro" }, `Cuándo: ${s.cuando}`) : null,
    gananciasNodo(s),
    resumenNodo(s),
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
  const [ex, ses, cir, obj] = await Promise.all([cargarJSON("data/exercises.json"), cargarJSON("data/sessions.json"), cargarJSON("data/circuits.json"), cargarJSON("data/objetivos.json")]);
  objetivos = obj.objetivos;
  disponibles = ex.materiales_disponibles;
  ejercicios = new Map(ex.ejercicios.map((e) => [e.id, e]));
  circuitos = new Map(normalizarCircuitos(cir).map((c) => [c.id, c]));
  datos = ses;
  ruta();
  window.addEventListener("hashchange", ruta);
} catch (err) {
  mostrarError(app, err);
}
