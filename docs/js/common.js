// Utilidades compartidas. Cada página importa esto como módulo ES (<script type="module">),
// parecido a un `from common import ...` de Python.

export const PERSONAS = [2, 3, 4, 8];

// localStorage puede tirar excepción (modo privado, datos bloqueados): siempre con try/except (acá try/catch).
export function getPersonas() {
  try {
    const v = Number(localStorage.getItem("personas"));
    if (PERSONAS.includes(v)) return v;
  } catch (e) { /* sin storage: valor por defecto */ }
  return 2;
}

function setPersonas(n) {
  try { localStorage.setItem("personas", String(n)); } catch (e) { /* idem */ }
  // CustomEvent: como un callback registrado; las páginas escuchan "personas-change".
  document.dispatchEvent(new CustomEvent("personas-change", { detail: n }));
}

// h("div", {class: "x"}, "texto", otroNodo) arma un nodo DOM sin pasar por innerHTML.
export function h(tag, attrs = {}, ...hijos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const hijo of hijos.flat()) {
    if (hijo === null || hijo === undefined || hijo === false) continue;
    el.append(hijo);
  }
  return el;
}

// Imagen del ejercicio para N personas: la de esa cantidad si existe, si no la general, si no nada.
// Devuelve un <img> o null (así no queda ningún placeholder roto).
export function imagenPara(ej, n) {
  const src = (ej.imagenes || {})[String(n)] || ej.imagen;
  if (!src) return null;
  const alt = (ej.imagenes || {})[String(n)] ? `${ej.nombre}, con ${n}` : ej.nombre;
  return h("img", { src, alt, loading: "lazy", width: 640, height: 400 });
}

// Minúsculas y sin tildes, para que "estocada" y "Estócada" matcheen igual.
export function normalizar(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function renderHeader(activa) {
  const actual = getPersonas();
  const radios = PERSONAS.flatMap((n) => [
    h("input", { type: "radio", name: "personas", id: `p${n}`, value: n, checked: n === actual,
      onchange: () => setPersonas(n) }),
    h("label", { for: `p${n}`, "aria-label": `${n} personas` }, String(n)),
  ]);
  const link = (href, texto, id) =>
    h("a", { href, "aria-current": activa === id ? "page" : null }, texto);

  const header = h("header", { class: "cabecera" },
    h("div", { class: "cabecera-in" },
      h("a", { class: "marca", href: "index.html" }, "Entrenamiento"),
      h("nav", { class: "nav", "aria-label": "Principal" },
        link("sesiones.html", "Sesiones", "sesiones"),
        link("glosario.html", "Glosario", "glosario")),
      h("fieldset", { class: "personas" },
        h("legend", {}, "Somos"),
        h("div", { class: "personas-botones" }, radios))));
  document.body.prepend(header);
}

// fetch es asíncrono: `await` es como esperar el resultado de una corutina en Python (asyncio).
export async function cargarJSON(ruta) {
  if (location.protocol === "file:") {
    throw new Error("file");
  }
  const r = await fetch(ruta); // ruta relativa: funciona bajo /nombre-repo/ en GitHub Pages
  if (!r.ok) throw new Error(`${ruta}: HTTP ${r.status}`);
  return r.json();
}

export function mostrarError(contenedor, err) {
  const msg = err.message === "file"
    ? h("p", {}, "No se pueden leer los datos abriendo el archivo directo. Abrí la web con ",
        h("code", {}, "python -m http.server"), " y entrá a ", h("code", {}, "http://localhost:8000"), ".")
    : h("p", {}, "No se pudieron cargar los datos. Probá recargar. (", String(err.message), ")");
  contenedor.replaceChildren(h("div", { class: "aviso", role: "alert" }, msg));
}
