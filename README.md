# Ho Quoc — Photography & Video

Plain HTML/CSS/JS portfolio. Galleries are generated: edit `build.py`, then run `python3 build.py`.

- Photos: put `name.jpg` (1800px) and `name-sm.jpg` (800px) in `assets/img`, add a line to WEDDINGS / PORTRAITS / EVENTS / VIDEO in `build.py`.
- Each section has its own print (`STYLE` in `build.py`): weddings are cut film negatives, portraits Polaroids, events slide mounts, video a cinema camera monitor.
- Contact: `CONTACT` in `build.py` (Instagram and phone are set; email is hidden while empty).
- About photo: set `ABOUT_PHOTO` to a photo name (a placeholder print shows while it's empty).
- 3D film roll and lens slideshow: list photo names in `ROLL` and `HERO` (the roll shows labelled blank frames while `ROLL` is empty).
