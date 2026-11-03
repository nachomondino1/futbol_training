"""Genera los diagramas SVG de los ejercicios de grupo en docs/img/.

Blanco = jugador, amarillo = quien presiona, naranja = cono.
Flecha blanca = pase, amarilla punteada = desplazamiento, amarilla gruesa = tiro.

Correr desde la raíz del repo: python3 scripts/gen_diagramas.py
"""
import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "docs" / "img"
R = 11
AMARILLO = "#f2c230"


def player(x, y, label="", kind="a"):
    fill = AMARILLO if kind == "d" else "#fff"
    return (f'<circle cx="{x}" cy="{y}" r="{R}" fill="{fill}" stroke="#10231a" stroke-width="2"/>'
            f'<text x="{x}" y="{y + 4.5}" text-anchor="middle" font-size="13" font-weight="800" '
            f'fill="#10231a">{label}</text>')


def cone(x, y):
    return (f'<polygon points="{x},{y - 8} {x - 7},{y + 6} {x + 7},{y + 6}" fill="#ff7a1a" '
            f'stroke="#fff" stroke-width="1.5"/>')


def arrow(p, q, kind="pase", s0=R + 3, s1=R + 5):
    (x1, y1), (x2, y2) = p, q
    d = math.hypot(x2 - x1, y2 - y1) or 1
    ux, uy = (x2 - x1) / d, (y2 - y1) / d
    a = (x1 + ux * s0, y1 + uy * s0)
    b = (x2 - ux * s1, y2 - uy * s1)
    estilo = {
        "pase": ('#fff', 2.5, '', 'mb'),
        "mov": (AMARILLO, 2.5, ' stroke-dasharray="6 5"', 'ma'),
        "tiro": (AMARILLO, 4, '', 'ma'),
    }[kind]
    color, w, dash, m = estilo
    return (f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{color}" '
            f'stroke-width="{w}"{dash} marker-end="url(#{m})"/>')


def goal(x=288):
    return (f'<rect x="{x}" y="68" width="24" height="64" fill="none" stroke="#fff" stroke-width="3"/>'
            f'<line x1="{x}" y1="84" x2="{x + 24}" y2="84" stroke="#fff" stroke-width="1"/>'
            f'<line x1="{x}" y1="100" x2="{x + 24}" y2="100" stroke="#fff" stroke-width="1"/>'
            f'<line x1="{x}" y1="116" x2="{x + 24}" y2="116" stroke="#fff" stroke-width="1"/>')


def texto(x, y, t, size=13):
    return (f'<text x="{x}" y="{y}" text-anchor="middle" font-size="{size}" font-weight="800" '
            f'fill="#fff" stroke="#0c3f29" stroke-width="3" paint-order="stroke">{t}</text>')


def svg(titulo, cuerpo):
    franjas = "".join(f'<rect x="{x}" y="0" width="40" height="200" fill="#11573a"/>' for x in range(40, 320, 80))
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="640" height="400" '
        f'font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" role="img" aria-label="{titulo}"><title>{titulo}</title>'
        '<defs>'
        '<marker id="mb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">'
        '<path d="M0,0 L10,5 L0,10z" fill="#fff"/></marker>'
        f'<marker id="ma" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">'
        f'<path d="M0,0 L10,5 L0,10z" fill="{AMARILLO}"/></marker></defs>'
        '<rect width="320" height="200" fill="#14633f"/>' + franjas +
        '<rect x="3" y="3" width="314" height="194" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>'
        + cuerpo + '</svg>\n')


def cuadrado():
    return "".join(cone(x, y) for x, y in [(30, 22), (290, 22), (30, 178), (290, 178)])


def par(y, x1=60, x2=260, n1="", n2=""):
    return player(x1, y, n1) + player(x2, y, n2) + arrow((x1, y), (x2, y))


# --- Rondo ---
def rondo_2():
    return (cuadrado() + cone(125, 50) + cone(195, 150)
            + arrow((80, 92), (240, 92)) + arrow((240, 108), (80, 108))
            + arrow((80, 100), (125, 52), "mov", R + 2, 12) + arrow((240, 100), (195, 148), "mov", R + 2, 12)
            + player(80, 100, 1) + player(240, 100, 2)
            + texto(160, 190, "pasan y se desplazan a los conos"))


def rondo_3():
    return (cuadrado()
            + arrow((90, 150), (230, 150)) + arrow((230, 150), (90, 150))
            + arrow((160, 82), (160, 138), "mov", R + 2, 4)
            + player(90, 150, 1) + player(230, 150, 2) + player(160, 82, "", "d")
            + texto(160, 40, "2 tocan, 1 presiona"))


