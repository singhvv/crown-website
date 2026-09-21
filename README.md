# Crown Collision

Website for Crown Collision, an auto body and collision repair shop in Calgary,
Alberta.

Plain HTML, CSS and JavaScript. No build step, no framework, nothing to install.
Open `index.html` and it runs. Built to be hosted on GitHub Pages.

- Phone: 403 276 9613
- Email: info@crowncollisoncalgary.com

Brand colours are `#A42923` red, `#B5B1B0` grey and black. Flat fills only.

---

## Running it locally

Double clicking `index.html` covers most things. The booking form needs a real
server to reach Google, so use a local one while testing that part:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

---

## Almost everything you will change is in one file

`assets/js/config.js` holds the form connection, every photo path with its alt
text, and the hero video. Editing that one file covers most of the work.

```js
window.CROWN_CONFIG = {
  formEndpoint: "https://script.google.com/macros/s/AKfycb.../exec",

  images: {
    heroPoster: { src: "assets/img/my-shop.jpg", alt: "Our shop on 11th Street" },
    ...
  },

  video: "assets/video/hero.mp4"
};
```

Any filename works. Any format works: `.jpg`, `.png`, `.webp`, `.avif`. You do
not have to match the placeholder names or keep the `.svg` extension, and you do
not have to touch `index.html`.

The placeholder paths stay in `index.html` as a fallback, so the page still
shows something if JavaScript is off.

### Image shapes

| Config key | Used for | Shape |
|---|---|---|
| `heroPoster` | Still behind the hero, and whenever the video is missing | 16:9 |
| `before`, `after` | Drag to compare slider | 14:9 |
| `work1` to `work6` | Job gallery | 4:3 |
| `shop` | Warranty section | 7:5 |

Save at about 1600px wide, JPG, 80% quality. Shoot the before and after pair
from the same spot with the same framing or the slider looks wrong.

---

## What still has to be edited in index.html

These are not in the config because they are one offs. Search for `CUSTOMIZE`.

| What | Why |
|---|---|
| Street address | Currently reads `PLACEHOLDER street address`, in the contact block and the structured data near the top |
| Opening hours | A guess, in three places |
| The stats band | `12+` years is correct. Vehicles repaired, insurers billed and turnaround are invented. Put in real numbers or delete those three tiles |
| Warranty list | Confirm the term and whether there really is a courtesy vehicle |
| Map | A placeholder panel sits where a Google Maps embed belongs |
| Gallery captions | The job titles under each photo |
| Domain | In the canonical link, the Open Graph tags, the structured data, `sitemap.xml` and `robots.txt` |

---

## Turning the booking form on

Each request writes a row to a Google Sheet and emails the shop. It runs on a
Google Apps Script web app, which is free and needs no server of your own.

The script is `google-apps-script/Code.gs`. Setting it up, deploying it and
getting the URL is covered step by step in the deployment guide that came with
this project. That guide is kept outside this repository so it never reaches
GitHub.

Short version: deploy the script, copy the `/exec` URL, paste it into
`formEndpoint` in `assets/js/config.js`.

Until that is filled in the form runs in demo mode. It validates and shows the
success state but sends nothing, so a half finished site cannot quietly swallow
a real customer.

---

## File layout

```
index.html                     The whole site
404.html                       Not found page for GitHub Pages
favicon.svg
robots.txt, sitemap.xml
.nojekyll                      Tells Pages to serve files as they are
assets/
  css/styles.css               All styling
  js/config.js                 The file you edit
  js/main.js                   Animation and form handling
  js/vendor/anime.umd.min.js   anime.js 4.5.0, kept local on purpose
  img/                         Placeholder artwork
  video/                       Drop hero.mp4 here
google-apps-script/Code.gs     Backend for the form
```

anime.js is committed rather than pulled from a CDN, so the site keeps working
if a CDN has a bad day and the version never shifts underneath you.

---

## Notes

- Works down to 360px wide. Test on a phone before publishing.
- Respects `prefers-reduced-motion`. Animation is skipped for anyone whose
  device asks for less of it, and the page stays fully readable.
- Content is hidden for animation only when JavaScript is running, and a
  watchdog forces the hero visible if the intro never finishes. A blocked or
  broken script cannot leave the page blank.
- The only outside request is the Google Fonts stylesheet.
- The form has a hidden honeypot field and a minimum fill time to catch bots.
