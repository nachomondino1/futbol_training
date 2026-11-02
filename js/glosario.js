import { PERSONAS, getPersonas, h, normalizar, renderHeader, cargarJSON, mostrarError } from "./common.js";

const app = document.getElementById("app");
const estado = { cat: null, q: "" };
let datos = null;

renderHeader("glosario");

function celdaVariantes(ej) {
  const n = getPersonas();
  const vars = ej.variantes || {};
  if (!Object.keys(vars).length) return "—";
  const propia = vars[String(n)];
  const otras = PERSONAS.filter((p) => p !== n && vars[String(p)]);
  return [
    propia
      ? h("div", {}, h("span", { class: "variante-label" }, `Con ${n}: `), propia)
      : h("div", {}, `Sin variante para ${n}.`),
    otras.length
      ? h("details", { class: "otras" },
          h("summary", {}, "Otras cantidades"),
          h("ul", {}, otras.map((p) => h("li", {}, h("strong", {}, `${p}: `), vars[String(p)]))))
      : null,
  ];
}

function celdaMedios(ej) {
  const items = [];
  if (ej.imagen) items.push(h("img", { src: ej.imagen, alt: ej.nombre, loading: "lazy" }));
  if (ej.video) items.push(h("a", { class: "btn", href: ej.video, target: "_blank", rel: "noopener" }, "Ver video"));
  return items.length ? h("div", { class: "medios" }, items) : null;
}

function fila(ej) {
  const cat = datos.categorias.find((c) => c.id === ej.categoria);
  return h("tr", { id: ej.id },
    h("td", { class: "td-nombre", "data-label": "Ejercicio" },
      h("span", { class: "nombre" }, ej.nombre),
      ej.alias?.length ? h("span", { class: "alias" }, `También: ${ej.alias.join(", ")}`) : null),
    h("td", { "data-label": "Categoría" }, h("span", { class: "cat" }, cat ? cat.nombre : ej.categoria)),
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
    return [e.nombre, ...(e.alias || [])].some((t) => normalizar(t).includes(q));
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
  if (!id) return;
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

function armarPagina() {
  app.replaceChildren(
    h("h1", {}, "Glosario"),
    h("div", { class: "controles" },
      h("input", { class: "buscar", type: "search", id: "buscar", placeholder: "Buscar ejercicio",
        "aria-label": "Buscar ejercicio", autocomplete: "off",
        oninput: (e) => { estado.q = e.target.value; renderLista(); } }),
      h("div", { class: "chips", id: "chips", role: "group", "aria-label": "Filtrar por categoría" })),
    h("p", { class: "conteo", id: "conteo", "aria-live": "polite" }),
    h("div", { id: "lista" }));
  renderChips();
  renderLista();
}

// Si el link apunta a un ejercicio que el filtro esconde, se limpia el filtro.
function irAHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id && !visibles().some((e) => e.id === id)) {
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
  datos = await cargarJSON("data/exercises.json"); // await de nivel módulo: válido en <script type="module">
  armarPagina();
  irAHash();
  window.addEventListener("hashchange", irAHash);
  document.addEventListener("personas-change", renderLista);
} catch (err) {
  mostrarError(app, err);
}
