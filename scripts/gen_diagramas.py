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


# --- Ejercicios con conos y pelota: un diagrama por ejercicio (docs/img/<id>.svg) ---
def curva(d):
    return (f'<path d="{d}" fill="none" stroke="{AMARILLO}" stroke-width="2.5" stroke-dasharray="6 5" '
            f'marker-end="url(#ma)"/>')


def linea(x1, y1, x2, y2, extra=""):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#fff" stroke-width="2" {extra}/>'


def cuadrado_medio():
    pasadores = [(160, 38), (242, 100), (160, 162), (78, 100)]
    cuerpo = "".join(cone(x, y) for x, y in [(112, 62), (208, 62), (208, 138), (112, 138)])
    cuerpo += arrow(pasadores[0], pasadores[1]) + arrow(pasadores[1], pasadores[2]) + arrow(pasadores[3], pasadores[0])
    cuerpo += "".join(player(x, y, i + 1) for i, (x, y) in enumerate(pasadores)) + player(160, 100, "", "d")
    return cuerpo + texto(160, 195, "los de afuera pasan, el del medio presiona", 11)


def dos_conos_base():
    return (cone(40, 122) + cone(280, 122) + player(40, 100, 2) + player(280, 100, 3)
            + linea(40, 150, 280, 150, 'stroke-dasharray="4 4" opacity=".7"')
            + texto(160, 168, "unos 15 m", 11))


def dejada_vuelta():
    cuerpo = dos_conos_base() + player(160, 100, 1)
    cuerpo += arrow((160, 100), (95, 100), "mov", R + 2, 4)
    cuerpo += curva("M 95 100 C 78 66, 4 66, 4 100 C 4 134, 62 128, 82 106")
    cuerpo += arrow((95, 100), (225, 100), "mov", 6, 4)[:0]
    cuerpo += curva("M 90 112 C 130 124, 190 124, 232 112")
    cuerpo += curva("M 232 100 C 250 66, 318 66, 318 100 C 318 134, 262 128, 240 106")
    return cuerpo + texto(160, 30, "le deja la pelota y le da la vuelta por detrás", 11)


def pared_control():
    cuerpo = dos_conos_base() + player(160, 100, 1)
    cuerpo += arrow((160, 100), (100, 100), "mov", R + 2, 4)
    cuerpo += arrow((100, 92), (52, 92)) + arrow((52, 108), (100, 108))
    cuerpo += arrow((100, 120), (220, 120), "mov", 6, 4)
    cuerpo += arrow((220, 92), (268, 92)) + arrow((268, 108), (220, 108))
    return cuerpo + texto(160, 30, "pared de primera y control orientado", 11)


def un_toque_central():
    cuerpo = ('<circle cx="160" cy="100" r="78" fill="none" stroke="#fff" stroke-width="2" '
              'stroke-dasharray="5 5" opacity=".7"/>')
    cuerpo += cone(160, 112) + player(160, 100, 1)
    cuerpo += player(95, 55, 2) + arrow((95, 55), (160, 100))
    cuerpo += arrow((160, 100), (236, 138)) + curva("M 104 64 C 150 30, 240 70, 240 124")
    return cuerpo + texto(160, 193, "devuelve de un toque; radio ≈ 5 m", 11)


def campo_rival():
    cuerpo = (linea(160, 12, 160, 188) + '<circle cx="160" cy="100" r="22" fill="none" stroke="#fff" stroke-width="2"/>'
              + player(70, 100, 1) + player(250, 100, 2)
              + arrow((70, 100), (250, 100)) + arrow((250, 118), (70, 118)))
    cuerpo += texto(80, 40, "tu campo", 12) + texto(240, 40, "campo rival", 12)
    return cuerpo + texto(160, 190, "punto si queda quieta en el campo rival (a 10)", 10)


def cono_lateral():
    cuerpo = cone(50, 132) + cone(270, 132) + cone(160, 62)
    cuerpo += player(160, 50, 2) + player(50, 112, 1)
    cuerpo += arrow((50, 112), (160, 50)) + arrow((160, 50), (230, 115))
    cuerpo += arrow((60, 124), (250, 124), "mov", 4, 4)
    return cuerpo + texto(160, 168, "vueltita por fuera del cono, a máxima velocidad", 10)


