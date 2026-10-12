# Text Crush

A word board you tap. Tap a letter to clear it together with every letter connected to it, and the
tiles above fall down to fill the gap.

**Play it:** <https://kevinelong.github.io/textcrush/> — it installs to a phone home screen
(Share → Add to Home Screen on iOS, or the install prompt on Android) and then runs offline.

## How it plays

- The board is 8×8, drawn from 8 distinct letters and digits.
- **Tap a tile** to clear it and every tile joined to it (up, down, left, right) with the same
  character.
- **Scoring** is `2^(n-1)` for a run of `n`: one tile is 1 point, two is 2, three is 4, eight is 128.
  A turn is spent whatever the size, so the game rewards one big group over five small ones.
- **Twenty turns**, then it is over. The high score is kept on your device.

## Layout

```
source/web/          the page: canvas, click pipeline, service worker, manifest, icons
source/game/classes/ the game: TypeScript sources next to the JavaScript the page loads
alt/tc.py            a Python port of the model, for reference
tools/               stage-site.sh (builds the published site), make_pwa_icons.py
```

## Run it locally

```sh
sh tools/stage-site.sh
python -m http.server 8020 --directory build/site
# open http://127.0.0.1:8020/
```

`tools/stage-site.sh` is the single definition of the published layout — GitHub Pages runs the same
script (`.github/workflows/pages.yml`), so a local check and the live site are assembled identically.

Editing the TypeScript needs a compiler; the JavaScript beside it is generated output:

```sh
npx -y -p typescript@5 tsc -p tsconfig.json
```

## Android and iOS

The same game is wrapped as an Android app in
[kevinelong/textcrush-android](https://github.com/kevinelong/textcrush-android) (APK downloads,
verified on an emulator). The mobile wrappers bundle this source and serve it to a WebView.

## License

Functional Source License, Version 1.1, MIT Future License (`FSL-1.1-MIT`) — see
[LICENSE.md](LICENSE.md). Use, copy, modify and redistribute it freely, including commercially,
except to build a competing product or service; two years after each release the license becomes
plain MIT.
