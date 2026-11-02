import { h, renderHeader, cargarJSON, mostrarError } from "./common.js";
import { aplicarVariacion, estructuraNodo, guiaDetalle } from "./estructura.js";

const app = document.getElementById("app");
renderHeader("circuitos");

let ejercicios = new Map();
let categorias = new Map();
let circuitos = [];
let sesiones = [];
let guias = {};
const estado = { filtro: null, variacion: {} }; // variacion: id de circuito -> id de variación (sin valor = el original)

const etiquetas = () => [...new Set(circuitos.flatMap((c) => c.etiquetas || []))].sort((a, b) => a.localeCompare(b, "es"));
const visibles = () => circuitos.filter((c) => !estado.filtro || (c.etiquetas || []).includes(estado.filtro));

function filtros() {
  const todas = [{ id: null, nombre: "Todos" }, ...etiquetas().map((e) => ({ id: e, nombre: e[0].toUpperCase() + e.slice(1) }))];
  return h("div", { class: "chips", role: "group", "aria-label": "Filtrar circuitos" }, todas.map((f) =>
    h("button", { type: "button", class: "chip", "aria-pressed": String(estado.filtro === f.id),
      onclick: () => { estado.filtro = f.id; pintar(); } }, f.nombre)));
}

function indice(lista) {
  if (!lista.length) return h("p", { class: "vacio" }, "No hay circuitos con ese filtro.");
  return h("nav", { class: "resumen", "aria-label": "Circuitos" },
    h("p", { class: "resumen-tit" }, `${lista.length} ${lista.length === 1 ? "circuito" : "circuitos"}`),
    h("ol", {}, lista.map((c, i) => {
      const n = (c.variaciones || []).length;
      return h("li", {}, h("button", { type: "button", class: "resumen-fila",
        onclick: () => document.getElementById(c.id).scrollIntoView({ block: "start" }) },
        h("span", { class: "bloque-n" }, String(i + 1)),
        h("span", { class: "resumen-nombre" }, c.nombre),
        h("span", { class: "resumen-min" }, n ? `${n + 1} versiones` : `${c.items.length} ejercicios`)));
    })));
}

function tarjeta(c) {
  const vid = estado.variacion[c.id] || null;
  const ef = aplicarVariacion(c, vid);
  const guia = c.guia ? guiaDetalle(guias[c.guia]) : null;
  const versiones = [{ id: null, nombre: c.base_nombre || "Original" }, ...(c.variaciones || []).map((v) => ({ id: v.id, nombre: v.nombre }))];
  const posibles = [...new Set([c, ...(c.variaciones || [])].flatMap((x) => x.items.map((it) => it.ex)))];
  const usos = sesiones.filter((s) => s.bloques.some((b) => b.opciones.some((o) => o.circuito === c.id)));

  return h("section", { class: "musculo circuito", id: c.id },
    h("h2", {}, c.nombre),
    c.etiquetas?.length ? h("p", { class: "card-meta" }, c.etiquetas.map((e) => h("span", { class: "etiqueta" }, e))) : null,
    h("p", { class: "musculo-para" }, c.descripcion),
    versiones.length > 1
      ? h("div", { class: "opciones", role: "group", "aria-label": `Versiones de ${c.nombre}` }, versiones.map((v) =>
          h("button", { type: "button", class: "chip", "aria-pressed": String(v.id === vid),
            onclick: () => { estado.variacion[c.id] = v.id; pintar(); } }, v.nombre)))
      : null,
    ef.variacion?.nota ? h("p", { class: "nota" }, ef.variacion.nota) : null,
    ef.estructura ? estructuraNodo(ef, guia) : guia,
    h("h3", {}, `${ef.items.length} ejercicios, en este orden`),
    h("ol", { class: "circuito-lista" }, ef.items.map((it, i) => {
      const ej = ejercicios.get(it.ex);
      const detalle = [it.dosis, it.nota].filter(Boolean).join(" · ");
      return h("li", {},
        h("span", { class: "est-num" }, String(i + 1)),
        h("a", { href: `glosario.html#${ej.id}` }, ej.nombre),
        h("span", { class: "etiqueta" }, categorias.get(ej.categoria)),
        detalle ? h("span", { class: "item-dosis" }, detalle) : null);
    })),
    posibles.length > ef.items.length || (c.variaciones || []).length
      ? h("details", { class: "musculo-sec" },
          h("summary", {}, `Ejercicios que se pueden usar (${posibles.length})`),
          h("ul", { class: "musculo-lista" }, posibles.map((id) =>
            h("li", {}, h("a", { href: `glosario.html#${id}` }, ejercicios.get(id).nombre)))))
      : null,
    usos.length
      ? h("p", { class: "usado-en" }, "Se usa en: ",
          usos.flatMap((s, i) => [i ? ", " : "", h("a", { href: `sesiones.html#${s.id}` }, s.nombre)]))
      : null);
}

function pintar() {
  const y = window.scrollY;
  const lista = visibles();
  app.replaceChildren(
    h("h1", {}, "Circuitos"),
    h("p", { class: "intro" }, "Un circuito es un conjunto de ejercicios del glosario, hechos en orden. Cada uno puede tener versiones: misma estructura, otros ejercicios."),
    filtros(),
    indice(lista),
    ...lista.map(tarjeta));
  window.scrollTo(0, y);
}

try {
  const [ex, cir, ses] = await Promise.all([
    cargarJSON("data/exercises.json"), cargarJSON("data/circuits.json"), cargarJSON("data/sessions.json")]);
  ejercicios = new Map(ex.ejercicios.map((e) => [e.id, e]));
  categorias = new Map(ex.categorias.map((c) => [c.id, c.nombre]));
  circuitos = cir.circuitos;
  sesiones = ses.sesiones;
  guias = ses.guias;
  pintar();
  const id = decodeURIComponent(location.hash.slice(1));
  if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
} catch (err) {
  mostrarError(app, err);
}
