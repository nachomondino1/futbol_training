"""Valida data/exercises.json contra data/sessions.json.

ERROR (exit 1): referencias rotas, ids duplicados, huérfanos, categorías o
variantes inválidas, archivos de sw.js o del manifest que no existen.
WARNING (no corta): variantes sin validar, dosis pendientes.

Correr desde la raíz del repo: python scripts/validate.py
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

WEB = Path(__file__).resolve().parent.parent / "docs"
DATA = WEB / "data"
PERSONAS = ["2", "3", "4", "8"]

errors: list[str] = []
warnings: list[str] = []


def dupes(ids: list[str]) -> list[str]:
    return [i for i, n in Counter(ids).items() if n > 1]


def completar_items(c: dict) -> dict:
    """El circuito con su lista de ejercicios: la propia, la primera opción de cada parte o la propuesta."""
    if "items" in c:
        return c
    if c.get("partes"):
        return {**c, "items": [p["opciones"][0] for p in c["partes"]]}
    if c.get("propuesta"):
        return {**c, "items": c["propuesta"]}
    return c


def resolver(o: dict, circuitos: dict) -> dict:
    """Una opción que referencia un circuito hereda sus items, estructura y guía (lo propio gana)."""
    c = circuitos.get(o.get("circuito"))
    if not c:
        return o
    base = completar_items(c)
    est = {**(base.get("estructura") or {}), **(o.get("estructura") or {})} or None
    return {**base, **o, "items": base["items"], "estructura": est}


def validar_estructura(where: str, o: dict, guias: dict, minutos: int | None) -> None:
    """Vueltas / trabajo / descanso de una opción (circuito por estaciones o series repetidas)."""
    if o.get("guia") and o["guia"] not in guias:
        errors.append(f"{where}: guia inexistente '{o['guia']}'")
    e = o.get("estructura")
    if not e:
        return
    modo = e.get("modo")
    if modo not in ("circuito", "series"):
        errors.append(f"{where}: estructura.modo inválido '{modo}'")
        return
    for k in ("vueltas", "trabajo_s", "descanso_s"):
        if not isinstance(e.get(k), int) or e[k] < 0 or (k != "descanso_s" and e[k] == 0):
            errors.append(f"{where}: estructura.{k} debe ser un entero positivo")
            return
    n = len(o["items"])
    agrupar = o.get("agrupar")
    if agrupar is not None and (not isinstance(agrupar, int) or agrupar < 2 or n % agrupar):
        errors.append(f"{where}: 'agrupar' debe ser un entero >= 2 y dividir la cantidad de ejercicios ({n})")
        return
    if agrupar:
        n = n // agrupar  # cada grupo es una estación
    if modo == "circuito" and n < 2:
        errors.append(f"{where}: un circuito necesita al menos 2 estaciones")
    if modo == "series" and n != 1:
        errors.append(f"{where}: 'series' lleva exactamente 1 ejercicio")
    pausa = e.get("pausa_vuelta_s") or 0
    if modo == "circuito" and e["vueltas"] > 1 and e.get("pausa_vuelta_s") is None:
        warnings.append(f"{where}: falta la pausa entre vueltas (pausa_vuelta_s)")
    sets = e.get("sets", 1)
    if "sets" in e and (modo != "series" or not isinstance(sets, int) or sets < 1):
        errors.append(f"{where}: 'sets' solo va en modo series y debe ser un entero positivo")
        return
    est = n if modo == "circuito" else sets
    total_min = (e["vueltas"] * est * (e["trabajo_s"] + e["descanso_s"]) + (e["vueltas"] - 1) * pausa) / 60
    if minutos is not None and total_min > minutos:
        errors.append(f"{where}: la estructura dura {total_min:.1f} min y el bloque {minutos}")


def validar_offline() -> None:
    """Si falta un archivo de BASICOS (sw.js), el service worker no se instala y la web no anda sin señal."""
    sw = (WEB / "sw.js").read_text(encoding="utf-8")
    bloque = re.search(r"const BASICOS = \[(.*?)\];", sw, re.S)
    if not bloque:
        errors.append("sw.js: no encuentro la lista BASICOS")
        return
    listados = set()
    for ruta in re.findall(r'"([^"]+)"', bloque.group(1)):
        listados.add("index.html" if ruta == "./" else ruta)
        if not (WEB / ("index.html" if ruta == "./" else ruta)).is_file():
            errors.append(f"sw.js: '{ruta}' (BASICOS) no existe en docs/")
    # Lo inverso: una página, script o JSON nuevo que no está en BASICOS no se guarda para usar sin señal
    for patron in ("*.html", "css/*.css", "css/pages/*.css", "js/*.js", "data/*.json"):
        for archivo in sorted(WEB.glob(patron)):
            ruta = archivo.relative_to(WEB).as_posix()
            if ruta not in listados:
                errors.append(f"sw.js: '{ruta}' falta en BASICOS (no andaría sin señal)")
    manifest = json.loads((WEB / "manifest.webmanifest").read_text(encoding="utf-8"))
    for icono in manifest["icons"]:
        if not (WEB / icono["src"]).is_file():
            errors.append(f"manifest.webmanifest: el ícono '{icono['src']}' no existe en docs/")


def main() -> int:
    validar_offline()
    ex_data = json.loads((DATA / "exercises.json").read_text(encoding="utf-8"))
    ses_data = json.loads((DATA / "sessions.json").read_text(encoding="utf-8"))

    cats = [c["id"] for c in ex_data["categorias"]]
    subcats = [c["id"] for c in ex_data.get("subcategorias", [])]
    usadas_sub: set[str] = set()
    ejercicios = ex_data["ejercicios"]
    ids = [e["id"] for e in ejercicios]
    sesion_ids = [s["id"] for s in ses_data["sesiones"]]

    grupos = json.loads((DATA / "muscles.json").read_text(encoding="utf-8"))["grupos"]
    grupo_ids = [g["id"] for g in grupos]
    for d in dupes(grupo_ids):
        errors.append(f"grupo muscular duplicado: {d}")

    objetivos = json.loads((DATA / "objetivos.json").read_text(encoding="utf-8"))["objetivos"]
    objetivo_ids = [o["id"] for o in objetivos]
    for d in dupes(objetivo_ids):
        errors.append(f"objetivo duplicado: {d}")
    aportados: set[str] = set()

    circ_data = json.loads((DATA / "circuits.json").read_text(encoding="utf-8"))["circuitos"]
    bancos = json.loads((DATA / "circuits.json").read_text(encoding="utf-8")).get("bancos", {})
    for c in circ_data:
        if c.get("banco"):
            if c["banco"] not in bancos:
                errors.append(f"circuito {c['id']}: usa un banco inexistente '{c['banco']}'")
            else:
                c["opciones"] = bancos[c["banco"]]["opciones"]
        if c.get("bancos"):
            faltan = [b for b in c["bancos"] if b not in bancos]
            for b in faltan:
                errors.append(f"circuito {c['id']}: usa un banco inexistente '{b}'")
            if not faltan:
                c["opciones"] = [o for b in c["bancos"] for o in bancos[b]["opciones"]]
        for pi, parte in enumerate(c.get("partes", []), 1):
            if parte.get("banco"):
                if parte["banco"] not in bancos:
                    errors.append(f"circuito {c['id']}: la parte {pi} usa un banco inexistente '{parte['banco']}'")
                else:  # se resuelve acá y el resto de las reglas ve las opciones como si fueran propias
                    parte["opciones"] = bancos[parte["banco"]]["opciones"]
                    parte.setdefault("nombre", bancos[parte["banco"]]["nombre"])
            elif parte.get("bancos"):
                faltan = [b for b in parte["bancos"] if b not in bancos]
                for b in faltan:
                    errors.append(f"circuito {c['id']}: la parte {pi} usa un banco inexistente '{b}'")
                if not faltan:
                    parte["opciones"] = [o for b in parte["bancos"] for o in bancos[b]["opciones"]]
    circuitos = {c["id"]: c for c in circ_data}
    for d in dupes([c["id"] for c in circ_data]):
        errors.append(f"circuito duplicado: {d}")

    guias = ses_data.get("guias", {})
    for gid, g in guias.items():
        for p in PERSONAS:
            if not g.get("variantes", {}).get(p):
                errors.append(f"guía {gid}: falta variante para {p} personas")
        for p in g.get("pendiente_validar", []):
            warnings.append(f"guía {gid}: variante de {p} personas propuesta, sin validar")

    for d in dupes(cats):
        errors.append(f"categoría duplicada: {d}")
    for d in dupes(ids):
        errors.append(f"ejercicio duplicado: {d}")
    for d in dupes(sesion_ids):
        errors.append(f"sesión duplicada: {d}")

    principales: set[str] = set()
    for e in ejercicios:
        eid = e["id"]
        if e["categoria"] not in cats:
            errors.append(f"{eid}: categoría inexistente '{e['categoria']}'")
        vars_ = e.get("variantes", {})
        for k in vars_:
            if k not in PERSONAS:
                errors.append(f"{eid}: variante con clave inválida '{k}'")
        if e.get("requiere_variantes"):
            for p in PERSONAS:
                if not vars_.get(p):
                    errors.append(f"{eid}: falta variante para {p} personas")
        for p in e.get("pendiente_validar", []):
            warnings.append(f"{eid}: variante de {p} personas propuesta, sin validar")
        rutas = [e["imagen"]] if e.get("imagen") else []
        for k, ruta in e.get("imagenes", {}).items():
            if k not in PERSONAS:
                errors.append(f"{eid}: imagenes con clave inválida '{k}'")
            rutas.append(ruta)
        for pat in e.get("patrones", []):
            if not (pat.get("nombre") and pat.get("descripcion")):
                errors.append(f"{eid}: cada patrón necesita nombre y descripcion")
            else:
                rutas.extend(pat.get("imagenes") or ([pat["imagen"]] if pat.get("imagen") else []))
        for ruta in rutas:
            if not (WEB / ruta).is_file():
                errors.append(f"{eid}: la imagen '{ruta}' no existe en docs/")
        subs = e.get("subcategorias", [])
        if e["categoria"] == "pelota" and not subs:
            errors.append(f"{eid}: un ejercicio con pelota necesita 'subcategorias' (tiro, pase corto, control orientado...)")
        if e["categoria"] != "pelota" and subs:
            errors.append(f"{eid}: 'subcategorias' es solo para ejercicios con pelota")
        for k in subs:
            if k not in subcats:
                errors.append(f"{eid}: subcategoría inexistente '{k}'")
        usadas_sub.update(subs)
        mats = e.get("materiales")
        if not isinstance(mats, list):
            errors.append(f"{eid}: falta 'materiales' (lista; vacía si no hace falta nada)")
        ap = e.get("aporta")
        if not ap:
            errors.append(f"{eid}: falta 'aporta' (qué se gana con el ejercicio)")
        else:
            for k in ap:
                if k not in objetivo_ids:
                    errors.append(f"{eid}: objetivo inexistente '{k}'")
            aportados.update(ap)
        t = e.get("trabaja")
        if not t:
            errors.append(f"{eid}: falta 'trabaja' (músculo principal)")
        else:
            for k in [t.get("principal")] + t.get("secundarios", []):
                if k not in grupo_ids:
                    errors.append(f"{eid}: grupo muscular inexistente '{k}'")
            if t.get("principal") in t.get("secundarios", []):
                errors.append(f"{eid}: el principal no puede estar también en secundarios")
            principales.add(t.get("principal"))
        if e.get("pendiente_dosis"):
            warnings.append(f"{eid}: dosis pendiente ({e['pendiente_dosis']})")

    for k in subcats:
        if k not in usadas_sub:
            warnings.append(f"subcategoría '{k}': ningún ejercicio la usa")
    for g in grupo_ids:
        if g not in principales:
            warnings.append(f"grupo '{g}': ningún ejercicio lo tiene como principal")

    for o in objetivo_ids:
        if o not in aportados:
            warnings.append(f"objetivo '{o}': ningún ejercicio lo aporta")
    for s in ses_data["sesiones"]:
        if not s.get("objetivo"):
            errors.append(f"sesión {s['id']}: falta 'objetivo' (qué se gana con la sesión)")

    usados: set[str] = set()
    usados_circ: set[str] = set()
    for s in ses_data["sesiones"]:
        for b in s["bloques"]:
            if not b.get("opciones"):
                errors.append(f"{s['id']}/{b['titulo']}: bloque sin opciones")
                continue
            if len(b["opciones"]) > 1 and not all(o.get("label") for o in b["opciones"]):
                errors.append(f"{s['id']}/{b['titulo']}: opciones múltiples sin label")
            for o_raw in b["opciones"]:
                where = f"{s['id']}/{b['titulo']}" + (f"/{o_raw['label']}" if o_raw.get("label") else "")
                if o_raw.get("circuito"):
                    if o_raw["circuito"] not in circuitos:
                        errors.append(f"{where}: circuito inexistente '{o_raw['circuito']}'")
                        continue
                    usados_circ.add(o_raw["circuito"])
                    if o_raw.get("items"):
                        errors.append(f"{where}: una opción con 'circuito' no lleva 'items' propios")
                o = resolver(o_raw, circuitos)
                if not o.get("items"):
                    errors.append(f"{where}: opción sin items")
                    continue
                validar_estructura(where, o, guias, b["min"])
                for it in o["items"]:
                    usados.add(it["ex"])
                    if it["ex"] not in ids:
                        errors.append(f"{s['id']}/{b['titulo']}: ex inexistente '{it['ex']}'")
                    for k in it.get("variantes", {}):
                        if k not in PERSONAS:
                            errors.append(f"{s['id']}/{it['ex']}: variante con clave inválida '{k}'")
                    for p in it.get("pendiente_validar", []):
                        warnings.append(f"{s['id']}/{it['ex']}: variante de {p} personas propuesta, sin validar")

    # Jugadores: jugadores_min válido (lo usan el filtro y los colores de Ejercicios)
    ex_por_id = {e["id"]: e for e in ejercicios}
    for n in dupes([str(e.get("numero")) for e in ejercicios]):
        errors.append(f"numero repetido: {n}")
    for e in ejercicios:
        m = e.get("jugadores_min")
        if m is not None and (not isinstance(m, int) or m < 1):
            errors.append(f"{e['id']}: jugadores_min debe ser un entero >= 1")
        n = e.get("numero")
        if not isinstance(n, int) or n < 1:
            errors.append(f"{e['id']}: falta numero (entero >= 1)")
        mx = e.get("jugadores_max")
        if mx is not None and (not isinstance(mx, int) or mx < (m or 1)):
            errors.append(f"{e['id']}: jugadores_max debe ser un entero >= jugadores_min")

    for c in circ_data:
        where = f"circuito {c['id']}"
        partes = c.get("partes")
        if partes:
            if len(partes) < 2:
                errors.append(f"{where}: una plantilla necesita al menos 2 partes")
            for pi, parte in enumerate(partes, 1):
                if not parte.get("opciones"):
                    errors.append(f"{where}: la parte {pi} no tiene opciones")
                for o in parte.get("opciones", []):
                    usados.add(o["ex"])
                    if o["ex"] not in ids:
                        errors.append(f"{where}: parte {pi}: ex inexistente '{o['ex']}'")
            if all(p.get("opciones") for p in partes):
                c = completar_items(c)
        elif c.get("opciones") and c.get("items"):  # ejercicios fijos + alternativas
            for o in c["opciones"]:
                usados.add(o["ex"])
                if o["ex"] not in ids:
                    errors.append(f"{where}: ex inexistente en el banco '{o['ex']}'")
        elif c.get("opciones"):  # lista de ejercicios posibles + orden propuesto
            pool = {o["ex"] for o in c["opciones"]}
            for o in c["opciones"]:
                usados.add(o["ex"])
                if o["ex"] not in ids:
                    errors.append(f"{where}: ex inexistente en el banco '{o['ex']}'")
            if not c.get("propuesta"):
                errors.append(f"{where}: falta 'propuesta' (el orden propuesto)")
            for it in c.get("propuesta", []):
                if it["ex"] not in pool:
                    errors.append(f"{where}: la propuesta incluye '{it['ex']}', que no está entre los posibles")
            if not isinstance(c.get("elegir"), int) or c.get("elegir", 0) < 1:
                errors.append(f"{where}: 'elegir' debe ser un entero positivo")
            elif len(c.get("propuesta", [])) != c["elegir"]:
                warnings.append(f"{where}: la propuesta tiene {len(c.get('propuesta', []))} ejercicios y 'elegir' dice {c['elegir']}")
            c = completar_items(c)
        if not c.get("items"):
            errors.append(f"{where}: sin items")
            continue
        if c.get("agrupar"):
            vistos = [it["ex"] for it in c["items"]]
            for ex_id in sorted({x for x in vistos if vistos.count(x) > 1}):
                warnings.append(f"{where}: repite el ejercicio '{ex_id}' en varias estaciones")
        for it in c["items"]:
            usados.add(it["ex"])
            if it["ex"] not in ids:
                errors.append(f"{where}: ex inexistente '{it['ex']}'")
        validar_estructura(where, c, guias, None)
        if c["id"] not in usados_circ and not c.get("huerfano_ok"):
            errors.append(f"circuito huérfano: {c['id']} (ninguna sesión lo usa)")

    for e in ejercicios:
        if e["id"] not in usados and not e.get("huerfano_ok"):
            errors.append(f"ejercicio huérfano: {e['id']} (ninguna sesión lo usa)")

    for w in warnings:
        print(f"WARNING {w}")
    for err in errors:
        print(f"ERROR   {err}")
    print(f"\n{len(ejercicios)} ejercicios, {len(circ_data)} circuitos, {len(sesion_ids)} sesiones, "
          f"{len(errors)} errores, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
