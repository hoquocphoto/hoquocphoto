# Add photos to your website

Drag photos into the right album folder below and click **Commit changes**. About two minutes later they're resized, captioned and live on [hoquocphoto.github.io/hoquocphoto](https://hoquocphoto.github.io/hoquocphoto/). No software or code needed, just a web browser.

## Which folder is which album

Each folder is one album on the website. The folder you upload into decides the album.

| Folder | Album | Section |
|---|---|---|
| [wedding-film](wedding-film/) | Wedding day on film | Weddings |
| [wedding-pyrmont](wedding-pyrmont/) | Wedding day in Pyrmont | Weddings |
| [prewedding](prewedding/) | Pre-wedding by the harbour | Weddings |
| [graduation](graduation/) | Graduation day | Portraits |
| [harbour](harbour/) | On the harbour | Portraits |
| [opera-house](opera-house/) | The sails at golden hour | Portraits |
| [jacaranda](jacaranda/) | Jacaranda season | Portraits |
| [parks](parks/) | Parks & gardens | Portraits |
| [ao-dai](ao-dai/) | Áo dài in Sydney | Portraits |
| [bougainvillea](bougainvillea/) | Bougainvillea walls | Portraits |
| [street](street/) | Out on the street | Portraits |
| [concepts](concepts/) | Concept shoots | Portraits |
| [cosplay](cosplay/) | Cosplay in character | Portraits |
| [tours](tours/) | Seeing Sydney together | Events |
| [cars](cars/) | Car shoots after dark | Events |
| [birthdays](birthdays/) | First birthdays | Events |

## Before you start

- **Sign in to GitHub as hoquocphoto.** A computer is easiest; the GitHub phone app can't upload files.
- **Export your edited photos as JPG.** iPhone HEIC and PNG files work too.
- **Keep them a sensible size.** About 2400px on the long edge (2–5 MB each) keeps uploads quick. GitHub's limits are 25 MB per photo and 100 photos per upload.
- **Only upload photos that can be public.** Anyone can see the website.

## Adding photos, step by step

1. Click the album's folder in the table above, for example **harbour**.
2. Click **Add file** (top right), then **Upload files**.
3. Drag your photos into the box, or click **choose your files** and pick them.
4. Wait until every photo has finished uploading (the progress bars disappear).
5. Leave **Commit directly to the main branch** selected and click the green **Commit changes** button.
6. Wait about two minutes, then refresh the website. The new photos appear at the end of that album, and the folder on GitHub is empty again.

## Captions and the album cover

The file name becomes the photo's caption, so rename a photo before uploading to caption it. Name places, never clients.

| File name you upload | What the website shows |
|---|---|
| `Kirribilli at dusk.jpg` | Caption "Kirribilli at dusk" |
| `Kirribilli at dusk 2.jpg` | Also "Kirribilli at dusk" (numbers at the end are dropped) |
| `QUOC0127.JPG` or `IMG_1234.jpg` | The album's usual caption, e.g. "Harbour light" |
| `cover - Milsons Point.jpg` | Becomes the **album cover**, captioned "Milsons Point" |

The camera settings shown in the viewfinder (aperture, shutter, ISO, focal length) are read from the photo automatically. Location data is removed from the copies on the website.

## Checking it worked

It worked when the album folder is empty again and the photos show on the website.

- **To watch it happen:** open the [Actions page](https://github.com/hoquocphoto/hoquocphoto/actions). The top run, **Add photos and publish**, shows a yellow dot while it works and a green tick when it's done (about 20 seconds). The website catches up a minute or so later.
- **Website still looks the same:** your browser may be showing an old copy. Refresh with Cmd + Shift + R (Ctrl + Shift + R on Windows).
- **Red cross on the Actions page:** nothing on the website changed, and the photo stays in the folder. Send Nathan the link to that run.
- **Photo stayed in the folder but the run is green:** it's probably in the wrong format (for example a RAW file). Export it as JPG and upload again.
- **Uploaded outside an album folder:** the photos just sit there and nothing changes. Delete them and upload again into the right folder.
- **Uploaded to the wrong album:** tell Nathan which photos need moving.

## Changing a caption, removing a photo, or a new album

The easy way for all three: message Nathan with the album and what to change.

To fix a caption yourself:

1. Open [albums.json](https://github.com/hoquocphoto/hoquocphoto/blob/main/albums.json) and click the pencil icon (**Edit this file**).
2. Press Cmd + F (Ctrl + F on Windows) and search for the caption you want to change.
3. Change only the words between the quote marks. Keep the quote marks and the comma after them.
4. Click **Commit changes**. The website updates in about two minutes.

If an edit breaks the file, the run on the Actions page shows a red cross and the website keeps showing the previous version until it's fixed.

Removing photos and new albums are best left to Nathan. A new album needs a title, a one-line note and a section (Weddings, Portraits or Events), so have those ready.
