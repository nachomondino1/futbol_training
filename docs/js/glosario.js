import { completarItems, normalizarCircuitos } from "./estructura.js";
import { h, imagenesNodos, patronesNodos, variantesNodo, materialesNodo, leerMateriales, guardarMateriales, normalizar, renderHeader, cargarJSON, mostrarError } from "./common.js";

const app = document.getElementById("app");
// tipo: null | "con" | "sin" (pelota); sub: subcategoría de pelota (si tipo es "con") o categoría (si es "sin")
// gente: null | "solo" | "grupo"; materiales: los que tenemos (vacío = no filtrar por material)
const estado = { tipo: null, sub: null, q: "", gente: null, materiales: new Set(leerMateriales()), menu: null };
// menu: cuál de los tres filtros tiene el menú abierto (null | "categoria" | "jugadores" | "materiales")
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
// Etiquetas de la tarjeta: la categoría y, si es de pelota, qué trabaja (tiro, control orientado...).
const tagsDe = (ej) => [categoriaDe(ej)?.nombre || ej.categoria,
  ...(ej.subcategorias || []).map((id) => datos.subcategorias.find((x) => x.id === id).nombre)];

const esIndividual = (ej) => !ej.jugadores_min || ej.jugadores_min === 1;

function tarjeta(ej) {
  const src = imagenCard(ej);
  return h("a", { class: `ej-card${esIndividual(ej) ? " ej-card--individual" : ""}`, href: `#${ej.id}` },
    h("span", { class: "ej-card__marco" },
      src
        ? h("img", { src, alt: "", loading: "lazy", width: 640, height: 400 })
        : h("span", { class: "ej-card__vacio" },
            h("span", { class: "ej-card__emoji", "aria-hidden": "true" }, EMOJI[ej.categoria] || "⚽"),
            )),
    h("span", { class: "ej-card__nombre" }, ej.nombre),
    h("span", { class: "ej-card__tags" }, tagsDe(ej).map((t) => h("span", { class: "etiqueta" }, t))));
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
    if (estado.gente === "solo" && !esIndividual(e)) return false;
    if (estado.gente === "grupo" && esIndividual(e)) return false;
    // con materiales elegidos: solo los ejercicios que se pueden hacer con ellos (los que no piden nada siempre entran)
    if (estado.materiales.size && !(e.materiales || []).every((m) => estado.materiales.has(m))) return false;
    if (!q) return true;
    return [e.nombre, ...(e.alias || []), grupos.get(e.trabaja.principal).nombre].some((t) => normalizar(t).includes(q));
  });
}

function renderLista() {
  const lista = visibles();
  const cont = document.getElementById("lista");
  const conteo = document.getElementById("conteo");
  conteo.replaceChildren(`${lista.length} ${lista.length === 1 ? "ejercicio" : "ejercicios"}`);
  if (hayFiltros()) conteo.append(h("button", { type: "button", class: "limpiar-filtros", onclick: limpiarFiltros }, "✕ Limpiar filtros"));
  if (!lista.length) {
    cont.replaceChildren(h("p", { class: "vacio" }, "No hay ejercicios con esos filtros."));
    return;
  }
  cont.replaceChildren(h("div", { class: "galeria" }, lista.map(tarjeta)));
}

// --- Filtros: tres botones (Categoría, Jugadores, Materiales). Al tocar uno se abre su menú debajo. ---
const hayFiltros = () => !!(estado.tipo || estado.sub || estado.gente || estado.materiales.size);

function limpiarFiltros() {
  estado.tipo = estado.sub = estado.gente = estado.menu = null;
  estado.materiales.clear();
  guardarMateriales([]);
  renderFiltros();
  renderLista();
}

// Materiales que aparecen en algún ejercicio, los más usados primero.
function materialesDisponibles() {
  const cuenta = new Map();
  datos.ejercicios.forEach((e) => (e.materiales || []).forEach((m) => cuenta.set(m, (cuenta.get(m) || 0) + 1)));
  return [...cuenta].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es")).map(([m]) => m);
}

const mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// Qué dice cada botón: su nombre, o su nombre y lo elegido.
function nombreSub() {
  const lista = estado.tipo === "con" ? datos.subcategorias : datos.categorias;
  return lista.find((x) => x.id === estado.sub)?.nombre;
}
const textoCategoria = () => !estado.tipo ? "Categoría"
  : `${estado.tipo === "con" ? "Con pelota" : "Sin pelota"}${estado.sub ? ` · ${nombreSub()}` : ""}`;
const textoJugadores = () => estado.gente === "solo" ? "Se hace solo" : estado.gente === "grupo" ? "Con alguien más" : "Jugadores";
const textoMateriales = () => estado.materiales.size ? `Materiales · ${estado.materiales.size}` : "Materiales";

