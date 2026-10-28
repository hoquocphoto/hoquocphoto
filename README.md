# Nathan Bui — Photography

Client-facing photo portfolio (Scenery / People / Events). Plain HTML/CSS/JS, no build tools beyond Python.

- Edit copy in `template.html`, styles in `assets/css/site.css`.
- Add a photo: put `name.jpg` (1800px long edge) and `name-sm.jpg` (800px) in `assets/img`, add a line to the list in `build.py`, then run `python3 build.py` to regenerate `index.html`.
- Bump `?v=` on the CSS/JS links after edits so browsers pick up changes.
