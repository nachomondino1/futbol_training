// Piezas compartidas por la página de sesiones y la de circuitos.
import { getPersonas, h, variantesNodo } from "./common.js";

// 40 -> "40 s", 90 -> "1 min 30 s", 240 -> "4 min"
export function tiempo(seg) {
  const m = Math.floor(seg / 60), s = seg % 60;
  if (!m) return `${s} s`;
  return s ? `${m} min ${s} s` : `${m} min`;
}

// Ficha con los números de una opción: vueltas, estaciones o sets, trabajo, descanso, pausa.
export function estructuraNodo(op, guia = null) {
  const e = op.estructura;
  const circuito = e.modo === "circuito";
  const unidades = circuito ? op.items.length : (e.sets || 1);
  const pausa = e.pausa_vuelta_s || 0;
  const totalMin = Math.round((e.vueltas * unidades * (e.trabajo_s + e.descanso_s) + (e.vueltas - 1) * pausa) / 60);
  const nombreDesc = e.descanso_nombre ? e.descanso_nombre[0].toUpperCase() + e.descanso_nombre.slice(1) : "Descanso";
  const porUnidad = circuito ? "por estación" : e.sets ? "por set" : "";

  const filas = [["Vueltas", String(e.vueltas)]];
  if (circuito) filas.push(["Estaciones", String(unidades)]);
  else if (e.sets) filas.push(["Sets por vuelta", String(e.sets)]);
  filas.push([`Trabajo ${porUnidad}`.trim(), tiempo(e.trabajo_s)], [`${nombreDesc} ${porUnidad}`.trim(), tiempo(e.descanso_s)]);
  if (e.vueltas > 1 && (circuito || pausa)) filas.push(["Pausa entre vueltas", pausa ? tiempo(pausa) : "a definir"]);

  return h("div", { class: "estructura" },
    h("dl", { class: "ficha" }, filas.map(([k, v]) => h("div", {}, h("dt", {}, k), h("dd", {}, v)))),
    h("p", { class: "est-total" }, `Total: unos ${totalMin} min${circuito && !pausa && e.vueltas > 1 ? " sin contar las pausas" : ""}.`),
    guia);
}

// Explicación de cómo se hace un circuito (no es un ejercicio): vive en sessions.json > guias.
export function guiaDetalle(g, { abierto = false, alAlternar = null } = {}) {
  return h("details", { class: "item guia", open: abierto, ontoggle: alAlternar },
    h("summary", {}, h("span", { class: "item-nombre" }, g.titulo)),
    h("div", { class: "item-cuerpo" }, h("p", {}, g.descripcion), variantesNodo(g.variantes, getPersonas())));
}

// El circuito con los items (y ajustes de estructura) de una variación; sin variación, el circuito base.
export function aplicarVariacion(c, id) {
  const v = id ? (c.variaciones || []).find((x) => x.id === id) : null;
  if (!v) return c;
  const estructura = c.estructura || v.estructura ? { ...c.estructura, ...v.estructura } : undefined;
  return { ...c, items: v.items, estructura, variacion: v };
}
