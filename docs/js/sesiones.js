import { h, imagenesNodos, patronesNodos, videosNodos, variantesNodo, materialesNodo, renderHeader, cargarJSON, mostrarError } from "./common.js";
import { agruparEstaciones, completarItems, estructuraNodo, guiaDetalle, masGanado, minutosEstructura, normalizarCircuitos, repartirMinutos } from "./estructura.js";

const app = document.getElementById("app");
let ejercicios = new Map(); // id -> ejercicio (como un dict de Python)
let datos = null;
let objetivos = []; // qué se gana (docs/data/objetivos.json)
let circuitos = new Map(); // id -> circuito (docs/data/circuits.json)

// Estado de la vista de detalle. Vive en memoria mientras la página esté abierta.
const abiertos = new Set();   // "bloque:número:ex" de los ítems (y guías) que abriste; por defecto todo arranca plegado, para ver el bloque de un vistazo
let elegidas = {};            // índice de bloque -> índice de opción elegida
let somos = null;             // cuántos jugadores somos hoy (null = sin filtro)
const MAX_SOMOS = 10;
let sesionActual = null;
let ganasAbierto = false;     // "Qué vas a ganar" arranca plegado y recuerda si lo abriste

renderHeader("sesiones");

// Lo que dura un bloque depende de la opción elegida: una opción puede traer su propio "min" y, si es una serie
// (HIIT, rondo), se calcula con su estructura. Si no, vale el "min" del bloque.
function minutosDe(b, opcion) {
  if (opcion.min != null) return opcion.min;
  if (opcion.estructura && opcion.estructura.modo === "series") return minutosEstructura(opcion);
  return b.min;
}
const minutosElegidos = (b, bi, elegidasBloque = {}) => minutosDe(b, resolver(b.opciones[Math.min(elegidasBloque[bi] ?? 0, b.opciones.length - 1)]));
// Los bloques opcionales no suman al total: se muestran aparte ("+ 10 min opcionales").
const duracion = (s, elegidasBloque = {}) => s.bloques.reduce((t, b, bi) => t + (b.opcional ? 0 : minutosElegidos(b, bi, elegidasBloque)), 0);
const minutosOpcionales = (s, elegidasBloque = {}) => s.bloques.reduce((t, b, bi) => t + (b.opcional ? minutosElegidos(b, bi, elegidasBloque) : 0), 0);

function grilla() {
  app.replaceChildren(
    h("h1", {}, "Sesiones"),
    h("div", { class: "grid-sesiones" }, datos.sesiones.map((s) =>
      h("a", { class: "card-sesion", href: `#${s.id}` },
        h("span", { class: "card-min" }, String(duracion(s)), h("small", {}, " min")),
        h("span", { class: "card-nombre" }, s.emoji ? h("span", { class: "card-emoji", "aria-hidden": "true" }, s.emoji) : null, s.nombre),
        h("ul", { class: "card-bloques" }, s.bloques.map((b) => h("li", {}, b.titulo, b.opcional ? " (opcional)" : ""))),
        s.cuando ? h("p", { class: "card-cuando" }, s.cuando) : null))));
}

function itemNodo(item, bi, numero = null, conEstructura = false, plegado = false) {
  const ej = ejercicios.get(item.ex);
  const clave = `${bi}:${numero ?? ""}:${item.ex}`;
  const vars = item.variantes || ej.variantes || {};
  const dosis = item.dosis || (conEstructura ? null : ej.dosis);
  const medios = [];
  medios.push(...imagenesNodos(ej));
  medios.push(...videosNodos(ej));

  return h("details", {
      class: "item", open: abiertos.has(clave),
      ontoggle: (e) => { e.target.open ? abiertos.add(clave) : abiertos.delete(clave); } },
    h("summary", {},
      h("span", { class: "item-nombre" },
        numero ? h("span", { class: "est-num" }, String(numero)) : null, h("span", { class: "num-ej" }, String(ej.numero)), ej.nombre,
        item.opcional ? h("span", { class: "etiqueta" }, "opcional") : null),
      dosis ? h("span", { class: "item-dosis" }, dosis) : null),
    h("div", { class: "item-cuerpo" },
      item.nota ? h("p", { class: "nota" }, item.nota) : null,
      h("p", {}, ej.descripcion),
      ej.materiales?.length ? h("p", { class: "materiales-linea" }, h("strong", {}, "Materiales: "), materialesNodo(ej)) : null,
      variantesNodo(vars),
      ej.patrones?.length ? h("div", { class: "patrones" }, patronesNodos(ej)) : null,
      medios.length ? h("div", { class: "medios" }, medios) : null,
      h("a", { class: "link-glosario", href: `glosario.html#${ej.id}` }, "Ver el ejercicio")));
}