def v_devolucion():
    cuerpo = cone(160, 164) + cone(60, 70) + cone(260, 70) + player(160, 30, 2) + player(160, 142, 1)
    cuerpo += arrow((160, 142), (70, 82), "mov", R + 2, 8) + arrow((160, 142), (250, 82), "mov", R + 2, 8)
    cuerpo += arrow((160, 30), (80, 56)) + arrow((90, 66), (166, 40))[:0]
    return cuerpo + texto(160, 192, "en cada extremo recibe una pelota y la devuelve", 10)


def v_suela():
    cuerpo = cone(160, 164) + cone(60, 70) + cone(260, 70) + player(160, 142, 1)
    cuerpo += arrow((152, 140), (68, 80), "mov", R + 2, 8) + arrow((74, 90), (152, 154), "mov", 8, R + 2)
    cuerpo += arrow((168, 140), (252, 80), "mov", R + 2, 8) + arrow((246, 90), (168, 154), "mov", 8, R + 2)
    return cuerpo + texto(160, 24, "ida conduciendo, vuelta de espaldas con la suela", 10)


def zigzag_conos():
    pts = [(70, 60), (130, 140), (190, 60), (250, 140), (300, 60)]
    cuerpo = "".join(cone(x, y) for x, y in pts) + player(24, 100, 1)
    cuerpo += arrow((24, 100), (66, 66), "tiro", R + 2, 10)
    for a, b in zip(pts, pts[1:]):
        cuerpo += arrow(a, b, "tiro", 10, 10)
    return cuerpo + texto(160, 190, "acelerás hacia cada cono", 11)


def cambios_ritmo():
    xs = [30, 85, 140, 195, 250, 305]
    cuerpo = "".join(cone(x, 126) for x in xs) + player(30, 100, 1)
    for i, (a, b) in enumerate(zip(xs, xs[1:])):
        cuerpo += arrow((a, 100), (b, 100), "mov" if i % 2 == 0 else "tiro", R + 2 if i == 0 else 4, 6)
    return cuerpo + texto(160, 160, "tramos suaves (línea punteada) y acelerados (gruesa)", 10)


def pelota(x, y):
    return f'<circle cx="{x}" cy="{y}" r="5" fill="#fff" stroke="#10231a" stroke-width="1.5"/>'


def conduccion_variable():
    xs = [34, 94, 154, 214, 274]
    cuerpo = "".join(cone(x, 130) for x in xs) + player(24, 100, 1) + pelota(44, 100)
    tramos = [(44, 110, "mov"), (110, 160, "tiro"), (160, 205, "mov"), (205, 270, "tiro"), (270, 300, "mov")]
    for a, b, k in tramos:
        cuerpo += arrow((a, 100), (b, 100), k, 4, 4)
    return cuerpo + texto(160, 165, "tramos lentos (punteado) y aceleraciones cortas (grueso)", 10) + texto(160, 30, "pelota controlada, sin presión", 11)


def progresion():
    cuerpo = cone(30, 130) + cone(290, 130) + player(30, 100, 1)
    for i in range(6):
        x1, x2 = 52 + i * 40, 88 + i * 40
        cuerpo += (f'<line x1="{x1}" y1="100" x2="{x2}" y2="100" stroke="{AMARILLO}" stroke-width="{2 + i * 1.3:.1f}"/>')
    cuerpo += arrow((250, 100), (292, 100), "tiro", 0, 4)
    return (cuerpo + texto(60, 70, "arranque suave", 11) + texto(250, 70, "60-70 %", 11)
            + texto(160, 165, "15-20 m, acelerando de a poco; volvés caminando", 11))


def uno_contra_uno():
    cuerpo = goal() + player(70, 100, 1, "d") + player(165, 100, 2)
    cuerpo += arrow((70, 100), (165, 100)) + arrow((165, 100), (284, 100), "tiro")
    cuerpo += player(300, 100, "", "d")[:0]
    return cuerpo + texto(100, 70, "defensor o arquero", 11) + texto(165, 140, "ataca: mano a mano", 11) + texto(160, 190, "el pase da inicio a la situación de partido", 10)


