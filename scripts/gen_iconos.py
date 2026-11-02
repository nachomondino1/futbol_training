"""Genera los íconos de la app (para instalarla en la pantalla de inicio) en docs/img/.

Césped a rayas como el header, con el círculo central de la cancha. El dibujo queda
dentro del 60% central, así sirve también como ícono "maskable" de Android.
Sin dependencias: el PNG se escribe a mano.

Correr desde la raíz del repo: python3 scripts/gen_iconos.py
"""
import math
import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "docs" / "img"
TAMANOS = [180, 192, 512]  # 180: apple-touch-icon (iOS); 192 y 512: manifest
PASTO_1 = (0x14, 0x63, 0x3F)
PASTO_2 = (0x11, 0x57, 0x3A)
BLANCO = (255, 255, 255)
RAYAS = 6
SS = 3  # submuestras por eje, para suavizar los bordes


def color(x: float, y: float, size: int) -> tuple[int, int, int]:
    """Color del punto (x, y) de un ícono de size x size."""
    d = math.hypot(x - size / 2, y - size / 2)
    if abs(d - size * 0.27) <= size * 0.03 or d <= size * 0.05:
        return BLANCO
    return PASTO_1 if int(x * RAYAS / size) % 2 == 0 else PASTO_2


def pixel(px: int, py: int, size: int) -> bytes:
    muestras = [color(px + (i + .5) / SS, py + (j + .5) / SS, size) for i in range(SS) for j in range(SS)]
    return bytes(round(sum(m[c] for m in muestras) / len(muestras)) for c in range(3))


def chunk(tipo: bytes, datos: bytes) -> bytes:
    cuerpo = tipo + datos
    return struct.pack(">I", len(datos)) + cuerpo + struct.pack(">I", zlib.crc32(cuerpo))


def png(size: int) -> bytes:
    filas = b"".join(b"\x00" + b"".join(pixel(x, y, size) for x in range(size)) for y in range(size))
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))  # 8 bits, RGB
            + chunk(b"IDAT", zlib.compress(filas, 9))
            + chunk(b"IEND", b""))


if __name__ == "__main__":
    for size in TAMANOS:
        destino = OUT / f"icon-{size}.png"
        destino.write_bytes(png(size))
        print(f"{destino.relative_to(OUT.parent.parent)}: {destino.stat().st_size} bytes")