// Índice de la sesión: cuántos bloques hay y cuánto dura cada uno, de un vistazo.
function resumenNodo(s) {
  return h("nav", { class: "resumen", "aria-label": "Bloques de la sesión" },
    h("p", { class: "resumen-tit" }, `${s.bloques.length} bloques · ${duracion(s, elegidas)} min${minutosOpcionales(s, elegidas) ? ` (+ ${minutosOpcionales(s, elegidas)} opcionales)` : ""}`),
    h("ol", {}, s.bloques.map((b, i) => h("li", {},
      h("button", { type: "button", class: "resumen-fila",
        onclick: () => document.getElementById(`bloque-${i}`).scrollIntoView({ block: "start" }) },
        h("span", { class: "bloque-n" }, String(i + 1)),
        h("span", { class: "resumen-nombre" }, b.titulo, b.opcional ? h("span", { class: "etiqueta" }, "opcional") : null),
        h("span", { class: "resumen-min" }, `${minutosElegidos(b, i, elegidas)} min`))))));
}

function guiaNodo(id, bi) {
  const clave = `${bi}:guia:${id}`;
  return guiaDetalle(datos.guias[id], {
    abierto: abiertos.has(clave),
    alAlternar: (e) => { e.target.open ? abiertos.add(clave) : abiertos.delete(clave); } });
}

// Una opción puede referenciar un circuito de la lista de circuitos: hereda sus items, estructura y guía.
function resolver(o) {
  const c = circuitos.get(o.circuito);
  if (!c) return o;
  const base = completarItems(c);
  const estructura = base.estructura || o.estructura ? { ...base.estructura, ...o.estructura } : undefined;
  return { ...base, ...o, items: base.items, estructura, numerado: true };
}

// Una opción se puede hacer solo si ninguno de sus ejercicios pide compañeros (jugadores_min en exercises.json; sin dato = 1).
const esIndividual = (opcion) => resolver(opcion).items.every((it) => (ejercicios.get(it.ex).jugadores_min || 1) === 1);

// Una opción sirve para N jugadores si todos sus ejercicios aceptan N (jugadores_min / jugadores_max; sin dato = 1 / sin tope).
const cabe = (opcion, n) => resolver(opcion).items.every((it) => {
  const ej = ejercicios.get(it.ex);
  return n >= (ej.jugadores_min || 1) && n <= (ej.jugadores_max ?? Infinity);
});

// Índices de las opciones del bloque que sirven para los que somos (todas si no elegiste cantidad).
const indicesValidos = (b, bi) => b.opciones.map((_, i) => i).filter((i) => somos == null || cabe(b.opciones[i], somos));

// Opción elegida del bloque: la que tocaste o, si no tocaste ninguna, la primera. Si no sirve para los que somos, la primera que sirva.
function indiceElegido(b, bi) {
  const idx = Math.min(elegidas[bi] ?? 0, b.opciones.length - 1);
  const validos = indicesValidos(b, bi);
  return validos.length && !validos.includes(idx) ? validos[0] : idx;
}

// "Hoy somos": una solapa por cantidad; tocar la elegida la saca y vuelve a mostrar todo.
function somosNodo() {
  return h("div", { class: "somos", role: "group", "aria-label": "Cuántos somos hoy" },
    h("span", { class: "somos__tit" }, "Hoy somos"),
    Array.from({ length: MAX_SOMOS }, (_, k) => k + 1).map((n) => h("button", {
      type: "button", class: "chip chip--n", "aria-pressed": String(somos === n),
      onclick: () => { somos = somos === n ? null : n; detalle(sesionActual, true); } }, String(n))));
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
            h("li", {}, h("a", { href: `glosario.html#${o.ex}` }, o.nombre || ejercicios.get(o.ex).nombre), o.grupo ? h("span", { class: "etiqueta" }, o.grupo) : null))))
      : null);
}

