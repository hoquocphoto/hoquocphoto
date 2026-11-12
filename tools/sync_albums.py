#!/usr/bin/env python3
"""Keeps each album in step with its folder, albums/<album>/.

- A photo in the folder that the album doesn't list yet is new: it is turned
  upright, resized to 1600px on the long edge (location data stripped), renamed
  NN.jpg, given a 640px preview in assets/thumbs/<album>/ and added to the end
  of the album with its camera settings.
- A photo the album lists but the folder no longer has was deleted: it leaves
  the album and its preview is removed.
- Uploading a photo with the same name as one already there replaces it and
  keeps its place and caption.

The file name of a new photo becomes its caption ("Kirribilli at dusk.jpg").
Camera names like IMG_1234.jpg get the album's usual caption instead. A name
starting with "cover" puts the photo first, so it becomes the album cover.
Run:  python3 tools/sync_albums.py   (then build.py)
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
FOLDERS = ROOT / "albums"
THUMBS = ROOT / "assets/thumbs"
ALBUMS = ROOT / "albums.json"
KINDS = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".tif", ".tiff"}
FULL, SMALL = 1600, 640
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


def save(im, path, edge):
    im = im.copy()
    im.thumbnail((edge, edge), Image.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "JPEG", quality=82, optimize=True, progressive=True)


def rel(path):
    return path.relative_to(ROOT).as_posix()


def sync(album, log):
    slug, folder = album["slug"], FOLDERS / album["slug"]
    film = Counter(p["exif"] for p in album["photos"]).most_common(1)
    film = bool(film) and film[0][0] == "Shot on film"
    files = {rel(p): p for p in folder.iterdir() if p.suffix.lower() in KINDS} if folder.exists() else {}

    # deleted from the folder -> out of the album
    kept = []
    for photo in album["photos"]:
        if photo["full"] in files or not photo["full"].startswith("albums/"):
            kept.append(photo)
        else:
            (ROOT / photo["src"]).unlink(missing_ok=True)
            log.append(f"{slug}: removed {photo['full'].rsplit('/', 1)[-1]}")
    album["photos"] = kept
    listed = {p["full"]: p for p in kept}

    taken = [int(m[1]) for p in files.values() if (m := re.fullmatch(r"(\d+)", p.stem))]
    number = max(taken, default=0)
    for path in sorted(files.values()):
        photo = listed.get(rel(path))
        try:
            im = Image.open(path)
            big = max(im.size) > FULL + 400
            if photo and not big and (ROOT / photo["src"]).exists():
                continue                                    # already on the site
            exif = settings(im) or ("Shot on film" if film else "")
            im = ImageOps.exif_transpose(im).convert("RGB")
        except Exception as e:                              # a broken or unsupported file stays put
            print(f"Could not open {rel(path)}: {e}", file=sys.stderr)
            continue
        if photo:                                           # replaced (same name) or missing its preview
            if big:
                save(im, path, FULL)
                photo["exif"] = exif or photo["exif"]
            save(im, ROOT / photo["src"], SMALL)
            log.append(f"{slug}: updated {path.name}")
            continue
        number += 1
        full = folder / f"{number:02d}.jpg"
        save(im, full, FULL)
        if path != full:
            path.unlink()
        photo = {"full": rel(full), "src": f"assets/thumbs/{slug}/{full.name}",
                 "cap": caption(path.stem, album), "exif": exif}
        save(im, ROOT / photo["src"], SMALL)
        if re.match(r"cover\b", path.stem, re.I):
            album["photos"].insert(0, photo)
        else:
            album["photos"].append(photo)
        log.append(f'{slug}: added {path.name} as {full.name} ("{photo["cap"]}")')


def main():
    albums = json.loads(ALBUMS.read_text())
    slugs = {a["slug"] for a in albums}
    log = []
    for album in albums:
        sync(album, log)
    for folder in sorted(p for p in FOLDERS.iterdir() if p.is_dir() and p.name not in slugs):
        print(f"No album called {folder.name}: left {folder.name}/ as it is", file=sys.stderr)
    ALBUMS.write_text(json.dumps(albums, ensure_ascii=False, indent=1))
    print("\n".join(log) or "Albums already match their folders")


if __name__ == "__main__":
    main()
