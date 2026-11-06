import { h, renderHeader, cargarJSON, mostrarError, videoNodo, subseccion, normalizar } from "./common.js";
import { agruparEstaciones, completarItems, estructuraNodo, guiaDetalle, masGanado, minutosEstructura, normalizarCircuitos, repartirMinutos } from "./estructura.js";

const app = document.getElementById("app");
renderHeader("circuitos");

let ejercicios = new Map();
let categorias = new Map();
let objetivos = [];
let circuitos = [];
let sesiones = [];
let guias = {};

const nombreDe = (o) => o.nombre || ejercicios.get(o.ex).nombre;

// Las etiquetas dicen qué se gana con el circuito (aeróbico, velocidad, pelota...), no cómo se llama.
function etiquetas(items) {
  const g = masGanado(repartirMinutos(items, items.length, ejercicios), objetivos, { max: 3, etiquetas: true });
  return g.length ? h("p", { class: "card-meta" }, g.map((x) => h("span", { class: "etiqueta" }, x.nombre))) : null;
}

function usadoEn(c) {
  const usos = sesiones.filter((s) => s.bloques.some((b) => b.opciones.some((o) => o.circuito === c.id)));
  return h("p", { class: "usado-en" },
    usos.length
      ? ["Se usa en: ", ...usos.flatMap((s, i) => [i ? ", " : "", h("a", { href: `sesiones.html#${s.id}` }, s.nombre)])]
      : "Ninguna sesión lo usa todavía.");
}

// Resumen de una línea para la tarjeta: cuántos ejercicios y, si tiene estructura, cuánto dura.
function resumen(c) {
  const ef = completarItems(c);
  const cuantos = c.partes ? `${c.partes.length} partes` : c.opciones ? `${c.opciones.length} ejercicios posibles` : `${ef.items.length} ejercicios`;
  const min = ef.estructura && ef.items ? ` · unos ${minutosEstructura(ef)} min` : "";
  return cuantos + min;
}

function tarjetaResumen(c) {
  const ef = completarItems(c);
  return h("a", { class: "card-sesion card-circuito", href: `#${c.id}` },
    h("span", { class: "card-min" }, String(c.numero)),
    h("span", { class: "card-nombre" }, c.nombre),
    ef.items ? etiquetas(ef.items) : null,
    h("p", { class: "card-cuando" }, resumen(c)));
}

// Lista numerada de ejercicios, con su tipo (fuerza, coordinación...) y la nota si la hay.
function listaEjercicios(items, etiquetaDe) {
  return h("ol", { class: "circuito-lista" }, items.map((it, i) => {
    const ej = ejercicios.get(it.ex);
    const detalle = [it.dosis, it.nota].filter(Boolean).join(" · ");
    return h("li", {},
      h("span", { class: "est-num" }, String(i + 1)),
      h("a", { href: `glosario.html#${ej.id}` }, it.nombre || ej.nombre),
      h("span", { class: "etiqueta" }, etiquetaDe(it, ej)),
      it.opcional ? h("span", { class: "etiqueta" }, "opcional") : null,
      detalle ? h("span", { class: "item-dosis" }, detalle) : null);
  }));
}

// Alternativas: lista desplegable de ejercicios que también sirven en lugar de los propuestos.
function alternativasNodo(titulo, opciones) {
  if (!opciones.length) return null;
  return h("details", { class: "musculo-sec" },
    h("summary", {}, `${titulo} (${opciones.length})`),
    h("ul", { class: "musculo-lista" }, opciones.map((o) =>
      h("li", {}, h("a", { href: `glosario.html#${o.ex}` }, nombreDe(o)), o.grupo ? h("span", { class: "etiqueta" }, o.grupo) : null))));
}

// Lista de ejercicios posibles: se muestra la propuesta y, aparte, el resto de las alternativas.
function tarjetaPool(c) {
  const propuesta = c.propuesta.map((p) => p.ex);
  const items = c.propuesta.map((p) => ({ ex: p.ex, nota: p.nota ?? c.opciones.find((o) => o.ex === p.ex)?.nota, nombre: c.opciones.find((o) => o.ex === p.ex)?.nombre }));
  const guia = c.guia ? guiaDetalle(guias[c.guia]) : null;
  return h("section", { class: "musculo circuito", id: c.id },
    h("h2", {}, h("span", { class: "num-ej" }, String(c.numero)), c.nombre),
    etiquetas(items),
    h("p", { class: "musculo-para" }, c.descripcion),
    c.estructura ? estructuraNodo({ ...c, items }, guia) : guia,
    subseccion(`Propuesta: ${items.length} ejercicios`, listaEjercicios(items, (it, ej) => categorias.get(ej.categoria))),
    alternativasNodo("Otros ejercicios que podés usar", c.opciones.filter((o) => !propuesta.includes(o.ex))),
    usadoEn(c));
}

