# Ho Quoc — Photography & Video

Plain HTML/CSS/JS portfolio. Galleries are generated: edit `build.py`, then run `python3 build.py`.

- Albums: each section shows its shoots as albums, listed in `albums.json` (section, title, italic part, place line, photos with the cover first). Album photos live in `assets/img` as `album-<album>-NN.jpg` (1600px) and `album-<album>-NN-sm.jpg` (640px), next to the hand-picked frames they also use. To reorder or drop a photo, edit its album's `photos` list and rebuild. Opening an album sets `#album-<name>` in the address bar, so albums can be linked to directly.
- Each section frames its album covers its own way: weddings as cut film negatives, portraits as Polaroids, events as slide mounts.
- Hand-picked frames: `name.jpg` (1800px) and `name-sm.jpg` (800px) in `assets/img`, listed in WEDDINGS / PORTRAITS / EVENTS in `build.py`. They feed the roll, lens, film camera and instant camera below.
- Contact: `CONTACT` in `build.py` (Instagram and phone are set; email is hidden while empty).
- Wedding film camera: list up to 6 wedding photo names in `FILMCAM` (placeholder frames show while it's empty).
- About photo: set `ABOUT_PHOTO` to a photo name (a placeholder print shows while it's empty).
- 3D film roll and lens slideshow: list photo names in `ROLL` and `HERO` (the roll shows labelled blank frames while `ROLL` is empty).
