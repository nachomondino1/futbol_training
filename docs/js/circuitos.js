import { h, renderHeader, cargarJSON, mostrarError } from "./common.js";
import { completarItems, estructuraNodo, guiaDetalle, masGanado, normalizarCircuitos, repartirMinutos } from "./estructura.js";

const app = document.getElementById("app");
renderHeader("circuitos");

let ejercicios = new Map();
let categorias = new Map();
let objetivos = [];
let circuitos = [];
let sesiones = [];
let guias = {};
const estado = { pool: {}, partes: {} };
// pool: id de circuito -> ids de los ejercicios elegidos, en el orden en que se van a hacer
// partes: id de plantilla -> [índice de la opción elegida en cada parte]

const nombreDe = (o) => o.nombre || ejercicios.get(o.ex).nombre;

// Las etiquetas dicen qué se gana con el circuito (aeróbico, velocidad, pelota...), no cómo se llama.
function etiquetas(items) {
  const g = masGanado(repartirMinutos(items, items.length, ejercicios), objetivos, { max: 3, etiquetas: true });
  return g.length ? h("p", { class: "card-meta" }, g.map((x) => h("span", { class: "etiqueta" }, x.nombre))) : null;
}

function usadoEn(c) {
  const usos = sesiones.filter((s) => s.bloques.some((b) => b.opciones.some((o) => o.circuito === c.id)));
  return usos.length
    ? h("p", { class: "usado-en" }, "Se usa en: ",
        usos.flatMap((s, i) => [i ? ", " : "", h("a", { href: `sesiones.html#${s.id}` }, s.nombre)]))
    : null;
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
      detalle ? h("span", { class: "item-dosis" }, detalle) : null);
  }));
}

// Lista de ejercicios posibles: se eligen los que se quieran y se propone un orden (el que se hace hoy).
function tarjetaPool(c) {
  const propuesta = c.propuesta.map((p) => p.ex);
  const elegidos = estado.pool[c.id] ||= [...propuesta];
  const items = elegidos.map((ex) => {
    const nota = c.propuesta.find((p) => p.ex === ex)?.nota ?? c.opciones.find((o) => o.ex === ex)?.nota;
    return { ex, nota, nombre: c.opciones.find((o) => o.ex === ex)?.nombre };
  });
  const guia = c.guia ? guiaDetalle(guias[c.guia]) : null;
  const alternar = (ex) => {
    const i = elegidos.indexOf(ex);
    if (i >= 0) elegidos.splice(i, 1); else elegidos.push(ex);
    pintar();
  };

  return h("section", { class: "musculo circuito", id: c.id },
    h("h2", {}, c.nombre),
    etiquetas(items),
    h("p", { class: "musculo-para" }, c.descripcion),
    c.estructura ? estructuraNodo({ ...c, items }, guia) : guia,
    h("div", { class: "hoy" },
      h("h3", {}, "Tu circuito de hoy"),
      items.length ? listaEjercicios(items, (it, ej) => categorias.get(ej.categoria)) : h("p", {}, "Elegí al menos un ejercicio."),
      items.length !== c.elegir ? h("p", { class: "ganas-nota" }, `Elegiste ${items.length}; lo habitual son ${c.elegir}.`) : null),
    h("p", { class: "parte-ayuda" }, "Elegí los ejercicios (se hacen en el orden en que los vas tocando):"),
    h("div", { class: "opciones", role: "group", "aria-label": "Ejercicios posibles" }, c.opciones.map((o) =>
      h("button", { type: "button", class: "chip", "aria-pressed": String(elegidos.includes(o.ex)), onclick: () => alternar(o.ex) }, nombreDe(o)))),
    h("button", { type: "button", class: "chip", onclick: () => { estado.pool[c.id] = [...propuesta]; pintar(); } }, "Volver al orden propuesto"),
    usadoEn(c));
}

// Plantilla: tres (o más) partes y, de cada una, las opciones posibles. Se elige una por parte.
function tarjetaPlantilla(c) {
  const elegidas = estado.partes[c.id] ||= c.partes.map(() => 0);
  const items = c.partes.map((p, pi) => p.opciones[elegidas[pi]]);

  const hoy = h("div", { class: "hoy" },
    h("h3", {}, "Tu circuito de hoy"),
    h("ol", { class: "circuito-lista" }, c.partes.map((p, pi) => {
      const o = items[pi];
      return h("li", {},
        h("span", { class: "est-num" }, String(pi + 1)),
        h("a", { href: `glosario.html#${o.ex}` }, nombreDe(o)),
        h("span", { class: "etiqueta" }, p.nombre),
        o.nota ? h("span", { class: "item-dosis" }, o.nota) : null);
    })));

  const parte = (p, pi) => {
    const grupos = [...new Set(p.opciones.map((o) => o.grupo || ""))];
    return h("div", { class: "parte" },
      h("h3", {}, `Parte ${pi + 1}: ${p.nombre}`, h("span", { class: "parte-elegida" }, nombreDe(items[pi]))),
      grupos.flatMap((g) => [
        g ? h("p", { class: "grupo-opciones" }, g) : null,
        h("div", { class: "opciones", role: "group", "aria-label": `${p.nombre}${g ? ": " + g : ""}` },
          p.opciones.map((o, oi) => (o.grupo || "") === g
            ? h("button", { type: "button", class: "chip", "aria-pressed": String(elegidas[pi] === oi),
                onclick: () => { elegidas[pi] = oi; pintar(); } }, nombreDe(o))
            : null))]));
  };

  return h("section", { class: "musculo circuito", id: c.id },
    h("h2", {}, c.nombre),
    etiquetas(items),
    h("p", { class: "musculo-para" }, c.descripcion),
    hoy,
    h("p", { class: "parte-ayuda" }, "Elegí una opción de cada parte:"),
    c.partes.map(parte),
    usadoEn(c));
}

// Circuito de ejercicios fijos, en orden.
function tarjetaSimple(c) {
  const ef = completarItems(c);
  const guia = c.guia ? guiaDetalle(guias[c.guia]) : null;
  return h("section", { class: "musculo circuito", id: c.id },
    h("h2", {}, c.nombre),
    etiquetas(ef.items),
    h("p", { class: "musculo-para" }, c.descripcion),
    ef.estructura ? estructuraNodo(ef, guia) : guia,
    h("h3", {}, `${ef.items.length} ejercicios, en este orden`),
    listaEjercicios(ef.items, (it, ej) => categorias.get(ej.categoria)),
    usadoEn(c));
}

function tarjeta(c) {
  if (c.partes) return tarjetaPlantilla(c);
  if (c.opciones) return tarjetaPool(c);
  return tarjetaSimple(c);
}

function pintar() {
  const y = window.scrollY;
  app.replaceChildren(
    h("h1", {}, "Circuitos"),
    h("p", { class: "intro" }, "Un circuito es un conjunto de ejercicios hechos en orden. Algunos son una lista de ejercicios posibles para elegir; otros, una plantilla donde elegís una opción por parte."),
    indice(circuitos),
    ...circuitos.map(tarjeta));
  window.scrollTo(0, y);
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