// Plantilla: varias partes. De cada una se propone una opción (la primera) y se listan las otras.
function tarjetaPlantilla(c) {
  const items = c.partes.map((p) => p.opciones[0]);
  return h("section", { class: "musculo circuito", id: c.id },
    h("h2", {}, h("span", { class: "num-ej" }, String(c.numero)), c.nombre),
    etiquetas(items),
    h("p", { class: "musculo-para" }, c.descripcion),
    subseccion("Propuesta", h("ol", { class: "circuito-lista" }, c.partes.map((p, pi) => h("li", {},
      h("span", { class: "est-num" }, String(pi + 1)),
      h("a", { href: `glosario.html#${items[pi].ex}` }, nombreDe(items[pi])),
      h("span", { class: "etiqueta" }, p.nombre),
      items[pi].nota ? h("span", { class: "item-dosis" }, items[pi].nota) : null)))),
    c.partes.map((p) => alternativasNodo(`Alternativas de ${p.nombre.toLowerCase()}`, p.opciones.slice(1))),
    usadoEn(c));
}

// Tabla de cuánto hacer según el tiempo (campo "progresion" del circuito).
function progresionNodo(p) {
  if (!p) return null;
  return subseccion(p.titulo,
    p.nota ? h("p", { class: "nota" }, p.nota) : null,
    h("table", { class: "tabla" },
      h("thead", {}, h("tr", {}, h("th", {}, "Tiempo"), h("th", {}, "Bloques"), h("th", {}, "Qué hacer"))),
      h("tbody", {}, p.filas.map((f) => h("tr", {}, h("td", {}, `${f.min} min`), h("td", {}, String(f.bloques)), h("td", {}, f.que))))));
}

// Todos los patrones que se pueden usar (campo "patrones" del circuito); los "extra" son los que se suman al subir el tiempo.
function patronesNodo(p) {
  if (!p) return null;
  return subseccion(p.titulo,
    h("ul", { class: "musculo-lista" }, p.lista.map((x) => h("li", {},
      h("a", { href: "glosario.html#escalera" }, x.nombre),
      h("span", { class: "etiqueta" }, x.extra ? "se suma al subir" : "base"),
      x.nota ? h("span", { class: "item-dosis" }, x.nota) : null))));
}

// "6 estaciones, 3 ejercicios en cada una" o, si no todas son iguales, "6 estaciones, de 2 o 3 ejercicios".
function tituloEstaciones(ef) {
  const tams = agruparEstaciones(ef.items, ef.agrupar).map((g) => g.length);
  const min = Math.min(...tams), max = Math.max(...tams);
  return `${tams.length} estaciones, ${min === max ? `${max} ejercicios en cada una` : `de ${min} a ${max} ejercicios`}`;
}

// Circuito de ejercicios fijos, en orden. Con "agrupar", cada grupo de ejercicios es una estación.
function tarjetaSimple(c) {
  const ef = completarItems(c);
  const guia = c.guia ? guiaDetalle(guias[c.guia]) : null;
  const usados = new Set(ef.items.map((it) => it.ex));
  const etiqueta = (it, ej) => categorias.get(ej.categoria);
  return h("section", { class: "musculo circuito", id: c.id },
    h("h2", {}, h("span", { class: "num-ej" }, String(c.numero)), c.nombre),
    etiquetas(ef.items),
    h("p", { class: "musculo-para" }, c.descripcion),
    c.videos?.length ? subseccion("Videos e imágenes", h("div", { class: "medios" }, c.videos.map(videoNodo))) : null,
    ef.estructura ? estructuraNodo(ef, guia) : guia,
    ef.agrupar
      ? subseccion(tituloEstaciones(ef),
          ...agruparEstaciones(ef.items, ef.agrupar).map((grupo, k) => h("div", { class: "estacion-lista" },
            h("h4", {}, `Estación ${k + 1}`), listaEjercicios(grupo, etiqueta))))
      : [progresionNodo(c.progresion), patronesNodo(c.patrones),
         subseccion(c.lista_titulo || `${ef.items.length} ejercicios, en este orden`, listaEjercicios(ef.items, etiqueta))],
    c.opciones ? alternativasNodo("Otros ejercicios que podés usar", c.opciones.filter((o) => !usados.has(o.ex))) : null,
    usadoEn(c));
}

function tarjeta(c) {
  if (c.partes) return tarjetaPlantilla(c);
  if (c.opciones && c.propuesta) return tarjetaPool(c);
  return tarjetaSimple(c);
}

// Filtros de la grilla (se conservan al abrir un circuito y volver).
const TIPOS = [["calentamiento", "Entrada en calor"], ["fuerza", "Fuerza"], ["potencia", "Potencia"], ["coordinacion", "Coordinación"],
  ["velocidad", "Velocidad"], ["aerobico", "Aeróbico"], ["pelota", "Con pelota"]];
const filtros = { q: "", tipos: new Set(), sinPelota: false, gente: null }; // gente: null | "solo" | "grupo"