function bloqueNodo(b, bi) {
  const idx = indiceElegido(b, bi);
  const opcion = resolver(b.opciones[idx]);
  const validos = indicesValidos(b, bi);
  const varias = b.opciones.length > 1;
  const sinOpciones = validos.length === 0;
  return h("section", { class: "bloque", id: `bloque-${bi}`, "aria-labelledby": `b${bi}` },
    h("header", { class: "bloque-cab" },
      h("span", { class: "bloque-n" }, String(bi + 1)),
      h("h2", { id: `b${bi}` }, b.titulo, b.opcional ? h("span", { class: "etiqueta bloque-opcional" }, "opcional") : null),
      h("span", { class: "bloque-min" }, String(minutosDe(b, opcion)), h("small", {}, " min"))),
    h("div", { class: "bloque-cuerpo" },
    sinOpciones
      ? h("p", { class: "nota" }, `Ninguna opción de este bloque sirve para ${somos} jugadores: salteá el bloque o elegí otra cantidad.`)
      : null,
    varias && !sinOpciones
      ? h("details", { class: "selector" },
          h("summary", {},
            h("span", { class: "selector__etiqueta" }, "Elegido"),
            h("span", { class: "selector__actual" }, b.opciones[idx].label),
            h("span", { class: "selector__cambiar" }, `${validos.length - 1 > 0 ? `${validos.length - 1} más` : "sin más opciones"}`)),
          h("div", { class: "opciones", role: "group", "aria-label": `Opciones de ${b.titulo}` },
            validos.map((oi) => h("button", {
              type: "button", class: `chip${esIndividual(b.opciones[oi]) ? " chip--individual" : ""}`, "aria-pressed": String(oi === idx),
              onclick: () => { elegidas[bi] = oi; detalle(sesionActual, true); } }, b.opciones[oi].label))))
      : null,
    sinOpciones ? null : h("div", { class: "bloque-contenido" },
    opcion.nota ? h("p", { class: "nota" }, opcion.nota) : null,
    opcion.estructura ? estructuraNodo(opcion, opcion.guia ? guiaNodo(opcion.guia, bi) : null) : null,
    opcion.agrupar
      ? h("div", { class: "estaciones" }, agruparEstaciones(opcion.items, opcion.agrupar).map((grupo, k) => h("section", { class: "estacion" },
          h("h3", { class: "estacion__titulo" }, `Estación ${k + 1}`),
          h("div", { class: "items" }, grupo.map((it, j) => itemNodo(it, bi, `${k + 1}.${j + 1}`, !!opcion.estructura, !!opcion.plegado))))))
      : h("div", { class: "items" },
          opcion.items.map((it, i) => itemNodo(it, bi, opcion.numerado || opcion.estructura?.modo === "circuito" ? i + 1 : null, !!opcion.estructura, !!opcion.plegado))),
    opcion.opciones ? posiblesNodo(opcion) : null)));
}

// Qué se gana con la sesión: reparte los minutos de cada bloque (con la opción elegida) entre lo que aporta cada ejercicio.
function minutosGanados(s) {
  const minutos = new Map();
  s.bloques.forEach((b, bi) => {
    if (b.opcional) return; // lo opcional no entra en "Qué vas a ganar"
    const opcion = resolver(b.opciones[indiceElegido(b, bi)]);
    repartirMinutos(opcion.items, minutosDe(b, opcion), ejercicios, minutos);
  });
  return minutos;
}

function gananciasNodo(s) {
  const minutos = minutosGanados(s);
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
    if (sesionActual !== s) { abiertos.clear(); elegidas = {}; somos = null; }
  }
  sesionActual = s;
  const y = window.scrollY;
  app.replaceChildren(
    h("a", { class: "volver", href: "#" }, "Todas las sesiones"),
    h("h1", {}, s.nombre),
    s.cuando ? h("p", { class: "intro" }, `Cuándo: ${s.cuando}`) : null,
    h("p", { class: "leyenda" },
      h("span", { class: "leyenda__punto leyenda__punto--individual", "aria-hidden": "true" }), "Opción que se puede hacer solo",
      h("span", { class: "leyenda__punto", "aria-hidden": "true" }), "Hace falta alguien más"),
    somosNodo(),
    gananciasNodo(s),
    resumenNodo(s),
    ...s.bloques.map(bloqueNodo));
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
  ejercicios = new Map(ex.ejercicios.map((e) => [e.id, e]));
  circuitos = new Map(normalizarCircuitos(cir).map((c) => [c.id, c]));
  datos = ses;
  ruta();
  window.addEventListener("hashchange", ruta);
} catch (err) {
  mostrarError(app, err);
}
