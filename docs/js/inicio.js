// Página de inicio: arma la lista de sesiones y los conteos de "Cómo está armado" con los mismos JSON que usan las otras páginas.
// El hero y la estructura de las secciones están escritos a mano en index.html; acá solo se llena lo que viene de los datos.
import { h, renderHeader, cargarJSON, mostrarError } from "./common.js";

renderHeader("inicio");

const duracion = (s) => s.bloques.reduce((t, b) => t + b.min, 0);

function tarjeta(s) {
  return h("a", { class: "card-sesion", href: `sesiones.html#${s.id}` },
    h("span", { class: "card-min" }, String(duracion(s)), h("small", {}, " min")),
    h("span", { class: "card-nombre" }, s.nombre),
    h("ul", { class: "card-bloques" }, s.bloques.map((b) => h("li", {}, b.titulo))),
    s.cuando ? h("p", { class: "card-cuando" }, s.cuando) : null);
}

try {
  const [ex, cir, ses] = await Promise.all([
    cargarJSON("data/exercises.json"), cargarJSON("data/circuits.json"), cargarJSON("data/sessions.json")]);
  const lista = document.getElementById("lista-sesiones");
  lista.replaceChildren(...ses.sesiones.map(tarjeta));
  lista.removeAttribute("aria-busy");
  document.getElementById("n-ejercicios").textContent = String(ex.ejercicios.length);
  document.getElementById("n-circuitos").textContent = String(cir.circuitos.length);
  document.getElementById("n-sesiones").textContent = String(ses.sesiones.length);
} catch (err) {
  mostrarError(document.getElementById("app"), err);
}
