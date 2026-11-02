import { getPersonas, h, imagenesNodos, variantesNodo, renderHeader, cargarJSON, mostrarError } from "./common.js";

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

// 40 -> "40 s", 90 -> "1 min 30 s", 240 -> "4 min"
function tiempo(seg) {
  const m = Math.floor(seg / 60), s = seg % 60;
  if (!m) return `${s} s`;
  return s ? `${m} min ${s} s` : `${m} min`;
}

// Ficha con los números de una opción: vueltas, estaciones o sets, trabajo, descanso, pausa.
function estructuraNodo(op) {
  const e = op.estructura;
  const circuito = e.modo === "circuito";
  const unidades = circuito ? op.items.length : (e.sets || 1);
  const pausa = e.pausa_vuelta_s || 0;
  const totalMin = Math.round((e.vueltas * unidades * (e.trabajo_s + e.descanso_s) + (e.vueltas - 1) * pausa) / 60);
  const nombreDesc = e.descanso_nombre ? e.descanso_nombre[0].toUpperCase() + e.descanso_nombre.slice(1) : "Descanso";
  const porUnidad = circuito ? "por estación" : e.sets ? "por set" : "";

  const filas = [["Vueltas", String(e.vueltas)]];
  if (circuito) filas.push(["Estaciones", String(unidades)]);
  else if (e.sets) filas.push(["Sets por vuelta", String(e.sets)]);
  filas.push([`Trabajo ${porUnidad}`.trim(), tiempo(e.trabajo_s)], [`${nombreDesc} ${porUnidad}`.trim(), tiempo(e.descanso_s)]);
  if (e.vueltas > 1 && (circuito || pausa)) filas.push(["Pausa entre vueltas", pausa ? tiempo(pausa) : "a definir"]);

  return h("div", { class: "estructura" },
    h("dl", { class: "ficha" }, filas.map(([k, v]) => h("div", {}, h("dt", {}, k), h("dd", {}, v)))),
    h("p", { class: "est-total" }, `Total: unos ${totalMin} min${circuito && !pausa && e.vueltas > 1 ? " sin contar las pausas" : ""}.`));
}

function itemNodo(item, bi, numero = null, conEstructura = false) {
  const ej = ejercicios.get(item.ex);
  const n = getPersonas();
  const clave = `${bi}:${item.ex}`;
  const vars = item.variantes || ej.variantes || {};
  const dosis = item.dosis || (conEstructura ? null : ej.dosis);
  const medios = [];
  medios.push(...imagenesNodos(ej, n));
  if (ej.video) medios.push(h("a", { class: "btn", href: ej.video, target: "_blank", rel: "noopener" }, "Ver video"));

  return h("details", {
      class: "item", open: abiertos.has(clave),
      ontoggle: (e) => { e.target.open ? abiertos.add(clave) : abiertos.delete(clave); } },
    h("summary", {},
      h("span", { class: "item-nombre" },
        numero ? h("span", { class: "est-num" }, String(numero)) : null, ej.nombre),
      dosis ? h("span", { class: "item-dosis" }, dosis) : null),
    h("div", { class: "item-cuerpo" },
      item.nota ? h("p", { class: "nota" }, item.nota) : null,
      h("p", {}, ej.descripcion),
      variantesNodo(vars, n),
      medios.length ? h("div", { class: "medios" }, medios) : null,
      h("a", { class: "link-glosario", href: `glosario.html#${ej.id}` }, "Ver en el glosario")));
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

function bloqueNodo(b, bi) {
  const idx = Math.min(elegidas[bi] ?? 0, b.opciones.length - 1);
  const opcion = b.opciones[idx];
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
    opcion.estructura ? estructuraNodo(opcion) : null,
    h("div", { class: "items" },
      opcion.guia ? itemNodo({ ex: opcion.guia }, bi) : null,
      opcion.items.map((it, i) => itemNodo(it, bi, opcion.estructura?.modo === "circuito" ? i + 1 : null, !!opcion.estructura)))));
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
    s.dia ? h("p", { class: "detalle-meta" }, s.dia) : null,
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
  const [ex, ses] = await Promise.all([cargarJSON("data/exercises.json"), cargarJSON("data/sessions.json")]);
  ejercicios = new Map(ex.ejercicios.map((e) => [e.id, e]));
  datos = ses;
  ruta();
  window.addEventListener("hashchange", ruta);
  document.addEventListener("personas-change", () => { if (sesionActual) detalle(sesionActual, true); });
} catch (err) {
  mostrarError(app, err);
}