def rondo_4():
    a = [(160, 50), (85, 150), (235, 150)]
    cuerpo = cuadrado()
    for i in range(3):
        cuerpo += arrow(a[i], a[(i + 1) % 3])
    cuerpo += "".join(player(x, y, i + 1) for i, (x, y) in enumerate(a))
    return cuerpo + player(160, 112, "", "d") + texto(160, 20, "3v1")


def rondo_8():
    a = [(160, 32), (250, 66), (250, 134), (160, 168), (70, 134), (70, 66)]
    cuerpo = cuadrado() + arrow(a[0], a[1]) + arrow(a[1], a[2]) + arrow(a[4], a[5])
    cuerpo += "".join(player(x, y, i + 1) for i, (x, y) in enumerate(a))
    return cuerpo + player(140, 100, "", "d") + player(182, 100, "", "d") + texto(160, 105 + 40, "6v2", 12)


# --- Pases cortos con control orientado ---
def pases_2():
    return (cone(60, 118) + cone(260, 118) + par(100, n1=1, n2=2)
            + arrow((260, 100), (285, 150), "mov", R + 2, 0)
            + texto(160, 82, "10 m") + texto(160, 190, "control orientado y pase largo"))


def pases_3():
    a = [(160, 40), (70, 158), (250, 158)]
    cuerpo = "".join(arrow(a[i], a[(i + 1) % 3]) for i in range(3))
    return cuerpo + "".join(player(x, y, i + 1) for i, (x, y) in enumerate(a)) + texto(160, 118, "8-10 m")


def pases_4():
    return par(60, n1=1, n2=2) + par(140, n1=3, n2=4) + texto(160, 100, "dos parejas")


def pases_8():
    cuerpo = ""
    n = 1
    for y in (55, 145):
        for x1, x2 in ((25, 135), (185, 295)):
            cuerpo += par(y, x1, x2, n, n + 1)
            n += 2
    return cuerpo + texto(160, 105, "cuatro parejas")


# --- Pase, control y definición ---
def pcd_2():
    return (goal() + player(55, 100, 1) + player(190, 100, 2) + arrow((55, 100), (190, 100))
            + arrow((190, 100), (288, 100), "tiro", R + 2, 0) + texto(160, 82, "pase")
            + texto(160, 190, "controla y define, alternan"))


def pcd_3():
    return (goal() + player(55, 100, 1) + player(140, 40, 2) + player(140, 160, 3)
            + arrow((55, 100), (140, 40)) + arrow((140, 40), (200, 100), "pase", R + 2, 0)
            + arrow((200, 100), (288, 100), "tiro", 0, 0) + texto(160, 190, "dos pasan en pared, uno define"))


def pcd_4():
    return (goal() + player(55, 100, 1) + player(140, 40, 2) + player(140, 160, 3)
            + player(255, 60, "", "d")
            + arrow((55, 100), (140, 40)) + arrow((140, 40), (200, 100), "pase", R + 2, 0)
            + arrow((200, 100), (288, 100), "tiro", 0, 0) + texto(160, 190, "defensor pasivo, rotan los 4"))


def pcd_8():
    fila = "".join(player(25 + 26 * i, 100, i + 2) for i in range(7))
    return (goal() + fila + player(215, 100, 1) + arrow((215, 100), (288, 100), "tiro", R + 2, 0)
            + texto(110, 70, "fila con la pelota") + texto(160, 190, "1-2 tiros por jugador"))


# --- Circuito de pases combinados ---
def cpc_2():
    return (cone(60, 118) + cone(260, 118) + par(100, n1=1, n2=2)
            + arrow((260, 100), (60, 100), "mov", R + 2, R + 2)
            + texto(160, 82, "control orientado") + texto(160, 190, "pase largo de vuelta"))


def cpc_3():
    return (player(40, 60, 1) + player(100, 150, 2) + player(280, 60, 3)
            + arrow((40, 60), (100, 150)) + arrow((100, 150), (280, 60))
            + arrow((280, 60), (40, 60), "mov", R + 2, R + 2)
            + texto(190, 130, "pase largo 20-25 m"))


def cpc_4():
    return par(60, n1=1, n2=2) + par(140, n1=3, n2=4) + texto(160, 100, "dos parejas")


