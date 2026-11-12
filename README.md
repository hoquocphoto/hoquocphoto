# Ho Quoc — Photography & Video

Website: [hoquocphoto.github.io/hoquocphoto](https://hoquocphoto.github.io/hoquocphoto/)

## Adding photos

1. Open the [uploads](uploads/) folder and click the album's folder (for example **harbour**).
2. Click **Add file → Upload files** and drag your photos in.
3. Click **Commit changes**.
4. About two minutes later they're resized, captioned and on the website.

Name a photo after its place to caption it (`Kirribilli at dusk.jpg`), or start the name with `cover` to make it the album cover. The full guide, with the list of album folders, is in [uploads](uploads/).

## How the site is built

Plain HTML/CSS/JS portfolio. Galleries are generated: edit `build.py`, then run `python3 build.py`.

- Adding photos: upload them on GitHub into `uploads/<album>/`. The "Add photos and publish" workflow (`.github/workflows/add-photos.yml`) runs `tools/add_photos.py` (resize to 1600px and 640px, strip location data, add to the album in `albums.json`, caption from the file name, `cover…` names become the cover), then `build.py`, commits and republishes. Editing `albums.json` on GitHub republishes the same way. Because the workflow commits to `main`, pull before editing locally.
- Albums: each section shows its shoots as albums, listed in `albums.json` (section, title, italic part, place line, photos with the cover first). Album photos live in `assets/img` as `album-<album>-NN.jpg` (1600px) and `album-<album>-NN-sm.jpg` (640px), next to the hand-picked frames they also use. To reorder or drop a photo, edit its album's `photos` list and rebuild. Opening an album sets `#album-<name>` in the address bar, so albums can be linked to directly.
- Each section frames its album covers its own way: weddings as cut film negatives, portraits as Polaroids, events as slide mounts.
- Hand-picked frames: `name.jpg` (1800px) and `name-sm.jpg` (800px) in `assets/img`, listed in WEDDINGS / PORTRAITS / EVENTS in `build.py`. They feed the roll, lens, film camera and instant camera below.
- Contact: `CONTACT` in `build.py` (Instagram and phone are set; email is hidden while empty).
- Wedding film camera: list up to 6 wedding photo names in `FILMCAM` (placeholder frames show while it's empty).
- About photo: set `ABOUT_PHOTO` to a photo name (a placeholder print shows while it's empty).
- 3D film roll and lens slideshow: list photo names in `ROLL` and `HERO` (the roll shows labelled blank frames while `ROLL` is empty).
