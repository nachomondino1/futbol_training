import { h, renderHeader, cargarJSON, mostrarError } from "./common.js";
import { agruparEstaciones, completarItems, estructuraNodo, guiaDetalle, masGanado, normalizarCircuitos, repartirMinutos } from "./estructura.js";

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

function indice(lista) {
  const detalle = (c) => c.partes ? `${c.partes.length} partes` : c.opciones ? `${c.opciones.length} ejercicios posibles` : `${c.items.length} ejercicios`;
  return h("nav", { class: "resumen", "aria-label": "Circuitos" },
    h("p", { class: "resumen-tit" }, `${lista.length} ${lista.length === 1 ? "circuito" : "circuitos"}`),
    h("ol", {}, lista.map((c, i) => h("li", {}, h("button", { type: "button", class: "resumen-fila",
      onclick: () => document.getElementById(c.id).scrollIntoView({ block: "start" }) },
      h("span", { class: "bloque-n" }, String(i + 1)),
      h("span", { class: "resumen-nombre" }, c.nombre),
      h("span", { class: "resumen-min" }, detalle(c)))))));
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
    h("h2", {}, c.nombre),
    etiquetas(items),
    h("p", { class: "musculo-para" }, c.descripcion),
    c.estructura ? estructuraNodo({ ...c, items }, guia) : guia,
    h("h3", {}, `Propuesta: ${items.length} ejercicios`),
    listaEjercicios(items, (it, ej) => categorias.get(ej.categoria)),
    alternativasNodo("Otros ejercicios que podés usar", c.opciones.filter((o) => !propuesta.includes(o.ex))),
    usadoEn(c));
}

// Plantilla: varias partes. De cada una se propone una opción (la primera) y se listan las otras.
function tarjetaPlantilla(c) {
  const items = c.partes.map((p) => p.opciones[0]);
  return h("section", { class: "musculo circuito", id: c.id },
    h("h2", {}, c.nombre),
    etiquetas(items),
    h("p", { class: "musculo-para" }, c.descripcion),
    h("h3", {}, "Propuesta"),
    h("ol", { class: "circuito-lista" }, c.partes.map((p, pi) => h("li", {},
      h("span", { class: "est-num" }, String(pi + 1)),
      h("a", { href: `glosario.html#${items[pi].ex}` }, nombreDe(items[pi])),
      h("span", { class: "etiqueta" }, p.nombre),
      items[pi].nota ? h("span", { class: "item-dosis" }, items[pi].nota) : null))),
    c.partes.map((p) => alternativasNodo(`Alternativas de ${p.nombre.toLowerCase()}`, p.opciones.slice(1))),
    usadoEn(c));
}

// Tabla de cuánto hacer según el tiempo (campo "progresion" del circuito).
function progresionNodo(p) {
  if (!p) return null;
  return h("div", { class: "progresion" },
    h("h3", {}, p.titulo),
    p.nota ? h("p", { class: "nota" }, p.nota) : null,
    h("table", { class: "tabla" },
      h("thead", {}, h("tr", {}, h("th", {}, "Tiempo"), h("th", {}, "Bloques"), h("th", {}, "Qué hacer"))),
      h("tbody", {}, p.filas.map((f) => h("tr", {}, h("td", {}, `${f.min} min`), h("td", {}, String(f.bloques)), h("td", {}, f.que))))));
}

// Todos los patrones que se pueden usar (campo "patrones" del circuito); los "extra" son los que se suman al subir el tiempo.
function patronesNodo(p) {
  if (!p) return null;
  return h("div", {},
    h("h3", {}, p.titulo),
    h("ul", { class: "musculo-lista" }, p.lista.map((x) => h("li", {},
      h("a", { href: "glosario.html#escalera" }, x.nombre),
      h("span", { class: "etiqueta" }, x.extra ? "se suma al subir" : "base"),
      x.nota ? h("span", { class: "item-dosis" }, x.nota) : null))));
}

// Circuito de ejercicios fijos, en orden. Con "agrupar", cada grupo de ejercicios es una estación.
function tarjetaSimple(c) {
  const ef = completarItems(c);
  const guia = c.guia ? guiaDetalle(guias[c.guia]) : null;
  const usados = new Set(ef.items.map((it) => it.ex));
  const etiqueta = (it, ej) => categorias.get(ej.categoria);
  return h("section", { class: "musculo circuito", id: c.id },
    h("h2", {}, c.nombre),
    etiquetas(ef.items),
    h("p", { class: "musculo-para" }, c.descripcion),
    c.videos ? h("p", {}, c.videos.map((v) => h("a", { class: "btn", href: v.url, target: "_blank", rel: "noopener" }, `▶ ${v.nombre}`))) : null,
    ef.estructura ? estructuraNodo(ef, guia) : guia,
    ef.agrupar
      ? [h("h3", {}, `${Math.ceil(ef.items.length / ef.agrupar)} estaciones, ${ef.agrupar} ejercicios en cada una`),
         ...agruparEstaciones(ef.items, ef.agrupar).map((grupo, k) => h("div", { class: "estacion-lista" },
           h("h4", {}, `Estación ${k + 1}`), listaEjercicios(grupo, etiqueta)))]
      : [progresionNodo(c.progresion), patronesNodo(c.patrones),
         h("h3", {}, c.lista_titulo || `${ef.items.length} ejercicios, en este orden`), listaEjercicios(ef.items, etiqueta)],
    c.opciones ? alternativasNodo("Otros ejercicios que podés usar", c.opciones.filter((o) => !usados.has(o.ex))) : null,
    usadoEn(c));
}

function tarjeta(c) {
  if (c.partes) return tarjetaPlantilla(c);
  if (c.opciones && c.propuesta) return tarjetaPool(c);
  return tarjetaSimple(c);
}

function pintar() {
  app.replaceChildren(
    h("h1", {}, "Circuitos"),
    h("p", { class: "intro" }, "Un circuito es un conjunto de ejercicios hechos en orden. Cada uno trae una propuesta y, aparte, las alternativas que también sirven."),
    indice(circuitos),
    ...circuitos.map(tarjeta));
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
  pintar();
  const id = decodeURIComponent(location.hash.slice(1));
  if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
} catch (err) {
  mostrarError(app, err);
}
