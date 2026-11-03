import { completarItems, normalizarCircuitos } from "./estructura.js";
import { h, imagenesNodos, patronesNodos, variantesNodo, materialesNodo, normalizar, renderHeader, cargarJSON, mostrarError } from "./common.js";

const app = document.getElementById("app");
// tipo: null | "con" | "sin" (pelota); sub: subcategoría de pelota (si tipo es "con") o categoría (si es "sin")
const estado = { tipo: null, sub: null, q: "" };
let datos = null;
let grupos = new Map(); // id -> grupo muscular o capacidad
let usos = new Map();   // id de ejercicio -> Map(id de sesión -> {nombre, alternativa})
let vista = null;       // "lista" | "detalle": qué se está mostrando
let scrollLista = 0;    // dónde estabas en la lista, para volver al mismo lugar

renderHeader("glosario");

// En qué sesiones aparece cada ejercicio: en un bloque (directo o por un circuito) o como alternativa de un circuito.
function calcularUsos(sesiones, circuitos) {
  const porId = new Map(circuitos.map((c) => [c.id, c]));
  const res = new Map();
  const marcar = (ex, s, alternativa) => {
    const m = res.get(ex) || res.set(ex, new Map()).get(ex);
    if (!m.has(s.id) || (m.get(s.id).alternativa && !alternativa)) m.set(s.id, { nombre: s.nombre, alternativa });
  };
  for (const s of sesiones) for (const b of s.bloques) for (const o of b.opciones) {
    const c = porId.get(o.circuito);
    const items = c ? completarItems(c).items : o.items;
    items.forEach((it) => marcar(it.ex, s, false));
    (c?.opciones || []).forEach((x) => marcar(x.ex, s, true));
  }
  return res;
}

