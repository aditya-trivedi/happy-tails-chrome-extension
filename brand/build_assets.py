#!/usr/bin/env python3
"""Rasterize Pawsome brand SVGs into toolbar icons and Chrome Web Store assets."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "brand"
ICONS = ROOT / "icons"
STORE = ROOT / "store-assets"
TOKENS = json.loads((BRAND / "tokens.json").read_text())
PALETTE = TOKENS["palette"]
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")


def require_deps() -> None:
    try:
        from PIL import Image  # noqa: F401
        from fontTools.ttLib import TTFont  # noqa: F401
    except ImportError:
        sys.stderr.write(
            "Missing deps. From the repo root run:\n"
            "  python3 -m venv .venv && .venv/bin/pip install pillow fonttools cairosvg\n"
        )
        raise SystemExit(1)


def svg_inner(path: Path) -> str:
    text = path.read_text()
    match = re.search(r"<svg[^>]*>(.*)</svg>", text, re.S)
    if not match:
        raise ValueError(f"No svg inner content in {path}")
    return match.group(1).strip()


def text_path(font_path: Path, text: str) -> tuple[str, int]:
    from fontTools.misc.transform import Transform
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.ttLib import TTFont

    font = TTFont(font_path)
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    x = 0
    parts: list[str] = []
    for ch in text:
        name = cmap.get(ord(ch))
        if name is None:
            x += 400
            continue
        glyph = glyph_set[name]
        pen = SVGPathPen(glyph_set)
        tpen = TransformPen(pen, Transform(1, 0, 0, -1, x, 0))
        glyph.draw(tpen)
        parts.append(pen.getCommands())
        x += glyph.width
    return " ".join(parts), x


def write_icon_svg() -> Path:
    mark = svg_inner(BRAND / "mark.svg")
    # 128 canvas, 14px padding around the 100x100 mark, cream rounded square.
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" rx="28" fill="{PALETTE["cream"]}"/>
  <g transform="translate(14 14)">
    {mark}
  </g>
</svg>
'''
    out = BRAND / "icon-tile.svg"
    out.write_text(svg)
    return out


def write_lockup() -> Path:
    mark = svg_inner(BRAND / "mark.svg")
    word = svg_inner(BRAND / "wordmark.svg")
    wm_scale = 72 / 780
    wm_w = 4681 * wm_scale
    total_w = 8 + 100 + 28 + wm_w + 8
    total_h = 116
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w:.2f} {total_h}" fill="none">
  <!-- Pawsome lockup: mark + Nunito ExtraBold wordmark -->
  <g transform="translate(8 8)">
    {mark}
  </g>
  <g transform="translate({8 + 100 + 28:.2f} {8 + 14:.2f}) scale({wm_scale:.6f})">
    {word}
  </g>
</svg>
'''
    out = BRAND / "lockup.svg"
    out.write_text(svg)
    return out


LOCKUP_W, LOCKUP_H = 576.09, 116
PET_W, PET_H = 96, 67
PET_SIZE = {
    "dog": (720, 767),
    "cat": (96, 67),
}


def write_tagline_svg() -> tuple[str, int]:
    d, width = text_path(BRAND / "fonts" / "Nunito-SemiBold.ttf", TOKENS["tagline"])
    return d, width


def cozy_defs(prefix: str) -> str:
    cream, mango, blush, violet, ink = (
        PALETTE["cream"],
        PALETTE["mango"],
        PALETTE["blush"],
        PALETTE["violet"],
        PALETTE["ink"],
    )
    return f'''<defs>
    <radialGradient id="{prefix}-lamp" cx="20%" cy="6%" r="70%">
      <stop offset="0%" stop-color="{mango}" stop-opacity="0.22"/>
      <stop offset="40%" stop-color="{blush}" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="{cream}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="{prefix}-dusk" cx="90%" cy="82%" r="58%">
      <stop offset="0%" stop-color="{violet}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="{cream}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="{prefix}-floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{ink}" stop-opacity="0"/>
      <stop offset="100%" stop-color="{ink}" stop-opacity="0.08"/>
    </linearGradient>
    <radialGradient id="{prefix}-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="{ink}" stop-opacity="0.20"/>
      <stop offset="65%" stop-color="{ink}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="{ink}" stop-opacity="0"/>
    </radialGradient>
    <filter id="{prefix}-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.045"/>
      </feComponentTransfer>
    </filter>
  </defs>'''


def cozy_field(w: int, h: int, prefix: str, floor_from: float = 0.72) -> str:
    return f'''  {cozy_defs(prefix)}
  <rect width="{w}" height="{h}" fill="{PALETTE["cream"]}"/>
  <rect width="{w}" height="{h}" fill="url(#{prefix}-lamp)"/>
  <rect width="{w}" height="{h}" fill="url(#{prefix}-dusk)"/>
  <rect x="0" y="{h * floor_from:.1f}" width="{w}" height="{h * (1 - floor_from):.1f}" fill="url(#{prefix}-floor)"/>
  <rect width="{w}" height="{h}" filter="url(#{prefix}-grain)" opacity="0.55"/>'''


def watermark_paw(x: float, y: float, size: float, opacity: float = 0.045) -> str:
    mark = svg_inner(BRAND / "mark.svg")
    scale = size / 100
    return f'<g opacity="{opacity}" transform="translate({x:.1f} {y:.1f}) scale({scale:.4f})">{mark}</g>'


def tagline_group(d: str, width: int, x: float, y: float, px: float) -> str:
    scale = px / 780
    return (
        f'<g fill="{PALETTE["muted"]}" transform="translate({x:.1f} {y:.1f}) '
        f'scale({scale:.6f}) translate(0 730)"><path d="{d}"/></g>'
    )


def mascot_group(name: str, x: float, y: float, scale: float, flip: bool = False) -> str:
    inner = svg_inner(BRAND / f"{name}.svg")
    vw = PET_SIZE.get(name, (PET_W, PET_H))[0]
    flip_t = f"scale(-1 1) translate(-{vw} 0)" if flip else ""
    return f'<g transform="translate({x} {y}) scale({scale}) {flip_t}">{inner}</g>'


def sit_pet(name: str, x: float, floor_y: float, scale: float, prefix: str, flip: bool = False) -> str:
    w0, h0 = PET_SIZE.get(name, (PET_W, PET_H))
    target_h = PET_H * scale
    s = target_h / h0
    w, h = w0 * s, h0 * s
    y = floor_y - h + 3 * s
    cx = x + w / 2
    shadow = (
        f'<ellipse cx="{cx:.1f}" cy="{floor_y + 3:.1f}" rx="{w * 0.40:.1f}" '
        f'ry="{8 * s:.1f}" fill="url(#{prefix}-shadow)"/>'
    )
    return f"{shadow}\n  {mascot_group(name, x, y, s, flip)}"


def write_promo_small(tag_d: str, tag_w: int) -> Path:
    lockup = svg_inner(BRAND / "lockup.svg")
    scale = 0.56
    x = (440 - LOCKUP_W * scale) / 2
    y = 92
    tag_px = 13
    tag_x = (440 - tag_w * (tag_px / 780)) / 2
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 280" width="440" height="280">
{cozy_field(440, 280, "sm", floor_from=0.78)}
  {watermark_paw(340, -18, 160, 0.04)}
  <g transform="translate({x:.2f} {y}) scale({scale:.6f})">{lockup}</g>
  {tagline_group(tag_d, tag_w, tag_x, 188, tag_px)}
</svg>
'''
    out = BRAND / "promo-small.svg"
    out.write_text(svg)
    return out


def write_promo_marquee(tag_d: str, tag_w: int) -> Path:
    lockup = svg_inner(BRAND / "lockup.svg")
    p = "mq"
    floor = 488
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 560" width="1400" height="560">
{cozy_field(1400, 560, p, floor_from=0.70)}
  {watermark_paw(1080, -40, 420, 0.035)}
  <g transform="translate(108 198) scale(0.92)">{lockup}</g>
  {tagline_group(tag_d, tag_w, 112, 338, 18)}
  {sit_pet("dog", 820, floor, 2.05, p, True)}
  {sit_pet("cat", 1048, floor, 2.05, p, True)}
</svg>
'''
    out = BRAND / "promo-marquee.svg"
    out.write_text(svg)
    return out


def write_hero(tag_d: str, tag_w: int) -> Path:
    lockup = svg_inner(BRAND / "lockup.svg")
    p = "hero"
    floor = 742
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800">
{cozy_field(1280, 800, p, floor_from=0.78)}
  {watermark_paw(860, 80, 520, 0.04)}
  <g transform="translate(96 92) scale(0.90)">{lockup}</g>
  {tagline_group(tag_d, tag_w, 100, 228, 20)}
  {sit_pet("dog", 318, floor, 2.15, p, True)}
  {sit_pet("cat", 790, floor, 2.15, p, True)}
</svg>
'''
    out = BRAND / "hero.svg"
    out.write_text(svg)
    return out


def write_screenshot(tag_d: str, tag_w: int) -> Path:
    """Quiet page with pets on the sill — the product, not a UI mock."""
    lockup = svg_inner(BRAND / "lockup.svg")
    p = "shot"
    floor = 748
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800">
{cozy_field(1280, 800, p, floor_from=0.80)}
  <g transform="translate(96 72) scale(0.62)">{lockup}</g>
  <rect x="96" y="168" width="56" height="1.5" rx="1" fill="{PALETTE["violet"]}" opacity="0.35"/>
  {tagline_group(tag_d, tag_w, 96, 196, 16)}
  {sit_pet("dog", 360, floor, 1.9, p, True)}
  {sit_pet("cat", 760, floor, 1.9, p, True)}
</svg>
'''
    out = BRAND / "screenshot.svg"
    out.write_text(svg)
    return out


def rasterize_cairosvg(svg_path: Path, png_path: Path, width: int, height: int, opaque: bool) -> None:
    import cairosvg

    kwargs = {
        "url": str(svg_path),
        "write_to": str(png_path),
        "output_width": width,
        "output_height": height,
    }
    if opaque:
        kwargs["background_color"] = PALETTE["cream"]
    cairosvg.svg2png(**kwargs)


def rasterize_chrome(svg_path: Path, png_path: Path, width: int, height: int, opaque: bool) -> None:
    if not CHROME.exists():
        raise FileNotFoundError("Google Chrome not found for SVG rasterization")
    bg = PALETTE["cream"] if opaque else "transparent"
    svg = svg_path.read_text()
    svg = re.sub(r"<svg\b", f'<svg width="{width}" height="{height}"', svg, count=1)
    html = (
        "<!DOCTYPE html><html><head><style>"
        f"html,body{{margin:0;width:{width}px;height:{height}px;overflow:hidden;background:{bg}}}"
        "svg{display:block}"
        "</style></head><body>"
        f"{svg}</body></html>"
    )
    with tempfile.TemporaryDirectory() as tmp:
        html_path = Path(tmp) / "frame.html"
        html_path.write_text(html)
        shot = Path(tmp) / "shot.png"
        cmd = [
            str(CHROME),
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-device-scale-factor=1",
            f"--window-size={width},{height}",
            f"--screenshot={shot}",
            "--default-background-color=00000000",
            html_path.as_uri(),
        ]
        subprocess.run(cmd, check=True, capture_output=True, cwd=tmp)
        if not shot.exists():
            fallback = Path(tmp) / "screenshot.png"
            if fallback.exists():
                shot = fallback
            else:
                raise FileNotFoundError("Chrome did not write a screenshot")
        shutil.copyfile(shot, png_path)


def rasterize(
    svg_path: Path,
    png_path: Path,
    width: int,
    height: int,
    opaque: bool,
    render_scale: int = 1,
) -> None:
    from PIL import Image

    png_path.parent.mkdir(parents=True, exist_ok=True)
    rw, rh = width * render_scale, height * render_scale
    engine = "cairosvg"
    try:
        rasterize_cairosvg(svg_path, png_path, rw, rh, opaque)
    except Exception:
        engine = "chrome"
        rasterize_chrome(svg_path, png_path, rw, rh, opaque)
    image = Image.open(png_path)
    if image.size != (width, height):
        image = image.resize((width, height), Image.Resampling.LANCZOS)
    if opaque:
        if image.mode != "RGB":
            bg = Image.new("RGB", image.size, PALETTE["cream"])
            if image.mode == "RGBA":
                bg.paste(image, mask=image.split()[-1])
                image = bg
            else:
                image = image.convert("RGB")
    else:
        image = image.convert("RGBA")
    image.save(png_path, "PNG")
    print(f"wrote {png_path.relative_to(ROOT)} ({image.size[0]}x{image.size[1]} {image.mode} via {engine})")


def downsample_icon(src: Path, dest: Path, size: int) -> None:
    from PIL import Image

    image = Image.open(src).convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
    image.save(dest, "PNG")
    print(f"wrote {dest.relative_to(ROOT)} ({size}x{size} RGBA via downsample)")


def capture_preview(png_path: Path, width: int = 1280, height: int = 800) -> None:
    from PIL import Image

    if not CHROME.exists():
        raise FileNotFoundError("Google Chrome not found for preview screenshot")
    url = (ROOT / "preview.html").as_uri()
    with tempfile.TemporaryDirectory() as tmp:
        shot = Path(tmp) / "shot.png"
        cmd = [
            str(CHROME),
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-device-scale-factor=1",
            f"--window-size={width},{height}",
            f"--screenshot={shot}",
            "--allow-file-access-from-files",
            url,
        ]
        subprocess.run(cmd, check=True, capture_output=True, cwd=tmp)
        if not shot.exists():
            fallback = Path(tmp) / "screenshot.png"
            if not fallback.exists():
                raise FileNotFoundError("Chrome did not write a preview screenshot")
            shot = fallback
        image = Image.open(shot)
        if image.size != (width, height):
            image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.convert("RGB").save(png_path, "PNG")
    print(f"wrote {png_path.relative_to(ROOT)} ({width}x{height} RGB via chrome preview)")


def main() -> None:
    require_deps()
    ICONS.mkdir(exist_ok=True)
    STORE.mkdir(exist_ok=True)

    icon_svg = write_icon_svg()
    write_lockup()
    tag_d, tag_w = write_tagline_svg()

    small = write_promo_small(tag_d, tag_w)
    marquee = write_promo_marquee(tag_d, tag_w)
    hero = write_hero(tag_d, tag_w)
    shot = write_screenshot(tag_d, tag_w)

    master = ICONS / "icon128.png"
    rasterize(icon_svg, master, 256, 256, opaque=False)
    downsample_icon(master, master, 128)
    downsample_icon(master, ICONS / "icon48.png", 48)
    downsample_icon(master, ICONS / "icon16.png", 16)
    shutil.copyfile(master, STORE / "store-icon-128.png")
    print("wrote store-assets/store-icon-128.png (copy of icon128)")

    rasterize(small, STORE / "promo-small-440x280.png", 440, 280, opaque=True, render_scale=2)
    rasterize(marquee, STORE / "promo-marquee-1400x560.png", 1400, 560, opaque=True, render_scale=2)
    rasterize(hero, STORE / "hero-1280x800.png", 1280, 800, opaque=True, render_scale=2)
    rasterize(shot, STORE / "screenshot-1280x800.png", 1280, 800, opaque=True, render_scale=2)


if __name__ == "__main__":
    main()
