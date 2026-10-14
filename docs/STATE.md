# State

Where this repository is right now: what the last change was, what is checked, what is next, and
what is waiting on Kevin. The README says what the project is; this says where it stands. Kept
current every time something here changes, because some of the numbers below are claims the checks
in `test/` and `tools/` now verify.

## Now (2026-10-14)

- Branch `master`. The commit before this note is `7dcec55` — "test: pin the game's rules, and ask
  the live site whether it is current".
- **The game's rules are checked.** `node test/game-rules.test.js` → 16 passed, 0 failed. It loads
  the shipped `.js` the page loads, with no dependencies.
- **The published site is checked against this checkout.** `sh tools/check-live-site.sh` → 7
  compared, 0 different ("the published site is this checkout"). The last Pages run, for `d598c6e`,
  succeeded, and the live `index.html`, `sw.js`, `Display.js`, `Game.js`, the manifest and an icon
  all match this tree once line endings are normalised.
- **CI:** `.github/workflows/test.yml` runs the rules suite on push and pull request.
  `.github/workflows/pages.yml` publishes the site on a push to `master` — which is why nothing here
  is pushed without Kevin's word.
- `alt/tc.py` is **not** a reference for the rules and no longer described as one: its scoring is
  `2^(n-1)` written in Python, where `^` is XOR (a run of eight scores 5 instead of 128), it can put
  nine characters in play where the game plays eight, and its `onRemove` default argument is a shared
  dict that leaves later clears scoring nothing.

## What changed last

`7dcec55`: the rules suite (`test/game-rules.test.js`), the live-site check
(`tools/check-live-site.sh`), the test workflow, and the README's account of both. Before that,
nothing tested the game anywhere — the only workflow here publishes the site — so a broken flood
fill or an off-by-one in the scoring exponent would have gone straight to the live site.

## Next

1. Nothing is pending in this repository's code. The site is current and the rules are pinned.
2. If the `.gitattributes` decision below goes the other way, re-verify the digests in the Android
   repository afterwards; this repository is unaffected either way (it publishes sources, and
   `tools/check-live-site.sh` already compares line endings away).
3. `alt/tc.py`: leave it as a sketch with a truthful description, or delete it. It is not worth
   testing until someone decides it should be a real port again.

## Awaiting Kevin's approval to push

**Nothing here has been pushed.** As of this note the branch is **2 commits ahead of `origin/master`**:

```
git log --oneline origin/master..HEAD

7dcec55  test: pin the game's rules, and ask the live site whether it is current
         (this note's own commit, on top of it)
```

A push publishes the live site through GitHub Pages, so this one waits for Kevin even when the
others are given the go-ahead. The committing credential needs the `workflow` scope for
`.github/workflows/test.yml`.

## Open decisions (Kevin's)

- **`.gitattributes` with `* text=auto eol=lf`.** Not a problem in this repository, but the same
  `core.autocrlf` behaviour is why the Android repository's published digests cannot be reproduced
  from a fresh clone. If it is added, add it here and in the iOS repository at the same time so the
  three stay in step.
- **Whether the hold really covers this repository.** Kevin's instruction to resume committing and
  pushing after each turn may have been meant to include these three; until he says so, this one
  waits, because a push here is a deployment.