function sesionesNodo(ej) {
  const m = usos.get(ej.id);
  if (!m) return "—";
  return h("ul", { class: "usos-lista" }, [...m].map(([id, u]) => h("li", {},
    h("a", { href: `sesiones.html#${id}` }, u.nombre), u.alternativa ? h("span", { class: "alias" }, " (alternativa)") : null)));
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

// Los ejercicios con pelota dicen qué trabajan: tiro al arco, pase corto, control orientado...
function subcategoriasNodo(ej) {
  if (!ej.subcategorias?.length) return null;
  const nombre = (id) => datos.subcategorias.find((x) => x.id === id).nombre;
  return h("p", { class: "card-meta" }, ej.subcategorias.map((id) => h("span", { class: "etiqueta" }, nombre(id))));
}

const EMOJI = { calentamiento: "🔥", coordinacion: "🪜", fuerza: "🏋️", aerobico: "🫁", potencia: "⚡", velocidad: "💨", pelota: "⚽", "vuelta-calma": "🧘" };

// Imagen para la tarjeta: la del ejercicio, la primera por cantidad de personas o la del primer patrón.
const imagenCard = (ej) => ej.imagen || Object.values(ej.imagenes || {})[0] || ej.patrones?.[0]?.imagen || null;

const categoriaDe = (ej) => datos.categorias.find((c) => c.id === ej.categoria);

// Tarjeta de la grilla: solo imagen y nombre; tocarla abre el detalle.
const esIndividual = (ej) => !ej.jugadores_min || ej.jugadores_min === 1;

function tarjeta(ej) {
  const src = imagenCard(ej);
  return h("a", { class: `ej-card${esIndividual(ej) ? " ej-card--individual" : ""}`, href: `#${ej.id}` },
    h("span", { class: "ej-card__marco" },
      src
        ? h("img", { src, alt: "", loading: "lazy", width: 640, height: 400 })
        : h("span", { class: "ej-card__vacio" },
            h("span", { class: "ej-card__emoji", "aria-hidden": "true" }, EMOJI[ej.categoria] || "⚽"),
            categoriaDe(ej)?.nombre || "")),
    h("span", { class: "ej-card__nombre" }, ej.nombre));
}

// Detalle de un ejercicio: lo que antes eran las columnas de la tabla.
function vistaDetalle(ej) {
  const medios = [...imagenesNodos(ej), ...patronesNodos(ej)];
  if (ej.video) medios.push(h("a", { class: "btn", href: ej.video, target: "_blank", rel: "noopener" }, "Ver video"));
  const vars = variantesNodo(ej.variantes || {});
  app.replaceChildren(
    h("a", { class: "volver", href: "#" }, "← Todos los ejercicios"),
    h("div", { class: "detalle" },
      h("h1", {}, ej.nombre),
      ej.alias?.length ? h("p", { class: "alias" }, `También: ${ej.alias.join(", ")}`) : null,
      h("p", { class: "card-meta" }, h("span", { class: "cat" }, categoriaDe(ej)?.nombre || ej.categoria)),
      subcategoriasNodo(ej),
      trabajaNodo(ej),
      medios.length ? h("div", { class: "medios" }, medios) : null,
      h("h2", {}, "Cómo se hace"),
      h("p", {}, ej.descripcion),
      ej.jugadores_min > 1 ? h("p", { class: "detalle__dato" }, `Se hace de a ${ej.jugadores_min} o más.`) : null,
      ej.dosis ? [h("h2", {}, "Dosis"), h("p", {}, ej.dosis)] : null,
      h("h2", {}, "Materiales"),
      materialesNodo(ej) || h("p", {}, "No necesita materiales."),
      vars ? [h("h2", {}, "Variantes"), vars] : null,
      h("h2", {}, "En qué sesiones"),
      usos.has(ej.id) ? sesionesNodo(ej) : h("p", {}, "Ninguna sesión lo usa todavía.")));
}

function visibles() {
  const q = normalizar(estado.q.trim());
  return datos.ejercicios.filter((e) => {
    if (estado.tipo === "con" && e.categoria !== "pelota") return false;
    if (estado.tipo === "sin" && e.categoria === "pelota") return false;
    if (estado.sub) {
      const cumple = estado.tipo === "con" ? (e.subcategorias || []).includes(estado.sub) : e.categoria === estado.sub;
      if (!cumple) return false;
    }
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
  cont.replaceChildren(h("div", { class: "galeria" }, lista.map(tarjeta)));
}

function chip(nombre, activo, alClick) {
  return h("button", { class: "chip", type: "button", "aria-pressed": String(activo), onclick: alClick }, nombre);
}

// Primera fila: con pelota o sin pelota. Segunda fila: las subcategorías de pelota o, sin pelota, las categorías.
function renderChips() {
  const eleg = (tipo, sub = null) => { estado.tipo = tipo; estado.sub = sub; renderChips(); renderLista(); };
  document.getElementById("chips").replaceChildren(
    chip("Todos", !estado.tipo, () => eleg(null)),
    chip("Con pelota", estado.tipo === "con", () => eleg("con")),
    chip("Sin pelota", estado.tipo === "sin", () => eleg("sin")));
  const segunda = estado.tipo === "con" ? datos.subcategorias : estado.tipo === "sin" ? datos.categorias.filter((c) => c.id !== "pelota") : [];
  document.getElementById("chips-sub").replaceChildren(...(segunda.length
    ? [chip("Todas", !estado.sub, () => eleg(estado.tipo)), ...segunda.map((c) => chip(c.nombre, estado.sub === c.id, () => eleg(estado.tipo, c.id)))]
    : []));
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

function vistaLista() {
  const buscar = h("input", { class: "buscar", type: "search", id: "buscar", placeholder: "Buscar ejercicio",
    "aria-label": "Buscar ejercicio", autocomplete: "off",
    oninput: (e) => { estado.q = e.target.value; renderLista(); } });
  buscar.value = estado.q;
  app.replaceChildren(
    h("h1", {}, "Ejercicios"),
    h("p", { class: "intro" }, h("a", { href: "#musculos" }, "Músculos y para qué sirve cada uno ↓")),
    h("div", { class: "controles" },
      buscar,
      h("div", { class: "chips", id: "chips", role: "group", "aria-label": "Con pelota o sin pelota" }),
      h("div", { class: "chips", id: "chips-sub", role: "group", "aria-label": "Filtrar por subcategoría" })),
    h("p", { class: "conteo", id: "conteo", "aria-live": "polite" }),
    h("p", { class: "leyenda" },
      h("span", { class: "leyenda__punto leyenda__punto--individual", "aria-hidden": "true" }), "Se hace solo",
      h("span", { class: "leyenda__punto", "aria-hidden": "true" }), "Hace falta alguien más"),
    h("div", { id: "lista" }),
    seccionMusculos());
  renderChips();
  renderLista();
}

// Un hash con el id de un ejercicio abre su detalle; sin hash (o con un músculo) se ve la grilla.
function ruta() {
  const id = decodeURIComponent(location.hash.slice(1));
  const ej = datos.ejercicios.find((e) => e.id === id);
  if (ej) {
    if (vista === "lista") scrollLista = window.scrollY;
    vistaDetalle(ej);
    vista = "detalle";
    document.title = ej.nombre;
    window.scrollTo(0, 0);
    return;
  }
  if (vista === "lista") { // ya estás en la grilla: solo hay que ir al músculo
    if (esMusculo(id)) document.getElementById(id)?.scrollIntoView({ block: "start" });
    return;
  }
  const venias = vista === "detalle";
  vistaLista();
  vista = "lista";
  document.title = "Ejercicios";
  if (esMusculo(id)) document.getElementById(id)?.scrollIntoView({ block: "start" });
  else window.scrollTo(0, venias ? scrollLista : 0);
}

try {
  const [ex, mus, ses, cir] = await Promise.all([cargarJSON("data/exercises.json"), cargarJSON("data/muscles.json"),
    cargarJSON("data/sessions.json"), cargarJSON("data/circuits.json")]);
  datos = ex;
  usos = calcularUsos(ses.sesiones, normalizarCircuitos(cir));
  grupos = new Map(mus.grupos.map((g) => [g.id, g])); // await de nivel módulo: válido en <script type="module">
  ruta();
  window.addEventListener("hashchange", ruta);
} catch (err) {
  mostrarError(app, err);
}