def pivote_nueve():
    cuerpo = goal() + player(50, 150, 1) + player(190, 100, 9, "d")
    cuerpo += arrow((50, 150), (190, 100)) + arrow((190, 100), (125, 138)) + arrow((125, 138), (284, 100), "tiro", 4, 4)
    return cuerpo + texto(160, 24, "pase al pivote, la deja de primera y define", 11) + texto(205, 130, "pivote", 11)


UNICOS = {
    "cuadrado-uno-al-medio": cuadrado_medio,
    "pared-control-orientado-conos-dejada": dejada_vuelta,
    "pared-control-orientado-conos": pared_control,
    "un-toque-cono-central": un_toque_central,
    "pelota-al-campo-rival": campo_rival,
    "pase-cono-lateral-control": cono_lateral,
    "carrera-v-devolucion": v_devolucion,
    "conduccion-v-suela": v_suela,
    "aceleracion-conos-zigzag": zigzag_conos,
    "cambios-ritmo-conos": cambios_ritmo,
    "conduccion-ritmo-variable": conduccion_variable,
    "progresion-aceleracion": progresion,
    "uno-contra-uno-tiro": uno_contra_uno,
    "pivote-9-definicion": pivote_nueve,
}


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
    cuerpo = escalera_base() + leyenda()
    for c in range(4):
        n = 4 * c + 1
        cuerpo += (huella(n, "I", c, "izq") + huella(n + 1, "D", c, "der")
                   + huella(n + 2, "I", c, "afuera-izq") + huella(n + 3, "D", c, "afuera-der"))
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


def esc_cinco_saltos():
    cuerpo = escalera_base() + leyenda()
    for c in range(5):
        cuerpo += huella(c + 1, "I", c, "izq") + huella(c + 1, "D", c, "der")
    cuerpo += huella(6, "D", 5, "med")
    return cuerpo + texto(160, 52, "5 saltos con los dos pies y después un apoyo por cuadrado", 10)


def esc_abrir_cerrar():
    cuerpo = escalera_base() + leyenda()
    for c in range(6):
        n = 2 * c + 1
        cuerpo += (huella(n, "I", c, "izq") + huella(n, "D", c, "der")
                   + huella(n + 1, "I", c, "afuera-izq") + huella(n + 1, "D", c, "afuera-der"))
    return cuerpo


def esc_adentro_afuera_costado():
    cuerpo = escalera_base() + leyenda()
    for c in range(4):
        n = 4 * c + 1
        cuerpo += (huella(n, "D", c, "med", 11) + huella(n + 1, "I", c, "med", -11)
                   + huella(n + 2, "D", c, "afuera-der", 11) + huella(n + 3, "I", c, "afuera-der", -11))
    return cuerpo + texto(160, 40, "de costado: adentro, adentro, afuera, afuera", 11)


def secuencia(pasos, texto_arriba=None, sentido=1):
    """Dibuja una lista de pasos (pie, cuadrado, zona, desplazamiento_x) con su número de orden."""
    cuerpo = escalera_base() + leyenda()
    for i, (pie, c, z, dx) in enumerate(pasos):
        cuerpo += huella(i + 1, pie, c, z, dx)
    if texto_arriba:
        cuerpo += texto(160, 44, texto_arriba, 10)
    return cuerpo


ESCALERA = {
    "un-pie": esc_un_pie,
    "dos-pies": esc_dos_pies,
    "in-in-out-out": esc_in_in_out_out,
    "lateral": esc_lateral,
    "zigzag": esc_zigzag,
    "salto-un-pie": esc_un_pie_salto,
    "cinco-saltos": esc_cinco_saltos,
    "abrir-cerrar": esc_abrir_cerrar,
    "adentro-afuera-costado": esc_adentro_afuera_costado,
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
    for ex, fn in UNICOS.items():
        (OUT / f"{ex}.svg").write_text(svg(ex, fn()), encoding="utf-8")
    print(f"{sum(len(f) for f in DIAGRAMAS.values()) + len(ESCALERA) + len(UNICOS)} diagramas en {OUT}")


if __name__ == "__main__":
    main()
