// Piezas compartidas por la página de sesiones y la de circuitos.
import { h, variantesNodo } from "./common.js";

// 40 -> "40 s", 90 -> "1 min 30 s", 240 -> "4 min"
export function tiempo(seg) {
  const m = Math.floor(seg / 60), s = seg % 60;
  if (!m) return `${s} s`;
  return s ? `${m} min ${s} s` : `${m} min`;
}

// Un circuito con "agrupar: 3" junta los ejercicios de a 3: cada grupo es una estación (la persona que está ahí hace los 3 seguidos).
// "agrupar" también puede ser una lista con el tamaño de cada estación ([3, 2, 3]) si no todas tienen la misma cantidad de partes.
export function agruparEstaciones(items, n) {
  const grupos = [];
  if (Array.isArray(n)) {
    let i = 0;
    for (const tam of n) { grupos.push(items.slice(i, i + tam)); i += tam; }
    return grupos;
  }
  for (let i = 0; i < items.length; i += n) grupos.push(items.slice(i, i + n));
  return grupos;
}
const unidadesDe = (op) => op.estructura.modo === "circuito"
  ? (op.agrupar ? agruparEstaciones(op.items, op.agrupar).length : op.items.length)
  : (op.estructura.sets || 1);

// Minutos que dura una opción con estructura (series o circuito), redondeados.
export function minutosEstructura(op) {
  const e = op.estructura;
  const unidades = unidadesDe(op);
  return Math.round((e.vueltas * unidades * (e.trabajo_s + e.descanso_s) + (e.vueltas - 1) * (e.pausa_vuelta_s || 0)) / 60);
}

// Ficha con los números de una opción: vueltas, estaciones o sets, trabajo, descanso, pausa.
export function estructuraNodo(op, guia = null) {
  const e = op.estructura;
  const circuito = e.modo === "circuito";
  const unidades = unidadesDe(op);
  const pausa = e.pausa_vuelta_s || 0;
  const totalMin = minutosEstructura(op);
  const nombreDesc = e.descanso_nombre ? e.descanso_nombre[0].toUpperCase() + e.descanso_nombre.slice(1) : "Descanso";
  const porUnidad = circuito ? "por estación" : e.sets ? "por set" : "";

  const filas = [["Vueltas", String(e.vueltas)]];
  if (circuito) filas.push(["Estaciones", String(unidades)]);
  else if (e.sets) filas.push(["Sets por vuelta", String(e.sets)]);
  filas.push([`Trabajo ${porUnidad}`.trim(), tiempo(e.trabajo_s)], [`${nombreDesc} ${porUnidad}`.trim(), tiempo(e.descanso_s)]);
  if (e.vueltas > 1 && (circuito || pausa)) filas.push(["Pausa entre vueltas", pausa ? tiempo(pausa) : e.pausa_vuelta_s === 0 ? "sin pausa" : "a definir"]);

  return h("div", { class: "estructura" },
    h("dl", { class: "ficha" }, filas.map(([k, v]) => h("div", {}, h("dt", {}, k), h("dd", {}, v)))),
    h("p", { class: "est-total" }, `Total: unos ${totalMin} min${circuito && !pausa && e.vueltas > 1 ? " sin contar las pausas" : ""}.`),
    guia);
}

// Explicación de cómo se hace un circuito (no es un ejercicio): vive en sessions.json > guias.
export function guiaDetalle(g, { abierto = false, alAlternar = null } = {}) {
  return h("details", { class: "item guia", open: abierto, ontoggle: alAlternar },
    h("summary", {}, h("span", { class: "item-nombre" }, g.titulo)),
    h("div", { class: "item-cuerpo" }, h("p", {}, g.descripcion), variantesNodo(g.variantes)));
}

// El circuito con su lista de ejercicios: la propia, la primera opción de cada parte (plantilla) o la propuesta (lista de posibles).
export function completarItems(c) {
  if (c.items) return c;
  if (c.partes) return { ...c, items: itemsDePartes(c) };
  if (c.propuesta) return { ...c, items: c.propuesta };
  return c;
}

// Plantilla de circuito: una opción por parte. `elegidas` es { índice de parte: índice de opción }.
export function itemsDePartes(c, elegidas = {}) {
  return c.partes.map((p, i) => p.opciones[elegidas[i] ?? 0]);
}

// Los ejercicios posibles de un circuito pueden venir de un banco (circuits.json > bancos), así la lista de
// ejercicios de fuerza, de coordinación, etc. se escribe una sola vez y la comparten varios circuitos.
export function normalizarCircuitos({ bancos = {}, circuitos }) {
  return circuitos.map((c) => {
    if (c.banco) return { ...c, opciones: bancos[c.banco].opciones };
    // varios bancos en un circuito: cada opción lleva el nombre de su banco como grupo
    if (c.bancos) return { ...c, opciones: c.bancos.flatMap((b) => bancos[b].opciones.map((o) => ({ grupo: bancos[b].nombre, ...o }))) };
    if (!c.partes) return c;
    return { ...c, partes: c.partes.map((p) => {
      if (p.banco) return { ...p, nombre: p.nombre || bancos[p.banco].nombre, opciones: bancos[p.banco].opciones };
      // varios bancos en una parte: cada opción lleva el nombre de su banco como grupo
      if (p.bancos) return { ...p, opciones: p.bancos.flatMap((b) => bancos[b].opciones.map((o) => ({ grupo: bancos[b].nombre, ...o }))) };
      return p;
    }) };
  });
}

// Qué se gana: reparte los minutos entre lo que aporta cada ejercicio (cada uno puede aportar más de una cosa).
// Devuelve un Map objetivo -> minutos; se puede seguir sumando pasando el mismo Map.
export function repartirMinutos(items, minutos, ejercicios, acumulado = new Map()) {
  if (!items.length) return acumulado;
  const por = minutos / items.length;
  for (const it of items) {
    const aporta = ejercicios.get(it.ex).aporta;
    for (const id of aporta) acumulado.set(id, (acumulado.get(id) || 0) + por / aporta.length);
  }
  return acumulado;
}

// Lo que más se gana, de mayor a menor, con los datos del objetivo (nombre, para qué sirve) y los minutos.
// Solo cuenta lo que llega a `minimo` del total. Con `etiquetas` deja afuera lo que está en todas las sesiones
// (solo_detalle, por ejemplo movilidad), para que las etiquetas digan qué distingue a cada una.
export function masGanado(minutos, objetivos, { max = 4, minimo = 0.15, etiquetas = false } = {}) {
  const total = [...minutos.values()].reduce((a, b) => a + b, 0) || 1;
  return objetivos.map((o) => ({ ...o, min: minutos.get(o.id) || 0 }))
    .filter((o) => o.min / total >= minimo && !(etiquetas && o.solo_detalle)).sort((a, b) => b.min - a.min).slice(0, max);
}
