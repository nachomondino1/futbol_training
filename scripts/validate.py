"""Valida data/exercises.json contra data/sessions.json.

ERROR (exit 1): referencias rotas, ids duplicados, huérfanos, categorías o
variantes inválidas. WARNING (no corta): variantes sin validar, dosis pendientes.

Correr desde la raíz del repo: python scripts/validate.py
"""
import json
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


def aplicar_variacion(c: dict, vid: str | None) -> dict | None:
    """El circuito con los items (y ajustes de estructura) de una variación; None si la variación no existe."""
    if not vid:
        return c
    v = next((x for x in c.get("variaciones", []) if x["id"] == vid), None)
    if not v:
        return None
    est = {**(c.get("estructura") or {}), **(v.get("estructura") or {})} or None
    return {**c, "items": v["items"], "estructura": est}


def resolver(o: dict, circuitos: dict) -> dict:
    """Una opción que referencia un circuito hereda sus items, estructura y guía (lo propio gana)."""
    c = circuitos.get(o.get("circuito"))
    if not c:
        return o
    base = aplicar_variacion(c, o.get("variacion")) or c
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


def main() -> int:
    ex_data = json.loads((DATA / "exercises.json").read_text(encoding="utf-8"))
    ses_data = json.loads((DATA / "sessions.json").read_text(encoding="utf-8"))

    cats = [c["id"] for c in ex_data["categorias"]]
    ejercicios = ex_data["ejercicios"]
    ids = [e["id"] for e in ejercicios]
    sesion_ids = [s["id"] for s in ses_data["sesiones"]]

    grupos = json.loads((DATA / "muscles.json").read_text(encoding="utf-8"))["grupos"]
    grupo_ids = [g["id"] for g in grupos]
    for d in dupes(grupo_ids):
        errors.append(f"grupo muscular duplicado: {d}")

    circ_data = json.loads((DATA / "circuits.json").read_text(encoding="utf-8"))["circuitos"]
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
        for ruta in rutas:
            if not (WEB / ruta).is_file():
                errors.append(f"{eid}: la imagen '{ruta}' no existe en docs/")
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

    for g in grupo_ids:
        if g not in principales:
            warnings.append(f"grupo '{g}': ningún ejercicio lo tiene como principal")

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
                    if o_raw.get("variacion") and aplicar_variacion(circuitos[o_raw["circuito"]], o_raw["variacion"]) is None:
                        errors.append(f"{where}: variación inexistente '{o_raw['variacion']}' en {o_raw['circuito']}")
                        continue
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

    for c in circ_data:
        where = f"circuito {c['id']}"
        if not c.get("items"):
            errors.append(f"{where}: sin items")
            continue
        for it in c["items"]:
            usados.add(it["ex"])
            if it["ex"] not in ids:
                errors.append(f"{where}: ex inexistente '{it['ex']}'")
        validar_estructura(where, c, guias, None)
        for d in dupes([v["id"] for v in c.get("variaciones", [])]):
            errors.append(f"{where}: variación duplicada '{d}'")
        for v in c.get("variaciones", []):
            wv = f"{where}/{v['id']}"
            if not v.get("items"):
                errors.append(f"{wv}: variación sin items")
                continue
            for it in v["items"]:
                usados.add(it["ex"])
                if it["ex"] not in ids:
                    errors.append(f"{wv}: ex inexistente '{it['ex']}'")
            validar_estructura(wv, aplicar_variacion(c, v["id"]), guias, None)
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
