#!/usr/bin/env python3
"""Moves photos dropped into uploads/<album>/ into that album.

Each photo is turned upright, resized to the site's two sizes (1600px and 640px
on the long edge, location and camera data stripped) and saved in assets/img as
album-<album>-NN.jpg. Then it is added to the end of the album in albums.json
with its camera settings, and the upload is deleted. Run build.py afterwards.

The file name becomes the caption ("Kirribilli at dusk.jpg"). Camera names
like IMG_1234.jpg get the album's usual caption instead. A name starting with
"cover" puts the photo first, so it becomes the album cover.
Run:  python3 tools/add_photos.py
"""
import json, re, sys
from collections import Counter
from pathlib import Path

from PIL import Image, ImageOps

try:
    from pillow_heif import register_heif_opener   # iPhone HEIC photos
    register_heif_opener()
except ImportError:
    pass

ROOT = Path(__file__).resolve().parent.parent
UPLOADS = ROOT / "uploads"
IMG = ROOT / "assets/img"
ALBUMS = ROOT / "albums.json"
KINDS = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".tif", ".tiff"}
SIZES = {"": 1600, "-sm": 640}
# names cameras and phones give files: IMG_1234, DSC01234, QUOC0127, PXL_2024..., "photo 3", "Untitled-1 copy"
CAMERA_NAME = re.compile(r"^[\W_]*([a-z]{0,6}_?\d{3,}|photo|image|untitled|cover)?([\W_]*(\d+|copy|edited|final))*[\W_]*$", re.I)


def settings(im):
    """Camera settings in the site's style, e.g. 'f/2.8 · 1/160s · ISO 500 · 35mm'."""
    exif = im.getexif().get_ifd(0x8769)
    f, t, iso, mm = exif.get(0x829D), exif.get(0x829A), exif.get(0x8827), exif.get(0x920A)
    if isinstance(iso, (tuple, list)):
        iso = iso[0] if iso else None
    if not (f and t and iso and mm):
        return ""
    t = float(t)
    shutter = f"1/{round(1 / t)}s" if t < 1 else f"{t:g}s"
    return f"f/{round(float(f), 1):g} · {shutter} · ISO {int(iso)} · {round(float(mm), 1):g}mm"


def caption(stem, album):
    """The caption from a file name, or the album's usual caption for camera names."""
    text = re.sub(r"^cover\b[\W_]*", "", stem, flags=re.I)
    camera = CAMERA_NAME.match(text)
    text = re.sub(r"[\s_-]*(\(\d+\)|\d+)$", "", text)            # "name 2", "name (1)"
    text = re.sub(r"[_\s]+", " ", text.replace(" - ", " ")).strip(" -")
    if camera or not re.search(r"[^\W\d_]", text):
        usual = Counter(p["cap"] for p in album["photos"]).most_common(1)
        return usual[0][0] if usual else f'{album["title"]} {album["em"]}'.strip()
    return text[0].upper() + text[1:]


def next_number(slug):
    taken = [int(m[1]) for p in IMG.glob(f"album-{slug}-*.jpg") if (m := re.fullmatch(rf"album-{re.escape(slug)}-(\d+)", p.stem))]
    return max(taken, default=0) + 1


def main():
    albums = json.loads(ALBUMS.read_text())
    by_slug = {a["slug"]: a for a in albums}
    added, skipped = Counter(), []
    for folder in sorted(p for p in UPLOADS.iterdir() if p.is_dir()) if UPLOADS.exists() else []:
        files = sorted(p for p in folder.iterdir() if p.suffix.lower() in KINDS)
        if not files:
            continue
        album = by_slug.get(folder.name)
        if not album:
            skipped += [str(p.relative_to(ROOT)) for p in files]
            continue
        film = Counter(p["exif"] for p in album["photos"]).most_common(1)
        film = film and film[0][0] == "Shot on film"
        for path in files:
            try:
                im = Image.open(path)
                exif = settings(im) or ("Shot on film" if film else "")
                im = ImageOps.exif_transpose(im).convert("RGB")
            except Exception as e:                       # a broken or unsupported file stays put
                print(f"Could not open {path.relative_to(ROOT)}: {e}", file=sys.stderr)
                skipped.append(str(path.relative_to(ROOT)))
                continue
            n = next_number(album["slug"])
            name = f"album-{album['slug']}-{n:02d}"
            for suffix, edge in SIZES.items():
                out = im.copy()
                out.thumbnail((edge, edge), Image.LANCZOS)
                out.save(IMG / f"{name}{suffix}.jpg", "JPEG", quality=82, optimize=True, progressive=True)
            photo = {"full": f"assets/img/{name}.jpg", "src": f"assets/img/{name}-sm.jpg",
                     "cap": caption(path.stem, album), "exif": exif}
            if re.match(r"cover\b", path.stem, re.I):
                album["photos"].insert(0, photo)
            else:
                album["photos"].append(photo)
            path.unlink()
            added[album["slug"]] += 1
            print(f'{album["slug"]}: {path.name} -> {name}.jpg ("{photo["cap"]}")')
    ALBUMS.write_text(json.dumps(albums, ensure_ascii=False, indent=1))
    for p in skipped:
        print(f"Left in place (no album called that, or not a photo): {p}", file=sys.stderr)
    print(f"Added {sum(added.values())} photos" + (f": {dict(added)}" if added else ""))


if __name__ == "__main__":
    main()
