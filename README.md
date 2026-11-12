# Ho Quoc — Photography & Video

Website: [hoquocphoto.github.io/hoquocphoto](https://hoquocphoto.github.io/hoquocphoto/)

## Adding photos

Every album has its own folder in [albums](albums/), holding all of its photos.

1. Open [albums](albums/) and click the album's folder (for example **harbour**).
2. To add photos: click **Add file → Upload files**, drag them in and click **Commit changes**.
3. To remove one: click the photo, choose **… → Delete file** and click **Commit changes**.
4. About two minutes later the website matches the folder.

Name a new photo after its place to caption it (`Kirribilli at dusk.jpg`), or start the name with `cover` to make it the album cover. The full guide, with the list of album folders, is in [albums](albums/).

## How the site is built

Plain HTML/CSS/JS portfolio. Galleries are generated: edit `build.py`, then run `python3 build.py`.

- Album folders: `albums/<album>/` holds each album's photos (1600px), with 640px previews in `assets/thumbs/<album>/`. The "Add photos and publish" workflow (`.github/workflows/add-photos.yml`) runs `tools/sync_albums.py` on every change there: new files are resized, renamed to the next number and added to the album in `albums.json` (caption from the file name, `cover…` names become the cover, location data stripped); files deleted from the folder leave the album. Then it runs `build.py`, commits and republishes. Editing `albums.json` on GitHub republishes the same way. Because the workflow commits to `main`, pull before editing locally.
- Albums: each section shows its shoots as albums, listed in `albums.json` (section, title, italic part, place line, photos with the cover first). To reorder photos, edit the album's `photos` list. The hand-picked frames in `assets/img` are copied into their albums, so deleting one from an album never touches the 3D scenes. Opening an album sets `#album-<name>` in the address bar, so albums can be linked to directly.
- Each section frames its album covers its own way: weddings as cut film negatives, portraits as Polaroids, events as slide mounts.
- Hand-picked frames: `name.jpg` (1800px) and `name-sm.jpg` (800px) in `assets/img`, listed in WEDDINGS / PORTRAITS / EVENTS in `build.py`. They feed the roll, lens, film camera and instant camera below.
- Contact: `CONTACT` in `build.py` (Instagram and phone are set; email is hidden while empty).
- Wedding film camera: list up to 6 wedding photo names in `FILMCAM` (placeholder frames show while it's empty).
- About photo: set `ABOUT_PHOTO` to a photo name (a placeholder print shows while it's empty).
- 3D film roll and lens slideshow: list photo names in `ROLL` and `HERO` (the roll shows labelled blank frames while `ROLL` is empty).