const itemsDe = (c) => completarItems(c).items || [];
const categoriasDe = (c) => new Set(itemsDe(c).map((it) => ejercicios.get(it.ex).categoria));
const individual = (c) => itemsDe(c).every((it) => (ejercicios.get(it.ex).jugadores_min || 1) === 1);
const textoDe = (c) => normalizar([c.nombre, c.descripcion, ...itemsDe(c).map((it) => it.nombre || ejercicios.get(it.ex).nombre)].join(" "));

function visibles() {
  const q = normalizar(filtros.q.trim());
  return circuitos.filter((c) => {
    const cats = categoriasDe(c);
    if ([...filtros.tipos].some((t) => !cats.has(t))) return false;
    if (filtros.sinPelota && cats.has("pelota")) return false;
    if (filtros.gente === "solo" && !individual(c)) return false;
    if (filtros.gente === "grupo" && individual(c)) return false;
    return !q || textoDe(c).includes(q);
  });
}

const hayFiltros = () => filtros.q.trim() || filtros.tipos.size || filtros.sinPelota || filtros.gente;

function limpiarFiltros() {
  filtros.q = ""; filtros.tipos.clear(); filtros.sinPelota = false; filtros.gente = null;
  grilla();
}

function chipFiltro(texto, activo, alClick) {
  return h("button", { type: "button", class: "chip", "aria-pressed": String(activo), onclick: alClick }, texto);
}

function pintarGrilla() {
  const lista = visibles();
  const conteo = document.getElementById("conteo");
  conteo.replaceChildren(`${lista.length} ${lista.length === 1 ? "circuito" : "circuitos"}`);
  if (hayFiltros()) conteo.append(h("button", { type: "button", class: "limpiar-filtros", onclick: limpiarFiltros }, "✕ Limpiar filtros"));
  document.getElementById("chips-tipo").replaceChildren(
    ...TIPOS.map(([id, nombre]) => chipFiltro(nombre, filtros.tipos.has(id), () => {
      if (filtros.tipos.has(id)) filtros.tipos.delete(id); else filtros.tipos.add(id);
      if (id === "pelota" && filtros.tipos.has(id)) filtros.sinPelota = false;
      pintarGrilla();
    })),
    chipFiltro("Sin pelota", filtros.sinPelota, () => {
      filtros.sinPelota = !filtros.sinPelota;
      if (filtros.sinPelota) filtros.tipos.delete("pelota");
      pintarGrilla();
    }));
  document.getElementById("chips-gente").replaceChildren(
    chipFiltro("Se hace solo", filtros.gente === "solo", () => { filtros.gente = filtros.gente === "solo" ? null : "solo"; pintarGrilla(); }),
    chipFiltro("Hace falta alguien más", filtros.gente === "grupo", () => { filtros.gente = filtros.gente === "grupo" ? null : "grupo"; pintarGrilla(); }));
  document.getElementById("grilla").replaceChildren(lista.length
    ? h("div", { class: "grid-sesiones" }, lista.map(tarjetaResumen))
    : h("p", { class: "vacio" }, "No hay circuitos con esos filtros."));
}

function grilla() {
  document.title = "Circuitos";
  const buscar = h("input", { class: "buscar", type: "search", placeholder: "Buscar circuito", "aria-label": "Buscar circuito", autocomplete: "off",
    oninput: (e) => { filtros.q = e.target.value; pintarGrilla(); } });
  buscar.value = filtros.q;
  app.replaceChildren(
    h("h1", {}, "Circuitos"),
    h("p", { class: "intro" }, "Un circuito es un conjunto de ejercicios hechos en orden. Filtrá para encontrar uno rápido y tocalo para ver el detalle: la propuesta y, aparte, las alternativas que también sirven."),
    h("div", { class: "controles" }, buscar,
      h("div", { class: "chips", id: "chips-tipo", role: "group", "aria-label": "Tipo de circuito" }),
      h("div", { class: "chips", id: "chips-gente", role: "group", "aria-label": "Cuánta gente hace falta" })),
    h("p", { class: "conteo", id: "conteo", "aria-live": "polite" }),
    h("div", { id: "grilla" }));
  pintarGrilla();
  window.scrollTo(0, 0);
}

function detalle(c) {
  document.title = c.nombre;
  app.replaceChildren(h("a", { class: "volver", href: "#" }, "← Todos los circuitos"), tarjeta(c));
  window.scrollTo(0, 0);
}

function ruta() {
  const id = decodeURIComponent(location.hash.slice(1));
  const c = circuitos.find((x) => x.id === id);
  if (c) detalle(c); else grilla();
}

try {
  const [ex, cir, ses, obj] = await Promise.all([
    cargarJSON("data/exercises.json"), cargarJSON("data/circuits.json"), cargarJSON("data/sessions.json"), cargarJSON("data/objetivos.json")]);
  ejercicios = new Map(ex.ejercicios.map((e) => [e.id, e]));
  categorias = new Map(ex.categorias.map((c) => [c.id, c.nombre]));
  objetivos = obj.objetivos;
  circuitos = normalizarCircuitos(cir);
  sesiones = ses.sesiones;
  guias = ses.guias;
  ruta();
  window.addEventListener("hashchange", ruta);
} catch (err) {
  mostrarError(app, err);
}
