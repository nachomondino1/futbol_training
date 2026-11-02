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


def main() -> int:
    ex_data = json.loads((DATA / "exercises.json").read_text(encoding="utf-8"))
    ses_data = json.loads((DATA / "sessions.json").read_text(encoding="utf-8"))

    cats = [c["id"] for c in ex_data["categorias"]]
    ejercicios = ex_data["ejercicios"]
    ids = [e["id"] for e in ejercicios]
    sesion_ids = [s["id"] for s in ses_data["sesiones"]]

    for d in dupes(cats):
        errors.append(f"categoría duplicada: {d}")
    for d in dupes(ids):
        errors.append(f"ejercicio duplicado: {d}")
    for d in dupes(sesion_ids):
        errors.append(f"sesión duplicada: {d}")

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
        if e.get("pendiente_dosis"):
            warnings.append(f"{eid}: dosis pendiente ({e['pendiente_dosis']})")

    usados: set[str] = set()
    for s in ses_data["sesiones"]:
        for b in s["bloques"]:
            if not b.get("opciones"):
                errors.append(f"{s['id']}/{b['titulo']}: bloque sin opciones")
                continue
            if len(b["opciones"]) > 1 and not all(o.get("label") for o in b["opciones"]):
                errors.append(f"{s['id']}/{b['titulo']}: opciones múltiples sin label")
            for o in b["opciones"]:
                for it in o["items"]:
                    usados.add(it["ex"])
                    if it["ex"] not in ids:
                        errors.append(f"{s['id']}/{b['titulo']}: ex inexistente '{it['ex']}'")
                    for k in it.get("variantes", {}):
                        if k not in PERSONAS:
                            errors.append(f"{s['id']}/{it['ex']}: variante con clave inválida '{k}'")
                    for p in it.get("pendiente_validar", []):
                        warnings.append(f"{s['id']}/{it['ex']}: variante de {p} personas propuesta, sin validar")

    for e in ejercicios:
        if e["id"] not in usados and not e.get("huerfano_ok"):
            errors.append(f"ejercicio huérfano: {e['id']} (ninguna sesión lo usa)")

    for w in warnings:
        print(f"WARNING {w}")
    for err in errors:
        print(f"ERROR   {err}")
    print(f"\n{len(ejercicios)} ejercicios, {len(sesion_ids)} sesiones, "
          f"{len(errors)} errores, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