def cpc_8():
    v = [(160, 28), (282, 100), (160, 172), (38, 100)]
    cuerpo = ""
    for i in range(4):
        cuerpo += arrow(v[i], v[(i + 1) % 4], s0=22, s1=24)
    n = 1
    for x, y in v:
        cuerpo += player(x - 14, y, n) + player(x + 14, y, n + 1)
        n += 2
    return cuerpo + texto(160, 105, "rombo", 12)


# --- Escalera de coordinación: huellas numeradas sobre una escalera de 6 cuadrados ---
# Se avanza de izquierda a derecha. Blanco = pie izquierdo, amarillo = pie derecho.
X0, CELDA = 28, 44
ZONA_Y = {"izq": 88, "der": 112, "med": 100, "afuera-izq": 50, "afuera-der": 150}


def escalera_base():
    celdas = "".join(f'<rect x="{X0 + i * CELDA}" y="74" width="{CELDA}" height="52" fill="none" '
                     f'stroke="#fff" stroke-width="2.5"/>' for i in range(6))
    return (celdas + arrow((60, 182), (260, 182), "mov", 2, 2) + texto(160, 176, "avanzás", 11)
            )


def huella(n, pie, celda, zona, dx=0):
    x = X0 + celda * CELDA + CELDA / 2 + dx
    kind = "d" if pie == "D" else "a"
    return player(x, ZONA_Y[zona], n, kind).replace(f'r="{R}"', 'r="10"')


def leyenda():
    return (player(60, 20, "", "a") + texto(110, 25, "izquierdo", 11)
            + player(190, 20, "", "d") + texto(238, 25, "derecho", 11))


def esc_un_pie():
    pasos = [("I", 0, "izq"), ("D", 1, "der"), ("I", 2, "izq"), ("D", 3, "der"), ("I", 4, "izq"), ("D", 5, "der")]
    return escalera_base() + leyenda() + "".join(huella(i + 1, p, c, z) for i, (p, c, z) in enumerate(pasos))


def esc_dos_pies():
    return escalera_base() + leyenda() + "".join(
        huella(c + 1, "I", c, "izq") + huella(c + 1, "D", c, "der") for c in range(6))


def esc_in_in_out_out():
    cuerpo, n = escalera_base() + leyenda(), 1
    for c in range(6):
        zi, zd = ("izq", "der") if c % 2 == 0 else ("afuera-izq", "afuera-der")
        cuerpo += huella(n, "I", c, zi) + huella(n + 1, "D", c, zd)
        n += 2
    return cuerpo


def esc_lateral():
    cuerpo, n = escalera_base() + leyenda(), 1
    for c in range(5):
        cuerpo += huella(n, "D", c, "med", 11) + huella(n + 1, "I", c, "med", -11)
        n += 2
    return cuerpo + texto(160, 50, "de costado: mirás hacia arriba", 11)


def esc_zigzag():
    pasos = [("I", 0, "izq"), ("D", 1, "afuera-der"), ("I", 2, "izq"), ("D", 3, "afuera-der"),
             ("I", 4, "izq"), ("D", 5, "afuera-der")]
    return escalera_base() + leyenda() + "".join(huella(i + 1, p, c, z) for i, (p, c, z) in enumerate(pasos))


def esc_un_pie_salto():
    return escalera_base() + leyenda() + "".join(huella(c + 1, "D", c, "med") for c in range(6))


ESCALERA = {
    "un-pie": esc_un_pie,
    "dos-pies": esc_dos_pies,
    "in-in-out-out": esc_in_in_out_out,
    "lateral": esc_lateral,
    "zigzag": esc_zigzag,
    "salto-un-pie": esc_un_pie_salto,
}


DIAGRAMAS = {
    "rondo": (rondo_2, rondo_3, rondo_4, rondo_8),
    "pases-control-orientado": (pases_2, pases_3, pases_4, pases_8),
    "pase-control-definicion": (pcd_2, pcd_3, pcd_4, pcd_8),
    "circuito-pases-combinados": (cpc_2, cpc_3, cpc_4, cpc_8),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for ex, fns in DIAGRAMAS.items():
        for n, fn in zip((2, 3, 4, 8), fns):
            (OUT / f"{ex}-{n}.svg").write_text(svg(f"{ex} con {n}", fn()), encoding="utf-8")
    for nombre, fn in ESCALERA.items():
        (OUT / f"escalera-{nombre}.svg").write_text(svg(f"Escalera: {nombre}", fn()), encoding="utf-8")
    print(f"{sum(len(f) for f in DIAGRAMAS.values()) + len(ESCALERA)} diagramas en {OUT}")


if __name__ == "__main__":
    main()