function chip(nombre, activo, alClick) {
  return h("button", { class: "chip", type: "button", "aria-pressed": String(activo), onclick: alClick }, nombre);
}

function renderPildoras() {
  const botones = [
    ["categoria", textoCategoria(), !!estado.tipo],
    ["jugadores", textoJugadores(), !!estado.gente],
    ["materiales", textoMateriales(), estado.materiales.size > 0],
  ].map(([id, texto, activo]) => h("button", {
    type: "button", class: "chip filtro-pildora", "aria-pressed": String(activo), "aria-expanded": String(estado.menu === id),
    onclick: () => { estado.menu = estado.menu === id ? null : id; renderFiltros(); } },
    h("span", { class: "filtro-texto" }, texto), h("span", { class: "filtro-flecha", "aria-hidden": "true" }, "▾")));
  document.getElementById("filtro-pildoras").replaceChildren(...botones);
}

// Cada elección se aplica al instante. Los menús de una sola opción se cierran solos; el de materiales queda abierto para tildar varios.
function panelCategoria() {
  const elegir = (tipo, sub = null, cerrar = false) => { estado.tipo = tipo; estado.sub = sub; if (cerrar) estado.menu = null; renderFiltros(); renderLista(); };
  const segunda = estado.tipo === "con" ? datos.subcategorias : estado.tipo === "sin" ? datos.categorias.filter((c) => c.id !== "pelota") : [];
  return [
    h("p", { class: "menu-tit" }, "¿Con pelota o sin pelota?"),
    h("div", { class: "chips" },
      chip("Todos", !estado.tipo, () => elegir(null, null, true)),
      chip("Con pelota", estado.tipo === "con", () => elegir("con")),
      chip("Sin pelota", estado.tipo === "sin", () => elegir("sin"))),
    segunda.length ? h("p", { class: "menu-tit" }, estado.tipo === "con" ? "¿Qué se trabaja?" : "¿Qué categoría?") : null,
    segunda.length
      ? h("div", { class: "chips" },
          chip("Todas", !estado.sub, () => elegir(estado.tipo, null, true)),
          ...segunda.map((c) => chip(c.nombre, estado.sub === c.id, () => elegir(estado.tipo, c.id, true))))
      : null];
}

function panelJugadores() {
  const elegir = (g) => { estado.gente = g; estado.menu = null; renderFiltros(); renderLista(); };
  return [
    h("p", { class: "menu-tit" }, "¿Cuántas personas hacen falta?"),
    h("div", { class: "chips" },
      chip("Cualquiera", !estado.gente, () => elegir(null)),
      chip("Se hace solo", estado.gente === "solo", () => elegir("solo")),
      chip("Hace falta alguien más", estado.gente === "grupo", () => elegir("grupo")))];
}

function panelMateriales() {
  const casillas = materialesDisponibles().map((m) => h("label", { class: "menu-opcion" },
    h("input", { type: "checkbox", checked: estado.materiales.has(m), onchange: (e) => {
      e.target.checked ? estado.materiales.add(m) : estado.materiales.delete(m);
      guardarMateriales([...estado.materiales]);
      renderPildoras(); // solo el botón: el menú queda como está
      renderLista();
    } }), mayus(m)));
  return [
    h("p", { class: "menu-tit" }, "Marcá los materiales que tenés"),
    h("p", { class: "menu-ayuda" }, "Se muestran los ejercicios que podés hacer con eso, y los que no piden nada."),
    h("div", { class: "menu-lista" }, casillas),
    estado.materiales.size ? h("button", { type: "button", class: "menu-limpiar", onclick: () => {
      estado.materiales.clear(); guardarMateriales([]); renderFiltros(); renderLista(); } }, "Quitar todos") : null];
}

function renderFiltros() {
  renderPildoras();
  const panel = document.getElementById("filtro-panel");
  const contenido = { categoria: panelCategoria, jugadores: panelJugadores, materiales: panelMateriales }[estado.menu];
  panel.replaceChildren(...(contenido ? contenido() : []));
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
      h("div", { class: "filtro-fila", id: "filtro-pildoras", role: "group", "aria-label": "Filtros" }),
      h("div", { class: "menu-panel", id: "filtro-panel" })),
    h("p", { class: "conteo", id: "conteo", "aria-live": "polite" }),
    h("p", { class: "leyenda" },
      h("span", { class: "leyenda__punto leyenda__punto--individual", "aria-hidden": "true" }), "Se hace solo",
      h("span", { class: "leyenda__punto", "aria-hidden": "true" }), "Hace falta alguien más"),
    h("div", { id: "lista" }),
    seccionMusculos());
  renderFiltros();
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
