import { getPersonas, h, imagenesNodos, variantesNodo, normalizar, renderHeader, cargarJSON, mostrarError } from "./common.js";

const app = document.getElementById("app");
const estado = { cat: null, q: "" };
let datos = null;
let grupos = new Map(); // id -> grupo muscular o capacidad

renderHeader("glosario");

function celdaVariantes(ej) {
  return variantesNodo(ej.variantes || {}, getPersonas()) || "—";
}

function celdaMedios(ej) {
  const items = [];
  items.push(...imagenesNodos(ej, getPersonas()));
  if (ej.video) items.push(h("a", { class: "btn", href: ej.video, target: "_blank", rel: "noopener" }, "Ver video"));
  return items.length ? h("div", { class: "medios" }, items) : null;
}

// Los músculos viven al final de esta misma página: su id lleva prefijo para no chocar con los de los ejercicios.
const idMusculo = (id) => `musculo-${id}`;
const esMusculo = (id) => id === "musculos" || id.startsWith("musculo-");

function trabajaNodo(ej) {
  const t = ej.trabaja;
  const link = (id) => h("a", { href: `#${idMusculo(id)}` }, grupos.get(id).nombre);
  return h("div", { class: "trabaja" },
    h("span", {}, "Trabaja: "), h("strong", {}, link(t.principal)),
    t.secundarios.length
      ? h("span", { class: "trabaja-sec" }, " · también ", t.secundarios.flatMap((id, i) => [i ? ", " : "", link(id)]))
      : null);
}

function fila(ej) {
  const cat = datos.categorias.find((c) => c.id === ej.categoria);
  return h("tr", { id: ej.id },
    h("td", { class: "td-nombre", "data-label": "Ejercicio" },
      h("span", { class: "nombre" }, ej.nombre),
      ej.alias?.length ? h("span", { class: "alias" }, `También: ${ej.alias.join(", ")}`) : null),
    h("td", { "data-label": "Categoría" },
      h("span", { class: "cat" }, cat ? cat.nombre : ej.categoria),
      trabajaNodo(ej)),
    h("td", { "data-label": "Cómo se hace" }, ej.descripcion),
    h("td", { "data-label": "Variantes" }, celdaVariantes(ej)),
    h("td", { "data-label": "Dosis" }, ej.dosis || "—"),
    h("td", { "data-label": "Imagen / video" }, celdaMedios(ej)));
}

function visibles() {
  const q = normalizar(estado.q.trim());
  return datos.ejercicios.filter((e) => {
    if (estado.cat && e.categoria !== estado.cat) return false;
    if (!q) return true;
    return [e.nombre, ...(e.alias || []), grupos.get(e.trabaja.principal).nombre].some((t) => normalizar(t).includes(q));
  });
}

function renderLista() {
  const lista = visibles();
  const cont = document.getElementById("lista");
  document.getElementById("conteo").textContent =
    `${lista.length} ${lista.length === 1 ? "ejercicio" : "ejercicios"}`;
  if (!lista.length) {
    cont.replaceChildren(h("p", { class: "vacio" }, "No hay ejercicios con ese filtro."));
    return;
  }
  cont.replaceChildren(h("table", { class: "tabla" },
    h("thead", {}, h("tr", {}, ["Ejercicio", "Categoría", "Cómo se hace", "Variantes", "Dosis", "Imagen / video"]
      .map((t) => h("th", { scope: "col" }, t)))),
    h("tbody", {}, lista.map(fila))));
  resaltarHash();
}

function resaltarHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  document.querySelectorAll("tr.destacada").forEach((t) => t.classList.remove("destacada"));
  if (!id || esMusculo(id)) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("destacada");
  el.scrollIntoView({ block: "center" });
}

function renderChips() {
  const chips = document.getElementById("chips");
  const todas = [{ id: null, nombre: "Todas" }, ...datos.categorias];
  chips.replaceChildren(...todas.map((c) =>
    h("button", { class: "chip", type: "button", "aria-pressed": String(estado.cat === c.id),
      onclick: () => { estado.cat = c.id; renderChips(); renderLista(); } }, c.nombre)));
}

// Músculo o capacidad: qué ejercicios lo trabajan (como principal o secundario) y para qué sirve.
function seccionMusculo(g) {
  const principales = datos.ejercicios.filter((e) => e.trabaja.principal === g.id);
  const secundarios = datos.ejercicios.filter((e) => e.trabaja.secundarios.includes(g.id));
  const link = (e) => h("li", {}, h("a", { href: `#${e.id}` }, e.nombre));
  return h("section", { class: "musculo", id: idMusculo(g.id) },
    h("h3", {}, g.nombre),
    h("p", { class: "musculo-zona" }, g.zona),
    h("p", { class: "musculo-para" }, g.para_que),
    principales.length
      ? [h("h4", {}, "Lo trabajan principalmente"), h("ul", { class: "musculo-lista" }, principales.map(link))]
      : null,
    secundarios.length
      ? h("details", { class: "musculo-sec" },
          h("summary", {}, `También lo trabajan (${secundarios.length})`),
          h("ul", { class: "musculo-lista" }, secundarios.map(link)))
      : null);
}

function seccionMusculos() {
  const grupo = (tipo) => [...grupos.values()].filter((g) => g.tipo === tipo).map(seccionMusculo);
  return h("div", { id: "musculos" },
    h("h2", { class: "subtitulo" }, "Músculos"),
    h("p", { class: "intro" }, "Qué músculo trabaja cada ejercicio y para qué te sirve en la cancha."),
    ...grupo("musculo"),
    h("h2", { class: "subtitulo" }, "Otras capacidades"),
    ...grupo("capacidad"));
}

function armarPagina() {
  app.replaceChildren(
    h("h1", {}, "Glosario"),
    h("p", { class: "intro" }, h("a", { href: "#musculos" }, "Músculos y para qué sirve cada uno ↓")),
    h("div", { class: "controles" },
      h("input", { class: "buscar", type: "search", id: "buscar", placeholder: "Buscar ejercicio",
        "aria-label": "Buscar ejercicio", autocomplete: "off",
        oninput: (e) => { estado.q = e.target.value; renderLista(); } }),
      h("div", { class: "chips", id: "chips", role: "group", "aria-label": "Filtrar por categoría" })),
    h("p", { class: "conteo", id: "conteo", "aria-live": "polite" }),
    h("div", { id: "lista" }),
    seccionMusculos());
  renderChips();
  renderLista();
}

// Si el link apunta a un ejercicio que el filtro esconde, se limpia el filtro.
function irAHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (esMusculo(id)) {
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  } else if (id && !visibles().some((e) => e.id === id)) {
    estado.cat = null;
    estado.q = "";
    const b = document.getElementById("buscar");
    if (b) b.value = "";
    renderChips();
    renderLista();
  } else {
    resaltarHash();
  }
}

try {
  const [ex, mus] = await Promise.all([cargarJSON("data/exercises.json"), cargarJSON("data/muscles.json")]);
  datos = ex;
  grupos = new Map(mus.grupos.map((g) => [g.id, g])); // await de nivel módulo: válido en <script type="module">
  armarPagina();
  irAHash();
  window.addEventListener("hashchange", irAHash);
  document.addEventListener("personas-change", renderLista);
} catch (err) {
  mostrarError(app, err);
}
